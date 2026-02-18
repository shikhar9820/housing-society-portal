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
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  PieChart,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/types'

interface Expense {
  id: string
  date: string
  category: string
  description: string
  vendorName: string | null
  amount: number
  paymentMode: string
  invoiceNumber: string | null
  isApproved: boolean
  createdBy: {
    id: string
    name: string
    email: string
  }
  approvedBy?: {
    id: string
    name: string
  } | null
}

interface ExpenseSummary {
  thisMonth: number
  lastMonth: number
  yearToDate: number
  budgetUsed: number
  totalBudget: number
  pendingApprovals: number
}

interface BudgetComparison {
  category: string
  budgeted: number
  actual: number
  variance: number
  percentUsed: number
}

interface VendorSummary {
  vendor: string | null
  amount: number
  payments: number
}

export default function FinancesPage() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison[]>([])
  const [vendorSummary, setVendorSummary] = useState<VendorSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    vendorName: '',
    invoiceNumber: '',
    paymentMode: 'BANK_TRANSFER',
  })

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'
  const isAdmin = session?.user?.role === 'ADMIN'

  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (monthFilter) params.set('month', monthFilter)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)

      const response = await fetch(`/api/expenses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch expenses')

      const data = await response.json()
      setExpenses(data.expenses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses')
    }
  }, [monthFilter, categoryFilter])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/expenses/summary')
      if (!response.ok) throw new Error('Failed to fetch summary')

      const data = await response.json()
      setSummary(data.summary)
      setBudgetComparison(data.budgetComparison || [])
      setVendorSummary(data.vendorSummary || [])
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchExpenses(), fetchSummary()])
      setLoading(false)
    }
    loadData()
  }, [fetchExpenses, fetchSummary])

  const getCategoryLabel = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create expense')
      }

      setAddExpenseOpen(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        vendorName: '',
        invoiceNumber: '',
        paymentMode: 'BANK_TRANSFER',
      })
      await Promise.all([fetchExpenses(), fetchSummary()])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    try {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve expense')
      }

      await Promise.all([fetchExpenses(), fetchSummary()])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve expense')
    } finally {
      setApprovingId(null)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
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
          <h1 className="text-2xl font-bold tracking-tight">Financial Transparency</h1>
          <p className="text-muted-foreground">
            Track society expenses, budgets, and financial reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          {isCommittee && (
            <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Record a new society expense
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (INR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
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
                      placeholder="Expense description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor Name</Label>
                      <Input
                        id="vendor"
                        placeholder="Vendor name"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice">Invoice Number</Label>
                      <Input
                        id="invoice"
                        placeholder="INV-XXXX"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select
                      value={formData.paymentMode}
                      onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddExpenseOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Expense
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.thisMonth || 0)}</div>
            {summary && summary.lastMonth > 0 && (
              <div className={`flex items-center gap-1 text-xs ${summary.thisMonth <= summary.lastMonth ? 'text-green-600' : 'text-red-600'}`}>
                {summary.thisMonth <= summary.lastMonth ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(Math.round(((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100))}% vs last month
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.lastMonth || 0)}</div>
            <p className="text-xs text-muted-foreground">Previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year to Date
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.yearToDate || 0)}</div>
            <p className="text-xs text-muted-foreground">Current FY</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Used
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.budgetUsed || 0}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${(summary?.budgetUsed || 0) > 100 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(summary?.budgetUsed || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <Select value={monthFilter} onValueChange={(value) => setMonthFilter(value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>
                Total: {formatCurrency(totalExpenses)} ({expenses.length} records)
                {summary?.pendingApprovals ? ` | ${summary.pendingApprovals} pending approval` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No expenses found for the selected period
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden md:table-cell">Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead>Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            {expense.invoiceNumber && (
                              <p className="text-xs text-muted-foreground">
                                {expense.invoiceNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryLabel(expense.category)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {expense.vendorName || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          {expense.isApproved ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {!expense.isApproved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(expense.id)}
                                disabled={approvingId === expense.id}
                              >
                                {approvingId === expense.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Approve'
                                )}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual - Current Month</CardTitle>
              <CardDescription>
                Compare budgeted amounts with actual expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgetComparison.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No budget data available. Set up monthly budgets to see comparison.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Budgeted</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">% Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetComparison.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="font-medium">
                          {getCategoryLabel(item.category)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.budgeted)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.actual)}
                        </TableCell>
                        <TableCell className={`text-right ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${item.percentUsed > 100 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{item.percentUsed}%</span>
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

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payment Summary</CardTitle>
              <CardDescription>
                Total payments made to vendors this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorSummary.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No vendor payments recorded this month
                </div>
              ) : (
                <div className="space-y-4">
                  {vendorSummary.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{vendor.vendor || 'Unknown Vendor'}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.payments} payment(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(vendor.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
