'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  User,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Bell,
} from 'lucide-react'
import { ANNOUNCEMENT_CATEGORIES } from '@/types'

const mockAnnouncements = [
  {
    id: '1',
    title: 'Water Supply Interruption - Scheduled Maintenance',
    content: 'Dear Residents,\n\nPlease note that water supply will be interrupted on February 20, 2026 from 10 AM to 4 PM due to scheduled tank cleaning and maintenance work.\n\nWe request all residents to store sufficient water for the day. The underground and overhead tanks will be cleaned and sanitized during this period.\n\nWe apologize for any inconvenience caused.',
    priority: 'IMPORTANT',
    category: 'MAINTENANCE',
    isPinned: true,
    expiresAt: '2026-02-20',
    createdAt: '2026-02-17',
    createdBy: { name: 'Management Committee' },
  },
  {
    id: '2',
    title: 'Annual General Meeting Notice',
    content: 'The Annual General Meeting of Angel Jupiter Housing Society will be held on March 1, 2026 at 4:00 PM in the Community Hall.\n\nAgenda:\n1. Approval of previous meeting minutes\n2. Annual financial statement presentation\n3. Committee election for 2026-27\n4. Budget approval for FY 2026-27\n5. Any other matters\n\nAll members are requested to attend.',
    priority: 'URGENT',
    category: 'MEETING',
    isPinned: true,
    expiresAt: '2026-03-01',
    createdAt: '2026-02-15',
    createdBy: { name: 'Secretary' },
  },
  {
    id: '3',
    title: 'Holi Celebration 2026',
    content: 'Dear Residents,\n\nWe are organizing Holi celebration in the society garden on March 14, 2026 from 9 AM to 1 PM.\n\nHighlights:\n- Rain dance\n- Organic colors\n- Thandai and snacks\n- DJ Music\n\nAll residents are cordially invited with family. Please register at the security desk by March 10.',
    priority: 'NORMAL',
    category: 'EVENT',
    isPinned: false,
    expiresAt: '2026-03-14',
    createdAt: '2026-02-12',
    createdBy: { name: 'Cultural Committee' },
  },
  {
    id: '4',
    title: 'New Parking Guidelines',
    content: 'Effective March 1, 2026, the following parking guidelines will be implemented:\n\n1. All vehicles must display society parking stickers\n2. Visitor parking limited to 4 hours\n3. No parking in fire lanes - strict penalty\n4. Two-wheelers to park only in designated areas\n\nPlease collect your parking stickers from the security office.',
    priority: 'IMPORTANT',
    category: 'GENERAL',
    isPinned: false,
    expiresAt: null,
    createdAt: '2026-02-10',
    createdBy: { name: 'Management Committee' },
  },
  {
    id: '5',
    title: 'Lift Maintenance Completed',
    content: 'We are pleased to inform all residents that the annual maintenance of all 6 lifts has been completed successfully.\n\nAll lifts are now operational with updated safety certifications.',
    priority: 'NORMAL',
    category: 'MAINTENANCE',
    isPinned: false,
    expiresAt: null,
    createdAt: '2026-02-05',
    createdBy: { name: 'Technical Committee' },
  },
]

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const filteredAnnouncements = mockAnnouncements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ann.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || ann.priority === priorityFilter
    return matchesSearch && matchesCategory && matchesPriority
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
        return <Badge variant="default">Important</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with society news, events, and notices
          </p>
        </div>
        {isCommittee && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Post a new announcement for society residents
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Announcement title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="IMPORTANT">Important</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement here..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Input id="expiresAt" type="date" />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="isPinned" className="rounded border-gray-300" />
                      <Label htmlFor="isPinned">Pin this announcement</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Post Announcement</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
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
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Pin className="h-5 w-5" />
            Pinned
          </h2>
          <div className="grid gap-4">
            {pinnedAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(announcement.priority)}
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="outline">{announcement.category}</Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {announcement.createdBy.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    {announcement.expiresAt && (
                      <span className="text-orange-600">
                        Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="h-5 w-5" />
          All Announcements
        </h2>
        <div className="grid gap-4">
          {regularAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(announcement.priority)}
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(announcement.priority)}
                    <Badge variant="outline">{announcement.category}</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {announcement.createdBy.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm line-clamp-4">{announcement.content}</p>
                {announcement.content.length > 300 && (
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Read more
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
