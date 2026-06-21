import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, CheckCircle, AlertTriangle, FileCheck } from 'lucide-react'
import { useComplianceViolations } from '@/hooks/useSupabaseData'
import { useAppStore } from '@/store/appStore'
import { updateComplianceViolationStatus } from '@/services/dbService'
import type { ComplianceViolation } from '@/services/dbService'
import { toSeverity } from '@/types/db'

function ProgressRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#2E7D32' : score >= 60 ? '#ED6C02' : '#DD3259'

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.94 0 0)" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={22}
        fontWeight="bold" fill={color} style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {score}%
      </text>
    </svg>
  )
}

function computeComplianceScore(violations: ComplianceViolation[]): number {
  const total = violations.length
  if (total === 0) return 100
  const open = violations.filter(v => v.status === 'open').length
  const inProgress = violations.filter(v => v.status === 'in_progress').length
  return Math.max(0, Math.round(100 - ((open + inProgress * 0.5) / total) * 100))
}

function frameworkStats(violations: ComplianceViolation[]) {
  const frameworks = ['NIST', 'CIS', 'GDPR', 'ISO 27001', 'RBI Guidelines']
  return frameworks.map(fw => {
    const fwViolations = violations.filter(v => v.framework === fw)
    if (fwViolations.length === 0) return { framework: fw, total: 0, violations: 0, score: 100 }
    const total = fwViolations.length
    const resolved = fwViolations.filter(v => v.status === 'resolved').length
    const score = Math.round((resolved / total) * 100)
    return { framework: fw, total, violations: fwViolations.filter(v => v.status === 'open').length, score }
  })
}

export function CompliancePage() {
  const { invalidateData, addNotification } = useAppStore()
  const { violations, loading } = useComplianceViolations()

  const [frameworkFilter, setFrameworkFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const allFrameworks = ['all', 'NIST', 'CIS', 'GDPR', 'ISO 27001', 'RBI Guidelines']
  const severities = ['all', 'low', 'medium', 'high', 'critical']
  const statuses = ['all', 'open', 'in_progress', 'resolved', 'dismissed']

  const filtered = violations
    .filter(v => frameworkFilter === 'all' || v.framework === frameworkFilter)
    .filter(v => severityFilter === 'all' || v.severity === severityFilter)
    .filter(v => statusFilter === 'all' || v.status === statusFilter)

  const COMPLIANCE_SCORE = computeComplianceScore(violations)
  const FRAMEWORK_STATS = frameworkStats(violations)
  const openCount = violations.filter(v => v.status === 'open').length
  const criticalCount = violations.filter(v => v.severity === 'critical').length

  async function resolveViolation(id: string) {
    try {
      await updateComplianceViolationStatus(id, 'resolved')
      invalidateData()
      addNotification('Compliance violation resolved', 'success')
    } catch {
      alert('Failed to resolve violation. Please try again.')
    }
  }

  function exportPDF() {
    const content = `ZENITH ZERO — Compliance Report\nGenerated: ${new Date().toISOString()}\n\nTotal Violations: ${violations.length}\nCompliance Score: ${COMPLIANCE_SCORE}%\n\n` +
      violations.map(v =>
        `[${v.severity}] ${v.framework} — ${v.control}\n${v.violation_type}\nAffected: ${v.employee_id}\n`
      ).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'zenith-zero-compliance-report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Compliance Center"
          title="Compliance Audit & Violation Management"
          description="NIST SP 800-53 · CIS Controls v8 · GDPR Article 32 · Zero Trust Architecture"
          actions={
            <Button onClick={exportPDF} variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export Report
            </Button>
          }
        />

        {/* Top stats + score */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Score card */}
          <div className="lg:col-span-1 bg-white border border-border rounded-xl p-5 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Compliance Score</p>
            <ProgressRing score={COMPLIANCE_SCORE} />
            <p className="text-xs text-muted-foreground mt-2">Overall across 4 frameworks</p>
          </div>

          {/* Metric cards */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Violations', value: violations.length, icon: FileCheck, color: 'text-primary' },
              { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-red-700' },
              { label: 'Open Violations', value: openCount, icon: AlertTriangle, color: 'text-orange-600' },
            ].map(c => {
              const Icon = c.icon
              return (
                <div key={c.label} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                    <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                  </div>
                </div>
              )
            })}
            {/* Framework scores */}
            <div className="col-span-3 bg-white border border-border rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Framework Compliance Scores</p>
              <div className="grid grid-cols-4 gap-3">
                {FRAMEWORK_STATS.map(f => (
                  <div key={f.framework}>
                    <p className="text-[10px] text-muted-foreground mb-1 line-clamp-1">{f.framework}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${f.score}%`,
                          background: f.score >= 75 ? '#2E7D32' : f.score >= 60 ? '#ED6C02' : '#DD3259'
                        }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{
                        color: f.score >= 75 ? '#2E7D32' : f.score >= 60 ? '#ED6C02' : '#DD3259'
                      }}>{f.score}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.violations}/{f.total} controls violated</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="w-52 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allFrameworks.map(f => <SelectItem key={f} value={f}>{f === 'all' ? 'All Frameworks' : f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {severities.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Severities' : s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} violations</span>
        </div>

        {/* Violations Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs uppercase tracking-wide">Framework / Control</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Violation</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Affected Identity</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Severity</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : (
                filtered.map(v => (
                  <TableRow key={v.id} className="hover:bg-muted/30 align-top">
                    <TableCell className="py-3 min-w-44">
                      <p className="text-xs font-semibold text-foreground">{v.framework}</p>
                      <p className="text-xs font-mono text-primary mt-0.5">{v.control}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-foreground leading-relaxed">{v.violation_type}</p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-foreground min-w-36">{v.employee_id}</TableCell>
                    <TableCell><SeverityBadge severity={toSeverity(v.severity)} /></TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${
                        v.status === 'resolved' ? 'bg-green-50 text-green-700' :
                        v.status === 'in_progress' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {v.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                        {v.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {v.status === 'open' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => resolveViolation(v.id)}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No violations match the selected filters</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mapped Controls reference */}
        <div className="mt-4 bg-white border border-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Key Mapped Controls</p>
          <div className="flex flex-wrap gap-2">
            {['NIST AC-2', 'NIST AC-6', 'NIST AC-17', 'NIST AU-12', 'CIS-5', 'CIS-6', 'GDPR Art.32', 'ZTA-3', 'ZTA-7'].map(ctrl => (
              <motion.span
                key={ctrl}
                whileHover={{ scale: 1.03 }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-border bg-muted text-foreground cursor-default"
              >
                {ctrl}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
