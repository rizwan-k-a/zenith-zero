import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import {
  getEmployeeCount,
  getHighRiskEmployeeCount,
  getPrivilegedAccountCount,
  getZombieAccountCount,
  getDormantCredentialCount,
  getComplianceViolationCount,
  getPlatformAccountCount,
  getPermissionCount,
  getGroupMembershipCount,
  getIdentityRelationshipCount,
  getEmployees,
  getRiskDistribution,
  getPlatformDistribution,
  getPrivilegeHistory,
  getDormantAccess,
  getComplianceViolations,
  getTemporaryAccess,
  getApiTokens,
  getServiceAccounts,
  getOffboardingRecords,
  getAuditLogs,
  getLifecycleEvents,
  getRevocationRequests,
  getResidualAccessViolations,
  getIdentityRelationships,
  getPlatformAccountsByEmployee,
  getPermissionsByEmployee,
  getGroupMembershipsByEmployee,
  type Employee,
  type ComplianceViolation,
  type TemporaryAccess,
  type ApiToken,
  type ServiceAccount,
  type OffboardingRecord,
  type AuditLog,
  type LifecycleEvent,
  type RevocationRequest,
  type ResidualAccessViolation,
  type IdentityRelationship,
  type PlatformAccount,
  type Permission,
  type GroupMembership,
} from '@/services/dbService'

export function useTableAvailability() {
  const [anyAvailable, setAnyAvailable] = useState(false)
  useEffect(() => {
    getEmployeeCount().then(c => setAnyAvailable(c > 0)).catch(() => setAnyAvailable(false))
  }, [])
  return { anyAvailable }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalIdentities: 0,
    highRiskIdentities: 0,
    privilegedAccounts: 0,
    zombieAccounts: 0,
    dormantCredentials: 0,
    complianceViolations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    async function load() {
      try {
        const [
          totalIdentities,
          highRiskIdentities,
          privilegedAccounts,
          zombieAccounts,
          dormantCredentials,
          complianceViolations,
        ] = await Promise.all([
          getEmployeeCount(),
          getHighRiskEmployeeCount(),
          getPrivilegedAccountCount(),
          getZombieAccountCount(),
          getDormantCredentialCount(),
          getComplianceViolationCount(),
        ])
        setStats({ totalIdentities, highRiskIdentities, privilegedAccounts, zombieAccounts, dormantCredentials, complianceViolations })
        setError(null)
      } catch (e) {
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dataVersion])

  return { stats, loading, error }
}

export function useRiskDistribution() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const dataVersion = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getRiskDistribution()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dataVersion])
  return { data, loading }
}

export function usePlatformDistribution() {
  const [data, setData] = useState<{ platform: string; accounts: number; privileged: number }[]>([])
  const [loading, setLoading] = useState(true)
  const dataVersion = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getPlatformDistribution()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dataVersion])
  return { data, loading }
}

export function usePrivilegeHistory() {
  const [data, setData] = useState<{ month: string; total: number; high: number; critical: number }[]>([])
  const [loading, setLoading] = useState(true)
  const dataVersion = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getPrivilegeHistory()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dataVersion])
  return { data, loading }
}

export function useDormantAccess() {
  const [data, setData] = useState<{ platform: string; dormant30: number; dormant60: number; dormant90: number }[]>([])
  const [loading, setLoading] = useState(true)
  const dataVersion = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getDormantAccess()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dataVersion])
  return { data, loading }
}

