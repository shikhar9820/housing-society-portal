'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Vote,
  FileSpreadsheet,
  Megaphone,
  AlertCircle,
  Users,
  Settings,
  Wrench,
  FileCheck,
  Building2,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Role } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles?: Role[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    title: 'Finances',
    href: '/dashboard/finances',
    icon: Wallet,
  },
  {
    title: 'Voting',
    href: '/dashboard/voting',
    icon: Vote,
  },
  {
    title: 'Tenders',
    href: '/dashboard/tenders',
    icon: FileSpreadsheet,
  },
  {
    title: 'AMC Contracts',
    href: '/dashboard/amc',
    icon: FileCheck,
  },
  {
    title: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: Wrench,
  },
  {
    title: 'Announcements',
    href: '/dashboard/announcements',
    icon: Megaphone,
  },
  {
    title: 'Complaints',
    href: '/dashboard/complaints',
    icon: AlertCircle,
  },
  {
    title: 'Residents',
    href: '/dashboard/residents',
    icon: Users,
  },
]

const adminNavItems: NavItem[] = [
  {
    title: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Flat Management',
    href: '/dashboard/admin/flats',
    icon: Building2,
    roles: ['ADMIN'],
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
]

interface SidebarProps {
  userRole?: Role
}

export function Sidebar({ userRole = 'RESIDENT' }: SidebarProps) {
  const pathname = usePathname()

  const isAdmin = userRole === 'ADMIN'

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Angel Jupiter</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {isAdmin && (
          <>
            <div className="my-4 px-6">
              <div className="border-t" />
            </div>
            <div className="px-6 mb-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Admin
              </span>
            </div>
            <nav className="space-y-1 px-3">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Angel Jupiter Society Portal
          </p>
          <p className="text-xs text-muted-foreground">
            Transparency & Management
          </p>
        </div>
      </div>
    </div>
  )
}
