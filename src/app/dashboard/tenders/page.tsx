'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  FileSpreadsheet,
  Plus,
  Calendar,
  IndianRupee,
  Users,
  Eye,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { TENDER_CATEGORIES } from '@/types'

const mockTenders = {
  open: [
    {
      id: '1',
      title: 'Annual Housekeeping Contract 2026-27',
      description: 'Comprehensive housekeeping services for common areas including cleaning, waste management, and hygiene maintenance',
      category: 'CLEANING',
      deadline: '2026-03-15',
      minBudget: 1500000,
      maxBudget: 2000000,
      requiredDocuments: ['Company Profile', 'GST Certificate', 'Previous Work Experience', 'Staff Details'],
      status: 'OPEN',
      bids: 8,
      createdAt: '2026-02-01',
    },
    {
      id: '2',
      title: 'Security Services Contract',
      description: 'Round-the-clock security services with trained guards, CCTV monitoring, and access control management',
      category: 'SECURITY',
      deadline: '2026-03-10',
      minBudget: 2500000,
      maxBudget: 3200000,
      requiredDocuments: ['PSARA License', 'Company Profile', 'Insurance Certificate'],
      status: 'OPEN',
      bids: 5,
      createdAt: '2026-02-05',
    },
    {
      id: '3',
      title: 'Lift AMC Renewal',
      description: 'Annual maintenance contract for 6 passenger lifts including emergency services',
      category: 'LIFT',
      deadline: '2026-02-28',
      minBudget: 300000,
      maxBudget: 450000,
      requiredDocuments: ['OEM Authorization', 'Technical Team Details', 'Previous AMC References'],
      status: 'OPEN',
      bids: 3,
      createdAt: '2026-02-10',
    },
  ],
  evaluation: [
    {
      id: '4',
      title: 'Exterior Painting Work',
      description: 'Complete exterior painting of all 4 towers with weather-resistant paint',
      category: 'PAINTING',
      deadline: '2026-02-20',
      minBudget: 2000000,
      maxBudget: 2800000,
      status: 'EVALUATION',
      bids: 12,
      createdAt: '2026-01-15',
      topBids: [
        { vendor: 'ColorCraft Painters', amount: 2350000, rating: 4.5 },
        { vendor: 'Premium Paints Co.', amount: 2400000, rating: 4.8 },
        { vendor: 'QuickPaint Services', amount: 2100000, rating: 4.0 },
      ],
    },
  ],
  awarded: [
    {
      id: '5',
      title: 'Garden Landscaping Project',
      description: 'Complete redesign and landscaping of central garden area',
      category: 'GARDENING',
      deadline: '2026-01-30',
      minBudget: 800000,
      maxBudget: 1200000,
      status: 'AWARDED',
      awardedTo: 'Green Gardens Co.',
      awardedAmount: 950000,
      awardReason: 'Best value proposal with excellent past work references',
      createdAt: '2026-01-01',
    },
    {
      id: '6',
      title: 'Fire Safety System Upgrade',
      description: 'Installation of new fire alarm system and emergency exits',
      category: 'MAINTENANCE',
      deadline: '2025-12-15',
      minBudget: 1500000,
      maxBudget: 2000000,
      status: 'AWARDED',
      awardedTo: 'SafetyFirst Systems',
      awardedAmount: 1750000,
      awardReason: 'Certified vendor with comprehensive safety compliance',
      createdAt: '2025-11-15',
    },
  ],
}

