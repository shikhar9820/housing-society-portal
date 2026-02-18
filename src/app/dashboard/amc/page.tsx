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
  Plus,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  IndianRupee,
  History,
} from 'lucide-react'

const mockAMCs = [
  {
    id: '1',
    title: 'Elevator/Lift Maintenance',
    vendor: 'ThyssenKrupp Elevators',
    category: 'LIFT',
    contractNumber: 'TK-AJ-2024-001',
    startDate: '2024-04-01',
    endDate: '2026-03-31',
    amount: 360000,
    paymentFrequency: 'YEARLY',
    lastServiceDate: '2026-02-10',
    nextServiceDate: '2026-03-10',
    contactPerson: 'Rakesh Kumar',
    contactPhone: '+91 98765 43210',
    status: 'ACTIVE',
    daysRemaining: 41,
    services: [
      { date: '2026-02-10', description: 'Monthly inspection and lubrication', status: 'COMPLETED' },
      { date: '2026-01-10', description: 'Monthly inspection', status: 'COMPLETED' },
      { date: '2025-12-10', description: 'Quarterly overhaul', status: 'COMPLETED' },
    ],
  },
  {
    id: '2',
    title: 'Fire Safety System',
    vendor: 'FireSafe Systems Pvt Ltd',
    category: 'FIRE_SAFETY',
    contractNumber: 'FS-AJ-2025-002',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    amount: 180000,
    paymentFrequency: 'YEARLY',
    lastServiceDate: '2026-01-15',
    nextServiceDate: '2026-04-15',
    contactPerson: 'Amit Shah',
    contactPhone: '+91 98765 11111',
    status: 'EXPIRING_SOON',
    daysRemaining: 41,
    services: [
      { date: '2026-01-15', description: 'Quarterly fire drill and equipment check', status: 'COMPLETED' },
      { date: '2025-10-15', description: 'Quarterly inspection', status: 'COMPLETED' },
    ],
  },
  {
    id: '3',
    title: 'Generator Maintenance',
    vendor: 'Kirloskar Generators',
    category: 'GENERATOR',
    contractNumber: 'KG-AJ-2024-003',
    startDate: '2024-06-01',
    endDate: '2026-05-31',
    amount: 240000,
    paymentFrequency: 'YEARLY',
    lastServiceDate: '2026-02-05',
    nextServiceDate: '2026-03-05',
    contactPerson: 'Suresh Mehta',
    contactPhone: '+91 98765 22222',
    status: 'ACTIVE',
    daysRemaining: 102,
    services: [
      { date: '2026-02-05', description: 'Monthly oil check and run test', status: 'COMPLETED' },
      { date: '2026-01-05', description: 'Monthly inspection', status: 'COMPLETED' },
    ],
  },
  {
    id: '4',
    title: 'Water Pump Systems',
    vendor: 'CRI Pumps',
    category: 'WATER_PUMP',
    contractNumber: 'CRI-AJ-2024-004',
    startDate: '2024-08-01',
    endDate: '2026-07-31',
    amount: 120000,
    paymentFrequency: 'YEARLY',
    lastServiceDate: '2026-02-01',
    nextServiceDate: '2026-05-01',
    contactPerson: 'Vijay Patel',
    contactPhone: '+91 98765 33333',
    status: 'ACTIVE',
    daysRemaining: 163,
    services: [
      { date: '2026-02-01', description: 'Quarterly pump inspection and impeller check', status: 'COMPLETED' },
    ],
  },
  {
    id: '5',
    title: 'CCTV & Security Systems',
    vendor: 'HikVision India',
    category: 'SECURITY',
    contractNumber: 'HK-AJ-2025-005',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    amount: 95000,
    paymentFrequency: 'YEARLY',
    lastServiceDate: '2025-10-15',
    nextServiceDate: '2026-01-15',
    contactPerson: 'Rohit Sharma',
    contactPhone: '+91 98765 44444',
    status: 'EXPIRED',
    daysRemaining: -49,
    services: [
      { date: '2025-10-15', description: 'Quarterly camera check and DVR maintenance', status: 'COMPLETED' },
    ],
  },
]

