import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  fetchResidualViolations, runResidualAccessScan, resolveResidualViolation,
} from '@/engines/lifecycleEngine'
import {
  Scan, AlertTriangle, CheckCircle2, ShieldAlert, Lock, Eye,
  RefreshCw, UserX, Clock, CheckCheck, Inbox
} from 'lucide-react'
import { getEmployees } from '@/services/dbService'
import type { ResidualAccessViolation } from '@/types/db'
import { toSeverity } from '@/types/db'

const PLATFORM_COLORS: Record<string, string> = {
  'Active Directory': 'bg-blue-50 text-blue-700 border-blue-200',
  'Azure AD': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'AWS IAM': 'bg-orange-50 text-orange-700 border-orange-200',
  'Kubernetes': 'bg-purple-50 text-purple-700 border-purple-200',
  'Okta': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Salesforce': 'bg-sky-50 text-sky-700 border-sky-200',
}

export function ScannerTab() {
  const { user, permissions, residualViolations, setResidualViolations, resolveResidualViolation: storeResolve, scanRunning, lastScanAt, setScanRunning, setScanComplete } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<{ scanned: number; found: number } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [resolving, setResolving] = useState<string | null>(null)
  const [terminatedCount, setTerminatedCount] = useState(0)

  async function loadViolations() {
    setLoading(true)
    try {
      const violations = await fetchResidualViolations()
      setResidualViolations(violations)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadViolations()
    getEmployees({ status: 'terminated' }).then(emps => setTerminatedCount(emps.length))
  }, [])

  async function handleRunScan() {
    setScanRunning(true)
    setScanResult(null)
    setScanProgress(0)

    // Simulate scan progress
    const progressInterval = setInterval(() => {
      setScanProgress(p => Math.min(p + Math.random() * 15, 92))
    }, 300)

    try {
      const result = await runResidualAccessScan(user?.name ?? 'Analyst')
      clearInterval(progressInterval)
      setScanProgress(100)
      setScanResult({ scanned: result.total, found: result.violations.length })
      setScanComplete(new Date().toISOString())
      await loadViolations()
      setToast(`Scan complete. ${result.total} terminated employees scanned. ${result.violations.length} new violations found.`)
      setTimeout(() => setToast(null), 6000)
    } catch {
      clearInterval(progressInterval)
      setScanProgress(0)
      setScanRunning(false)
      setToast('Scan failed. Check Supabase connection and try again.')
      setTimeout(() => setToast(null), 5000)
    }
  }

  async function handleResolve(violation: ResidualAccessViolation) {
    setResolving(violation.id)
    try {
      await resolveResidualViolation(violation.id)
      storeResolve(violation.id)
      await loadViolations()
      setToast(`Violation resolved for ${violation.employee_name} on ${violation.platform}.`)
      setTimeout(() => setToast(null), 4000)
    } finally {
      setResolving(null)
    }
  }

  const activeViolations = residualViolations.filter(v => v.status === 'active')
  const resolvedCount = residualViolations.filter(v => v.status === 'resolved').length

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Residual Access Scanner</p>
          <p className="text-xs text-muted-foreground">
            Periodic background checks for terminated employees with lingering platform access.
            Detects zombie credentials, orphaned accounts, and privilege leakage post-termination.
          </p>
        </div>
        {permissions.canScan ? (
          <Button
            onClick={handleRunScan}
            disabled={scanRunning}
            className="gap-2 flex-shrink-0 font-semibold"
            style={{ background: scanRunning ? undefined : 'oklch(0.52 0.21 11)', color: scanRunning ? undefined : 'white' }}
          >
            {scanRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {scanRunning ? 'Scanning...' : 'Run Scan Now'}
          </Button>
        ) : (
          <Button disabled variant="outline" className="gap-2 flex-shrink-0">
            <Lock className="w-4 h-4" />
            Scan Restricted
          </Button>
        )}
      </div>

      {/* Scan scope */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
          <UserX className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Terminated Employees</p>
            <p className="text-xl font-bold text-foreground">{terminatedCount}</p>
            <p className="text-[10px] text-muted-foreground">Tracked in HR system</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active Violations</p>
            <p className="text-xl font-bold text-primary">{activeViolations.length}</p>
            <p className="text-[10px] text-muted-foreground">Require immediate action</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
          <CheckCheck className="w-4 h-4 text-green-600 mt-0.5" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Resolved</p>
            <p className="text-xl font-bold text-green-700">{resolvedCount}</p>
            <p className="text-[10px] text-muted-foreground">
              Last scan: {lastScanAt ? new Date(lastScanAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Scan progress */}
      <AnimatePresence>
        {scanRunning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 bg-white border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <p className="text-sm font-semibold text-foreground">Scanning terminated employee records...</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{Math.round(scanProgress)}%</span>
            </div>
            <Progress value={scanProgress} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-2">
              Checking {terminatedCount} employees across Active Directory, Azure AD, AWS IAM, Kubernetes, Okta, Salesforce, and API tokens...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan complete result */}
      <AnimatePresence>
        {scanResult && !scanRunning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
            <Scan className="w-4 h-4 text-blue-700" />
            <p className="text-sm font-medium text-blue-800">
              Scan complete — {scanResult.scanned} employees scanned. {scanResult.found > 0 ? `${scanResult.found} new violations flagged.` : 'No new violations.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Role notice */}
      {permissions.isReadOnly && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Auditor role: read-only access. Running scans requires Analyst or Admin role.</p>
        </div>
      )}

      {/* Violations list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : residualViolations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No residual access violations found</p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
            Run a scan to check for terminated employees with active platform accounts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Detected Violations ({residualViolations.length})
            </p>
            <Button variant="outline" size="sm" onClick={loadViolations} className="gap-1.5 text-xs h-7">
              <RefreshCw className="w-3 h-3" />Refresh
            </Button>
          </div>
          {residualViolations.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-4 rounded-xl border ${v.status === 'active' ? 'bg-white border-border' : 'bg-muted/20 border-border opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[v.platform] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {v.platform}
                    </span>
                    <SeverityBadge severity={toSeverity(v.severity)} />
                    {v.status === 'resolved' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        Resolved
                      </span>
                    )}
                    {v.status === 'active' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle className="w-2.5 h-2.5" />Active Violation
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-foreground">{v.employee_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.account_id}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.access_level}</p>

                  <div className="flex items-center gap-4 mt-2">
                    {v.termination_date && (
                      <div className="flex items-center gap-1.5">
                        <UserX className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Terminated: {v.termination_date}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Detected: {new Date(v.detected_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Scan className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Last scan: {new Date(v.last_scan_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {v.status === 'active' && permissions.canRevoke ? (
                    <Button
                      size="sm"
                      disabled={resolving === v.id}
                      className="h-8 text-xs gap-1.5"
                      style={{ background: 'oklch(0.52 0.21 11)', color: 'white' }}
                      onClick={() => handleResolve(v)}
                    >
                      {resolving === v.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Resolve
                    </Button>
                  ) : v.status === 'active' ? (
                    <Button size="sm" variant="outline" disabled className="h-8 text-xs gap-1.5 opacity-60">
                      <Lock className="w-3 h-3" />
                      {permissions.isReadOnly ? 'View Only' : 'No Permission'}
                    </Button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