export default function TendersPage() {
  const { data: session } = useSession()
  const [createTenderOpen, setCreateTenderOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDaysRemaining = (deadline: string) => {
    const end = new Date(deadline)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getCategoryLabel = (category: string) => {
    const cat = TENDER_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default">Open for Bids</Badge>
      case 'EVALUATION':
        return <Badge variant="secondary">Under Evaluation</Badge>
      case 'AWARDED':
        return <Badge className="bg-green-500">Awarded</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tender Management</h1>
          <p className="text-muted-foreground">
            Post tenders, collect bids, and manage vendor selection transparently
          </p>
        </div>
        {isCommittee && (
          <Dialog open={createTenderOpen} onOpenChange={setCreateTenderOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post New Tender
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Post New Tender</DialogTitle>
                <DialogDescription>
                  Create a new tender for vendor bids
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Tender Title</Label>
                  <Input id="title" placeholder="Enter tender title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TENDER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of work required"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minBudget">Minimum Budget (₹)</Label>
                    <Input id="minBudget" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBudget">Maximum Budget (₹)</Label>
                    <Input id="maxBudget" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline</Label>
                  <Input id="deadline" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Required Documents</Label>
                  <div className="space-y-2">
                    <Input placeholder="e.g., Company Profile" />
                    <Input placeholder="e.g., GST Certificate" />
                    <Input placeholder="e.g., Previous Work Experience" />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    + Add Document Requirement
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateTenderOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Post Tender</Button>
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
              Open Tenders
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTenders.open.length}</div>
            <p className="text-xs text-muted-foreground">Accepting bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Evaluation
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTenders.evaluation.length}</div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bids Received
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTenders.open.reduce((sum, t) => sum + t.bids, 0) +
                mockTenders.evaluation.reduce((sum, t) => sum + t.bids, 0)}
            </div>
            <p className="text-xs text-muted-foreground">From vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awarded This Year
            </CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTenders.awarded.length}</div>
            <p className="text-xs text-muted-foreground">Contracts awarded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({mockTenders.open.length})</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation ({mockTenders.evaluation.length})</TabsTrigger>
          <TabsTrigger value="awarded">Awarded ({mockTenders.awarded.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockTenders.open.map((tender) => {
              const daysRemaining = getDaysRemaining(tender.deadline)
              return (
                <Card key={tender.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{getCategoryLabel(tender.category)}</Badge>
                      {getStatusBadge(tender.status)}
                    </div>
                    <CardTitle className="mt-2 line-clamp-2">{tender.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{tender.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatCurrency(tender.minBudget)} - {formatCurrency(tender.maxBudget)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={daysRemaining <= 7 ? 'text-red-600 font-medium' : ''}>
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.bids} bids received</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Required Documents:</p>
                        <div className="flex flex-wrap gap-1">
                          {tender.requiredDocuments.slice(0, 2).map((doc, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                          {tender.requiredDocuments.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tender.requiredDocuments.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {isCommittee && (
                      <Button variant="outline" className="flex-1">
                        <Users className="mr-2 h-4 w-4" />
                        View Bids
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          {mockTenders.evaluation.map((tender) => (
            <Card key={tender.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{getCategoryLabel(tender.category)}</Badge>
                      {getStatusBadge(tender.status)}
                    </div>
                    <CardTitle>{tender.title}</CardTitle>
                    <CardDescription>{tender.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p className="font-medium">
                      {formatCurrency(tender.minBudget)} - {formatCurrency(tender.maxBudget)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Top Bids ({tender.bids} total)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Bid Amount</TableHead>
                        <TableHead className="text-right">Rating</TableHead>
                        {isCommittee && <TableHead className="text-right">Action</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tender.topBids.map((bid, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{bid.vendor}</TableCell>
                          <TableCell className="text-right">{formatCurrency(bid.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{bid.rating}/5</Badge>
                          </TableCell>
                          {isCommittee && (
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View Full Proposal
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {isCommittee && (
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Tender
                  </Button>
                  <Button>
                    <Award className="mr-2 h-4 w-4" />
                    Award Contract
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="awarded" className="space-y-4">
          {mockTenders.awarded.map((tender) => (
            <Card key={tender.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{getCategoryLabel(tender.category)}</Badge>
                      {getStatusBadge(tender.status)}
                    </div>
                    <CardTitle>{tender.title}</CardTitle>
                    <CardDescription>{tender.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-green-50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Awarded to: {tender.awardedTo}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Contract Amount</p>
                      <p className="font-bold text-lg">{formatCurrency(tender.awardedAmount!)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="font-medium">
                        {formatCurrency(tender.minBudget)} - {formatCurrency(tender.maxBudget)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Award Reason:</p>
                    <p className="text-sm">{tender.awardReason}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
