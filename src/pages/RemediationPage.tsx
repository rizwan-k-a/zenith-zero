import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAppStore } from '@/store/appStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { WorkbenchTab } from '@/components/remediation/WorkbenchTab'
import { LifecycleTab } from '@/components/remediation/LifecycleTab'
import { ApprovalsTab } from '@/components/remediation/ApprovalsTab'
import { ScannerTab } from '@/components/remediation/ScannerTab'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLifecycleEvents } from '@/hooks/useSupabaseData'

export function RemediationPage() {
  const { user } = useAppStore()
  const { events } = useLifecycleEvents()

  const revocationRequests = events.filter(e => e.event_type === 'approval_requested' || e.event_type === 'approval_approved' || e.event_type === 'approval_rejected')
  const residualViolations = events.filter(e => e.event_type === 'residual_violation')

  const pendingApprovals = revocationRequests.length
  const activeViolations = residualViolations.length

  function exportReport() {
    const lines = [
      'ZENITH ZERO — Remediation & Lifecycle Engine Report',
      `Generated: ${new Date().toISOString()}`,
      `Executed by: ${user?.name} (${user?.role})`,
      '',
      `=== REMEDIATION WORKBENCH ===`,
      ...events.filter(e => e.event_type === 'auto_revoked').map(r => `[${r.severity || 'MEDIUM'}] ${r.employee_name || 'Unknown'} — ${r.action_detail}`),
      '',
      `=== APPROVAL REQUESTS (${revocationRequests.length}) ===`,
      ...revocationRequests.map(r => `[${r.event_type.toUpperCase().replace('_', ' ')}] ${r.employee_name || 'Unknown'} / ${r.platform || 'N/A'}: ${r.action_detail}`),
      '',
      `=== RESIDUAL VIOLATIONS (${residualViolations.length}) ===`,
      ...residualViolations.map(v => `[${v.severity || 'HIGH'}] ${v.employee_name || 'Unknown'} / ${v.platform || 'N/A'}: ${v.action_detail}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'zenith-zero-lifecycle-report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Remediation Engine"
          title="Identity Lifecycle Orchestration"
          description="End-to-end identity lifecycle management with recursive privilege analysis, cross-dependency detection, and automated revocation"
          actions={
            <Button onClick={exportReport} variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export Report
            </Button>
          }
        />

        {/* Role banner */}
        <div className={`mb-4 flex items-center gap-3 p-3 rounded-xl border ${
          user?.role === 'admin'
            ? 'bg-red-50 border-red-200'
            : user?.role === 'analyst'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-muted border-border'
        }`}>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
            user?.role === 'admin'
              ? 'bg-red-100 text-red-700'
              : user?.role === 'analyst'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-muted text-muted-foreground'
          }`}>
            {user?.role}
          </div>
          <p className="text-xs text-muted-foreground">
            {user?.role === 'admin' && 'Full access: revoke, approve, scan, global revoke, trigger terminations'}
            {user?.role === 'analyst' && 'Scan access: run residual access scans. Revocation and approval actions require Admin role.'}
            {user?.role === 'auditor' && 'Read-only access: view all data. No execution permissions. All actions require Admin role.'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workbench">
          <TabsList className="mb-6 h-auto p-1 bg-muted/40 border border-border rounded-xl">
            <TabsTrigger value="workbench" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Workbench
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Lifecycle Orchestration
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Approvals
              {pendingApprovals > 0 && (
                <Badge className="h-4 w-4 p-0 text-[9px] flex items-center justify-center rounded-full"
                  style={{ background: 'oklch(0.52 0.21 11)', color: 'white', border: 'none' }}>
                  {pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scanner" className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Residual Scanner
              {activeViolations > 0 && (
                <Badge className="h-4 w-4 p-0 text-[9px] flex items-center justify-center rounded-full"
                  style={{ background: 'oklch(0.52 0.21 11)', color: 'white', border: 'none' }}>
                  {activeViolations}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workbench">
            <WorkbenchTab />
          </TabsContent>

          <TabsContent value="lifecycle">
            <LifecycleTab />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalsTab />
          </TabsContent>

          <TabsContent value="scanner">
            <ScannerTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
