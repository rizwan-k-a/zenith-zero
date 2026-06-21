import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  fetchRevocationRequests, updateRevocationRequest, logLifecycleEvent,
} from '@/engines/lifecycleEngine'
import type { RevocationRequest } from '@/services/dbService'
import {
  CheckCircle2, XCircle, Clock, Lock, Eye,
  RefreshCw, ShieldCheck, Inbox
} from 'lucide-react'

const CRITICALITY_CONFIG: Record<string, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'bg-red-50 text-red-700 border-red-200' },
  high: { label: 'High', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  medium: { label: 'Medium', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  low: { label: 'Low', classes: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; classes: string }> = {
  pending: { label: 'Pending', icon: Clock, classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  approved: { label: 'Approved', icon: CheckCircle2, classes: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle, classes: 'bg-red-50 text-red-700 border-red-200' },
  executed: { label: 'Executed', icon: ShieldCheck, classes: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const PLATFORM_COLORS: Record<string, string> = {
  'Active Directory': 'bg-blue-50 text-blue-700 border-blue-200',
  'Azure AD': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'AWS IAM': 'bg-orange-50 text-orange-700 border-orange-200',
  'Kubernetes': 'bg-purple-50 text-purple-700 border-purple-200',
  'Okta': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Salesforce': 'bg-sky-50 text-sky-700 border-sky-200',
}

export function ApprovalsTab() {
  const { user, permissions, revocationRequests, setRevocationRequests, invalidateData, addNotification } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [actionItem, setActionItem] = useState<{ req: RevocationRequest; action: 'approve' | 'reject' } | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  async function loadRequests() {
    setLoading(true)
    try {
      const reqs = await fetchRevocationRequests()
      setRevocationRequests(reqs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleDecision() {
    if (!actionItem) return
    setSaving(true)
    try {
      const status = actionItem.action === 'approve' ? 'approved' : 'rejected'
      await updateRevocationRequest(actionItem.req.id, status, user?.name ?? 'Admin', notes)
      await logLifecycleEvent({
        eventType: actionItem.action === 'approve' ? 'approval_approved' : 'approval_rejected',
        employeeId: actionItem.req.employee_id,
        employeeName: actionItem.req.employee_name,
        platform: actionItem.req.platform,
        accountId: actionItem.req.account_id,
        actionDetail: `${status.toUpperCase()}: ${actionItem.req.system_type} on ${actionItem.req.platform}. ${notes ? `Notes: ${notes}` : ''}`,
        performedBy: user?.name ?? 'Admin',
        severity: actionItem.req.criticality === 'critical' ? 'CRITICAL' : 'HIGH',
      })
      setToast(`Request ${status}. Audit trail updated.`)
      setActionItem(null)
      setNotes('')
      setTimeout(() => setToast(null), 4000)
      await loadRequests()
      invalidateData()
      addNotification(`Revocation request ${status}`, status === 'approved' ? 'success' : 'warning')
    } finally {
      setSaving(false)
    }
  }

  const filtered = revocationRequests.filter(r => filter === 'all' || r.status === filter)
  const pendingCount = revocationRequests.filter(r => r.status === 'pending').length
  const criticalPendingCount = revocationRequests.filter(r => r.status === 'pending' && r.criticality === 'critical').length

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Manual Approval Workflow</p>
          <p className="text-xs text-muted-foreground">
            High-critical system revocations require explicit admin authorization before execution.
            Production databases, root cloud accounts, and cluster-admin privileges are governed here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading} className="gap-2 flex-shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Requests', value: revocationRequests.length, color: 'text-foreground' },
          { label: 'Pending Approval', value: pendingCount, color: 'text-orange-600' },
          { label: 'Critical Pending', value: criticalPendingCount, color: 'text-primary' },
          { label: 'Resolved', value: revocationRequests.filter(r => r.status !== 'pending').length, color: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Role notice */}
      {!permissions.canApprove && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
          {permissions.isReadOnly ? <Eye className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
          <p className="text-xs text-muted-foreground">
            {permissions.isReadOnly
              ? 'Auditor role: read-only access. Approval actions require Admin role.'
              : 'Security Analyst role: you can view requests but cannot approve or reject. Admin role required.'}
          </p>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <p className="text-sm font-medium text-green-800">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-foreground'
            }`}
          >
            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No approval requests</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Requests are created when high-critical accounts require revocation during lifecycle orchestration.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[10px] uppercase tracking-wide">Employee / Account</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">Platform</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">System</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">Criticality</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">Requested By</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(req => {
                const critConf = CRITICALITY_CONFIG[req.criticality] ?? CRITICALITY_CONFIG.high
                const statusConf = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
                const StatusIcon = statusConf.icon
                const platformColor = PLATFORM_COLORS[req.platform] ?? 'bg-muted text-muted-foreground border-border'

                return (
                  <TableRow key={req.id} className="align-top hover:bg-muted/20">
                    <TableCell className="py-3 min-w-48">
                      <p className="text-xs font-semibold text-foreground">{req.employee_name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{req.employee_id}</p>
                      <p className="text-[10px] font-mono text-primary mt-0.5 truncate max-w-44">{req.account_id}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${platformColor}`}>
                        {req.platform}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-40">
                      <p className="text-xs text-foreground">{req.system_type}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{req.access_level}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${critConf.classes}`}>
                        {critConf.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{req.requested_by}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConf.classes}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {req.status === 'pending' && permissions.canApprove ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setActionItem({ req, action: 'approve' })}>
                            <CheckCircle2 className="w-3 h-3" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setActionItem({ req, action: 'reject' })}>
                            <XCircle className="w-3 h-3" />Reject
                          </Button>
                        </div>
                      ) : req.status === 'pending' ? (
                        <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1 opacity-60">
                          <Lock className="w-3 h-3" />Restricted
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {req.approved_by && `By ${req.approved_by}`}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Decision dialog */}
      <Dialog open={!!actionItem} onOpenChange={() => { setActionItem(null); setNotes('') }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${actionItem?.action === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
              {actionItem?.action === 'approve'
                ? <><CheckCircle2 className="w-5 h-5" />Approve Revocation</>
                : <><XCircle className="w-5 h-5" />Reject Revocation</>
              }
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              {actionItem?.action === 'approve'
                ? 'Approving this request will execute the revocation immediately. This action is permanent and logged.'
                : 'Rejecting this request will cancel the revocation. The account will remain active until re-evaluated.'
              }
            </DialogDescription>
          </DialogHeader>
          {actionItem && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted border border-border space-y-1">
                <p className="text-xs font-semibold text-foreground">{actionItem.req.employee_name}</p>
                <p className="text-xs text-muted-foreground">{actionItem.req.platform}: {actionItem.req.account_id}</p>
                <p className="text-xs text-muted-foreground">{actionItem.req.system_type}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CRITICALITY_CONFIG[actionItem.req.criticality]?.classes ?? ''}`}>
                    {actionItem.req.criticality}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Decision Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={actionItem.action === 'approve'
                    ? 'e.g. Verified with manager. Termination confirmed.'
                    : 'e.g. Re-evaluation needed. Employee still on garden leave.'
                  }
                  className="h-20 text-xs resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionItem(null); setNotes('') }}>Cancel</Button>
            <Button
              onClick={handleDecision}
              disabled={saving}
              className={actionItem?.action === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {saving ? 'Processing...' : actionItem?.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
