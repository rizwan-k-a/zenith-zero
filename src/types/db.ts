export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type EmploymentStatus = 'active' | 'terminated' | 'suspended' | 'on_leave'
export type AccountStatus = 'active' | 'disabled' | 'suspended' | 'expired'
export type PermissionLevel = 'Read' | 'Write' | 'Delete' | 'Execute' | 'Admin' | 'SuperAdmin'
export type MembershipType = 'direct' | 'inherited' | 'nested' | 'delegated'
export type RelationshipType = 'member_of' | 'inherits' | 'assume_role' | 'delegated_access' | 'owns_token' | 'manages' | 'reports_to'
export type OffboardingStatus = 'complete' | 'pending' | 'overdue'
export type PlatformStatus = 'disabled' | 'active' | 'unknown'
export type TempAccessStatus = 'active' | 'expired' | 'revoked' | 'extended'
export type ViolationStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed'
export type RevocationStatus = 'pending' | 'approved' | 'rejected' | 'executed'
export type ResidualStatus = 'active' | 'resolved'
export type UserRoleName = 'Admin' | 'Security Analyst' | 'Auditor'

export interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  department: string
  region: string
  designation: string
  employment_status: EmploymentStatus
  join_date: string
  termination_date: string | null
  manager_id: string | null
  risk_level: RiskLevel
  created_at: string
}

export interface PlatformAccount {
  id: string
  account_id: string
  employee_id: string
  platform: string
  username: string
  account_status: AccountStatus
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
  permission_level: PermissionLevel
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
  membership_type: MembershipType
  created_at: string
}

export interface IdentityRelationship {
  id: string
  relationship_id: string
  source_id: string
  target_id: string
  relationship_type: RelationshipType
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
  hr_status: OffboardingStatus
  ad_status: PlatformStatus
  azure_status: PlatformStatus
  aws_status: PlatformStatus
  okta_status: PlatformStatus
  salesforce_status: PlatformStatus
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
  current_status: TempAccessStatus
  still_active: boolean
  risk_level: RiskLevel
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
  risk_level: RiskLevel
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
  risk_level: RiskLevel
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
  status: ViolationStatus
  created_at: string
}

export interface UserRole {
  id: string
  email: string
  role: UserRoleName
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
  status: RevocationStatus
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
  status: ResidualStatus
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

export interface CrossPlatformRisk {
  employeeId: string
  identityName: string
  department: string
  platforms: string[]
  platformCount: number
  adminPlatforms: string[]
  riskScore: number
  severity: Severity
}

export interface ZombieCredential {
  employeeId: string
  identityName: string
  terminationDate: string
  daysSinceTermination: number
  activePlatforms: string[]
  lastActivity: string
  riskScore: number
  severity: Severity
}

export interface ServiceAccountIssue {
  serviceAccountId: string
  serviceName: string
  ownerIdentity: string
  platform: string
  privilegeLevel: string
  lastUsed: string
  daysUnused: number
  tokenActive: boolean
  riskScore: number
  severity: Severity
}

export interface DormantAccess {
  employeeId: string
  identityName: string
  platform: string
  accountId: string
  lastLogin: string
  daysInactive: number
  permissionLevel: string
  riskScore: number
  severity: Severity
}

export interface TempAccessDrift {
  employeeId: string
  identityName: string
  accessType: string
  grantedDate: string
  expiryDate: string
  daysOverdue: number
  currentStatus: string
  riskScore: number
  severity: Severity
}

export interface PrivilegeCreepResult {
  employeeId: string
  identityName: string
  department: string
  currentPrivileges: string[]
  privilegeGrowthPercent: number
  unusedPermissions: number
  lastPrivilegeChange: string
  riskScore: number
  severity: Severity
}

export interface DiscoveredAccount {
  accountId: string
  platform: string
  systemType: string
  roles: string[]
  isServiceAccount: boolean
  revocationCategory: 'auto' | 'manual'
}

export interface PrivilegeDependencyNode {
  nodeId: string
  label: string
  type: string
  depth: number
  inheritedFrom?: string
}

export interface TerminationResult {
  discoveredAccounts: DiscoveredAccount[]
  autoRevoked: DiscoveredAccount[]
  pendingApproval: DiscoveredAccount[]
  residualViolations: ResidualAccessViolation[]
  crossDepLocks: number
  dependencyTree: PrivilegeDependencyNode[]
}

export interface ScanResult {
  total: number
  resolved: number
  active: number
  violations: ResidualAccessViolation[]
}

export interface AttackPath {
  risk: number
  path: string[]
  severity: Severity
  compromiseSteps: number
  description: string
  reachableAssets: string[]
}

export interface DetectionResult {
  totalFindings: number
  criticalFindings: number
  crossPlatform: CrossPlatformRisk[]
  zombieCredentials: ZombieCredential[]
  serviceAccountAbuse: ServiceAccountIssue[]
  dormantAccess: DormantAccess[]
  tempAccessDrift: TempAccessDrift[]
}

export interface RemediationItem {
  id: string
  issue: string
  affectedIdentity: string
  affectedPlatforms: string[]
  detectedDate: string
  riskScore: number
  severity: Severity
  recommendedAction: string
  actionType: string
}

export interface GraphNode {
  id: string
  type: string
  label: string
  data: {
    employeeId?: string
    department?: string
    riskScore?: number
    platform?: string
    critical?: boolean
    orphaned?: boolean
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  animated: boolean
}

export interface DashboardStats {
  totalIdentities: number
  highRiskIdentities: number
  privilegedAccounts: number
  zombieAccounts: number
  dormantCredentials: number
  complianceViolations: number
  trends: {
    totalIdentities: string
    highRiskIdentities: string
    privilegedAccounts: string
    zombieAccounts: string
    dormantCredentials: string
    complianceViolations: string
  }
}

export function toSeverity(level: string): Severity {
  const map: Record<string, Severity> = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
    critical: 'CRITICAL',
    emergency: 'EMERGENCY',
  }
  return map[level.toLowerCase()] || 'LOW'
}

export function toDbSeverity(severity: Severity): RiskLevel {
  const map: Record<Severity, RiskLevel> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    EMERGENCY: 'critical',
  }
  return map[severity] || 'low'
}

export function riskScoreFromLevel(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    low: 25,
    medium: 45,
    high: 65,
    critical: 85,
  }
  return map[level] || 25
}

export function privilegeLevelLabel(level: PermissionLevel): string {
  const map: Record<PermissionLevel, string> = {
    Read: 'Standard',
    Write: 'Elevated',
    Delete: 'Elevated',
    Execute: 'Elevated',
    Admin: 'Admin',
    SuperAdmin: 'Super Admin',
  }
  return map[level] || 'Standard'
}
