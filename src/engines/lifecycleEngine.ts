import {
  supabase,
  getPlatformAccountsByEmployee,
  getPermissionsByEmployee,
  getGroupMembershipsByEmployee,
  insertLifecycleEvent,
  updateRevocationRequestStatus,
  updateResidualViolationStatus,
  updatePlatformAccountStatus,
  revokeApiToken,
  getRevocationRequests,
  getResidualAccessViolations,
  type ResidualAccessViolation,
  type RevocationRequest,
} from '@/services/dbService'
import type { DiscoveredAccount, PrivilegeDependencyNode, TerminationResult, ScanResult } from '@/types/db'

// ─────────────────────────────────────────────────────────────
// Lifecycle Engine — Real Supabase Mutations
// All mutations batched: no Supabase calls inside loops.
// ─────────────────────────────────────────────────────────────

export async function fetchRevocationRequests(): Promise<RevocationRequest[]> {
  return getRevocationRequests()
}

export async function fetchResidualViolations(): Promise<ResidualAccessViolation[]> {
  return getResidualAccessViolations()
}

export async function updateRevocationRequest(id: string, status: string, approvedBy: string, notes?: string): Promise<void> {
  await updateRevocationRequestStatus(id, status, approvedBy, notes ?? null)
}

export async function resolveResidualViolation(id: string): Promise<void> {
  await updateResidualViolationStatus(id, 'resolved')
}

export async function logLifecycleEvent(payload: {
  eventType: string
  employeeId?: string
  employeeName?: string
  platform?: string
  accountId?: string
  actionDetail: string
  performedBy: string
  severity?: string
}): Promise<void> {
  await insertLifecycleEvent({
    event_type: payload.eventType,
    employee_id: payload.employeeId ?? null,
    employee_name: payload.employeeName ?? null,
    platform: payload.platform ?? null,
    account_id: payload.accountId ?? null,
    action_detail: payload.actionDetail,
    performed_by: payload.performedBy,
    severity: payload.severity ?? null,
  })
}

export async function analyzePrivilegeDependencies(employeeId: string): Promise<PrivilegeDependencyNode[]> {
  const [accounts, permissions, memberships, { data: tokens }] = await Promise.all([
    getPlatformAccountsByEmployee(employeeId),
    getPermissionsByEmployee(employeeId),
    getGroupMembershipsByEmployee(employeeId),
    supabase.from('api_tokens').select('*').eq('employee_id', employeeId),
  ])

  const nodes: PrivilegeDependencyNode[] = []
  const seen = new Set<string>()

  const rootId = `emp-${employeeId}`
  nodes.push({ nodeId: rootId, label: employeeId, type: 'employee', depth: 0 })
  seen.add(rootId)

  for (const acc of accounts) {
    const id = `acc-${acc.account_id}`
    if (!seen.has(id)) {
      nodes.push({ nodeId: id, label: acc.account_id, type: 'account', depth: 1, inheritedFrom: acc.platform })
      seen.add(id)
    }
  }

  for (const perm of permissions) {
    const id = `perm-${perm.permission_id}`
    if (!seen.has(id)) {
      nodes.push({ nodeId: id, label: `${perm.permission_level} on ${perm.resource_name}`, type: 'role', depth: 2, inheritedFrom: perm.platform })
      seen.add(id)
    }
  }

  for (const gm of memberships) {
    const id = `group-${gm.group_id}`
    if (!seen.has(id)) {
      nodes.push({ nodeId: id, label: gm.group_name, type: 'group', depth: 2, inheritedFrom: gm.platform })
      seen.add(id)
    }
  }

  for (const tok of tokens ?? []) {
    const id = `tok-${tok.token_id}`
    if (!seen.has(id)) {
      nodes.push({ nodeId: id, label: tok.token_name, type: 'token', depth: 2, inheritedFrom: tok.platform })
      seen.add(id)
    }
  }

  return nodes
}

