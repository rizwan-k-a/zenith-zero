import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAppStore, type UserRole } from '@/store/appStore'
import { canAccessPath } from '@/lib/rbac'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { IdentityGraphPage } from '@/pages/IdentityGraphPage'
import { PrivilegeAnalysisPage } from '@/pages/PrivilegeAnalysisPage'
import { AccessRiskPage } from '@/pages/AccessRiskPage'
import { AttackSimulatorPage } from '@/pages/AttackSimulatorPage'
import { CompliancePage } from '@/pages/CompliancePage'
import { RemediationPage } from '@/pages/RemediationPage'
import { AppShell } from '@/components/layout/AppShell'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole[] }) {
  const { isAuthenticated, user } = useAppStore()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <AccessDenied />
  }

  if (user && !canAccessPath(location.pathname, user.role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

function AccessDenied() {
  return (
    <AppShell>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 border border-red-200">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You do not have sufficient permissions to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore(s => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function ShellRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole[] }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  )
}

export function App() {
  const initAuth = useAppStore(s => s.initAuth)
  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ShellRoute><DashboardPage /></ShellRoute>} />
        <Route path="/identity-graph" element={<ShellRoute><IdentityGraphPage /></ShellRoute>} />
        <Route path="/privilege-analysis" element={<ShellRoute><PrivilegeAnalysisPage /></ShellRoute>} />
        <Route path="/access-risk" element={<ShellRoute><AccessRiskPage /></ShellRoute>} />
        <Route path="/attack-simulator" element={<ShellRoute><AttackSimulatorPage /></ShellRoute>} />
        <Route path="/compliance" element={<ShellRoute><CompliancePage /></ShellRoute>} />
        <Route path="/remediation" element={<ShellRoute requiredRole={['admin']}><RemediationPage /></ShellRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
