import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Network, Shield, AlertTriangle,
  Swords, FileCheck, Wrench, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { getNavItemsForRole } from '@/lib/rbac'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Network,
  Shield,
  AlertTriangle,
  Swords,
  FileCheck,
  Wrench,
}

export function AppSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, user } = useAppStore()
  const navigate = useNavigate()

  const navItems = getNavItemsForRole(user?.role ?? null)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full z-30 flex flex-col overflow-hidden"
        style={{ background: 'oklch(0.08 0.06 261)', borderRight: '1px solid oklch(0.16 0.06 261)' }}
      >
        <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: 'oklch(0.16 0.06 261)' }}>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 min-w-0">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <p className="text-white font-bold text-sm leading-none tracking-wider">ZENITH ZERO</p>
                  <p className="text-xs leading-none mt-1" style={{ color: 'oklch(0.55 0.04 260)' }}>Identity Intelligence</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'sidebar-nav-link flex items-center gap-3 mx-2 mb-1 rounded-lg transition-all duration-150',
                      sidebarCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        <div className="p-2 border-t" style={{ borderColor: 'oklch(0.16 0.06 261)' }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center rounded-lg p-2 transition-colors"
            style={{ color: 'oklch(0.55 0.04 260)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.14 0.06 261)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
