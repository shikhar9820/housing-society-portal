'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  Phone,
  Mail,
  Home,
  Building2,
} from 'lucide-react'

const mockResidents = [
  { id: '1', name: 'Rajesh Sharma', email: 'rajesh@email.com', phone: '+91 98765 43210', flat: 'A-101', block: 'A', role: 'ADMIN' },
  { id: '2', name: 'Priya Patel', email: 'priya@email.com', phone: '+91 98765 11111', flat: 'B-205', block: 'B', role: 'COMMITTEE' },
  { id: '3', name: 'Amit Kumar', email: 'amit@email.com', phone: '+91 98765 22222', flat: 'C-301', block: 'C', role: 'COMMITTEE' },
  { id: '4', name: 'Sunita Verma', email: 'sunita@email.com', phone: '+91 98765 33333', flat: 'A-402', block: 'A', role: 'RESIDENT' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 98765 44444', flat: 'B-103', block: 'B', role: 'RESIDENT' },
  { id: '6', name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 98765 55555', flat: 'D-201', block: 'D', role: 'TENANT' },
  { id: '7', name: 'Rohit Mehta', email: 'rohit@email.com', phone: '+91 98765 66666', flat: 'B-201', block: 'B', role: 'RESIDENT' },
  { id: '8', name: 'Anjali Shah', email: 'anjali@email.com', phone: '+91 98765 77777', flat: 'C-101', block: 'C', role: 'RESIDENT' },
  { id: '9', name: 'Deepak Joshi', email: 'deepak@email.com', phone: '+91 98765 88888', flat: 'A-202', block: 'A', role: 'RESIDENT' },
  { id: '10', name: 'Kavita Reddy', email: 'kavita@email.com', phone: '+91 98765 99999', flat: 'D-301', block: 'D', role: 'RESIDENT' },
]

export default function ResidentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [blockFilter, setBlockFilter] = useState('all')

  const filteredResidents = mockResidents.filter((resident) => {
    const matchesSearch =
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.flat.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBlock = blockFilter === 'all' || resident.block === blockFilter
    return matchesSearch && matchesBlock
  })

  const blocks = Array.from(new Set(mockResidents.map((r) => r.block))).sort()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Admin</Badge>
      case 'COMMITTEE':
        return <Badge variant="default">Committee</Badge>
      case 'TENANT':
        return <Badge variant="outline">Tenant</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resident Directory</h1>
        <p className="text-muted-foreground">
          View contact information for society residents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Residents
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Committee Members
            </CardTitle>
            <Home className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockResidents.filter((r) => r.role === 'COMMITTEE' || r.role === 'ADMIN').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Blocks
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocks.length}</div>
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
                placeholder="Search by name or flat number..."
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
          </div>
        </CardContent>
      </Card>

      {/* Residents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResidents.map((resident) => (
          <Card key={resident.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{resident.name}</h3>
                    {getRoleBadge(resident.role)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Home className="h-3 w-3" />
                    {resident.flat} (Block {resident.block})
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {resident.phone}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {resident.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No residents found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
