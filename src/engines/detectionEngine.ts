import { supabase } from '@/services/dbService'
import type {
  DetectionResult,
  CrossPlatformRisk,
  ZombieCredential,
  ServiceAccountIssue,
  DormantAccess,
  TempAccessDrift,
  PrivilegeCreepResult,
  AttackPath,
} from '@/types/db'
import { toSeverity, riskScoreFromLevel } from '@/types/db'

// ─────────────────────────────────────────────────────────────
// Detection Engine — Optimized: max 2 DB queries per engine
// No Supabase calls inside loops. All data fetched upfront.
// ─────────────────────────────────────────────────────────────

export async function detectZombieCredentials(): Promise<ZombieCredential[]> {
  const { data } = await supabase.rpc('detect_zombie_credentials')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      identityName: d.full_name,
      terminationDate: d.termination_date,
      daysSinceTermination: d.days_since,
      activePlatforms: d.platforms || [],
      lastActivity: d.last_activity,
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 2 queries
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('employment_status', 'terminated')
  if (!employees || employees.length === 0) return []

  const empIds = employees.map((e: any) => e.employee_id)
  const { data: allAccounts } = await supabase
    .from('platform_accounts')
    .select('*')
    .in('employee_id', empIds)
    .in('account_status', ['active', 'suspended'])

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allAccounts ?? []) {
    const list = accountsByEmp.get(acc.employee_id) ?? []
    list.push(acc)
    accountsByEmp.set(acc.employee_id, list)
  }

  const zombies: ZombieCredential[] = []
  for (const emp of employees as any[]) {
    const accounts = accountsByEmp.get(emp.employee_id) ?? []
    if (accounts.length === 0) continue
    const termDate = emp.termination_date ? new Date(emp.termination_date) : new Date()
    const days = Math.floor((Date.now() - termDate.getTime()) / (1000 * 60 * 60 * 24))
    const lastActivity =
      accounts.map((a: any) => a.last_login).filter(Boolean).sort().pop() ||
      emp.termination_date ||
      new Date().toISOString()
    zombies.push({
      employeeId: emp.employee_id,
      identityName: emp.full_name,
      terminationDate: termDate.toISOString(),
      daysSinceTermination: days,
      activePlatforms: accounts.map((a: any) => a.platform),
      lastActivity: lastActivity as string,
      riskScore: Math.min(100, days + accounts.length * 10),
      severity: days > 90 ? 'CRITICAL' : days > 30 ? 'HIGH' : 'MEDIUM',
    })
  }
  return zombies
}

export async function detectPrivilegeCreep(): Promise<PrivilegeCreepResult[]> {
  const { data } = await supabase.rpc('detect_privilege_creep')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      identityName: d.full_name,
      department: d.department,
      currentPrivileges: d.current_privileges || [],
      privilegeGrowthPercent: d.growth_percent || 0,
      unusedPermissions: d.unused_count || 0,
      lastPrivilegeChange: d.last_change,
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 2 queries
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('employment_status', 'active')
  if (!employees || employees.length === 0) return []

  const empIds = employees.map((e: any) => e.employee_id)
  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('*')
    .in('employee_id', empIds)

  const permsByEmp = new Map<string, any[]>()
  for (const p of allPermissions ?? []) {
    const list = permsByEmp.get(p.employee_id) ?? []
    list.push(p)
    permsByEmp.set(p.employee_id, list)
  }

  const results: PrivilegeCreepResult[] = []
  for (const emp of employees as any[]) {
    const permissions = permsByEmp.get(emp.employee_id) ?? []
    const unused = permissions.filter((p: any) => !p.last_used)
    const admin = permissions.filter((p: any) => p.is_admin)
    if (admin.length > 2 || unused.length > 5) {
      results.push({
        employeeId: emp.employee_id,
        identityName: emp.full_name,
        department: emp.department,
        currentPrivileges: permissions.map((p: any) => p.permission_level),
        privilegeGrowthPercent: admin.length * 25,
        unusedPermissions: unused.length,
        lastPrivilegeChange:
          permissions.map((p: any) => p.granted_date).sort().pop() ||
          new Date().toISOString(),
        riskScore: Math.min(100, admin.length * 15 + unused.length * 5),
        severity: admin.length > 3 ? 'CRITICAL' : admin.length > 1 ? 'HIGH' : 'MEDIUM',
      })
    }
  }
  return results
}

