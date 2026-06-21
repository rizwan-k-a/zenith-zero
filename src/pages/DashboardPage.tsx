import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import {
  Users, AlertTriangle, Shield, Ghost, Clock, FileWarning, Database
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { useTableAvailability, useDashboardStats, useRiskDistribution, usePlatformDistribution, usePrivilegeHistory, useDormantAccess } from '@/hooks/useSupabaseData'
import { useEffect, useState } from 'react'
import { supabase, getLatestSecurityMetric, getPreviousMonthMetric } from '@/services/dbService'

const riskConfig: ChartConfig = {
  Low: { label: 'Low Risk', color: '#2E7D32' },
  Medium: { label: 'Medium Risk', color: '#ED6C02' },
  High: { label: 'High Risk', color: '#DD3259' },
  Critical: { label: 'Critical', color: '#000234' },
}

const platformConfig: ChartConfig = {
  accounts: { label: 'Total Accounts', color: 'oklch(0.08 0.06 261)' },
  privileged: { label: 'Privileged', color: 'oklch(0.52 0.21 11)' },
}

const privilegeConfig: ChartConfig = {
  total: { label: 'Total Privileges', color: 'oklch(0.08 0.06 261)' },
  high: { label: 'High', color: 'oklch(0.65 0.18 52)' },
  critical: { label: 'Critical', color: 'oklch(0.52 0.21 11)' },
}

const dormantConfig: ChartConfig = {
  dormant30: { label: '30 days', color: 'oklch(0.75 0.06 260)' },
  dormant60: { label: '60 days', color: 'oklch(0.55 0.06 260)' },
  dormant90: { label: '90+ days', color: 'oklch(0.08 0.06 261)' },
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function calcTrend(current: number, previous: number): number | undefined {
  if (!previous || previous === 0) return undefined
  return Math.round(((current - previous) / previous) * 100)
}

export function DashboardPage() {
  const { anyAvailable } = useTableAvailability()
  const { stats } = useDashboardStats()
  const { data: riskDistribution } = useRiskDistribution()
  const { data: platformDistribution } = usePlatformDistribution()
  const { data: privilegeHistory } = usePrivilegeHistory()
  const { data: dormantAccess } = useDormantAccess()
  const [recentAlerts, setRecentAlerts] = useState<{ time: string; msg: string; level: string }[]>([])
  const [trends, setTrends] = useState<Record<string, number | undefined>>({})

  useEffect(() => {
    async function loadAlerts() {
      try {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .gte('anomaly_score', 0.7)
          .order('timestamp', { ascending: false })
          .limit(6)
        if (data) {
          setRecentAlerts(
            data.map((d: any) => ({
              time: new Date(d.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
              msg: `${d.action_type} on ${d.resource} from ${d.location} (score: ${d.anomaly_score?.toFixed(2)})`,
              level: d.anomaly_score >= 0.9 ? 'CRITICAL' : d.anomaly_score >= 0.8 ? 'HIGH' : 'MEDIUM',
            }))
          )
        }
      } catch {
        // silently skip alerts if query fails
      }
    }
    loadAlerts()
  }, [])

  useEffect(() => {
    async function loadTrends() {
      try {
        const [latest, previous] = await Promise.all([
          getLatestSecurityMetric(),
          getPreviousMonthMetric(),
        ])
        if (latest && previous) {
          setTrends({
            totalIdentities: calcTrend(latest.total_identities, previous.total_identities),
            highRiskIdentities: calcTrend(latest.high_risk_identities, previous.high_risk_identities),
            privilegedAccounts: calcTrend(latest.privileged_accounts, previous.privileged_accounts),
            zombieAccounts: calcTrend(latest.zombie_accounts, previous.zombie_accounts),
            dormantCredentials: calcTrend(latest.dormant_credentials, previous.dormant_credentials),
            complianceViolations: calcTrend(latest.compliance_violations, previous.compliance_violations),
          })
        }
      } catch {
        // no trends available
      }
    }
    loadTrends()
  }, [])

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Executive Overview"
          labelBadge={anyAvailable ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <Database className="w-3 h-3" />LIVE DATA
            </span>
          ) : undefined}
          title="Identity Security Dashboard"
          description={`Real-time enterprise identity risk intelligence · Updated ${new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC`}
          actions={stats.totalIdentities > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Detection Ready</span>
            </div>
          ) : undefined}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Identities" value={stats.totalIdentities} trend={trends.totalIdentities} icon={Users} color="default" delay={0} />
          <StatCard title="High Risk" value={stats.highRiskIdentities} trend={trends.highRiskIdentities} icon={AlertTriangle} color="danger" delay={100} />
          <StatCard title="Privileged Accounts" value={stats.privilegedAccounts} trend={trends.privilegedAccounts} icon={Shield} color="navy" delay={200} />
          <StatCard title="Zombie Accounts" value={stats.zombieAccounts} trend={trends.zombieAccounts} icon={Ghost} color="danger" delay={300} />
          <StatCard title="Dormant Credentials" value={stats.dormantCredentials} trend={trends.dormantCredentials} icon={Clock} color="warning" delay={400} />
          <StatCard title="Compliance Violations" value={stats.complianceViolations} trend={trends.complianceViolations} icon={FileWarning} color="danger" delay={500} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          <ChartCard title="Risk Distribution" subtitle="Identity risk classification across all platforms">
            <div className="flex items-center justify-center gap-6">
              <ChartContainer config={riskConfig} className="w-44 h-44">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%" cy="50%"
                    innerRadius={44} outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2.5">
                {riskDistribution.map(item => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-semibold text-foreground ml-auto pl-4 tabular-nums">{item.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-xs font-bold text-foreground">{riskDistribution.reduce((s, i) => s + i.value, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Platform Distribution */}
          <ChartCard title="Platform Account Distribution" subtitle="Accounts and privileged users per platform">
            <ChartContainer config={platformConfig} className="h-44 w-full">
              <BarChart data={platformDistribution} margin={{ left: -20, right: 8 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.94 0 0)" />
                <XAxis dataKey="platform" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.replace(' ', '\n').split(' ')[0]} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="accounts" fill="var(--color-accounts)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="privileged" fill="var(--color-privileged)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Privilege Growth Timeline */}
          <ChartCard title="Privilege Growth Timeline" subtitle="Total privilege growth vs. critical escalations over 6 months">
            <ChartContainer config={privilegeConfig} className="h-48 w-full">
              <LineChart data={privilegeHistory} margin={{ left: -20, right: 8 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.94 0 0)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="high" stroke="var(--color-high)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="critical" stroke="var(--color-critical)" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          {/* Dormant Access Analysis */}
          <ChartCard title="Dormant Access Analysis" subtitle="Unused accounts per platform (30 / 60 / 90+ day inactivity)">
            <ChartContainer config={dormantConfig} className="h-48 w-full">
              <BarChart data={dormantAccess} margin={{ left: -20, right: 8 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.94 0 0)" />
                <XAxis dataKey="platform" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="dormant30" fill="var(--color-dormant30)" stackId="a" />
                <Bar dataKey="dormant60" fill="var(--color-dormant60)" stackId="a" />
                <Bar dataKey="dormant90" fill="var(--color-dormant90)" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        {/* Recent Alerts */}
        <div className="mt-6">
          <ChartCard title="Recent High-Priority Alerts" subtitle="Latest critical identity security events">
            <div className="space-y-2">
              {recentAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted transition-colors">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                    alert.level === 'EMERGENCY' ? 'bg-[#000234] text-white' :
                    alert.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>{alert.level}</span>
                  <span className="text-xs text-foreground flex-1">{alert.msg}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">{alert.time}</span>
                </div>
              ))}
              {recentAlerts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">No recent alerts</div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  )
}
