'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  FileText,
  Search,
  Calendar,
  IndianRupee,
  Clock,
  Building2,
  LogIn,
  Send,
  CheckCircle2,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'

// Mock tenders data - will be replaced with API call
const mockTenders = [
  {
    id: '1',
    title: 'Annual Painting and Waterproofing Contract',
    description: 'Seeking quotations for exterior painting and waterproofing of all blocks (A, B, C, D, E, F). Work includes surface preparation, primer application, two coats of weather-resistant paint, and terrace waterproofing. Materials must be of premium quality (Asian Paints Apex Ultima or equivalent). Work to be completed within 90 days of award.',
    category: 'Maintenance',
    deadline: new Date('2025-03-15'),
    minBudget: 1500000,
    maxBudget: 2500000,
    status: 'OPEN',
    requiredDocuments: ['Company Registration', 'GST Certificate', 'Past Work Portfolio', 'Material Specifications'],
    createdAt: new Date('2025-02-01'),
  },
  {
    id: '2',
    title: 'Security Services Contract - 2025-26',
    description: 'Annual contract for 24x7 security services. Requirements: 15 guards per shift (3 shifts), 2 supervisors, trained personnel with verification, uniforms provided by contractor. CCTV monitoring support required. Contract period: April 2025 to March 2026.',
    category: 'Security',
    deadline: new Date('2025-03-01'),
    minBudget: 3000000,
    maxBudget: 4000000,
    status: 'OPEN',
    requiredDocuments: ['Security Agency License', 'Company Registration', 'Insurance Certificate', 'Employee Verification Process'],
    createdAt: new Date('2025-02-05'),
  },
  {
    id: '3',
    title: 'Elevator Maintenance - Annual AMC',
    description: 'Annual maintenance contract for 12 elevators (6 passenger + 6 service lifts). Includes monthly preventive maintenance, emergency breakdown service (response within 2 hours), spare parts at actuals, safety certification support.',
    category: 'AMC',
    deadline: new Date('2025-02-28'),
    minBudget: 600000,
    maxBudget: 900000,
    status: 'OPEN',
    requiredDocuments: ['Authorized Service Provider Certificate', 'Company Profile', 'Service Team Details'],
    createdAt: new Date('2025-02-10'),
  },
  {
    id: '4',
    title: 'Landscaping and Garden Maintenance',
    description: 'Monthly contract for maintaining society gardens, lawns, and common area plants. Includes daily watering, weekly trimming, monthly pruning, seasonal planting, pest control, and fertilization. Area coverage: approximately 2 acres.',
    category: 'Maintenance',
    deadline: new Date('2025-02-25'),
    minBudget: 50000,
    maxBudget: 80000,
    status: 'OPEN',
    requiredDocuments: ['Company Registration', 'Team Details', 'Equipment List'],
    createdAt: new Date('2025-02-12'),
  },
]

export default function PublicTendersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTender, setSelectedTender] = useState<typeof mockTenders[0] | null>(null)
  const [bidSubmitted, setBidSubmitted] = useState(false)

  const filteredTenders = mockTenders
    .filter((tender) => tender.status === 'OPEN' && !isPast(tender.deadline))
    .filter((tender) => {
      const matchesSearch =
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || tender.category === categoryFilter
      return matchesSearch && matchesCategory
    })

  const categories = Array.from(new Set(mockTenders.map((t) => t.category)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault()
    setBidSubmitted(true)
    // In production, this would call an API
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
              <p className="text-xs text-muted-foreground">Vendor Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/public/announcements">
              <Button variant="ghost" size="sm">Announcements</Button>
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
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold tracking-tight">Open Tenders</h1>
            </div>
            <p className="text-muted-foreground">
              View active tenders and submit your bids for Angel Jupiter Society contracts
            </p>
          </div>

          {/* Info Banner */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Transparent Tendering Process</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Angel Jupiter Society believes in transparent vendor selection. All bids are evaluated
                    by the committee and the final decision is based on quality, pricing, and past performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tenders List */}
          <div className="grid gap-4">
            {filteredTenders.map((tender) => (
              <Card key={tender.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{tender.title}</CardTitle>
                    <Badge variant="outline">{tender.category}</Badge>
                    <Badge className="bg-green-500">Open</Badge>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(tender.minBudget)} - {formatCurrency(tender.maxBudget)}
                    </span>
                    <span className="flex items-center gap-1 text-orange-600">
                      <Clock className="h-3 w-3" />
                      Deadline: {format(tender.deadline, 'MMM d, yyyy')}
                      ({formatDistanceToNow(tender.deadline, { addSuffix: true })})
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {tender.description}
                  </p>

                  {tender.requiredDocuments && tender.requiredDocuments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Required Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {tender.requiredDocuments.map((doc, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setSelectedTender(tender); setBidSubmitted(false); }}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Bid
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Submit Bid</DialogTitle>
                        <DialogDescription>
                          {tender.title}
                        </DialogDescription>
                      </DialogHeader>

                      {bidSubmitted ? (
                        <div className="py-8 text-center">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold">Bid Submitted Successfully!</h3>
                          <p className="text-muted-foreground mt-2">
                            Thank you for your interest. The society committee will review all bids
                            and contact shortlisted vendors.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitBid} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="vendorName">Company/Vendor Name *</Label>
                              <Input id="vendorName" required placeholder="Your company name" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactPerson">Contact Person *</Label>
                              <Input id="contactPerson" required placeholder="Contact person name" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input id="email" type="email" required placeholder="email@company.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone *</Label>
                              <Input id="phone" required placeholder="+91 XXXXX XXXXX" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bidAmount">Bid Amount (INR) *</Label>
                            <Input
                              id="bidAmount"
                              type="number"
                              required
                              placeholder="Enter your bid amount"
                              min={tender.minBudget * 0.5}
                              max={tender.maxBudget * 1.5}
                            />
                            <p className="text-xs text-muted-foreground">
                              Budget range: {formatCurrency(tender.minBudget)} - {formatCurrency(tender.maxBudget)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="proposal">Proposal / Cover Letter *</Label>
                            <Textarea
                              id="proposal"
                              required
                              placeholder="Describe your experience, approach, and why you're the best fit for this contract..."
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="attachments">Attachments (Optional)</Label>
                            <Input id="attachments" type="file" multiple />
                            <p className="text-xs text-muted-foreground">
                              Upload relevant documents (PDF, DOC, images). Max 10MB each.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="submit">
                              <Send className="mr-2 h-4 w-4" />
                              Submit Bid
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTenders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No open tenders at the moment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check back later for new opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Angel Jupiter Housing Society | Vendor Portal</p>
          <p className="mt-1">
            For inquiries, contact: <span className="text-blue-600">committee@angeljupiter.com</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