export function useEmployees(options?: { limit?: number; offset?: number; status?: string; department?: string; search?: string }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    setLoading(true)
    getEmployees(options)
      .then(data => { setEmployees(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load employees'); setLoading(false) })
  }, [options?.limit, options?.offset, options?.status, options?.department, options?.search, dataVersion])

  return { employees, loading, error }
}

export function useEmployeeDetails(employeeId: string) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionEmp = useAppStore(s => s.dataVersion)
  useEffect(() => {
    if (!employeeId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      getPlatformAccountsByEmployee(employeeId),
      getPermissionsByEmployee(employeeId),
      getGroupMembershipsByEmployee(employeeId),
    ])
      .then(([a, p, m]) => { setAccounts(a); setPermissions(p); setMemberships(m); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load employee details'); setLoading(false) })
  }, [employeeId, dataVersionEmp])

  return { accounts, permissions, memberships, loading, error }
}

export function useComplianceViolations(options?: { status?: string; severity?: string; framework?: string }) {
  const [violations, setViolations] = useState<ComplianceViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    setLoading(true)
    getComplianceViolations(options)
      .then(data => { setViolations(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load compliance violations'); setLoading(false) })
  }, [options?.status, options?.severity, options?.framework, dataVersion])

  return { violations, loading, error }
}

export function useTemporaryAccess(options?: { status?: string }) {
  const [items, setItems] = useState<TemporaryAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    setLoading(true)
    getTemporaryAccess(options)
      .then(data => { setItems(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load temporary access records'); setLoading(false) })
  }, [options?.status, dataVersion])

  return { items, loading, error }
}

export function useApiTokens() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    getApiTokens()
      .then(data => { setTokens(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load API tokens'); setLoading(false) })
  }, [dataVersion])

  return { tokens, loading, error }
}

export function useServiceAccounts() {
  const [accounts, setAccounts] = useState<ServiceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataVersion = useAppStore(s => s.dataVersion)

  useEffect(() => {
    getServiceAccounts()
      .then(data => { setAccounts(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load service accounts'); setLoading(false) })
  }, [dataVersion])

  return { accounts, loading, error }
}

export function useOffboardingRecords() {
  const [records, setRecords] = useState<OffboardingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionOb = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getOffboardingRecords()
      .then(data => { setRecords(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load offboarding records'); setLoading(false) })
  }, [dataVersionOb])

  return { records, loading, error }
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionAl = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getAuditLogs()
      .then(data => { setLogs(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load audit logs'); setLoading(false) })
  }, [dataVersionAl])

  return { logs, loading, error }
}

export function useLifecycleEvents() {
  const [events, setEvents] = useState<LifecycleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionLe = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getLifecycleEvents()
      .then(data => { setEvents(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load lifecycle events'); setLoading(false) })
  }, [dataVersionLe])

  return { events, loading, error }
}

export function useRevocationRequests() {
  const [requests, setRequests] = useState<RevocationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionRr = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getRevocationRequests()
      .then(data => { setRequests(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load revocation requests'); setLoading(false) })
  }, [dataVersionRr])

  return { requests, loading, error }
}

export function useResidualAccessViolations() {
  const [violations, setViolations] = useState<ResidualAccessViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionRav = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getResidualAccessViolations()
      .then(data => { setViolations(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load residual violations'); setLoading(false) })
  }, [dataVersionRav])

  return { violations, loading, error }
}

export function useIdentityRelationships() {
  const [relationships, setRelationships] = useState<IdentityRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataVersionIr = useAppStore(s => s.dataVersion)
  useEffect(() => {
    getIdentityRelationships()
      .then(data => { setRelationships(data); setError(null); setLoading(false) })
      .catch(() => { setError('Failed to load identity relationships'); setLoading(false) })
  }, [dataVersionIr])

  return { relationships, loading, error }
}

export function useEntityCounts() {
  const [counts, setCounts] = useState({
    employees: 0, platformAccounts: 0, permissions: 0,
    groupMemberships: 0, identityRelationships: 0, complianceViolations: 0,
  })

  const dataVersionEc = useAppStore(s => s.dataVersion)
  useEffect(() => {
    Promise.all([
      getEmployeeCount(), getPlatformAccountCount(), getPermissionCount(),
      getGroupMembershipCount(), getIdentityRelationshipCount(), getComplianceViolationCount(),
    ])
      .then(([employees, platformAccounts, permissions, groupMemberships, identityRelationships, complianceViolations]) => {
        setCounts({ employees, platformAccounts, permissions, groupMemberships, identityRelationships, complianceViolations })
      })
      .catch(() => {})
  }, [dataVersionEc])

  return counts
}
