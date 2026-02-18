'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Megaphone,
  Search,
  Calendar,
  Pin,
  AlertTriangle,
  Info,
  Bell,
  LogIn,
  Building2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Mock announcements data - will be replaced with API call
const mockAnnouncements = [
  {
    id: '1',
    title: 'Annual General Meeting - Notice',
    content: 'The Annual General Meeting of Angel Jupiter Society will be held on March 15, 2025, at 10:00 AM in the Community Hall. All flat owners are requested to attend. Agenda items include approval of annual accounts, election of new committee members, and discussion of proposed maintenance fee revision.',
    priority: 'URGENT',
    category: 'Meeting',
    isPinned: true,
    createdAt: new Date('2025-02-01'),
    expiresAt: new Date('2025-03-15'),
  },
  {
    id: '2',
    title: 'Water Tank Cleaning Schedule',
    content: 'Water tanks in all blocks will be cleaned on February 20-22. Please store adequate water. Block A & B - Feb 20, Block C & D - Feb 21, Block E & F - Feb 22. Cleaning will be done between 9 AM to 3 PM.',
    priority: 'IMPORTANT',
    category: 'Maintenance',
    isPinned: true,
    createdAt: new Date('2025-02-10'),
    expiresAt: new Date('2025-02-22'),
  },
  {
    id: '3',
    title: 'New Security Protocol',
    content: 'Starting from March 1st, all visitors will need to register via the NoBrokerHood app. Residents are requested to pre-approve expected visitors. Delivery personnel will be issued day passes at the main gate.',
    priority: 'IMPORTANT',
    category: 'Security',
    isPinned: false,
    createdAt: new Date('2025-02-15'),
    expiresAt: null,
  },
  {
    id: '4',
    title: 'Holi Celebration 2025',
    content: 'The society will be organizing Holi celebrations on March 14th from 10 AM to 2 PM in the central garden. Organic colors will be provided. Food and refreshments will be arranged. All residents are welcome to participate!',
    priority: 'NORMAL',
    category: 'Event',
    isPinned: false,
    createdAt: new Date('2025-02-16'),
    expiresAt: new Date('2025-03-14'),
  },
  {
    id: '5',
    title: 'Gym Equipment Upgrade',
    content: 'New gym equipment has been installed in the society gymnasium. The gym will be closed on Feb 25-26 for installation. New equipment includes treadmills, cross trainers, and weight training machines.',
    priority: 'NORMAL',
    category: 'Amenities',
    isPinned: false,
    createdAt: new Date('2025-02-12'),
    expiresAt: null,
  },
]

export default function PublicAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredAnnouncements = mockAnnouncements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'IMPORTANT':
        return <Bell className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
      case 'IMPORTANT':
        return <Badge className="bg-orange-500">Important</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Angel Jupiter Society</h1>
              <p className="text-xs text-muted-foreground">Transparency Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/public/tenders">
              <Button variant="ghost" size="sm">Open Tenders</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Resident Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold tracking-tight">Society Announcements</h1>
            </div>
            <p className="text-muted-foreground">
              Stay updated with the latest notices and announcements from Angel Jupiter Society
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="IMPORTANT">Important</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Announcements
              </h2>
              <div className="grid gap-4">
                {pinnedAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityIcon(announcement.priority)}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {getPriorityBadge(announcement.priority)}
                        <Badge variant="outline">{announcement.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Posted {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                        {announcement.expiresAt && (
                          <span className="text-orange-600">
                            {' '}| Expires {formatDistanceToNow(announcement.expiresAt, { addSuffix: true })}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements */}
          {regularAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recent Announcements</h2>
              <div className="grid gap-4">
                {regularAnnouncements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityIcon(announcement.priority)}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {getPriorityBadge(announcement.priority)}
                        <Badge variant="outline">{announcement.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Posted {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredAnnouncements.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No announcements found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Angel Jupiter Housing Society | Transparency Portal</p>
          <p className="mt-1">
            For resident-only features, please{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              sign in
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