const AMC_CATEGORIES = [
  { value: 'LIFT', label: 'Elevator/Lift' },
  { value: 'GENERATOR', label: 'Generator' },
  { value: 'FIRE_SAFETY', label: 'Fire Safety' },
  { value: 'WATER_PUMP', label: 'Water Pump' },
  { value: 'SECURITY', label: 'CCTV/Security' },
  { value: 'HVAC', label: 'HVAC/AC' },
  { value: 'STP', label: 'STP/Water Treatment' },
  { value: 'OTHER', label: 'Other' },
]

export default function AMCPage() {
  const { data: session } = useSession()
  const [selectedAMC, setSelectedAMC] = useState<typeof mockAMCs[0] | null>(null)
  const [addAMCOpen, setAddAMCOpen] = useState(false)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (status === 'EXPIRED' || daysRemaining < 0) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (status === 'EXPIRING_SOON' || daysRemaining <= 60) {
      return <Badge variant="default" className="bg-orange-500">Expiring Soon</Badge>
    }
    return <Badge variant="default" className="bg-green-500">Active</Badge>
  }

  const getCategoryLabel = (category: string) => {
    const cat = AMC_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const activeAMCs = mockAMCs.filter((a) => a.status === 'ACTIVE')
  const expiringAMCs = mockAMCs.filter((a) => a.status === 'EXPIRING_SOON' || (a.daysRemaining > 0 && a.daysRemaining <= 60))
  const expiredAMCs = mockAMCs.filter((a) => a.status === 'EXPIRED' || a.daysRemaining < 0)
  const totalAMCValue = mockAMCs.filter((a) => a.status !== 'EXPIRED').reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Contracts</h1>
          <p className="text-muted-foreground">
            Manage Annual Maintenance Contracts and track service schedules
          </p>
        </div>
        {isCommittee && (
          <Dialog open={addAMCOpen} onOpenChange={setAddAMCOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add AMC
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New AMC Contract</DialogTitle>
                <DialogDescription>
                  Add a new Annual Maintenance Contract
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input id="title" placeholder="e.g., Lift Maintenance" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {AMC_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractNumber">Contract Number</Label>
                    <Input id="contractNumber" placeholder="Contract #" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor Name</Label>
                  <Input id="vendor" placeholder="Vendor company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Contract Amount (₹)</Label>
                    <Input id="amount" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Payment Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddAMCOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add AMC</Button>
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
              Active Contracts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAMCs.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringAMCs.length}</div>
            <p className="text-xs text-muted-foreground">Within 60 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredAMCs.length}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total AMC Value
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAMCValue)}</div>
            <p className="text-xs text-muted-foreground">Annual contracts</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringAMCs.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Contracts Expiring Soon
            </CardTitle>
            <CardDescription className="text-orange-700">
              The following contracts will expire within 60 days and need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringAMCs.map((amc) => (
                <div
                  key={amc.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{amc.title}</p>
                    <p className="text-sm text-muted-foreground">{amc.vendor}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {amc.daysRemaining} days remaining
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(amc.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AMC List */}
      <Card>
        <CardHeader>
          <CardTitle>All AMC Contracts</CardTitle>
          <CardDescription>
            View and manage all maintenance contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAMCs.map((amc) => (
                <TableRow key={amc.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{amc.title}</p>
                      <p className="text-xs text-muted-foreground">{amc.contractNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{amc.vendor}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {amc.contactPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(amc.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(amc.startDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">to {new Date(amc.endDate).toLocaleDateString()}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(amc.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(amc.status, amc.daysRemaining)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAMC(amc)
                          setViewDetailsOpen(true)
                        }}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      {isCommittee && amc.daysRemaining <= 60 && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service History Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAMC?.title}</DialogTitle>
            <DialogDescription>
              Service history and contract details
            </DialogDescription>
          </DialogHeader>
          {selectedAMC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{selectedAMC.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedAMC.contactPerson}</p>
                  <p className="text-sm text-muted-foreground">{selectedAMC.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Service</p>
                  <p className="font-medium">
                    {new Date(selectedAMC.lastServiceDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Service Due</p>
                  <p className="font-medium">
                    {new Date(selectedAMC.nextServiceDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Service History</h4>
                <div className="space-y-3">
                  {selectedAMC.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-l-2 border-primary pl-4 py-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{service.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(service.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
