import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Lock, Mail, AlertCircle, ShieldCheck, ShieldAlert, FileCheck } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DemoCard {
  role: string
  name: string
  title: string
  email: string
  password: string
  label: string
  desc: string
  icon: typeof ShieldCheck
  accent: string
}

const DEMO_CARDS: DemoCard[] = [
  {
    role: 'admin',
    name: 'Rizwan Ahmed',
    title: 'Chief Security Administrator',
    email: 'admin@bharatsecurebank.in',
    password: 'SecureBank@123',
    label: 'Admin',
    desc: 'Full Access',
    icon: ShieldCheck,
    accent: 'oklch(0.52 0.21 11)',
  },
  {
    role: 'analyst',
    name: 'Tarun Gowda',
    title: 'Security Operations Analyst',
    email: 'analyst@bharatsecurebank.in',
    password: 'SecureBank@123',
    label: 'Security Analyst',
    desc: 'Threat Detection + Monitoring',
    icon: ShieldAlert,
    accent: 'oklch(0.55 0.18 250)',
  },
  {
    role: 'auditor',
    name: 'Prasad Hegde',
    title: 'Compliance Auditor',
    email: 'auditor@bharatsecurebank.in',
    password: 'SecureBank@123',
    label: 'Auditor',
    desc: 'Compliance + Read Only',
    icon: FileCheck,
    accent: 'oklch(0.52 0.15 150)',
  },
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const { login } = useAppStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your credentials.')
      return
    }
    setLoading(true)
    setError('')
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Please verify your email and password.')
    }
  }

  function fillDemo(card: DemoCard) {
    setEmail(card.email)
    setPassword(card.password)
    setActiveCard(card.role)
    setError('')
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12"
        style={{ background: 'oklch(0.08 0.06 261)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.52 0.21 11)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold tracking-wider text-lg leading-none">ZENITH ZERO</p>
            <p className="text-xs leading-none mt-1" style={{ color: 'oklch(0.55 0.04 260)' }}>Identity Intelligence Platform</p>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Zero Hidden<br />Privileges.<br />Zero Blind Spots.
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'oklch(0.65 0.03 260)' }}>
              Enterprise Identity Security Intelligence for hybrid banking infrastructure. Detect privilege sprawl, zombie credentials, and attack paths before they become incidents.
            </p>
          </motion.div>
        </div>

        <p className="text-xs" style={{ color: 'oklch(0.40 0.03 260)' }}>
          © 2025 Zenith Zero · Bharat Secure Bank · Enterprise Identity Governance · Confidential
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.08 0.06 261)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold tracking-wider text-foreground">ZENITH ZERO</p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-8">Enter your enterprise credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@bharatsecurebank.in"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none bg-white focus:border-primary transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-border rounded-lg outline-none bg-white focus:border-primary transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold"
              style={{ background: 'oklch(0.52 0.21 11)', color: 'white' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Demo Access</p>
            <div className="space-y-2">
              {DEMO_CARDS.map(card => {
                const Icon = card.icon
                const isActive = activeCard === card.role
                return (
                  <button
                    key={card.role}
                    onClick={() => fillDemo(card)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                      isActive
                        ? 'border-primary shadow-sm'
                        : 'border-border hover:border-primary/40 hover:shadow-sm'
                    )}
                    style={isActive ? { background: `oklch(0.97 0.02 11)` } : undefined}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: card.accent }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{card.label}</p>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {card.desc}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.name}</p>
                      <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{card.email}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
