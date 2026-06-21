import type { UserRole } from '@/store/appStore'

export interface NavItem {
  path: string
  label: string
  description: string
  icon: string
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Executive Dashboard',
    description: 'Enterprise identity security overview',
    icon: 'LayoutDashboard',
    roles: ['admin', 'analyst', 'auditor'],
  },
  {
    path: '/identity-graph',
    label: 'Identity Graph',
    description: 'Visualize enterprise identity relationships',
    icon: 'Network',
    roles: ['admin', 'analyst'],
  },
  {
    path: '/privilege-analysis',
    label: 'Privilege Analysis',
    description: 'Analyze privilege growth patterns',
    icon: 'Shield',
    roles: ['admin', 'analyst', 'auditor'],
  },
  {
    path: '/access-risk',
    label: 'Access Risk Detection',
    description: 'Run identity risk detection engine',
    icon: 'AlertTriangle',
    roles: ['admin', 'analyst'],
  },
  {
    path: '/attack-simulator',
    label: 'Attack Path Simulator',
    description: 'Simulate privilege escalation paths',
    icon: 'Swords',
    roles: ['admin', 'analyst'],
  },
  {
    path: '/compliance',
    label: 'Compliance Center',
    description: 'Audit compliance violations',
    icon: 'FileCheck',
    roles: ['admin', 'auditor'],
  },
  {
    path: '/remediation',
    label: 'Remediation Engine',
    description: 'Execute remediation actions',
    icon: 'Wrench',
    roles: ['admin'],
  },
]

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter(item => item.roles.includes(role))
}

export function canAccessPath(path: string, role: UserRole | null): boolean {
  const item = NAV_ITEMS.find(n => path.startsWith(n.path.split('?')[0]))
  if (!item) return false
  return role ? item.roles.includes(role) : false
}
