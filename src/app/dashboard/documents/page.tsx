'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  FileType,
} from 'lucide-react'
import { DOCUMENT_CATEGORIES } from '@/types'

const mockDocuments = [
  {
    id: '1',
    title: 'January 2026 Meeting Minutes',
    description: 'Monthly committee meeting minutes with all decisions and action items',
    category: 'MEETING_MINUTES',
    fileName: 'meeting-minutes-jan-2026.pdf',
    fileSize: 245000,
    createdAt: '2026-02-05',
    uploadedBy: { name: 'Rajesh Sharma' },
    downloads: 45,
  },
  {
    id: '2',
    title: 'FY 2024-25 Audit Report',
    description: 'Annual financial audit report by CA firm',
    category: 'AUDIT_REPORT',
    fileName: 'audit-report-fy2024-25.pdf',
    fileSize: 1250000,
    createdAt: '2026-01-28',
    uploadedBy: { name: 'Priya Patel' },
    downloads: 120,
  },
  {
    id: '3',
    title: 'Society Bylaws (Updated 2026)',
    description: 'Updated society bylaws and regulations',
    category: 'BYLAWS',
    fileName: 'society-bylaws-2026.pdf',
    fileSize: 890000,
    createdAt: '2026-01-15',
    uploadedBy: { name: 'Admin' },
    downloads: 230,
  },
  {
    id: '4',
    title: 'NOC Application Form',
    description: 'No Objection Certificate application form for renovation',
    category: 'NOC_FORMS',
    fileName: 'noc-application-form.pdf',
    fileSize: 125000,
    createdAt: '2025-12-10',
    uploadedBy: { name: 'Admin' },
    downloads: 89,
  },
  {
    id: '5',
    title: 'Security Agency Contract',
    description: 'Annual contract with SecureGuard Security Services',
    category: 'CONTRACTS',
    fileName: 'security-contract-2026.pdf',
    fileSize: 450000,
    createdAt: '2025-12-01',
    uploadedBy: { name: 'Rajesh Sharma' },
    downloads: 34,
  },
]

export default function DocumentsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getCategoryLabel = (category: string) => {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'MEETING_MINUTES':
        return 'default'
      case 'AUDIT_REPORT':
        return 'destructive'
      case 'BYLAWS':
        return 'secondary'
      case 'CONTRACTS':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground">
            Access meeting minutes, audit reports, bylaws, and other society documents
          </p>
        </div>
        {isCommittee && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document to the society repository
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input id="title" placeholder="Enter document title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((cat) => (
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
                    placeholder="Brief description of the document"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Upload</Button>
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
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Click on a document to view or download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(doc.category)}>
                      {getCategoryLabel(doc.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {doc.uploadedBy.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileType className="h-3 w-3" />
                      {formatFileSize(doc.fileSize)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Cards for Quick Access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DOCUMENT_CATEGORIES.slice(0, 4).map((category) => {
          const count = mockDocuments.filter((d) => d.category === category.value).length
          return (
            <Card
              key={category.value}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setCategoryFilter(category.value)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">documents</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
