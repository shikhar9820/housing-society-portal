'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Plus,
  Search,
  Upload,
  Download,
  Users,
  Home,
  Edit,
  Phone,
  Mail,
} from 'lucide-react'
import BulkImportModal from '@/components/BulkImportModal'

interface Flat {
  id: string
  flatNumber: string
  block: string | null
  floor: number | null
  area: number | null
  ownerName: string | null
  ownerPhone: string | null
  ownerEmail: string | null
  isOccupied: boolean
  _count?: {
    residents: number
  }
}

export default function FlatManagementPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [blockFilter, setBlockFilter] = useState('all')
  const [addFlatOpen, setAddFlatOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [flats, setFlats] = useState<Flat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFlats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/flats')
      if (res.ok) {
        const data = await res.json()
        setFlats(data)
      }
    } catch (error) {
      console.error('Failed to fetch flats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchFlats()
    }
  }, [session, fetchFlats])

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const filteredFlats = flats.filter((flat) => {
    const matchesSearch =
      flat.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flat.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesBlock = blockFilter === 'all' || flat.block === blockFilter
    return matchesSearch && matchesBlock
  })

  const blocks = Array.from(new Set(flats.map((f) => f.block).filter(Boolean))).sort() as string[]
  const totalFlats = flats.length
  const occupiedFlats = flats.filter((f) => f.isOccupied).length
  const totalResidents = flats.reduce((sum, f) => sum + (f._count?.residents || 0), 0)
  const totalArea = flats.reduce((sum, f) => sum + (f.area || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flat Management</h1>
          <p className="text-muted-foreground">
            Manage society flats and owner information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <BulkImportModal
            isOpen={bulkImportOpen}
            onClose={() => setBulkImportOpen(false)}
            onSuccess={fetchFlats}
          />
          <Dialog open={addFlatOpen} onOpenChange={setAddFlatOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Flat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Flat</DialogTitle>
                <DialogDescription>
                  Add a new flat to the society
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flatNumber">Flat Number</Label>
                    <Input id="flatNumber" placeholder="e.g., A-101" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block">Block/Tower</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Block A</SelectItem>
                        <SelectItem value="B">Block B</SelectItem>
                        <SelectItem value="C">Block C</SelectItem>
                        <SelectItem value="D">Block D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input id="floor" type="number" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input id="area" type="number" placeholder="1200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input id="ownerName" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                    <Input id="ownerPhone" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input id="ownerEmail" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddFlatOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Flat</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Flats
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlats}</div>
            <p className="text-xs text-muted-foreground">{blocks.length} blocks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupied
            </CardTitle>
            <Home className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedFlats}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((occupiedFlats / totalFlats) * 100)}% occupancy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Residents
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResidents}</div>
            <p className="text-xs text-muted-foreground">
              Avg {(totalResidents / occupiedFlats).toFixed(1)} per flat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Area
            </CardTitle>
            <Building2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalArea / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">sq ft</p>
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
                placeholder="Search by flat number or owner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {blocks.map((block) => (
                  <SelectItem key={block} value={block}>
                    Block {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flats ({filteredFlats.length})</CardTitle>
          <CardDescription>
            Manage flat details and owner information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flat</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlats.map((flat) => (
                <TableRow key={flat.id}>
                  <TableCell className="font-medium">{flat.flatNumber}</TableCell>
                  <TableCell>
                    {flat.block ? (
                      <Badge variant="outline">Block {flat.block}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{flat.floor ? `Floor ${flat.floor}` : '-'}</TableCell>
                  <TableCell>{flat.area ? `${flat.area} sq ft` : '-'}</TableCell>
                  <TableCell>{flat.ownerName || <span className="text-muted-foreground">Not set</span>}</TableCell>
                  <TableCell>
                    {flat.ownerPhone || flat.ownerEmail ? (
                      <div className="space-y-1">
                        {flat.ownerPhone && (
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {flat.ownerPhone}
                          </p>
                        )}
                        {flat.ownerEmail && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {flat.ownerEmail}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {flat.isOccupied ? (
                      <div>
                        <Badge variant="default" className="bg-green-500">Occupied</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {flat._count?.residents || 0} resident(s)
                        </p>
                      </div>
                    ) : (
                      <Badge variant="secondary">Vacant</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
