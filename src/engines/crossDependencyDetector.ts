import { supabase, getCrossDepLocks, insertCrossDepLock } from '@/services/dbService'
import type { CrossDepLock } from '@/services/dbService'

export interface CrossPlatformPath {
  employeeId: string
  employeeName: string
  sourcePlatform: string
  targetPlatform: string
  trustPath: string
  reEntryRisk: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
}

export interface ReEntryFinding {
  employeeId: string
  employeeName: string
  terminated: boolean
  sourcePlatform: string
  reEntryPlatform: string
  mechanism: string
  riskLevel: string
  permissionLevel: string
}

export async function detectCrossPlatformReEntry(): Promise<ReEntryFinding[]> {
  const { data } = await supabase.rpc('detect_cross_platform_reentry')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      employeeName: d.full_name,
      terminated: d.terminated,
      sourcePlatform: d.source_platform,
      reEntryPlatform: d.reentry_platform,
      mechanism: d.mechanism,
      riskLevel: d.risk_level,
      permissionLevel: d.permission_level,
    }))
  }

  // Fallback: exactly 2 queries (all employees + all accounts + all permissions)
  const { data: employees } = await supabase.from('employees').select('*').limit(1000)
  if (!employees || employees.length === 0) return []

  const empIds = employees.map((e: any) => e.employee_id)
  const [{ data: allAccounts }, { data: allPermissions }] = await Promise.all([
    supabase.from('platform_accounts').select('*').in('employee_id', empIds),
    supabase.from('permissions').select('*').in('employee_id', empIds),
  ])

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allAccounts ?? []) {
    const list = accountsByEmp.get(acc.employee_id) ?? []
    list.push(acc)
    accountsByEmp.set(acc.employee_id, list)
  }

  const permsByEmp = new Map<string, any[]>()
  for (const p of allPermissions ?? []) {
    const list = permsByEmp.get(p.employee_id) ?? []
    list.push(p)
    permsByEmp.set(p.employee_id, list)
  }

  const findings: ReEntryFinding[] = []
  for (const emp of employees as any[]) {
    const accounts = accountsByEmp.get(emp.employee_id) ?? []
    const permissions = permsByEmp.get(emp.employee_id) ?? []
    const platforms = [...new Set(accounts.map((a: any) => a.platform))]
    if (platforms.length < 2) continue

    const adminPlatforms = [...new Set(permissions.filter((p: any) => p.is_admin).map((p: any) => p.platform))]
    for (const adminPlatform of adminPlatforms) {
      const otherPlatforms = platforms.filter((p: string) => p !== adminPlatform)
      for (const other of otherPlatforms) {
        const otherPerms = permissions.filter((p: any) => p.platform === other)
        const highestPerm = otherPerms.sort((a: any, b: any) => {
          const order = ['Read', 'Write', 'Delete', 'Execute', 'Admin', 'SuperAdmin']
          return order.indexOf(b.permission_level) - order.indexOf(a.permission_level)
        })[0]
        findings.push({
          employeeId: emp.employee_id,
          employeeName: emp.full_name,
          terminated: emp.employment_status === 'terminated',
          sourcePlatform: adminPlatform,
          reEntryPlatform: other,
          mechanism: 'federation_sync',
          riskLevel: emp.risk_level,
          permissionLevel: highestPerm?.permission_level || 'Read',
        })
      }
    }
  }

  return findings.sort((a, b) => {
    const riskOrder = ['critical', 'high', 'medium', 'low']
    return riskOrder.indexOf(a.riskLevel) - riskOrder.indexOf(b.riskLevel)
  })
}

export async function detectPrivilegeReEntryVectors(): Promise<CrossPlatformPath[]> {
  const { data } = await supabase.rpc('detect_privilege_reentry_vectors')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      employeeName: d.full_name,
      sourcePlatform: d.source_platform,
      targetPlatform: d.target_platform,
      trustPath: d.trust_path,
      reEntryRisk: d.reentry_risk,
      detectedAt: new Date().toISOString(),
    }))
  }

  // Fallback: exactly 2 queries
  const locks = await getCrossDepLocks()
  const lockedPairs = new Set(locks.map(l => `${l.employee_id}:${l.source_platform}:${l.target_platform}`))

  const { data: employees } = await supabase.from('employees').select('*').limit(1000)
  if (!employees || employees.length === 0) return []

  const empIds = employees.map((e: any) => e.employee_id)
  const { data: allAccounts } = await supabase
    .from('platform_accounts')
    .select('*')
    .in('employee_id', empIds)

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allAccounts ?? []) {
    const list = accountsByEmp.get(acc.employee_id) ?? []
    list.push(acc)
    accountsByEmp.set(acc.employee_id, list)
  }

  const paths: CrossPlatformPath[] = []
  for (const emp of employees as any[]) {
    const accounts = accountsByEmp.get(emp.employee_id) ?? []
    const platforms = [...new Set(accounts.map((a: any) => a.platform))]
    if (platforms.length < 2) continue

    for (let i = 0; i < platforms.length; i++) {
      for (let j = i + 1; j < platforms.length; j++) {
        const pair = `${emp.employee_id}:${platforms[i]}:${platforms[j]}`
        if (lockedPairs.has(pair)) continue

        const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
          emp.risk_level === 'critical' || emp.employment_status === 'terminated' ? 'critical' : emp.risk_level

        paths.push({
          employeeId: emp.employee_id,
          employeeName: emp.full_name,
          sourcePlatform: platforms[i],
          targetPlatform: platforms[j],
          trustPath: 'identity_federation',
          reEntryRisk: riskLevel,
          detectedAt: new Date().toISOString(),
        })
      }
    }
  }

  return paths.sort((a, b) => {
    const riskOrder = ['critical', 'high', 'medium', 'low']
    return riskOrder.indexOf(a.reEntryRisk) - riskOrder.indexOf(b.reEntryRisk)
  })
}

export async function lockCrossPlatformPath(
  employeeId: string,
  sourcePlatform: string,
  targetPlatform: string,
  trustPath: string,
  createdBy: string
): Promise<void> {
  await insertCrossDepLock({
    employee_id: employeeId,
    source_platform: sourcePlatform,
    target_platform: targetPlatform,
    trust_path: trustPath,
    created_by: createdBy,
  })
}

export async function getLockedPaths(): Promise<CrossDepLock[]> {
  return getCrossDepLocks()
}
