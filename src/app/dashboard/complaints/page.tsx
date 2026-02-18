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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react'
import { COMPLAINT_CATEGORIES } from '@/types'

const mockComplaints = [
  {
    id: '1',
    title: 'Water leakage in parking',
    description: 'There is continuous water leakage in basement parking area near spot B-45',
    category: 'MAINTENANCE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-02-15',
    createdBy: { name: 'Rajesh Sharma', flat: 'A-101' },
    assignedTo: 'Maintenance Team',
  },
  {
    id: '2',
    title: 'Lift not working',
    description: 'Tower B lift #2 has been out of service since morning',
    category: 'MAINTENANCE',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2026-02-17',
    createdBy: { name: 'Priya Patel', flat: 'B-205' },
    assignedTo: null,
  },
  {
    id: '3',
    title: 'Noise from construction',
    description: 'Loud construction noise from flat C-302 during restricted hours',
    category: 'NOISE',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2026-02-10',
    createdBy: { name: 'Amit Kumar', flat: 'C-301' },
    assignedTo: 'Committee',
    resolution: 'Warning issued to flat owner',
  },
  {
    id: '4',
    title: 'Streetlight not working',
    description: 'Streetlight near Tower D entrance is not working for past 3 days',
    category: 'ELECTRICITY',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: '2026-02-16',
    createdBy: { name: 'Sunita Verma', flat: 'D-102' },
    assignedTo: null,
  },
]

export default function ComplaintsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [newComplaintOpen, setNewComplaintOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive">Open</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">In Progress</Badge>
      case 'RESOLVED':
        return <Badge className="bg-green-500">Resolved</Badge>
      case 'CLOSED':
        return <Badge variant="secondary">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="default" className="bg-orange-500">High</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">Medium</Badge>
      case 'LOW':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const openCount = mockComplaints.filter((c) => c.status === 'OPEN').length
  const inProgressCount = mockComplaints.filter((c) => c.status === 'IN_PROGRESS').length
  const resolvedCount = mockComplaints.filter((c) => c.status === 'RESOLVED').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">
            Raise and track society complaints
          </p>
        </div>
        <Dialog open={newComplaintOpen} onOpenChange={setNewComplaintOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Raise Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Raise New Complaint</DialogTitle>
              <DialogDescription>
                Submit a complaint for society-related issues
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Subject</Label>
                <Input id="title" placeholder="Brief description of the issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLAINT_CATEGORIES.map((cat) => (
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
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Detailed description of the issue" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <Input id="attachments" type="file" multiple accept="image/*,.pdf" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setNewComplaintOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Complaint</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Complaints
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockComplaints.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Being addressed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
          <CardDescription>Track and manage all complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Date</TableHead>
                {isCommittee && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {complaint.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{complaint.category}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{complaint.createdBy.name}</p>
                      <p className="text-xs text-muted-foreground">{complaint.createdBy.flat}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  {isCommittee && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
