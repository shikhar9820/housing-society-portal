'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Wallet,
  Vote,
  FileSpreadsheet,
  Megaphone,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  FileCheck,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    title: 'Total Residents',
    value: '1,247',
    description: 'Across 650 flats',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Active Polls',
    value: '3',
    description: 'Voting in progress',
    icon: Vote,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Open Tenders',
    value: '5',
    description: 'Accepting bids',
    icon: FileSpreadsheet,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Monthly Expenses',
    value: '₹8.5L',
    description: 'February 2026',
    icon: Wallet,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

const recentAnnouncements = [
  {
    id: 1,
    title: 'Water Supply Maintenance',
    priority: 'IMPORTANT',
    date: 'Feb 17, 2026',
  },
  {
    id: 2,
    title: 'Annual General Meeting',
    priority: 'URGENT',
    date: 'Feb 15, 2026',
  },
  {
    id: 3,
    title: 'Parking Rules Update',
    priority: 'NORMAL',
    date: 'Feb 12, 2026',
  },
]

const pendingTasks = [
  {
    id: 1,
    title: 'Lift AMC Renewal',
    dueDate: 'Mar 1, 2026',
    type: 'AMC',
    status: 'EXPIRING_SOON',
  },
  {
    id: 2,
    title: 'Water Tank Cleaning',
    dueDate: 'Feb 25, 2026',
    type: 'MAINTENANCE',
    status: 'PENDING',
  },
  {
    id: 3,
    title: 'Fire Safety Inspection',
    dueDate: 'Feb 28, 2026',
    type: 'COMPLIANCE',
    status: 'SCHEDULED',
  },
]

const recentDocuments = [
  {
    id: 1,
    title: 'January 2026 Meeting Minutes',
    category: 'MEETING_MINUTES',
    date: 'Feb 5, 2026',
  },
  {
    id: 2,
    title: 'FY 2025 Audit Report',
    category: 'AUDIT_REPORT',
    date: 'Jan 28, 2026',
  },
  {
    id: 3,
    title: 'Society Bylaws (Updated)',
    category: 'BYLAWS',
    date: 'Jan 15, 2026',
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
      case 'IMPORTANT':
        return <Badge variant="default">Important</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXPIRING_SOON':
        return <Badge variant="destructive">Expiring Soon</Badge>
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'SCHEDULED':
        return <Badge variant="outline">Scheduled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in Angel Jupiter Society today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Announcements */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>Latest society announcements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/announcements">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground">{announcement.date}</p>
                  </div>
                  {getPriorityBadge(announcement.priority)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
              <CardDescription>AMC & Maintenance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/maintenance">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>Recently uploaded</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/documents">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {doc.category.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/complaints/new">
                <AlertCircle className="h-6 w-6" />
                <span>Raise Complaint</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/voting">
                <Vote className="h-6 w-6" />
                <span>Cast Vote</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/documents">
                <FileText className="h-6 w-6" />
                <span>View Documents</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/finances">
                <TrendingUp className="h-6 w-6" />
                <span>View Expenses</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AMC Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Active AMC Contracts
            </CardTitle>
            <CardDescription>Annual Maintenance Contracts Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Lift Maintenance</span>
                <Badge variant="default">Active until Dec 2026</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Generator Service</span>
                <Badge variant="default">Active until Oct 2026</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fire Safety System</span>
                <Badge variant="destructive">Expires Mar 2026</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Pumps</span>
                <Badge variant="default">Active until Aug 2026</Badge>
              </div>
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/dashboard/amc">View All AMC Contracts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Expense Summary
            </CardTitle>
            <CardDescription>This Month&apos;s Breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Security</span>
                <span className="font-medium">₹2,50,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Housekeeping</span>
                <span className="font-medium">₹1,80,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electricity (Common)</span>
                <span className="font-medium">₹1,45,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Maintenance & Repairs</span>
                <span className="font-medium">₹2,75,000</span>
              </div>
              <div className="border-t pt-4 flex items-center justify-between font-bold">
                <span>Total</span>
                <span>₹8,50,000</span>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/finances">View Detailed Report</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
