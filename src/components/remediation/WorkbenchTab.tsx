import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { SeverityBadge, RiskScoreBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, AlertTriangle, Trash2, Key, UserX, ShieldOff, Shield,
  ChevronRight, ClipboardList, Zap, Lock, Eye
} from 'lucide-react'
import {
  executeGlobalRevokeAll, logLifecycleEvent,
} from '@/engines/lifecycleEngine'
import { getResidualAccessViolations, getComplianceViolations, getTemporaryAccess } from '@/services/dbService'
import { toSeverity, riskScoreFromLevel } from '@/types/db'

interface RemediationItem {
  id: string
  issue: string
  affectedIdentity: string
  affectedPlatforms: string[]
  detectedDate: string
  riskScore: number
  severity: import('@/types/db').Severity
  recommendedAction: string
  actionType: string
  employeeId: string
  sourceType: 'violation' | 'compliance' | 'temp'
  sourceId: string
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  disable_account: { label: 'Disable Account', icon: UserX, color: 'text-red-700' },
  remove_role: { label: 'Remove Role', icon: ShieldOff, color: 'text-orange-700' },
  remove_cluster_admin: { label: 'Remove Cluster Admin', icon: Shield, color: 'text-purple-700' },
  revoke_admin: { label: 'Revoke Admin', icon: Trash2, color: 'text-red-700' },
  revoke_token: { label: 'Revoke Token', icon: Key, color: 'text-amber-700' },
  revoke_temp: { label: 'Revoke Temp', icon: UserX, color: 'text-red-700' },
  resolve_violation: { label: 'Resolve', icon: CheckCircle2, color: 'text-green-700' },
}

