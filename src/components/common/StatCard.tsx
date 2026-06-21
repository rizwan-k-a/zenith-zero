import { motion } from 'framer-motion'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatCardProps {
  title: string
  value: number
  trend?: number
  icon: LucideIcon
  color?: 'default' | 'danger' | 'warning' | 'success' | 'navy'
  delay?: number
  suffix?: string
}

export function StatCard({ title, value, trend, icon: Icon, color = 'default', delay = 0, suffix = '' }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => requestAnimationFrame(tick), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const iconBg: Record<string, string> = {
    default: 'oklch(0.97 0 0)',
    danger: 'oklch(0.97 0.02 11)',
    warning: 'oklch(0.97 0.02 52)',
    success: 'oklch(0.97 0.02 149)',
    navy: 'oklch(0.14 0.06 261)',
  }
  const iconColor: Record<string, string> = {
    default: 'oklch(0.42 0.025 18)',
    danger: 'oklch(0.52 0.21 11)',
    warning: 'oklch(0.55 0.18 52)',
    success: 'oklch(0.45 0.14 149)',
    navy: 'oklch(0.92 0.01 260)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000, ease: 'easeOut' }}
      className="zenith-stat-card cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
            {displayed.toLocaleString()}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-medium">{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
          style={{ background: iconBg[color] }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor[color] }} />
        </div>
      </div>
    </motion.div>
  )
}
