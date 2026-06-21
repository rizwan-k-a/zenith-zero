import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  department: string
  region: string
  designation: string
  employment_status: 'active' | 'terminated' | 'suspended' | 'on_leave'
  join_date: string
  termination_date: string | null
  manager_id: string | null
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface PlatformAccount {
  id: string
  account_id: string
  employee_id: string
  platform: string
  username: string
  account_status: 'active' | 'disabled' | 'suspended' | 'expired'
  last_login: string | null
  mfa_enabled: boolean
  created_date: string
  created_at: string
}

export interface Permission {
  id: string
  permission_id: string
  employee_id: string
  platform: string
  resource_name: string
  permission_level: 'Read' | 'Write' | 'Delete' | 'Execute' | 'Admin' | 'SuperAdmin'
  granted_date: string
  last_used: string | null
  is_admin: boolean
  created_at: string
}

export interface GroupMembership {
  id: string
  group_id: string
  employee_id: string
  platform: string
  group_name: string
  parent_group: string | null
  membership_type: 'direct' | 'inherited' | 'nested' | 'delegated'
  created_at: string
}

export interface IdentityRelationship {
  id: string
  relationship_id: string
  source_id: string
  target_id: string
  relationship_type: 'member_of' | 'inherits' | 'assume_role' | 'delegated_access' | 'owns_token' | 'manages' | 'reports_to'
  platform: string
  created_at: string
}

export interface PrivilegeHistory {
  id: string
  history_id: string
  employee_id: string
  month: string
  platform: string
  old_permission: string
  new_permission: string
  change_reason: string
  created_at: string
}

export interface OffboardingRecord {
  id: string
  offboard_id: string
  employee_id: string
  termination_date: string
  hr_status: 'complete' | 'pending' | 'overdue'
  ad_status: 'disabled' | 'active' | 'unknown'
  azure_status: 'disabled' | 'active' | 'unknown'
  aws_status: 'disabled' | 'active' | 'unknown'
  okta_status: 'disabled' | 'active' | 'unknown'
  salesforce_status: 'disabled' | 'active' | 'unknown'
  residual_access_found: boolean
  created_at: string
}

