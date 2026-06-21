import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, RefreshCw, Download, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { getEmployees } from '@/services/dbService'
import type { Employee } from '@/services/dbService'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  analyst: 'bg-blue-50 text-blue-700 border-blue-200',
  auditor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  analyst: 'Analyst',
  auditor: 'Auditor',
}

export function AppNavbar() {
  const { user, logout, notificationCount, notifications, clearNotifications, sidebarCollapsed, detection } = useAppStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Employee[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const sidebarW = sidebarCollapsed ? 64 : 240
  const role = user?.role ?? 'auditor'
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '??'

  useEffect(() => {
    async function doSearch() {
      if (searchQuery.length >= 2) {
        const results = await getEmployees({ limit: 6, search: searchQuery })
        setSearchResults(results)
        setShowSearch(true)
      } else {
        setShowSearch(false)
        setSearchResults([])
      }
    }
    doSearch()
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav
      className="fixed top-0 right-0 z-40 h-16 border-b border-border bg-white flex items-center px-4"
      style={{ left: sidebarW, transition: 'left 0.2s ease-in-out' }}
    >
      {/* Global Search */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search identities, employees, departments..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none bg-muted focus:bg-white focus:border-primary transition-colors"
          />
        </div>
        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {searchResults.length > 0 ? (
              searchResults.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearch(false)
                    navigate(`/identity-graph?id=${emp.employee_id}`)
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'oklch(0.08 0.06 261)' }}
                  >
                    {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{emp.full_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{emp.employee_id} · {emp.department}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Detection Status */}
        {detection.isRunning && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-medium text-orange-700 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Detection Running
          </div>
        )}

        <div className="h-5 w-px bg-border" />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
              {notificationCount > 0 && (
                <button onClick={clearNotifications} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">No new notifications</div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div key={n.id} className="px-3 py-2.5 border-b border-border last:border-0">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.type === 'success' ? 'bg-green-500' :
                      n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <button
          className="hidden md:flex p-2 rounded-lg hover:bg-muted transition-colors"
          title="Export summary report"
          onClick={() => {
            const ts = new Date().toISOString()
            const content = `ZENITH ZERO - Summary Export\nGenerated: ${ts}\nUser: ${user?.name ?? 'Unknown'}\nRole: ${user?.role ?? 'unknown'}\n\nFor full reports: open Remediation Engine → Export Report`
            const blob = new Blob([content], { type: 'text/plain' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `zenithzero-summary-${Date.now()}.txt`
            a.click()
          }}
        >
          <Download className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="h-5 w-px bg-border" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'oklch(0.08 0.06 261)' }}
              >
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.title}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'oklch(0.08 0.06 261)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 flex items-center gap-2">
              <Badge className={`h-5 px-2 text-[10px] font-medium border ${ROLE_BADGE_STYLES[role] ?? ''}`}>
                {ROLE_LABELS[role] ?? 'Auditor'}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => navigate('/privilege-analysis')}>
              <UserIcon className="w-3.5 h-3.5" />
              View Privilege Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-xs gap-2 text-primary cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