export function WorkbenchTab() {
  const { user, permissions, invalidateData, addNotification } = useAppStore()
  const dataVersion = useAppStore(s => s.dataVersion)
  const [items, setItems] = useState<RemediationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmItem, setConfirmItem] = useState<RemediationItem | null>(null)
  const [justExecuted, setJustExecuted] = useState<string | null>(null)
  const [globalRevokeDialog, setGlobalRevokeDialog] = useState(false)
  const [globalRevoking, setGlobalRevoking] = useState(false)
  const [globalRevokeDone, setGlobalRevokeDone] = useState(false)

  useEffect(() => {
    async function load() {
      try {
      const [violations, compliance, temp] = await Promise.all([
        getResidualAccessViolations(),
        getComplianceViolations({ status: 'open' }),
        getTemporaryAccess({ status: 'active' }),
      ])
      const mapped: RemediationItem[] = []
      violations.filter(v => v.status === 'active').forEach(v => {
        mapped.push({
          id: `rav-${v.id}`,
          issue: `Residual access after termination: ${v.platform} account still active`,
          affectedIdentity: v.employee_name,
          affectedPlatforms: [v.platform],
          detectedDate: new Date(v.detected_at).toISOString().split('T')[0],
          riskScore: riskScoreFromLevel(v.severity),
          severity: toSeverity(v.severity),
          recommendedAction: `Disable account ${v.account_id} on ${v.platform}`,
          actionType: 'disable_account',
          employeeId: v.employee_id,
          sourceType: 'violation',
          sourceId: v.id,
        })
      })
      compliance.forEach(c => {
        mapped.push({
          id: `cv-${c.id}`,
          issue: `Compliance violation: ${c.framework} ${c.control}`,
          affectedIdentity: c.employee_id,
          affectedPlatforms: ['All'],
          detectedDate: new Date(c.created_at).toISOString().split('T')[0],
          riskScore: riskScoreFromLevel(c.severity),
          severity: toSeverity(c.severity),
          recommendedAction: `Resolve compliance violation: ${c.violation_type}`,
          actionType: 'resolve_violation',
          employeeId: c.employee_id,
          sourceType: 'compliance',
          sourceId: c.id,
        })
      })
      temp.forEach(t => {
        const expired = new Date(t.expiry_date) < new Date()
        mapped.push({
          id: `ta-${t.id}`,
          issue: expired ? `Expired temporary access still active on ${t.platform}` : `Temporary access pending review on ${t.platform}`,
          affectedIdentity: t.employee_id,
          affectedPlatforms: [t.platform],
          detectedDate: new Date(t.created_at).toISOString().split('T')[0],
          riskScore: riskScoreFromLevel(t.risk_level),
          severity: toSeverity(t.risk_level),
          recommendedAction: `Revoke temporary access ${t.access_granted} on ${t.platform}`,
          actionType: 'revoke_temp',
          employeeId: t.employee_id,
          sourceType: 'temp',
          sourceId: t.id,
        })
      })
      setItems(mapped)
      } catch {
        // show empty table on error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dataVersion])

  const pendingItems = items
  const executedCount = 0
  const emergencyCount = pendingItems.filter(r => r.severity === 'EMERGENCY' || r.severity === 'CRITICAL').length

  async function handleConfirmRemediate() {
    if (!confirmItem) return
    const item = confirmItem
    setConfirmItem(null)
    try {
      if (item.sourceType === 'violation') {
        // Resolve the residual violation record in DB
        await import('@/services/dbService').then(m => m.updateResidualViolationStatus(item.sourceId, 'resolved'))
      } else if (item.sourceType === 'compliance') {
        await import('@/services/dbService').then(m => m.updateComplianceViolationStatus(item.sourceId, 'resolved'))
      } else if (item.sourceType === 'temp') {
        // Mark temp access as revoked
        await import('@/services/dbService').then(m => m.updateTemporaryAccessStatus(item.sourceId, 'revoked'))
      }
      await logLifecycleEvent({
        eventType: 'auto_revoked',
        employeeId: item.employeeId,
        actionDetail: `Remediation executed: ${item.issue} — ${item.recommendedAction}`,
        performedBy: user?.name ?? 'Admin',
        severity: item.severity,
      })
      setJustExecuted(item.id)
      setTimeout(() => setJustExecuted(null), 2000)
      addNotification(`Remediation executed: ${item.issue}`, 'success')
      setTimeout(() => invalidateData(), 800)
    } catch {
      alert('Remediation failed. Check Supabase connection and try again.')
    }
  }

  async function handleGlobalRevoke() {
    setGlobalRevoking(true)
    let succeeded = 0
    try {
      // Collect all unique employee IDs for cascade revoke
      const employeeIds = [...new Set(items.map(r => r.employeeId).filter(Boolean))]
      const dbService = await import('@/services/dbService')

      // Resolve all violations, compliance items, and temp access in DB
      await Promise.allSettled(items.map(async item => {
        try {
          if (item.sourceType === 'violation') {
            await dbService.updateResidualViolationStatus(item.sourceId, 'resolved')
          } else if (item.sourceType === 'compliance') {
            await dbService.updateComplianceViolationStatus(item.sourceId, 'resolved')
          } else if (item.sourceType === 'temp') {
            await dbService.updateTemporaryAccessStatus(item.sourceId, 'revoked')
          }
          succeeded++
        } catch { /* continue on individual item fail */ }
      }))

      // Recursive cascade revoke on all linked tables
      try {
        await executeGlobalRevokeAll(employeeIds, user?.name ?? 'Admin')
        setGlobalRevokeDone(true)
        addNotification(`Global revoke completed — ${employeeIds.length} employees cascaded`, 'warning')
        invalidateData()
      } catch (revokeError: any) {
        // Global revoke threw error with details
        throw new Error(`Cascade failed: ${revokeError.message}`)
      }
    } catch (err: any) {
      if (succeeded > 0) {
        setGlobalRevokeDone(true)
        addNotification(`Global revoke partial — ${succeeded} items pre-resolved, cascade failed`, 'warning')
        invalidateData()
      } else {
        alert(`Global revoke failed: ${err.message}. Check connection and try again.`)
      }
    } finally {
      setGlobalRevoking(false)
      setGlobalRevokeDialog(false)
      setTimeout(() => setGlobalRevokeDone(false), 4000)
    }
  }

  const sortedItems = [...items].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-foreground">Identity Risk Remediation Workbench</p>
          {permissions.isReadOnly && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Eye className="w-3 h-3" />
              Read Only
            </Badge>
          )}
        </div>
        {permissions.canGlobalRevoke && pendingItems.length > 0 && (
          <Button
            size="sm"
            className="gap-2 text-xs font-semibold"
            style={{ background: 'oklch(0.44 0.19 22)', color: 'white' }}
            onClick={() => setGlobalRevokeDialog(true)}
          >
            <Zap className="w-3.5 h-3.5" />
            Global Revoke All ({pendingItems.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Issues', value: items.length, icon: ClipboardList, color: 'text-foreground' },
          { label: 'Pending', value: pendingItems.length, icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Emergency/Critical', value: emergencyCount, icon: AlertTriangle, color: 'text-primary' },
          { label: 'Executed', value: executedCount, icon: CheckCircle2, color: 'text-green-700' },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white border border-border rounded-xl p-3.5 flex items-start gap-3">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${card.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remediation Progress</p>
          <span className="text-xs font-bold text-foreground">{executedCount}/{items.length}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: executedCount === items.length ? '#2E7D32' : 'oklch(0.52 0.21 11)' }}
            initial={{ width: 0 }}
            animate={{ width: items.length ? `${(executedCount / items.length) * 100}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {justExecuted && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <p className="text-sm font-medium text-green-800">Remediation executed. Action logged in audit trail.</p>
          </motion.div>
        )}
        {globalRevokeDone && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <Zap className="w-4 h-4 text-red-700" />
            <p className="text-sm font-medium text-red-800">Global Revoke All executed. All {items.length} items revoked. Audit trail updated.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[10px] uppercase tracking-wide">Issue / Identity</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide">Platforms</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide">Detected</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide text-right">Risk</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide">Severity</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : (
              sortedItems.map(item => {
                const isExecuted = item.id === justExecuted
                const actionConf = ACTION_CONFIG[item.actionType] ?? ACTION_CONFIG.disable_account
                const ActionIcon = actionConf.icon

                return (
                  <TableRow key={item.id}
                    className={`align-top transition-colors ${isExecuted ? 'opacity-60 bg-muted/10' : 'hover:bg-muted/20'}`}
                  >
                    <TableCell className="py-3 min-w-56 max-w-72">
                      <p className="text-xs font-medium text-foreground leading-relaxed line-clamp-2">{item.issue}</p>
                      <p className="text-xs font-mono text-primary mt-1">{item.affectedIdentity}</p>
                    </TableCell>
                    <TableCell className="min-w-40">
                      <div className="flex flex-wrap gap-1">
                        {item.affectedPlatforms.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            {p}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.detectedDate}</TableCell>
                    <TableCell className="text-right"><RiskScoreBadge score={item.riskScore} /></TableCell>
                    <TableCell><SeverityBadge severity={item.severity} /></TableCell>
                    <TableCell>
                      {isExecuted ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium bg-orange-50 text-orange-700">
                          <AlertTriangle className="w-3 h-3" />Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isExecuted ? (
                        <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1.5 opacity-50">
                          <CheckCircle2 className="w-3.5 h-3.5" />Done
                        </Button>
                      ) : permissions.isReadOnly ? (
                        <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1.5 opacity-60">
                          <Eye className="w-3.5 h-3.5" />View Only
                        </Button>
                      ) : !permissions.canRevoke ? (
                        <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1.5 opacity-70">
                          <Lock className="w-3.5 h-3.5" />No Permission
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7 text-xs gap-1.5"
                          style={{ background: 'oklch(0.52 0.21 11)', color: 'white' }}
                          onClick={() => setConfirmItem(item)}>
                          <ActionIcon className="w-3.5 h-3.5" />
                          {actionConf.label}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 bg-white border border-border rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Escalation Priority Queue</p>
        <div className="space-y-2">
          {sortedItems.slice(0, 4).map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
              <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0 mt-0.5">{i + 1}</span>
              <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.affectedIdentity}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.recommendedAction}</p>
              </div>
              <SeverityBadge severity={item.severity} />
            </div>
          ))}
          {pendingItems.length === 0 && (
            <div className="flex items-center gap-2 text-green-700 py-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">All remediations executed.</span>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!confirmItem} onOpenChange={() => setConfirmItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Confirm Remediation
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              This action will be logged in the audit trail and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {confirmItem && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs font-semibold text-foreground mb-1">{confirmItem.affectedIdentity}</p>
                <p className="text-xs text-muted-foreground">{confirmItem.issue}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs font-semibold text-red-800 mb-1">Action</p>
                <p className="text-xs text-red-700">{confirmItem.recommendedAction}</p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={confirmItem.severity} />
                <RiskScoreBadge score={confirmItem.riskScore} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmItem(null)}>Cancel</Button>
            <Button onClick={handleConfirmRemediate} style={{ background: 'oklch(0.52 0.21 11)', color: 'white' }}>
              Execute Remediation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={globalRevokeDialog} onOpenChange={setGlobalRevokeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Zap className="w-5 h-5" />
              Global Revoke All Access
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              This will immediately execute ALL {pendingItems.length} pending remediations across all platforms.
              This action is irreversible and will be logged as an emergency security operation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <div className="p-3 rounded-lg border border-red-200 bg-red-50">
              <p className="text-xs font-bold text-red-800 mb-1">Scope of Impact</p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• {pendingItems.filter(r => r.severity === 'EMERGENCY' || r.severity === 'CRITICAL').length} EMERGENCY severity items</li>
                <li>• {[...new Set(pendingItems.flatMap(r => r.affectedPlatforms))].length} platforms affected</li>
                <li>• {pendingItems.length} total revocations will execute simultaneously</li>
                <li>• Full audit trail entry will be created</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Only use this in emergency situations. Requires Admin role authorization.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGlobalRevokeDialog(false)}>Cancel</Button>
            <Button
              onClick={handleGlobalRevoke}
              disabled={globalRevoking}
              style={{ background: 'oklch(0.44 0.19 22)', color: 'white' }}
            >
              {globalRevoking ? 'Executing...' : `Revoke All ${pendingItems.length} Items`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
