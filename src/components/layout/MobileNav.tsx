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
  X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Role } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles?: Role[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Documents', href: '/dashboard/documents', icon: FileText },
  { title: 'Finances', href: '/dashboard/finances', icon: Wallet },
  { title: 'Voting', href: '/dashboard/voting', icon: Vote },
  { title: 'Tenders', href: '/dashboard/tenders', icon: FileSpreadsheet },
  { title: 'AMC Contracts', href: '/dashboard/amc', icon: FileCheck },
  { title: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { title: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { title: 'Complaints', href: '/dashboard/complaints', icon: AlertCircle },
  { title: 'Residents', href: '/dashboard/residents', icon: Users },
]

const adminNavItems: NavItem[] = [
  { title: 'User Management', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { title: 'Flat Management', href: '/dashboard/admin/flats', icon: Building2, roles: ['ADMIN'] },
  { title: 'Settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole?: Role
}

export function MobileNav({ open, onOpenChange, userRole = 'RESIDENT' }: MobileNavProps) {
  const pathname = usePathname()
  const isAdmin = userRole === 'ADMIN'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Angel Jupiter
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
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
              <div className="px-4 py-2">
                <div className="border-t" />
              </div>
              <div className="px-7 py-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Admin
                </span>
              </div>
              <nav className="space-y-1 px-4 pb-4">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  )
}
