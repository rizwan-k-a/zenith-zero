import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { orchestrateTermination, analyzePrivilegeDependencies } from '@/engines/lifecycleEngine'
import type { TerminationResult, DiscoveredAccount, PrivilegeDependencyNode } from '@/types/db'
import { getEmployees } from '@/services/dbService'
import type { Employee } from '@/services/dbService'
import { toSeverity } from '@/types/db'
import {
  UserX, Shield, ShieldCheck, GitBranch, AlertTriangle, CheckCircle2,
  Lock, Link, Loader2, ChevronRight, ZapOff
} from 'lucide-react'

const PLATFORM_COLORS: Record<string, string> = {
  'Active Directory': 'bg-blue-50 text-blue-700 border-blue-200',
  'Azure AD': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'AWS IAM': 'bg-orange-50 text-orange-700 border-orange-200',
  'Kubernetes': 'bg-purple-50 text-purple-700 border-purple-200',
  'Okta': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Salesforce': 'bg-sky-50 text-sky-700 border-sky-200',
}

function AccountCard({ account, index }: { account: DiscoveredAccount; index: number }) {
  const colorClass = PLATFORM_COLORS[account.platform] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg border border-border bg-white"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
            {account.platform}
          </span>
          {account.isServiceAccount && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Service Account
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
          account.revocationCategory === 'manual'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {account.revocationCategory === 'manual' ? 'Approval Required' : 'Auto-Revoke'}
        </span>
      </div>
      <p className="text-xs font-mono text-foreground truncate mb-1">{account.accountId}</p>
      <p className="text-[10px] text-muted-foreground mb-2">{account.systemType}</p>
      <div className="flex flex-wrap gap-1">
        {account.roles.slice(0, 3).map(r => (
          <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {r}
          </span>
        ))}
        {account.roles.length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            +{account.roles.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  )
}

function DependencyNode({ node }: { node: PrivilegeDependencyNode }) {
  const indent = node.depth * 16
  return (
    <div className="flex items-start gap-2" style={{ paddingLeft: indent }}>
      {node.depth > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />}
      <div className="flex items-center gap-2 flex-1 py-1">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          node.type === 'employee' || node.type === 'zombie' ? 'bg-primary' :
          node.type === 'group' ? 'bg-blue-500' :
          node.type === 'role' ? 'bg-purple-500' :
          node.type === 'resource' ? 'bg-orange-500' : 'bg-muted-foreground'
        }`} />
        <span className="text-xs text-foreground">{node.label}</span>
        <span className="text-[10px] text-muted-foreground">{node.type}</span>
        {node.inheritedFrom && (
          <span className="text-[10px] text-muted-foreground">← {node.inheritedFrom}</span>
        )}
      </div>
    </div>
  )
}

export function LifecycleTab() {
  const { user, permissions, addResidualViolations, invalidateData, addNotification } = useAppStore()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<TerminationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dependencyTree, setDependencyTree] = useState<PrivilegeDependencyNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const emps = await getEmployees({ limit: 1000 })
      const sorted = [...emps].sort((a: Employee, b: Employee) => {
        if (a.employment_status === 'terminated' && b.employment_status !== 'terminated') return -1
        if (a.employment_status !== 'terminated' && b.employment_status === 'terminated') return 1
        const ar = a.risk_level === 'critical' ? 4 : a.risk_level === 'high' ? 3 : a.risk_level === 'medium' ? 2 : 1
        const br = b.risk_level === 'critical' ? 4 : b.risk_level === 'high' ? 3 : b.risk_level === 'medium' ? 2 : 1
        return br - ar
      })
      setEmployees(sorted)
      setLoading(false)
    }
    load()
  }, [])

  const selectedEmployee = employees.find(e => e.employee_id === selectedEmployeeId)

  useEffect(() => {
    async function loadTree() {
      if (!selectedEmployeeId) {
        setDependencyTree([])
        return
      }
      const tree = await analyzePrivilegeDependencies(selectedEmployeeId)
      setDependencyTree(tree)
    }
    loadTree()
  }, [selectedEmployeeId])

  async function handleTriggerTermination() {
    if (!selectedEmployeeId) return
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await orchestrateTermination(selectedEmployeeId, user?.name ?? 'Admin')
      setResult(res)
      if (res.residualViolations.length > 0) {
        addResidualViolations(res.residualViolations)
      }
      invalidateData()
      addNotification(`Employee termination completed — all access revoked`, 'warning')
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Orchestration failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground mb-1">Identity Lifecycle Orchestration</p>
        <p className="text-xs text-muted-foreground">
          Select an employee to analyze their privilege dependency graph and execute a full lifecycle termination sequence.
          Automatically identifies all linked accounts across platforms and resolves inherited privileges recursively.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Select Employee</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Select employee by ID or name..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                ) : (
                  employees.map(emp => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id}>
                      <div className="flex items-center gap-2">
                        {emp.employment_status === 'terminated' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">TERMINATED</span>
                        )}
                        <span>{emp.full_name}</span>
                        <span className="text-muted-foreground">({emp.employee_id})</span>
                        <span className="text-muted-foreground">· {emp.department}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {permissions.canTriggerTermination ? (
            <Button
              onClick={handleTriggerTermination}
              disabled={!selectedEmployeeId || running}
              className="gap-2 h-10 font-semibold"
              style={{ background: selectedEmployeeId && !running ? 'oklch(0.52 0.21 11)' : undefined, color: selectedEmployeeId && !running ? 'white' : undefined }}
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ZapOff className="w-4 h-4" />}
              {running ? 'Orchestrating...' : 'Trigger Termination'}
            </Button>
          ) : (
            <Button disabled variant="outline" className="gap-2 h-10">
              <Lock className="w-4 h-4" />
              {permissions.isReadOnly ? 'View Only' : 'Scan Only'}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedEmployee.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmployee.designation} · {selectedEmployee.department} · {selectedEmployee.region}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedEmployee.email}</p>
                  </div>
                  <div className="text-right">
                    <SeverityBadge severity={toSeverity(selectedEmployee.risk_level)} />
                    <p className="text-xs text-muted-foreground mt-1">Risk: {selectedEmployee.risk_level}</p>
                    {selectedEmployee.termination_date && (
                      <p className="text-[10px] text-red-600 mt-1 font-medium">Terminated: {selectedEmployee.termination_date}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {dependencyTree.length > 0 && !result && (
        <div className="bg-white border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Privilege Dependency Graph ({dependencyTree.length} nodes)
            </p>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {dependencyTree.map(node => (
              <DependencyNode key={node.nodeId} node={node} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            All {dependencyTree.filter(n => n.type === 'resource').length} critical resources are reachable via this identity's trust chain.
            Triggering termination will recursively sever all {dependencyTree.length} dependency nodes.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-bold text-foreground">Termination Orchestration Complete</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Accounts Discovered', value: result.discoveredAccounts.length, icon: UserX, color: 'text-foreground' },
                { label: 'Auto-Revoked', value: result.autoRevoked.length, icon: ShieldCheck, color: 'text-green-700' },
                { label: 'Pending Approval', value: result.pendingApproval.length, icon: Shield, color: 'text-orange-600' },
                { label: 'Residual Violations', value: result.residualViolations.length, icon: AlertTriangle, color: 'text-primary' },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                    <Icon className={`w-4 h-4 ${s.color} mb-1`} />
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {result.autoRevoked.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Auto-Revoked ({result.autoRevoked.length})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.autoRevoked.map((acc, i) => (
                  <AccountCard key={`${acc.accountId}-${i}`} account={acc} index={i} />
                ))}
              </div>
            </div>
          )}

          {result.pendingApproval.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-orange-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Queued for Manual Approval ({result.pendingApproval.length})
                </p>
                <Badge variant="outline" className="text-[10px]">See Approvals tab</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.pendingApproval.map((acc, i) => (
                  <AccountCard key={`${acc.accountId}-${i}`} account={acc} index={i} />
                ))}
              </div>
            </div>
          )}

          {result.crossDepLocks > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cross-Dependency Locks Applied ({result.crossDepLocks})
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.crossDepLocks} trust paths have been locked to prevent privilege re-creation via alternate
                federation chains (AD sync, SAML, OIDC, EKS IAM). The revoked identity cannot gain access
                through any alternate platform trust relationship.
              </p>
            </div>
          )}

          {result.residualViolations.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Residual Access Violations ({result.residualViolations.length})
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                These accounts remain active pending manual approval. Flagged as residual access violations
                requiring escalation. Check the Scanner tab for full details.
              </p>
              <div className="space-y-2">
                {result.residualViolations.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{v.platform}: {v.account_id}</p>
                      <p className="text-[10px] text-muted-foreground">{v.access_level}</p>
                    </div>
                    <SeverityBadge severity={toSeverity(v.severity)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.dependencyTree.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Severed Dependency Tree ({result.dependencyTree.length} nodes)
                </p>
              </div>
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {result.dependencyTree.map(node => (
                  <DependencyNode key={node.nodeId} node={node} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!selectedEmployeeId && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UserX className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Select an employee to begin lifecycle analysis</p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
            The engine will recursively map all privilege dependencies and generate a full revocation plan across all linked platforms.
          </p>
        </div>
      )}
    </div>
  )
}
