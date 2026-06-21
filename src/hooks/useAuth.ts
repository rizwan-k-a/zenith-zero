import { useAppStore } from '@/store/appStore'
import type { UserRole } from '@/store/appStore'

export function useAuth() {
  const store = useAppStore()
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    userRole: (store.user?.role ?? 'auditor') as UserRole,
    userEmail: store.user?.email ?? null,
    loading: false,
  }
}