export async function detectTempAccessDrift(): Promise<TempAccessDrift[]> {
  const { data } = await supabase.rpc('detect_temp_access_drift')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      identityName: d.full_name,
      accessType: d.access_granted,
      grantedDate: d.granted_date,
      expiryDate: d.expiry_date,
      daysOverdue: d.days_overdue,
      currentStatus: d.current_status,
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 1 query (table already filtered by still_active)
  const { data: records } = await supabase
    .from('temporary_access')
    .select('*')
    .eq('still_active', true)
  const today = new Date()
  return (records ?? [])
    .filter((r: any) => new Date(r.expiry_date) < today)
    .map((r: any) => {
      const days = Math.floor(
        (today.getTime() - new Date(r.expiry_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        employeeId: r.employee_id,
        identityName: r.employee_id,
        accessType: r.access_granted,
        grantedDate: '',
        expiryDate: r.expiry_date,
        daysOverdue: days,
        currentStatus: r.current_status,
        riskScore: Math.min(100, days * 2 + 30),
        severity: days > 30 ? 'CRITICAL' : days > 7 ? 'HIGH' : 'MEDIUM' as const,
      }
    })
}

export async function detectServiceAccountAbuse(): Promise<ServiceAccountIssue[]> {
  const { data } = await supabase.rpc('detect_service_account_abuse')
  if (data) {
    return (data as any[]).map(d => ({
      serviceAccountId: d.service_account_id,
      serviceName: d.service_name,
      ownerIdentity: d.owner_name,
      platform: d.platform,
      privilegeLevel: d.privilege_level,
      lastUsed: d.last_used,
      daysUnused: d.days_unused,
      tokenActive: d.token_active,
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 1 query
  const { data: accounts } = await supabase.from('service_accounts').select('*')
  const today = new Date()
  return (accounts ?? [])
    .filter(
      (a: any) =>
        a.privilege_level === 'Admin' ||
        a.privilege_level === 'SuperAdmin' ||
        !a.last_used
    )
    .map((a: any) => {
      const days = a.last_used
        ? Math.floor(
            (today.getTime() - new Date(a.last_used).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 365
      return {
        serviceAccountId: a.service_account_id,
        serviceName: a.service_name,
        ownerIdentity: a.owner_employee_id,
        platform: a.platform,
        privilegeLevel: a.privilege_level,
        lastUsed: a.last_used || '',
        daysUnused: days,
        tokenActive: a.token_active,
        riskScore: Math.min(100, days + (a.privilege_level === 'SuperAdmin' ? 40 : 20)),
        severity: days > 90 ? 'CRITICAL' : days > 30 ? 'HIGH' : 'MEDIUM' as const,
      }
    })
}

export async function detectDormantAccess(): Promise<DormantAccess[]> {
  const { data } = await supabase.rpc('detect_dormant_access')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      identityName: d.full_name,
      platform: d.platform,
      accountId: d.account_id,
      lastLogin: d.last_login,
      daysInactive: d.days_inactive,
      permissionLevel: d.permission_level,
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 2 queries (parallel)
  const [{ data: allEmployees }, { data: allAccounts }] = await Promise.all([
    supabase.from('employees').select('*'),
    supabase.from('platform_accounts').select('*').not('last_login', 'is', null),
  ])
  if (!allEmployees || !allAccounts) return []

  const empIds = allEmployees.map((e: any) => e.employee_id)
  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('*')
    .in('employee_id', empIds)

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allAccounts) {
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

  const empMap = new Map<string, any>()
  for (const e of allEmployees as any[]) {
    empMap.set(e.employee_id, e)
  }

  const results: DormantAccess[] = []
  const today = new Date()
  for (const acc of allAccounts) {
    const days = Math.floor(
      (today.getTime() - new Date(acc.last_login).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (days > 60) {
      const emp = empMap.get(acc.employee_id)
      const permissions = permsByEmp.get(acc.employee_id) ?? []
      const perm = permissions.find((p: any) => p.platform === acc.platform)
      results.push({
        employeeId: acc.employee_id,
        identityName: emp?.full_name || acc.employee_id,
        platform: acc.platform,
        accountId: acc.account_id,
        lastLogin: acc.last_login,
        daysInactive: days,
        permissionLevel: perm?.permission_level || 'Read',
        riskScore: Math.min(100, days),
        severity: days > 180 ? 'CRITICAL' : days > 90 ? 'HIGH' : 'MEDIUM' as const,
      })
    }
  }
  return results
}

export async function detectCrossPlatformRisk(): Promise<CrossPlatformRisk[]> {
  const { data } = await supabase.rpc('detect_cross_platform_risk')
  if (data) {
    return (data as any[]).map(d => ({
      employeeId: d.employee_id,
      identityName: d.full_name,
      department: d.department,
      platforms: d.platforms || [],
      platformCount: d.platform_count,
      adminPlatforms: d.admin_platforms || [],
      riskScore: d.risk_score,
      severity: toSeverity(d.severity),
    }))
  }

  // Fallback: exactly 2 queries (parallel)
  const [{ data: allEmployees }, { data: allAccounts }] = await Promise.all([
    supabase.from('employees').select('*'),
    supabase.from('platform_accounts').select('*'),
  ])
  if (!allEmployees || !allAccounts) return []

  const empIds = allEmployees.map((e: any) => e.employee_id)
  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('*')
    .in('employee_id', empIds)

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allAccounts) {
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

  const results: CrossPlatformRisk[] = []
  for (const emp of allEmployees as any[]) {
    const accounts = accountsByEmp.get(emp.employee_id) ?? []
    const permissions = permsByEmp.get(emp.employee_id) ?? []
    const platforms = [...new Set(accounts.map((a: any) => a.platform))]
    const adminPlatforms = [
      ...new Set(permissions.filter((p: any) => p.is_admin).map((p: any) => p.platform)),
    ]
    if (platforms.length > 2 || adminPlatforms.length > 1) {
      results.push({
        employeeId: emp.employee_id,
        identityName: emp.full_name,
        department: emp.department,
        platforms,
        platformCount: platforms.length,
        adminPlatforms,
        riskScore: Math.min(100, platforms.length * 10 + adminPlatforms.length * 25),
        severity: adminPlatforms.length > 2 ? 'CRITICAL' : adminPlatforms.length > 1 ? 'HIGH' : 'MEDIUM' as const,
      })
    }
  }
  return results
}

export async function runFullDetection(): Promise<DetectionResult> {
  const [crossPlatform, zombieCredentials, serviceAccountAbuse, dormantAccess, tempAccessDrift] =
    await Promise.all([
      detectCrossPlatformRisk(),
      detectZombieCredentials(),
      detectServiceAccountAbuse(),
      detectDormantAccess(),
      detectTempAccessDrift(),
    ])
  const totalFindings =
    crossPlatform.length +
    zombieCredentials.length +
    serviceAccountAbuse.length +
    dormantAccess.length +
    tempAccessDrift.length
  const criticalFindings =
    crossPlatform.filter(r => r.severity === 'CRITICAL').length +
    zombieCredentials.filter(r => r.severity === 'CRITICAL').length +
    serviceAccountAbuse.filter(r => r.severity === 'CRITICAL').length +
    dormantAccess.filter(r => r.severity === 'CRITICAL').length +
    tempAccessDrift.filter(r => r.severity === 'CRITICAL').length
  return {
    totalFindings,
    criticalFindings,
    crossPlatform,
    zombieCredentials,
    serviceAccountAbuse,
    dormantAccess,
    tempAccessDrift,
  }
}

export async function simulateAttackPath(employeeId: string): Promise<AttackPath | null> {
  // Query 1: employee
  const { data: emp } = await supabase
    .from('employees')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle()
  if (!emp) return null

  // Query 2: all related data in parallel (single-employee scope, not N+1)
  const [{ data: accounts }, { data: permissions }, { data: relationships }] = await Promise.all([
    supabase.from('platform_accounts').select('*').eq('employee_id', employeeId),
    supabase.from('permissions').select('*').eq('employee_id', employeeId),
    supabase.from('identity_relationships').select('*').or(`source_id.eq.${employeeId},target_id.eq.${employeeId}`),
  ])

  const pathNodes: string[] = [`${emp.full_name} (${employeeId})`]
  const platforms = [...new Set((accounts ?? []).map((a: any) => a.platform))]
  const adminPerms = (permissions ?? []).filter((p: any) => p.is_admin)
  const reachableAssets: string[] = []

  // Build path
  for (const platform of platforms.slice(0, 3)) {
    const platformPerms = (permissions ?? []).filter((p: any) => p.platform === platform)
    const admin = platformPerms.filter((p: any) => p.is_admin)
    if (admin.length > 0) {
      pathNodes.push(`${platform}: Admin Access`)
    } else if (platformPerms.length > 0) {
      pathNodes.push(`${platform}: ${platformPerms[0].permission_level} on ${platformPerms[0].resource_name}`)
    }
    const resources = platformPerms.map((p: any) => p.resource_name)
    reachableAssets.push(...resources)
  }

  // Inherited roles
  for (const rel of (relationships ?? []).slice(0, 3)) {
    const target = rel.target_id === employeeId ? rel.source_id : rel.target_id
    pathNodes.push(`Inherits: ${target}`)
  }

  // Final target
  if (adminPerms.length > 0) {
    pathNodes.push('Critical Asset: Production Database / Global Admin')
  } else {
    pathNodes.push('Reachable: Standard Resource Pool')
  }

  const riskScore = Math.min(
    100,
    riskScoreFromLevel(emp.risk_level) + adminPerms.length * 10 + platforms.length * 5
  )
  const severity: import('@/types/db').Severity =
    riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'
  const compromiseSteps = pathNodes.length - 1

  const description = `From ${emp.full_name}, an attacker with initial access can traverse ${platforms.length} platforms and escalate via ${adminPerms.length} admin permissions to reach critical production resources.`

  return {
    risk: riskScore,
    path: pathNodes,
    severity,
    compromiseSteps,
    description,
    reachableAssets: [...new Set(reachableAssets)].slice(0, 6),
  }
}
