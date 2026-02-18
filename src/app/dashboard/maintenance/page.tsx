'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wrench,
  Plus,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  User,
} from 'lucide-react'

const mockTasks = [
  {
    id: '1',
    title: 'Water Tank Cleaning',
    description: 'Quarterly cleaning of underground and overhead water tanks',
    category: 'PLUMBING',
    location: 'All Towers',
    priority: 'HIGH',
    status: 'PENDING',
    estimatedCost: 25000,
    actualCost: null,
    assignedTo: 'CleanWater Services',
    dueDate: '2026-02-25',
    createdAt: '2026-02-10',
  },
  {
    id: '2',
    title: 'Lobby Light Replacement - Tower A',
    description: 'Replace faulty LED lights in Tower A ground floor lobby',
    category: 'ELECTRICAL',
    location: 'Tower A - Ground Floor',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    estimatedCost: 8000,
    actualCost: null,
    assignedTo: 'Sharma Electricals',
    dueDate: '2026-02-20',
    createdAt: '2026-02-12',
  },
  {
    id: '3',
    title: 'Garden Irrigation System Repair',
    description: 'Fix broken sprinkler heads and leaking pipes in central garden',
    category: 'PLUMBING',
    location: 'Central Garden',
    priority: 'LOW',
    status: 'PENDING',
    estimatedCost: 15000,
    actualCost: null,
    assignedTo: null,
    dueDate: '2026-03-01',
    createdAt: '2026-02-14',
  },
  {
    id: '4',
    title: 'Parking Area Line Marking',
    description: 'Repaint parking lines and numbering in basement parking',
    category: 'CIVIL',
    location: 'Basement Parking - All Towers',
    priority: 'MEDIUM',
    status: 'ON_HOLD',
    estimatedCost: 45000,
    actualCost: null,
    assignedTo: 'QuickPaint Services',
    dueDate: '2026-03-15',
    createdAt: '2026-02-01',
    remarks: 'Waiting for vendor availability',
  },
  {
    id: '5',
    title: 'Security Boom Barrier Repair',
    description: 'Repair malfunctioning boom barrier at main entrance',
    category: 'MECHANICAL',
    location: 'Main Gate',
    priority: 'URGENT',
    status: 'COMPLETED',
    estimatedCost: 12000,
    actualCost: 10500,
    assignedTo: 'SecureTech Systems',
    dueDate: '2026-02-15',
    completedAt: '2026-02-14',
    createdAt: '2026-02-10',
  },
  {
    id: '6',
    title: 'Terrace Waterproofing - Tower B',
    description: 'Apply waterproofing solution to prevent leakage',
    category: 'CIVIL',
    location: 'Tower B - Terrace',
    priority: 'HIGH',
    status: 'COMPLETED',
    estimatedCost: 85000,
    actualCost: 78000,
    assignedTo: 'BuildRight Construction',
    dueDate: '2026-02-10',
    completedAt: '2026-02-08',
    createdAt: '2026-01-20',
  },
]

const TASK_CATEGORIES = [
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'CIVIL', label: 'Civil Work' },
  { value: 'MECHANICAL', label: 'Mechanical' },
  { value: 'PAINTING', label: 'Painting' },
  { value: 'CARPENTRY', label: 'Carpentry' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'OTHER', label: 'Other' },
]

export default function MaintenancePage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [addTaskOpen, setAddTaskOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">In Progress</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'ON_HOLD':
        return <Badge variant="outline">On Hold</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
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

  const getCategoryLabel = (category: string) => {
    const cat = TASK_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const filteredTasks = mockTasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesStatus && matchesPriority
  })

  const pendingTasks = mockTasks.filter((t) => t.status === 'PENDING')
  const inProgressTasks = mockTasks.filter((t) => t.status === 'IN_PROGRESS')
  const completedTasks = mockTasks.filter((t) => t.status === 'COMPLETED')
  const totalEstimatedCost = mockTasks.filter((t) => t.status !== 'COMPLETED').reduce((sum, t) => sum + (t.estimatedCost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage society maintenance work
          </p>
        </div>
        {isCommittee && (
          <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Maintenance Task</DialogTitle>
                <DialogDescription>
                  Create a new maintenance task
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" placeholder="Enter task title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_CATEGORIES.map((cat) => (
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
                  <Textarea id="description" placeholder="Detailed description of work required" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., Tower A - Ground Floor" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
                    <Input id="estimatedCost" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Input id="assignedTo" placeholder="Vendor or staff name" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Cost
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimatedCost)}</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks Alert */}
      {mockTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Urgent Tasks Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTasks
                .filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED')
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(task.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>
            View and manage maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                {isCommittee && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(task.category)}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {task.status === 'COMPLETED' && task.actualCost ? (
                      <div>
                        <p className="font-medium text-green-600">
                          {formatCurrency(task.actualCost)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Est: {formatCurrency(task.estimatedCost)}
                        </p>
                      </div>
                    ) : (
                      formatCurrency(task.estimatedCost)
                    )}
                  </TableCell>
                  {isCommittee && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
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
