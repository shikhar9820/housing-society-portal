'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  IndianRupee,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Plus,
} from 'lucide-react'
import { AMENITY_CATEGORIES, BOOKING_STATUS, PAYMENT_STATUS, type AmenityBookingWithDetails } from '@/types'

interface Amenity {
  id: string
  name: string
  description: string | null
  category: string
  location: string | null
  capacity: number | null
  hourlyRate: number | null
  halfDayRate: number | null
  fullDayRate: number | null
  securityDeposit: number | null
  rules: string | null
  operatingHours: string | null
  advanceBookingDays: number
  requiresApproval: boolean
  isActive: boolean
  _count?: { bookings: number }
}

interface AvailabilitySlot {
  start: string
  end: string
  available: boolean
}

export default function AmenitiesPage() {
  const { data: session } = useSession()
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [myBookings, setMyBookings] = useState<AmenityBookingWithDetails[]>([])
  const [allBookings, setAllBookings] = useState<AmenityBookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Booking dialog state
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [attendeesCount, setAttendeesCount] = useState('')
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Add amenity dialog state (for admin)
  const [addAmenityOpen, setAddAmenityOpen] = useState(false)
  const [amenityForm, setAmenityForm] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    capacity: '',
    hourlyRate: '',
    halfDayRate: '',
    fullDayRate: '',
    securityDeposit: '',
    rules: '',
    requiresApproval: false,
  })

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const fetchAmenities = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter && categoryFilter !== 'all') {
        params.set('category', categoryFilter)
      }
      const response = await fetch(`/api/amenities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch amenities')
      const data = await response.json()
      setAmenities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch amenities')
    }
  }, [categoryFilter])

  const fetchMyBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/amenity-bookings?myBookings=true')
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setMyBookings(data)
    } catch (err) {
      console.error('Failed to fetch my bookings:', err)
    }
  }, [])

  const fetchAllBookings = useCallback(async () => {
    if (!isCommittee) return
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const response = await fetch(`/api/amenity-bookings?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setAllBookings(data)
    } catch (err) {
      console.error('Failed to fetch all bookings:', err)
    }
  }, [isCommittee, statusFilter])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAmenities(), fetchMyBookings(), fetchAllBookings()])
      setLoading(false)
    }
    loadData()
  }, [fetchAmenities, fetchMyBookings, fetchAllBookings])

  const checkAvailability = async (amenityId: string, date: string) => {
    if (!date) return
    setCheckingAvailability(true)
    try {
      const response = await fetch(`/api/amenities/${amenityId}/availability?date=${date}`)
      if (!response.ok) throw new Error('Failed to check availability')
      const data = await response.json()
      setAvailability(data.availableSlots || [])
    } catch (err) {
      console.error('Failed to check availability:', err)
      setAvailability([])
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleBookingDateChange = (date: string) => {
    setBookingDate(date)
    if (selectedAmenity && date) {
      checkAvailability(selectedAmenity.id, date)
    }
  }

  const openBookingDialog = (amenity: Amenity) => {
    setSelectedAmenity(amenity)
    setBookingDate('')
    setStartTime('')
    setEndTime('')
    setPurpose('')
    setAttendeesCount('')
    setAvailability([])
    setBookingOpen(true)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAmenity) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/amenity-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amenityId: selectedAmenity.id,
          bookingDate,
          startTime,
          endTime,
          purpose,
          attendeesCount: attendeesCount || null,
          bookingType: 'HOURLY',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      setBookingOpen(false)
      await fetchMyBookings()
      alert('Booking created successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddAmenity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenityForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create amenity')
      }

      setAddAmenityOpen(false)
      setAmenityForm({
        name: '',
        description: '',
        category: '',
        location: '',
        capacity: '',
        hourlyRate: '',
        halfDayRate: '',
        fullDayRate: '',
        securityDeposit: '',
        rules: '',
        requiresApproval: false,
      })
      await fetchAmenities()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create amenity')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/amenity-bookings/${bookingId}/confirm`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to confirm booking')
      await fetchAllBookings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm booking')
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      const response = await fetch(`/api/amenity-bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!response.ok) throw new Error('Failed to reject booking')
      await fetchAllBookings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject booking')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      const response = await fetch(`/api/amenity-bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by user' }),
      })
      if (!response.ok) throw new Error('Failed to cancel booking')
      await fetchMyBookings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel booking')
    }
  }

  const handleMarkPaid = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/amenity-bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMode: 'CASH' }),
      })
      if (!response.ok) throw new Error('Failed to mark as paid')
      await fetchAllBookings()
      alert('Payment recorded and finance entry created!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid')
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryLabel = (category: string) => {
    const cat = AMENITY_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = BOOKING_STATUS.find((s) => s.value === status)
    const colorClass = statusInfo?.color || 'bg-gray-500'
    return <Badge className={colorClass}>{statusInfo?.label || status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const statusInfo = PAYMENT_STATUS.find((s) => s.value === status)
    const colorClass = statusInfo?.color || 'bg-gray-500'
    return <Badge variant="outline" className={colorClass + ' text-white'}>{statusInfo?.label || status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Amenity Booking</h1>
          <p className="text-muted-foreground">
            Book society amenities like clubhouse, party hall, and more
          </p>
        </div>
        {isCommittee && (
          <Dialog open={addAmenityOpen} onOpenChange={setAddAmenityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Amenity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Amenity</DialogTitle>
                <DialogDescription>Create a new bookable amenity</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAmenity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={amenityForm.name}
                      onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={amenityForm.category}
                      onValueChange={(value) => setAmenityForm({ ...amenityForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {AMENITY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={amenityForm.description}
                    onChange={(e) => setAmenityForm({ ...amenityForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={amenityForm.location}
                      onChange={(e) => setAmenityForm({ ...amenityForm, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={amenityForm.capacity}
                      onChange={(e) => setAmenityForm({ ...amenityForm, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={amenityForm.hourlyRate}
                      onChange={(e) => setAmenityForm({ ...amenityForm, hourlyRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="halfDayRate">Half Day Rate</Label>
                    <Input
                      id="halfDayRate"
                      type="number"
                      value={amenityForm.halfDayRate}
                      onChange={(e) => setAmenityForm({ ...amenityForm, halfDayRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullDayRate">Full Day Rate</Label>
                    <Input
                      id="fullDayRate"
                      type="number"
                      value={amenityForm.fullDayRate}
                      onChange={(e) => setAmenityForm({ ...amenityForm, fullDayRate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={amenityForm.securityDeposit}
                    onChange={(e) => setAmenityForm({ ...amenityForm, securityDeposit: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={amenityForm.requiresApproval}
                    onChange={(e) => setAmenityForm({ ...amenityForm, requiresApproval: e.target.checked })}
                  />
                  <Label htmlFor="requiresApproval">Requires committee approval</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddAmenityOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Amenity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Amenities
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{amenities.length}</div>
            <p className="text-xs text-muted-foreground">Active amenities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBookings.length}</div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myBookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.bookingDate) >= new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myBookings.filter((b) => b.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse & Book</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          {isCommittee && <TabsTrigger value="all-bookings">All Bookings</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {AMENITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Amenities Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <Card key={amenity.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{amenity.name}</CardTitle>
                    <Badge variant="outline">{getCategoryLabel(amenity.category)}</Badge>
                  </div>
                  {amenity.description && (
                    <CardDescription>{amenity.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {amenity.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {amenity.location}
                    </div>
                  )}
                  {amenity.capacity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Capacity: {amenity.capacity} persons
                    </div>
                  )}
                  <div className="space-y-1">
                    {amenity.hourlyRate && (
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="h-4 w-4" />
                        {formatCurrency(amenity.hourlyRate)}/hour
                      </div>
                    )}
                    {amenity.halfDayRate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Half Day: {formatCurrency(amenity.halfDayRate)}
                      </div>
                    )}
                    {amenity.fullDayRate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Full Day: {formatCurrency(amenity.fullDayRate)}
                      </div>
                    )}
                  </div>
                  {amenity.securityDeposit && amenity.securityDeposit > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Security Deposit: {formatCurrency(amenity.securityDeposit)}
                    </p>
                  )}
                  {amenity.requiresApproval && (
                    <Badge variant="secondary" className="text-xs">Requires Approval</Badge>
                  )}
                </CardContent>
                <div className="p-4 pt-0">
                  <Button className="w-full" onClick={() => openBookingDialog(amenity)}>
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {amenities.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No amenities available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>View and manage your amenity bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {myBookings.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  You have no bookings yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amenity</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.amenity.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.amenity.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                        <TableCell>
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isCommittee && (
          <TabsContent value="all-bookings" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {BOOKING_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage all society amenity bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {allBookings.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    No bookings found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amenity</TableHead>
                        <TableHead>Booked By</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <p className="font-medium">{booking.amenity.name}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{booking.createdBy.name}</p>
                              <p className="text-xs text-muted-foreground">{booking.flat?.flatNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {booking.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleConfirmBooking(booking.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectBooking(booking.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {booking.status === 'CONFIRMED' && booking.paymentStatus === 'UNPAID' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkPaid(booking.id)}
                                >
                                  <IndianRupee className="h-4 w-4 mr-1" />
                                  Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {selectedAmenity?.name}</DialogTitle>
            <DialogDescription>
              {selectedAmenity?.requiresApproval
                ? 'This booking requires committee approval'
                : 'Your booking will be confirmed immediately'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Date *</Label>
              <Input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => handleBookingDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {checkingAvailability && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking availability...
              </div>
            )}

            {availability.length > 0 && (
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="flex flex-wrap gap-2">
                  {availability.map((slot) => (
                    <Badge
                      key={slot.start}
                      variant={slot.available ? 'outline' : 'secondary'}
                      className={slot.available ? 'cursor-pointer hover:bg-primary hover:text-primary-foreground' : 'opacity-50'}
                      onClick={() => {
                        if (slot.available) {
                          setStartTime(slot.start)
                          setEndTime(slot.end)
                        }
                      }}
                    >
                      {slot.start} - {slot.end}
                      {!slot.available && ' (Booked)'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Birthday party, Family gathering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input
                id="attendees"
                type="number"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(e.target.value)}
                placeholder="Number of people"
              />
            </div>

            {selectedAmenity && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Pricing:</p>
                {selectedAmenity.hourlyRate && <p>Hourly: {formatCurrency(selectedAmenity.hourlyRate)}</p>}
                {selectedAmenity.securityDeposit && selectedAmenity.securityDeposit > 0 && (
                  <p>Security Deposit: {formatCurrency(selectedAmenity.securityDeposit)}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !bookingDate || !startTime || !endTime}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Now
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
