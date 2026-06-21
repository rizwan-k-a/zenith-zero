import type { Severity } from '@/types/db'

const SEVERITY_CONFIG: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: 'LOW', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  MEDIUM: { label: 'MEDIUM', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  HIGH: { label: 'HIGH', bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  CRITICAL: { label: 'CRITICAL', bg: '#fef2f2', text: '#7f1d1d', border: '#fecaca' },
  EMERGENCY: { label: 'EMERGENCY', bg: '#000234', text: '#fff', border: 'transparent' },
}

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border ${className}`}
      style={{ background: config.bg, color: config.text, borderColor: config.border }}
    >
      {config.label}
    </span>
  )
}

export function RiskScoreBadge({ score }: { score: number }) {
  const color = score >= 81 ? '#7f1d1d' : score >= 61 ? '#9f1239' : score >= 41 ? '#9a3412' : score >= 21 ? '#854d0e' : '#166534'
  const bg = score >= 81 ? '#fef2f2' : score >= 61 ? '#fff1f2' : score >= 41 ? '#fff7ed' : score >= 21 ? '#fefce8' : '#f0fdf4'
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-bold tabular-nums"
      style={{ color, background: bg }}
    >
      {score}
    </span>
  )
}