export interface TemporaryAccess {
  id: string
  temp_access_id: string
  employee_id: string
  platform: string
  access_granted: string
  expiry_date: string
  current_status: 'active' | 'expired' | 'revoked' | 'extended'
  still_active: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface ApiToken {
  id: string
  token_id: string
  employee_id: string
  platform: string
  token_name: string
  created_date: string
  last_used: string | null
  rotated: boolean
  active: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface ServiceAccount {
  id: string
  service_account_id: string
  owner_employee_id: string
  service_name: string
  platform: string
  privilege_level: 'Read' | 'Write' | 'Admin' | 'SuperAdmin'
  last_used: string | null
  token_active: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface AuditLog {
  id: string
  log_id: string
  employee_id: string
  platform: string
  action_type: string
  resource: string
  timestamp: string
  location: string
  anomaly_score: number
  created_at: string
}

export interface ComplianceViolation {
  id: string
  violation_id: string
  employee_id: string
  framework: string
  control: string
  violation_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
  created_at: string
}

export interface UserRole {
  id: string
  email: string
  role: 'Admin' | 'Security Analyst' | 'Auditor'
  created_at: string
}

export interface LifecycleEvent {
  id: string
  event_type: string
  employee_id: string | null
  employee_name: string | null
  platform: string | null
  account_id: string | null
  action_detail: string
  performed_by: string
  severity: string | null
  created_at: string
}

export interface RevocationRequest {
  id: string
  employee_id: string
  employee_name: string
  platform: string
  account_id: string
  access_level: string
  system_type: string
  criticality: string
  requested_by: string
  approved_by: string | null
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  notes: string | null
  created_at: string
  resolved_at: string | null
}

export interface ResidualAccessViolation {
  id: string
  employee_id: string
  employee_name: string
  termination_date: string
  platform: string
  account_id: string
  access_level: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved'
  detected_at: string
  last_scan_at: string
}

export interface CrossDepLock {
  id: string
  employee_id: string
  source_platform: string
  target_platform: string
  trust_path: string
  created_by: string
  created_at: string
}

export async function getUserRole(email: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('email', email)
    .maybeSingle()
  return (data as any)?.role ?? null
}

export async function getEmployeeCount(): Promise<number> {
  const { count } = await supabase.from('employees').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function getPlatformAccountCount(): Promise<number> {
  const { count } = await supabase.from('platform_accounts').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function getPermissionCount(): Promise<number> {
  const { count } = await supabase.from('permissions').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function getGroupMembershipCount(): Promise<number> {
  const { count } = await supabase.from('group_memberships').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function getIdentityRelationshipCount(): Promise<number> {
  const { count } = await supabase.from('identity_relationships').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function getHighRiskEmployeeCount(): Promise<number> {
  // Connect to remediation engine: count all active issues requiring remediation
  // This matches exactly what WorkbenchTab displays
  const [residualCount, complianceCount, tempAccessCount] = await Promise.all([
    supabase
      .from('residual_access_violations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(r => r.count ?? 0),
    supabase
      .from('compliance_violations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .then(r => r.count ?? 0),
    supabase
      .from('temporary_access')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'active')
      .then(r => r.count ?? 0),
  ])
  return residualCount + complianceCount + tempAccessCount
}

export async function getPrivilegedAccountCount(): Promise<number> {
  // Count DISTINCT employees who have at least one admin-level permission.
  // Fetches employee_ids in pages and deduplicates — prevents double-counting
  // employees with multiple admin permissions (the old COUNT(*) gave 6259).
  const seen = new Set<string>()
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from('permissions')
      .select('employee_id')
      .eq('is_admin', true)
      .range(offset, offset + 999)
    if (error || !data || data.length === 0) break
    for (const row of data as { employee_id: string }[]) seen.add(row.employee_id)
    offset += data.length
    if (data.length < 1000) break
  }
  return seen.size
}

export async function getZombieAccountCount(): Promise<number> {
  // True zombies: terminated employees who still have active/suspended platform accounts.
  // Fetch terminated IDs and count in parallel batches of 200 for speed.
  const { data: terminated } = await supabase
    .from('employees').select('employee_id').eq('employment_status', 'terminated').limit(2000)
  if (!terminated || terminated.length === 0) return 0
  const ids = (terminated as any[]).map((e: any) => e.employee_id)
  // Run all batch count queries in parallel rather than sequentially
  const batches: Promise<number>[] = []
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200)
    batches.push(
      supabase.from('platform_accounts').select('*', { count: 'exact', head: true })
        .in('employee_id', batch).in('account_status', ['active', 'suspended'])
        .then((r: { count: number | null }) => r.count ?? 0) as Promise<number>
    )
  }
  const counts = await Promise.all(batches)
  return counts.reduce((a, b) => a + b, 0)
}

export async function getDormantCredentialCount(): Promise<number> {
  const { count } = await supabase
    .from('platform_accounts')
    .select('*', { count: 'exact', head: true })
    .lt('last_login', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  return count ?? 0
}

export async function getComplianceViolationCount(): Promise<number> {
  // Count only genuinely open violations (not in_progress or resolved).
  // Consistent with Remediation Engine which shows open-status compliance items.
  const { count } = await supabase
    .from('compliance_violations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')
  return count ?? 0
}

export async function getRiskDistribution(): Promise<{ name: string; value: number; color: string }[]> {
  // Use count queries instead of fetching all 8500 rows (default page size caps at 1000)
  const levels: Array<{ level: string; name: string; color: string }> = [
    { level: 'low', name: 'Low', color: '#2E7D32' },
    { level: 'medium', name: 'Medium', color: '#ED6C02' },
    { level: 'high', name: 'High', color: '#DD3259' },
    { level: 'critical', name: 'Critical', color: '#000234' },
  ]
  const results = await Promise.all(
    levels.map(async l => {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('risk_level', l.level)
      return { name: l.name, value: count ?? 0, color: l.color }
    })
  )
  return results
}

const KNOWN_PLATFORMS = [
  'Active Directory', 'Azure AD', 'AWS IAM', 'Okta', 'Kubernetes',
  'VPN Gateway', 'UPI Gateway', 'SWIFT Core', 'Core Banking',
  'Oracle DB', 'Jenkins', 'GitLab', 'ServiceNow',
]

export async function getPlatformDistribution(): Promise<{ platform: string; accounts: number; privileged: number }[]> {
  // Server-side aggregation not available (no RPC). Paginate all platforms.
  // For each known platform, run a count query + admin count query in parallel.
  const platformData = await Promise.all(
    KNOWN_PLATFORMS.map(async platform => {
      const [{ count: accounts }, { count: privileged }] = await Promise.all([
        supabase
          .from('platform_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('platform', platform),
        supabase
          .from('permissions')
          .select('*', { count: 'exact', head: true })
          .eq('platform', platform)
          .eq('is_admin', true),
      ])
      return { platform, accounts: accounts ?? 0, privileged: privileged ?? 0 }
    })
  )
  // Also detect any platforms not in KNOWN_PLATFORMS list
  const { data: allRows } = await supabase.from('platform_accounts').select('platform').limit(10000)
  const platformSet = new Set<string>()
  for (const r of allRows ?? []) platformSet.add((r as any).platform)
  const extras = [...platformSet].filter(p => !KNOWN_PLATFORMS.includes(p))
  if (extras.length > 0) {
    const extraData = await Promise.all(
      extras.map(async platform => {
        const [{ count: accounts }, { count: privileged }] = await Promise.all([
          supabase.from('platform_accounts').select('*', { count: 'exact', head: true }).eq('platform', platform),
          supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('platform', platform).eq('is_admin', true),
        ])
        return { platform, accounts: accounts ?? 0, privileged: privileged ?? 0 }
      })
    )
    platformData.push(...extraData)
  }
  return platformData.filter(p => p.accounts > 0).sort((a, b) => b.accounts - a.accounts)
}

export async function getPrivilegeHistory(): Promise<{ month: string; total: number; high: number; critical: number }[]> {
  // Count per distinct month via parallel count queries for known months
  // privilege_history is ~15000 rows; we use distinct months discovered via a single fetch
  const { data: months } = await supabase.from('privilege_history').select('month').order('month', { ascending: true })
  if (!months) return []
  const uniqueMonths: string[] = [...new Set((months as any[]).map(r => r.month))].sort()
  const results = await Promise.all(
    uniqueMonths.map(async month => {
      const { count: total } = await supabase.from('privilege_history').select('*', { count: 'exact', head: true }).eq('month', month)
      const { count: high } = await supabase.from('privilege_history').select('*', { count: 'exact', head: true }).eq('month', month).in('new_permission', ['Admin', 'SuperAdmin'])
      const { count: critical } = await supabase.from('privilege_history').select('*', { count: 'exact', head: true }).eq('month', month).eq('new_permission', 'SuperAdmin')
      return { month, total: total ?? 0, high: high ?? 0, critical: critical ?? 0 }
    })
  )
  return results
}

export async function getDormantAccess(): Promise<{ platform: string; dormant30: number; dormant60: number; dormant90: number }[]> {
  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const rows = await Promise.all(
    KNOWN_PLATFORMS.map(async platform => {
      const [{ count: dormant30 }, { count: dormant60 }, { count: dormant90 }] = await Promise.all([
        // 30d: inactive between 30 and 60 days
        supabase.from('platform_accounts').select('*', { count: 'exact', head: true })
          .eq('platform', platform).lt('last_login', d30).gte('last_login', d60),
        // 60d: inactive between 60 and 90 days
        supabase.from('platform_accounts').select('*', { count: 'exact', head: true })
          .eq('platform', platform).lt('last_login', d60).gte('last_login', d90),
        // 90d: inactive 90+ days
        supabase.from('platform_accounts').select('*', { count: 'exact', head: true })
          .eq('platform', platform).lt('last_login', d90),
      ])
      return { platform, dormant30: dormant30 ?? 0, dormant60: dormant60 ?? 0, dormant90: dormant90 ?? 0 }
    })
  )
  return rows.filter(r => r.dormant30 + r.dormant60 + r.dormant90 > 0)
}

export async function getEmployees(options?: { limit?: number; offset?: number; status?: string; department?: string; search?: string }): Promise<Employee[]> {
  let q = supabase.from('employees').select('*')
  if (options?.status) q = q.eq('employment_status', options.status)
  if (options?.department) q = q.eq('department', options.department)
  if (options?.search) {
    const s = options.search
    q = q.or(`full_name.ilike.%${s}%,employee_id.ilike.%${s}%,email.ilike.%${s}%`)
  }
  if (options?.limit) q = q.limit(options.limit)
  if (options?.offset) q = q.range(options.offset, options.offset + (options.limit ?? 10) - 1)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getPlatformAccountsByEmployee(employeeId: string): Promise<PlatformAccount[]> {
  const { data } = await supabase.from('platform_accounts').select('*').eq('employee_id', employeeId)
  return (data as any[]) ?? []
}

export async function getPermissionsByEmployee(employeeId: string): Promise<Permission[]> {
  const { data } = await supabase.from('permissions').select('*').eq('employee_id', employeeId)
  return (data as any[]) ?? []
}

export async function getGroupMembershipsByEmployee(employeeId: string): Promise<GroupMembership[]> {
  const { data } = await supabase.from('group_memberships').select('*').eq('employee_id', employeeId)
  return (data as any[]) ?? []
}

export async function getIdentityRelationships(limit: number = 1000): Promise<IdentityRelationship[]> {
  const { data } = await supabase.from('identity_relationships').select('*').limit(limit)
  return (data as any[]) ?? []
}

export async function getComplianceViolations(options?: { status?: string; severity?: string; framework?: string }): Promise<ComplianceViolation[]> {
  let q = supabase.from('compliance_violations').select('*')
  if (options?.status) q = q.eq('status', options.status)
  if (options?.severity) q = q.eq('severity', options.severity)
  if (options?.framework) q = q.eq('framework', options.framework)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getTemporaryAccess(options?: { status?: string }): Promise<TemporaryAccess[]> {
  let q = supabase.from('temporary_access').select('*')
  if (options?.status) q = q.eq('current_status', options.status)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getPermissions(options?: { employeeId?: string; limit?: number }): Promise<Permission[]> {
  let q = supabase.from('permissions').select('*')
  if (options?.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options?.limit) q = q.limit(options.limit)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getPlatformAccounts(options?: { employeeId?: string; limit?: number }): Promise<PlatformAccount[]> {
  let q = supabase.from('platform_accounts').select('*')
  if (options?.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options?.limit) q = q.limit(options.limit)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getGroupMemberships(options?: { employeeId?: string; limit?: number }): Promise<GroupMembership[]> {
  let q = supabase.from('group_memberships').select('*')
  if (options?.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options?.limit) q = q.limit(options.limit)
  const { data } = await q
  return (data as any[]) ?? []
}

export async function getApiTokens(): Promise<ApiToken[]> {
  const { data } = await supabase.from('api_tokens').select('*')
  return (data as any[]) ?? []
}

export async function getServiceAccounts(): Promise<ServiceAccount[]> {
  const { data } = await supabase.from('service_accounts').select('*')
  return (data as any[]) ?? []
}

export async function getOffboardingRecords(): Promise<OffboardingRecord[]> {
  const { data } = await supabase.from('offboarding_records').select('*')
  return (data as any[]) ?? []
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await supabase.from('audit_logs').select('*')
  return (data as any[]) ?? []
}

export async function getLifecycleEvents(): Promise<LifecycleEvent[]> {
  const { data } = await supabase.from('lifecycle_events').select('*').order('created_at', { ascending: false })
  return (data as any[]) ?? []
}

export async function getRevocationRequests(): Promise<RevocationRequest[]> {
  const { data } = await supabase.from('revocation_requests').select('*').order('created_at', { ascending: false })
  return (data as any[]) ?? []
}

export async function getResidualAccessViolations(): Promise<ResidualAccessViolation[]> {
  const { data } = await supabase.from('residual_access_violations').select('*').order('detected_at', { ascending: false })
  return (data as any[]) ?? []
}

export async function insertLifecycleEvent(payload: Omit<LifecycleEvent, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('lifecycle_events').insert(payload as any)
}

export async function insertRevocationRequest(payload: Omit<RevocationRequest, 'id' | 'created_at' | 'resolved_at'>): Promise<void> {
  await supabase.from('revocation_requests').insert(payload as any)
}

export async function insertResidualAccessViolation(payload: Omit<ResidualAccessViolation, 'id' | 'detected_at' | 'last_scan_at'>): Promise<void> {
  await supabase.from('residual_access_violations').insert(payload as any)
}

export async function updateRevocationRequestStatus(id: string, status: string, approvedBy: string, notes?: string | null): Promise<void> {
  await supabase.from('revocation_requests').update({ status, approved_by: approvedBy, notes, resolved_at: new Date().toISOString() } as any).eq('id', id)
}

export async function updateResidualViolationStatus(id: string, status: string): Promise<void> {
  await supabase.from('residual_access_violations').update({ status, last_scan_at: new Date().toISOString() } as any).eq('id', id)
}

export async function updateComplianceViolationStatus(id: string, status: string): Promise<void> {
  await supabase.from('compliance_violations').update({ status } as any).eq('id', id)
}

export async function updateTemporaryAccessStatus(id: string, status: string): Promise<void> {
  await supabase.from('temporary_access').update({ current_status: status } as any).eq('id', id)
}

export async function updatePlatformAccountStatus(accountId: string, status: string): Promise<void> {
  await supabase.from('platform_accounts').update({ account_status: status } as any).eq('account_id', accountId)
}

export async function deletePermission(permissionId: string): Promise<void> {
  await supabase.from('permissions').delete().eq('permission_id', permissionId)
}

export async function revokeApiToken(tokenId: string): Promise<void> {
  await supabase.from('api_tokens').update({ active: false } as any).eq('token_id', tokenId)
}

export async function insertCrossDepLock(payload: Omit<CrossDepLock, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('cross_dep_locks').insert(payload as any)
}

export async function getCrossDepLocks(): Promise<CrossDepLock[]> {
  const { data } = await supabase.from('cross_dep_locks').select('*')
  return (data as any[]) ?? []
}

export interface SecurityMetric {
  metric_month: string
  total_identities: number
  high_risk_identities: number
  privileged_accounts: number
  zombie_accounts: number
  dormant_credentials: number
  compliance_violations: number
  temporary_access_drift: number
  cross_platform_risks: number
  critical_attack_paths: number
}

export async function getSecurityMetricsHistory(): Promise<SecurityMetric[]> {
  const { data } = await supabase.from('security_metrics_history').select('*').order('metric_month', { ascending: true })
  return (data as any[]) ?? []
}

export async function getLatestSecurityMetric(): Promise<SecurityMetric | null> {
  const { data } = await supabase.from('security_metrics_history').select('*').order('metric_month', { ascending: false }).limit(1).maybeSingle()
  return (data as any) ?? null
}

export async function getPreviousMonthMetric(): Promise<SecurityMetric | null> {
  const { data } = await supabase.from('security_metrics_history').select('*').order('metric_month', { ascending: false }).limit(2)
  if (!data || data.length < 2) return null
  return (data[1] as any) ?? null
}

export interface Notification {
  id: string
  title: string
  message: string
  severity: string
  category: string
  read: boolean
  created_at: string
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
  return (data as any[]) ?? []
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function insertNotification(payload: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('notifications').insert(payload as any)
}

export async function getComplianceFrameworkScores(): Promise<{ framework: string; score: number; total: number; passed: number }[]> {
  const { data } = await supabase.from('compliance_violations').select('framework,status')
  if (!data) return []
  const frameworks: Record<string, { total: number; passed: number }> = {}
  for (const row of data as any[]) {
    const fw = row.framework
    if (!frameworks[fw]) frameworks[fw] = { total: 0, passed: 0 }
    frameworks[fw].total++
    if (row.status === 'resolved') frameworks[fw].passed++
  }
  return Object.entries(frameworks).map(([framework, stats]) => ({
    framework,
    score: Math.round((stats.passed / stats.total) * 100),
    total: stats.total,
    passed: stats.passed,
  }))
}

export async function executeGlobalRevokeAll(employeeIds: string[], performedBy: string): Promise<{ revoked: number; employees: number }> {
  const now = new Date().toISOString()
  const uniqueIds = [...new Set(employeeIds.filter(Boolean))]
  if (uniqueIds.length === 0) return { revoked: 0, employees: 0 }

  let revoked = 0
  const errors: string[] = []

  // 1. Disable platform accounts
  const { error: paErr } = await supabase.from('platform_accounts').update({ account_status: 'disabled' } as any).in('employee_id', uniqueIds)
  if (!paErr) revoked += uniqueIds.length
  else errors.push(`platform_accounts: ${paErr.message}`)

  // 2. Revoke API tokens (active = false)
  const { error: tokErr } = await supabase.from('api_tokens').update({ active: false } as any).in('employee_id', uniqueIds)
  if (tokErr) errors.push(`api_tokens: ${tokErr.message}`)

  // 3. Delete ALL permissions for these employees
  const { error: permErr } = await supabase.from('permissions').delete().in('employee_id', uniqueIds)
  if (permErr) errors.push(`permissions: ${permErr.message}`)

  // 4. Delete group memberships
  const { error: grpErr } = await supabase.from('group_memberships').delete().in('employee_id', uniqueIds)
  if (grpErr) errors.push(`group_memberships: ${grpErr.message}`)

  // 5. Revoke temporary access (mark expired, still_active false)
  const { error: tempErr } = await supabase.from('temporary_access').update({ current_status: 'revoked', still_active: false } as any).in('employee_id', uniqueIds)
  if (tempErr) errors.push(`temporary_access: ${tempErr.message}`)

  // 6. Service accounts owned by these employees — deactivate token + mark risk
  const { error: svcErr } = await supabase.from('service_accounts').update({ token_active: false } as any).in('owner_employee_id', uniqueIds)
  if (svcErr) errors.push(`service_accounts: ${svcErr.message}`)

  // 7. Delete identity relationships touching these employees
  const sourceFilter = uniqueIds.map(id => `source_id.eq.${id}`).join(',')
  const { error: relErr } = await supabase.from('identity_relationships').delete().or(sourceFilter)
  if (relErr) errors.push(`identity_relationships (source): ${relErr.message}`)
  // also target side
  const targetFilter = uniqueIds.map(id => `target_id.eq.${id}`).join(',')
  const { error: relErr2 } = await supabase.from('identity_relationships').delete().or(targetFilter)
  if (relErr2) errors.push(`identity_relationships (target): ${relErr2.message}`)

  // 8. Cross-dep locks: insert record of lock
  const locks = uniqueIds.flatMap(empId => [
    { employee_id: empId, source_platform: 'Global', target_platform: 'All', trust_path: 'Global Revoke Lock', created_by: performedBy },
  ])
  const { error: lockErr } = await supabase.from('cross_dep_locks').insert(locks as any)
  if (lockErr) errors.push(`cross_dep_locks: ${lockErr.message}`)

  // 9. Mark employee as terminated
  const { error: empErr } = await supabase.from('employees').update({ employment_status: 'terminated', termination_date: now } as any).in('employee_id', uniqueIds)
  if (empErr) errors.push(`employees: ${empErr.message}`)

  // 10. Resolve any open residual_access_violations for these employees
  const { error: ravErr } = await supabase.from('residual_access_violations').update({ status: 'resolved', last_scan_at: now } as any).in('employee_id', uniqueIds)
  if (ravErr) errors.push(`residual_access_violations: ${ravErr.message}`)

  // 11. Audit log — single batch insert
  const events = uniqueIds.map(id => ({
    event_type: 'global_revoke',
    employee_id: id,
    action_detail: `Recursive global revoke executed by ${performedBy}: disabled platform_accounts, revoked api_tokens, deleted permissions, removed group_memberships, revoked temporary_access, deactivated service_accounts, severed identity_relationships`,
    performed_by: performedBy,
    severity: 'CRITICAL',
  } as any))
  const { error: eventErr } = await supabase.from('lifecycle_events').insert(events)
  if (eventErr) errors.push(`lifecycle_events: ${eventErr.message}`)

  // Throw if ANY critical operation failed
  if (errors.length > 0) {
    throw new Error(`Global revoke partial failure: ${errors.join(' | ')}`)
  }

  return { revoked, employees: uniqueIds.length }
}

export async function terminateEmployee(employeeId: string, performedBy: string): Promise<void> {
  const now = new Date().toISOString()
  // Cascade revoke all linked access for this one employee
  await supabase.from('platform_accounts').update({ account_status: 'disabled' }).eq('employee_id', employeeId)
  await supabase.from('api_tokens').update({ active: false }).eq('employee_id', employeeId)
  await supabase.from('permissions').delete().eq('employee_id', employeeId)
  await supabase.from('group_memberships').delete().eq('employee_id', employeeId)
  await supabase.from('temporary_access').update({ current_status: 'revoked', still_active: false }).eq('employee_id', employeeId)
  await supabase.from('service_accounts').update({ token_active: false }).eq('owner_employee_id', employeeId)
  await supabase.from('identity_relationships').delete().or(`source_id.eq.${employeeId},target_id.eq.${employeeId}`)
  await supabase.from('employees').update({ employment_status: 'terminated', termination_date: now }).eq('employee_id', employeeId)
  await supabase.from('residual_access_violations').update({ status: 'resolved', last_scan_at: now }).eq('employee_id', employeeId)
  await supabase.from('lifecycle_events').insert({
    event_type: 'termination',
    employee_id: employeeId,
    action_detail: `Full lifecycle termination by ${performedBy}: cascaded to platform_accounts, api_tokens, permissions, group_memberships, temporary_access, service_accounts, identity_relationships`,
    performed_by: performedBy,
    severity: 'EMERGENCY',
  } as any)
}