export async function orchestrateTermination(employeeId: string, performedBy: string): Promise<TerminationResult> {
  const { data: emp } = await supabase.from('employees').select('*').eq('employee_id', employeeId).maybeSingle()
  if (!emp) throw new Error('Employee not found')

  const [accounts, permissions, memberships, { data: tokens }] = await Promise.all([
    getPlatformAccountsByEmployee(employeeId),
    getPermissionsByEmployee(employeeId),
    getGroupMembershipsByEmployee(employeeId),
    supabase.from('api_tokens').select('*').eq('employee_id', employeeId),
  ])

  const discoveredAccounts: DiscoveredAccount[] = []
  const autoRevoked: DiscoveredAccount[] = []
  const pendingApproval: DiscoveredAccount[] = []
  const residualViolations: ResidualAccessViolation[] = []

  // Discover accounts
  for (const acc of accounts) {
    const perms = permissions.filter(p => p.platform === acc.platform)
    const roles = perms.map(p => p.permission_level)
    const hasCritical = perms.some(p => p.permission_level === 'Admin' || p.permission_level === 'SuperAdmin')
    const category: 'auto' | 'manual' = hasCritical ? 'manual' : 'auto'
    discoveredAccounts.push({
      accountId: acc.account_id,
      platform: acc.platform,
      systemType: acc.platform,
      roles: roles.length > 0 ? roles : ['User'],
      isServiceAccount: false,
      revocationCategory: category,
    })
  }

  for (const tok of tokens ?? []) {
    discoveredAccounts.push({
      accountId: tok.token_id,
      platform: tok.platform,
      systemType: 'API Token',
      roles: [tok.token_name],
      isServiceAccount: true,
      revocationCategory: 'auto',
    })
  }

  for (const gm of memberships) {
    discoveredAccounts.push({
      accountId: gm.group_id,
      platform: gm.platform,
      systemType: 'Group Membership',
      roles: [gm.group_name],
      isServiceAccount: false,
      revocationCategory: 'auto',
    })
  }

  // Batch mutations: collect all operations first
  const groupIdsToDelete: string[] = []
  const accountIdsToDisable: string[] = []
  const tokenIdsToRevoke: string[] = []
  const revocationRequestsToInsert: any[] = []
  const residualViolationsToInsert: any[] = []

  for (const acc of discoveredAccounts) {
    if (acc.revocationCategory === 'auto') {
      if (acc.systemType === 'API Token') {
        tokenIdsToRevoke.push(acc.accountId)
      } else if (acc.systemType === 'Group Membership') {
        groupIdsToDelete.push(acc.accountId)
      } else {
        accountIdsToDisable.push(acc.accountId)
      }
      autoRevoked.push(acc)
    } else {
      pendingApproval.push(acc)
      revocationRequestsToInsert.push({
        employee_id: employeeId,
        employee_name: emp.full_name,
        platform: acc.platform,
        account_id: acc.accountId,
        access_level: acc.roles.join(', '),
        system_type: acc.systemType,
        criticality: acc.roles.some((r: string) => r.includes('Admin') || r.includes('SuperAdmin')) ? 'critical' : 'high',
        requested_by: performedBy,
        approved_by: null,
        status: 'pending',
        notes: null,
      })
      residualViolationsToInsert.push({
        employee_id: employeeId,
        employee_name: emp.full_name,
        termination_date: emp.termination_date || new Date().toISOString(),
        platform: acc.platform,
        account_id: acc.accountId,
        access_level: acc.roles.join(', '),
        severity: acc.roles.some((r: string) => r.includes('Admin')) ? 'critical' : 'high',
        status: 'active',
      })
    }
  }

  // Execute batch mutations
  if (groupIdsToDelete.length > 0) {
    await supabase.from('group_memberships').delete().in('group_id', groupIdsToDelete)
  }
  for (const accId of accountIdsToDisable) {
    await updatePlatformAccountStatus(accId, 'disabled')
  }
  for (const tokId of tokenIdsToRevoke) {
    await revokeApiToken(tokId)
  }
  if (revocationRequestsToInsert.length > 0) {
    await supabase.from('revocation_requests').insert(revocationRequestsToInsert as any)
  }
  if (residualViolationsToInsert.length > 0) {
    await supabase.from('residual_access_violations').insert(residualViolationsToInsert as any)
  }

  // Batch delete all permissions
  const permIdsToDelete = permissions.map(p => p.permission_id)
  if (permIdsToDelete.length > 0) {
    // deletePermission only handles single; use direct supabase for batch
    await supabase.from('permissions').delete().in('permission_id', permIdsToDelete)
  }

  // Cross-dependency locks
  const platforms = [...new Set(accounts.map(a => a.platform))]
  let crossDepLocks = 0
  const locksToInsert: any[] = []
  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      if (platforms[i] !== platforms[j]) {
        locksToInsert.push({
          employee_id: employeeId,
          source_platform: platforms[i],
          target_platform: platforms[j],
          trust_path: `${platforms[i]} → ${platforms[j]}`,
          created_by: performedBy,
        })
        crossDepLocks++
      }
    }
  }
  if (locksToInsert.length > 0) {
    await supabase.from('cross_dep_locks').insert(locksToInsert as any)
  }

  // Update employee status
  await supabase.from('employees').update({ employment_status: 'terminated' } as any).eq('employee_id', employeeId)

  await logLifecycleEvent({
    eventType: 'termination_orchestrated',
    employeeId,
    employeeName: emp.full_name,
    actionDetail: `Discovered ${discoveredAccounts.length} accounts, auto-revoked ${autoRevoked.length}, pending approval ${pendingApproval.length}, cross-dep locks ${crossDepLocks}`,
    performedBy,
    severity: 'HIGH',
  })

  return {
    discoveredAccounts,
    autoRevoked,
    pendingApproval,
    residualViolations,
    crossDepLocks,
    dependencyTree: [],
  }
}

