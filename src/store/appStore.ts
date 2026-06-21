import { create } from 'zustand'
import { supabase, getUserRole } from '@/services/dbService'
import type { RevocationRequest, ResidualAccessViolation } from '@/services/dbService'

export type UserRole = 'admin' | 'analyst' | 'auditor'

interface User {
  id: string
  email: string
  name: string
  title: string
  role: UserRole
}

interface Permissions {
  canRevoke: boolean
  canApprove: boolean
  canScan: boolean
  canTriggerTermination: boolean
  canGlobalRevoke: boolean
  canDeletePermission: boolean
  canDisableAccount: boolean
  canRevokeToken: boolean
  canExport: boolean
  isReadOnly: boolean
}

interface DetectionState {
  isRunning: boolean
  totalFindings: number | null
  criticalFindings: number | null
  lastRunAt: string | null
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  permissions: Permissions
  detection: DetectionState
  revocationRequests: RevocationRequest[]
  residualViolations: ResidualAccessViolation[]
  executedRemediations: string[]
  scanRunning: boolean
  lastScanAt: string | null
  notificationCount: number
  notifications: { id: string; message: string; time: string; type: 'success' | 'warning' | 'info' }[]
  sidebarCollapsed: boolean
  dataVersion: number
  invalidateData: () => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
  setRevocationRequests: (reqs: RevocationRequest[]) => void
  updateRevocationRequest: (id: string, status: string) => void
  setResidualViolations: (violations: ResidualAccessViolation[]) => void
  resolveResidualViolation: (id: string) => void
  addResidualViolations: (violations: ResidualAccessViolation[]) => void
  executeRemediation: (id: string) => void
  setDetectionRunning: (running: boolean) => void
  setDetectionResult: (total: number, critical: number) => void
  setScanRunning: (running: boolean) => void
  setScanComplete: (isoDate: string) => void
  clearNotifications: () => void
  incrementNotifications: (count?: number, message?: string) => void
  addNotification: (message: string, type?: 'success' | 'warning' | 'info') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

const ROLE_PROFILES: Record<UserRole, { name: string; title: string }> = {
  admin: { name: 'Rizwan Ahmed', title: 'Chief Security Administrator' },
  analyst: { name: 'Tarun Gowda', title: 'Security Operations Analyst' },
  auditor: { name: 'Prasad Hegde', title: 'Compliance Auditor' },
}

function normalizeRole(raw: string | null): UserRole {
  if (!raw) return 'auditor'
  const lower = raw.toLowerCase()
  if (lower.includes('admin')) return 'admin'
  if (lower.includes('analyst') || lower.includes('security')) return 'analyst'
  if (lower.includes('audit')) return 'auditor'
  return 'auditor'
}

function buildUser(id: string, email: string, role: UserRole): User {
  const profile = ROLE_PROFILES[role] ?? ROLE_PROFILES.auditor
  return { id, email, name: profile.name, title: profile.title, role }
}

function roleToPermissions(role: UserRole | null): Permissions {
  if (role === 'admin') {
    return {
      canRevoke: true,
      canApprove: true,
      canScan: true,
      canTriggerTermination: true,
      canGlobalRevoke: true,
      canDeletePermission: true,
      canDisableAccount: true,
      canRevokeToken: true,
      canExport: true,
      isReadOnly: false,
    }
  }
  if (role === 'analyst') {
    return {
      canRevoke: false,
      canApprove: false,
      canScan: true,
      canTriggerTermination: false,
      canGlobalRevoke: false,
      canDeletePermission: false,
      canDisableAccount: false,
      canRevokeToken: false,
      canExport: true,
      isReadOnly: false,
    }
  }
  // auditor
  return {
    canRevoke: false,
    canApprove: false,
    canScan: false,
    canTriggerTermination: false,
    canGlobalRevoke: false,
    canDeletePermission: false,
    canDisableAccount: false,
    canRevokeToken: false,
    canExport: true,
    isReadOnly: true,
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  permissions: roleToPermissions(null),
  detection: {
    isRunning: false,
    totalFindings: null,
    criticalFindings: null,
    lastRunAt: null,
  },
  revocationRequests: [],
  residualViolations: [],
  executedRemediations: [],
  scanRunning: false,
  lastScanAt: null,
  notificationCount: 0,
  notifications: [],
  sidebarCollapsed: false,
  dataVersion: 0,
  invalidateData: () => {
    set({ dataVersion: get().dataVersion + 1 })
  },

  async initAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      const email = session.user.email ?? ''
      const rawRole = await getUserRole(email)
      const role = normalizeRole(rawRole)
      const user = buildUser(session.user.id, email, role)
      set({ user, isAuthenticated: true, permissions: roleToPermissions(user.role) })
    }
    supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (session?.user) {
          const email = session.user.email ?? ''
          const rawRole = await getUserRole(email)
          const role = normalizeRole(rawRole)
          const user = buildUser(session.user.id, email, role)
          set({ user, isAuthenticated: true, permissions: roleToPermissions(user.role) })
        } else {
          set({
            user: null,
            isAuthenticated: false,
            permissions: roleToPermissions(null),
          })
        }
      })()
    })
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.user) {
      return false
    }
    const rawRole = await getUserRole(email)
    const role = normalizeRole(rawRole)
    const user = buildUser(data.user.id, email, role)
    set({ user, isAuthenticated: true, permissions: roleToPermissions(user.role) })
    return true
  },

  async logout() {
    await supabase.auth.signOut()
    set({
      user: null,
      isAuthenticated: false,
      permissions: roleToPermissions(null),
    })
  },

  setRevocationRequests(reqs) {
    set({ revocationRequests: reqs })
  },

  updateRevocationRequest(id, status) {
    set({
      revocationRequests: get().revocationRequests.map(r =>
        r.id === id ? { ...r, status: status as RevocationRequest['status'] } : r
      ),
    })
  },

  setResidualViolations(violations) {
    set({ residualViolations: violations })
  },

  resolveResidualViolation(id) {
    set({
      residualViolations: get().residualViolations.map(v =>
        v.id === id ? { ...v, status: 'resolved' as ResidualAccessViolation['status'] } : v
      ),
    })
  },

  addResidualViolations(violations) {
    const existing = get().residualViolations
    const newIds = new Set(existing.map(v => v.id))
    const merged = [...existing, ...violations.filter(v => !newIds.has(v.id))]
    set({ residualViolations: merged })
  },

  executeRemediation(id) {
    set({
      executedRemediations: [...new Set([...get().executedRemediations, id])],
      dataVersion: get().dataVersion + 1,
    })
  },

  setDetectionRunning(running) {
    set({ detection: { ...get().detection, isRunning: running } })
  },

  setDetectionResult(total, critical) {
    set({
      detection: {
        isRunning: false,
        totalFindings: total,
        criticalFindings: critical,
        lastRunAt: new Date().toISOString(),
      },
    })
  },

  setScanRunning(running) {
    set({ scanRunning: running })
  },

  setScanComplete(isoDate) {
    set({ scanRunning: false, lastScanAt: isoDate })
  },

  clearNotifications() {
    set({ notificationCount: 0, notifications: [] })
  },

  addNotification(message, type = 'success') {
    const id = Date.now().toString()
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const n = { id, message, time, type } as const
    set(s => ({ notifications: [n, ...s.notifications].slice(0, 20), notificationCount: s.notificationCount + 1 }))
  },

  incrementNotifications(count = 1, message) {
    if (message) {
      get().addNotification(message)
      if (count > 1) set(s => ({ notificationCount: s.notificationCount + count - 1 }))
    } else {
      set(s => ({ notificationCount: s.notificationCount + count }))
    }
  },

  toggleSidebar() {
    set({ sidebarCollapsed: !get().sidebarCollapsed })
  },
  setSidebarCollapsed(v) {
    set({ sidebarCollapsed: v })
  },
}))
