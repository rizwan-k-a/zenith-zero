import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { runFullDetection } from '@/engines/detectionEngine'
import { SeverityBadge, RiskScoreBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlayCircle, RefreshCw, AlertTriangle, Ghost, Server, Clock, Network } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { getEmployeeCount } from '@/services/dbService'
import type { DetectionResult } from '@/types/db'

export function AccessRiskPage() {
  const { detection, setDetectionRunning, setDetectionResult } = useAppStore()
  const [hasRun, setHasRun] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'zombie' | 'service' | 'dormant' | 'drift'>('overview')
  const [detectionRes, setDetectionRes] = useState<DetectionResult | null>(null)
  const [identityCount, setIdentityCount] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)

  const [platformCount, setPlatformCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const db = (await import('@/services/dbService'))
        const [ec, svc, plat] = await Promise.all([
          getEmployeeCount(),
          db.supabase.from('service_accounts').select('*', { count: 'exact', head: true }),
          db.supabase.from('platform_accounts').select('platform').then(r =>
            new Set((r.data ?? []).map((a: any) => a.platform)).size
          ),
        ])
        setIdentityCount(ec)
        setServiceCount(svc.count ?? 0)
        setPlatformCount(typeof plat === 'number' ? plat : 0)
      } catch {
        // show 0 on error
      }
    }
    load()
  }, [])

  async function runDetection() {
    setDetectionRunning(true)
    try {
      const res = await runFullDetection()
      setDetectionRes(res)
      setDetectionResult(res.totalFindings, res.criticalFindings)
      setHasRun(true)
    } catch {
      alert('Detection engine error. Check Supabase connection.')
    } finally {
      setDetectionRunning(false)
    }
  }

  const TABS = [
    { id: 'overview', label: 'Cross-Platform Risk', icon: Network },
    { id: 'zombie', label: 'Zombie Credentials', icon: Ghost },
    { id: 'service', label: 'Service Accounts', icon: Server },
    { id: 'dormant', label: 'Dormant Access', icon: Clock },
    { id: 'drift', label: 'Temp Access Drift', icon: AlertTriangle },
  ] as const

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Access Risk Detection"
          title="Identity Risk Detection"
          description={`Real-time detection across ${identityCount.toLocaleString()} enterprise identities`}
          actions={
            <Button variant="outline" onClick={runDetection} disabled={detection?.isRunning} className="gap-2">
              {detection?.isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {detection?.isRunning ? 'Running...' : 'Run Detection'}
            </Button>
          }
        />

        <AnimatePresence mode="wait">
          {!hasRun && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{identityCount}</div>
                  <div className="text-sm text-muted-foreground">Identities</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{serviceCount}</div>
                  <div className="text-sm text-muted-foreground">Service Accounts</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{platformCount || '—'}</div>
                  <div className="text-sm text-muted-foreground">Platforms</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{identityCount > 0 ? '✓' : '—'}</div>
                  <div className="text-sm text-muted-foreground">Engine Ready</div>
                </div>
              </div>
              <div className="bg-card p-8 rounded-lg border text-center space-y-4">
                <PlayCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Ready to Run Detection</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Execute the detection engine to analyze identity sprawl, zombie credentials, privilege creep, and cross-platform risks.
                </p>
                <Button onClick={runDetection} disabled={detection?.isRunning} className="gap-2">
                  {detection?.isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  {detection?.isRunning ? 'Scanning...' : 'Run Detection'}
                </Button>
              </div>
            </motion.div>
          )}

          {hasRun && detectionRes && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{detectionRes.totalFindings}</div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-red-500">{detectionRes.criticalFindings}</div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{detectionRes.zombieCredentials.length}</div>
                  <div className="text-sm text-muted-foreground">Zombie</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{detectionRes.serviceAccountAbuse.length}</div>
                  <div className="text-sm text-muted-foreground">Svc Abuse</div>
                </div>
                <div className="bg-card p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{detectionRes.dormantAccess.length}</div>
                  <div className="text-sm text-muted-foreground">Dormant</div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <Button key={tab.id} variant={isActive ? 'default' : 'ghost'} onClick={() => setActiveTab(tab.id)} className="gap-2">
                      <Icon className="w-4 h-4" />{tab.label}
                    </Button>
                  )
                })}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cross-Platform Privilege Risk</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identity</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Platforms</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionRes.crossPlatform.map((r) => (
                        <TableRow key={r.employeeId}>
                          <TableCell className="font-medium">{r.identityName}</TableCell>
                          <TableCell>{r.department}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {r.platforms.map((p: string) => (
                                <span key={p} className="text-xs bg-muted px-2 py-1 rounded">{p}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{r.adminPlatforms.length}</TableCell>
                          <TableCell><RiskScoreBadge score={r.riskScore} /></TableCell>
                          <TableCell><SeverityBadge severity={r.severity} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === 'zombie' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Zombie Credentials</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identity</TableHead>
                        <TableHead>Termination</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Platforms</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionRes.zombieCredentials.map((z) => (
                        <TableRow key={z.employeeId}>
                          <TableCell className="font-medium">{z.identityName}</TableCell>
                          <TableCell>{z.terminationDate}</TableCell>
                          <TableCell>{z.daysSinceTermination}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {z.activePlatforms.map((p: string) => (
                                <span key={p} className="text-xs bg-muted px-2 py-1 rounded">{p}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell><RiskScoreBadge score={z.riskScore} /></TableCell>
                          <TableCell><SeverityBadge severity={z.severity} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === 'service' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Account Abuse</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Account</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Days Unused</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionRes.serviceAccountAbuse.map((s) => (
                        <TableRow key={s.serviceAccountId}>
                          <TableCell className="font-medium">{s.serviceName}</TableCell>
                          <TableCell>{s.ownerIdentity}</TableCell>
                          <TableCell>{s.platform}</TableCell>
                          <TableCell>{s.privilegeLevel}</TableCell>
                          <TableCell>{s.daysUnused}</TableCell>
                          <TableCell><SeverityBadge severity={s.severity} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === 'dormant' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dormant Access</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identity</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionRes.dormantAccess.map((d) => (
                        <TableRow key={d.employeeId + d.platform}>
                          <TableCell className="font-medium">{d.identityName}</TableCell>
                          <TableCell>{d.platform}</TableCell>
                          <TableCell>{d.accountId}</TableCell>
                          <TableCell>{d.lastLogin}</TableCell>
                          <TableCell>{d.daysInactive}</TableCell>
                          <TableCell><SeverityBadge severity={d.severity} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === 'drift' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Temporary Access Drift</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identity</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Overdue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionRes.tempAccessDrift.map((t) => (
                        <TableRow key={t.employeeId}>
                          <TableCell className="font-medium">{t.identityName}</TableCell>
                          <TableCell>{t.accessType}</TableCell>
                          <TableCell>{t.expiryDate}</TableCell>
                          <TableCell>{t.daysOverdue}</TableCell>
                          <TableCell>{t.currentStatus}</TableCell>
                          <TableCell><SeverityBadge severity={t.severity} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