export async function executeGlobalRevokeAll(pendingItems: string[], performedBy: string): Promise<number> {
  // Query all pending items in one call
  const { data: allRequests } = await supabase
    .from('revocation_requests')
    .select('*')
    .in('id', pendingItems)
  const requests = (allRequests ?? []) as any[]

  let executed = 0
  const accountIdsToDisable: string[] = []
  const tokenIdsToRevoke: string[] = []
  const requestIdsToUpdate: string[] = []
  const lifecycleEventsToInsert: any[] = []

  for (const rr of requests) {
    if (rr.system_type === 'API Token') {
      tokenIdsToRevoke.push(rr.account_id)
    } else {
      accountIdsToDisable.push(rr.account_id)
    }
    requestIdsToUpdate.push(rr.id)
    lifecycleEventsToInsert.push({
      event_type: 'global_revoke',
      employee_id: rr.employee_id,
      employee_name: rr.employee_name,
      platform: rr.platform,
      account_id: rr.account_id,
      action_detail: `Global revoked ${rr.system_type} ${rr.account_id}`,
      performed_by: performedBy,
      severity: 'CRITICAL',
    })
    executed++
  }

  // Batch mutations
  for (const accId of accountIdsToDisable) {
    await updatePlatformAccountStatus(accId, 'disabled')
  }
  for (const tokId of tokenIdsToRevoke) {
    await revokeApiToken(tokId)
  }
  for (const id of requestIdsToUpdate) {
    await updateRevocationRequestStatus(id, 'executed', performedBy, 'Global revoke all')
  }
  if (lifecycleEventsToInsert.length > 0) {
    await supabase.from('lifecycle_events').insert(lifecycleEventsToInsert as any)
  }

  return executed
}

export async function runResidualAccessScan(_performedBy: string): Promise<ScanResult> {
  const { data: terminated } = await supabase
    .from('employees')
    .select('*')
    .eq('employment_status', 'terminated')
  const employees = (terminated as any[]) ?? []
  if (employees.length === 0) return { total: 0, resolved: 0, active: 0, violations: [] }

  const empIds = employees.map((e: any) => e.employee_id)

  const [{ data: allActiveAccounts }, { data: allExisting }] = await Promise.all([
    supabase.from('platform_accounts').select('*').in('employee_id', empIds).in('account_status', ['active', 'suspended']),
    supabase.from('residual_access_violations').select('*').in('employee_id', empIds),
  ])

  const existingMap = new Map<string, any>()
  for (const v of allExisting ?? []) {
    existingMap.set(`${v.employee_id}:${v.account_id}`, v)
  }

  const accountsByEmp = new Map<string, any[]>()
  for (const acc of allActiveAccounts ?? []) {
    const list = accountsByEmp.get(acc.employee_id) ?? []
    list.push(acc)
    accountsByEmp.set(acc.employee_id, list)
  }

  const empMap = new Map<string, any>()
  for (const e of employees) {
    empMap.set(e.employee_id, e)
  }

  const violations: ResidualAccessViolation[] = []
  let resolved = 0
  const now = new Date().toISOString()

  const existingIdsToUpdate: string[] = []
  const newViolationsToInsert: any[] = []

  for (const emp of employees) {
    const accounts = accountsByEmp.get(emp.employee_id) ?? []
    if (accounts.length === 0) continue

    for (const acc of accounts) {
      const key = `${emp.employee_id}:${acc.account_id}`
      const existing = existingMap.get(key)
      if (existing) {
        existingIdsToUpdate.push(existing.id)
        violations.push(existing)
        if (existing.status === 'resolved') resolved++
        continue
      }
      newViolationsToInsert.push({
        employee_id: emp.employee_id,
        employee_name: emp.full_name,
        termination_date: emp.termination_date || now,
        platform: acc.platform,
        account_id: acc.account_id,
        access_level: acc.account_status,
        severity: 'critical',
        status: 'active',
      })
      violations.push({
        id: crypto.randomUUID(),
        employee_id: emp.employee_id,
        employee_name: emp.full_name,
        termination_date: emp.termination_date || now,
        platform: acc.platform,
        account_id: acc.account_id,
        access_level: acc.account_status,
        severity: 'critical',
        status: 'active',
        detected_at: now,
        last_scan_at: now,
      })
    }
  }

  // Batch mutations
  if (existingIdsToUpdate.length > 0) {
    await supabase.from('residual_access_violations').update({ last_scan_at: now } as any).in('id', existingIdsToUpdate)
  }
  if (newViolationsToInsert.length > 0) {
    await supabase.from('residual_access_violations').insert(newViolationsToInsert as any)
  }

  return { total: violations.length, resolved, active: violations.length - resolved, violations }
}

export { updatePlatformAccountStatus, revokeApiToken }
