import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { detectPrivilegeCreep } from '@/engines/detectionEngine'
import { SeverityBadge, RiskScoreBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Download, Search, TrendingUp, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { getEmployees } from '@/services/dbService'
import type { PrivilegeCreepResult } from '@/types/db'
import { riskScoreFromLevel } from '@/types/db'

type SortField = 'fullName' | 'department' | 'privilegeGrowthPercent' | 'unusedPermissions' | 'riskScore'
type SortDir = 'asc' | 'desc'

interface TableRowData {
  id: string
  employeeId: string
  fullName: string
  department: string
  privilegeLevel: string
  privilegeGrowthPercent: number
  unusedPermissions: number
  riskScore: number
  severity: import('@/types/db').Severity
  hireDate: string
}

export function PrivilegeAnalysisPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('privilegeGrowthPercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<TableRowData[]>([])
  const [privilegeResults, setPrivilegeResults] = useState<PrivilegeCreepResult[]>([])
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 10

  useEffect(() => {
    async function load() {
      try {
      const [emps, creep] = await Promise.all([
        getEmployees({ limit: 1000 }),
        detectPrivilegeCreep(),
      ])
      const creepMap = new Map(creep.map(c => [c.employeeId, c]))
      const mapped = emps.map(emp => {
        const c = creepMap.get(emp.employee_id)
        return {
          id: emp.id,
          employeeId: emp.employee_id,
          fullName: emp.full_name,
          department: emp.department,
          privilegeLevel: c && c.privilegeGrowthPercent > 75 ? 'Super Admin' : c && c.privilegeGrowthPercent > 50 ? 'Admin' : c && c.privilegeGrowthPercent > 25 ? 'Elevated' : 'Standard',
          privilegeGrowthPercent: c?.privilegeGrowthPercent ?? 0,
          unusedPermissions: c?.unusedPermissions ?? 0,
          riskScore: riskScoreFromLevel(emp.risk_level),
          severity: (emp.risk_level === 'critical' ? 'CRITICAL' : emp.risk_level === 'high' ? 'HIGH' : emp.risk_level === 'medium' ? 'MEDIUM' : 'LOW') as import('@/types/db').Severity,
          hireDate: emp.join_date,
        }
      })
      setRows(mapped)
      setPrivilegeResults(creep)
      } catch {
        // show empty table on error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const departments = ['all', ...Array.from(new Set(rows.map(r => r.department))).sort()]
  const levels = ['all', 'Standard', 'Elevated', 'Admin', 'Super Admin']

  const activeRows = rows
  const filtered = activeRows
    .filter(r => deptFilter === 'all' || r.department === deptFilter)
    .filter(r => levelFilter === 'all' || r.privilegeLevel === levelFilter)
    .filter(r =>
      search === '' ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: number | string = a[sortField]
      let bv: number | string = b[sortField]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
    return sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
  }

  function exportCSV() {
    const headers = 'Employee ID,Name,Department,Privilege Level,Growth %,Unused Permissions,Risk Score,Severity'
    const rows = filtered.map(r =>
      `${r.employeeId},"${r.fullName}","${r.department}","${r.privilegeLevel}",${r.privilegeGrowthPercent},${r.unusedPermissions},${r.riskScore},${r.severity}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'privilege-analysis.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const chartData = [...privilegeResults].slice(0, 8).map(r => ({
    name: r.identityName.split(' ')[1] || r.identityName,
    growth: r.privilegeGrowthPercent,
    unused: r.unusedPermissions,
    flagged: r.privilegeGrowthPercent > 50,
  }))

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Privilege Analysis"
          title="Privilege Growth & Creep Detection"
          description="Identify privilege accumulation, unused permissions, and role inheritance anomalies"
          actions={
            <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Active Identities', value: activeRows.length },
            { label: 'Privilege Creep Flagged', value: privilegeResults.filter(p => p.privilegeGrowthPercent > 50).length, warn: true },
            { label: 'Avg Growth %', value: activeRows.length ? Math.round(activeRows.reduce((s, r) => s + r.privilegeGrowthPercent, 0) / activeRows.length) + '%' : '0%' },
            { label: 'Total Unused Permissions', value: activeRows.reduce((s, r) => s + r.unusedPermissions, 0) },
          ].map(card => (
            <div key={card.label} className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${'warn' in card && card.warn ? 'text-primary' : 'text-foreground'}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Top Privilege Growth — Active Identities</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
              <CartesianGrid vertical={false} stroke="oklch(0.94 0 0)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="growth" radius={[3, 3, 0, 0]} label={false}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.flagged ? 'oklch(0.52 0.21 11)' : 'oklch(0.08 0.06 261)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'oklch(0.52 0.21 11)' }} /><span className="text-xs text-muted-foreground">Flagged (Creep)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'oklch(0.08 0.06 261)' }} /><span className="text-xs text-muted-foreground">Normal</span></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-48 max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search name or ID..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(0) }}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Departments' : d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={v => { setLevelFilter(v); setPage(0) }}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Privilege Level" /></SelectTrigger>
            <SelectContent>
              {levels.map(l => <SelectItem key={l} value={l}>{l === 'all' ? 'All Levels' : l}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} identities</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs uppercase tracking-wide py-3 cursor-pointer" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-1">Employee <SortIcon field="fullName" /></div>
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide cursor-pointer" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-1">Department <SortIcon field="department" /></div>
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Current Privileges</TableHead>
                <TableHead className="text-xs uppercase tracking-wide cursor-pointer text-right" onClick={() => handleSort('privilegeGrowthPercent')}>
                  <div className="flex items-center gap-1 justify-end">Growth % <SortIcon field="privilegeGrowthPercent" /></div>
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide cursor-pointer text-right" onClick={() => handleSort('unusedPermissions')}>
                  <div className="flex items-center gap-1 justify-end">Unused <SortIcon field="unusedPermissions" /></div>
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Last Role Change</TableHead>
                <TableHead className="text-xs uppercase tracking-wide cursor-pointer text-right" onClick={() => handleSort('riskScore')}>
                  <div className="flex items-center gap-1 justify-end">Risk <SortIcon field="riskScore" /></div>
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : (
                paginated.map(identity => (
                  <TableRow key={identity.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: identity.riskScore >= 60 ? 'oklch(0.52 0.21 11)' : 'oklch(0.08 0.06 261)' }}
                        >
                          {identity.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{identity.fullName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{identity.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{identity.department}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        identity.privilegeLevel === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                        identity.privilegeLevel === 'Admin' ? 'bg-red-100 text-red-800' :
                        identity.privilegeLevel === 'Elevated' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {identity.privilegeLevel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        identity.privilegeGrowthPercent > 200 ? 'text-primary' :
                        identity.privilegeGrowthPercent > 100 ? 'text-orange-600' : 'text-foreground'
                      }`}>
                        +{identity.privilegeGrowthPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono text-foreground">{identity.unusedPermissions}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {new Date(identity.hireDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <RiskScoreBadge score={identity.riskScore} />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={identity.severity} />
                    </TableCell>
                  </TableRow>
                ))
              )}
              {paginated.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No identities match filters</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
