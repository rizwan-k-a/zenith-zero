import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AppSidebar } from './AppSidebar'
import { AppNavbar } from './AppNavbar'
import { useAppStore } from '@/store/appStore'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useAppStore()
  const sidebarW = sidebarCollapsed ? 64 : 240

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppNavbar />
      <motion.main
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  )
}
