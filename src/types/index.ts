export type Role = 'ADMIN' | 'COMMITTEE' | 'RESIDENT' | 'TENANT'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  flatId?: string | null
  flatNumber?: string | null
}

export interface DashboardStats {
  totalResidents: number
  totalFlats: number
  activePolls: number
  openTenders: number
  pendingComplaints: number
  recentDocuments: number
  totalExpensesThisMonth: number
  pendingApprovals: number
}

export interface ExpenseByCategory {
  category: string
  amount: number
  percentage: number
}

export interface MonthlyExpenseTrend {
  month: string
  amount: number
}

export interface VotingStats {
  totalVotes: number
  totalEligible: number
  participationRate: number
}

export interface DocumentWithUser {
  id: string
  title: string
  description: string | null
  category: string
  fileUrl: string
  fileName: string
  fileSize: number
  createdAt: Date
  uploadedBy: {
    name: string
  }
}

export interface PollWithOptions {
  id: string
  title: string
  description: string | null
  type: string
  startDate: Date
  endDate: Date
  isAnonymous: boolean
  status: string
  options: {
    id: string
    optionText: string
    description: string | null
    _count?: {
      votes: number
    }
  }[]
  _count?: {
    votes: number
  }
}

export interface TenderWithBids {
  id: string
  title: string
  description: string
  category: string
  deadline: Date
  minBudget: number | null
  maxBudget: number | null
  status: string
  bids: {
    id: string
    vendorName: string
    bidAmount: number
    submittedAt: Date
  }[]
}

export interface AnnouncementWithCreator {
  id: string
  title: string
  content: string
  priority: string
  category: string | null
  isPinned: boolean
  expiresAt: Date | null
  createdAt: Date
  createdBy: {
    name: string
  }
}

export const DOCUMENT_CATEGORIES = [
  { value: 'MEETING_MINUTES', label: 'Meeting Minutes' },
  { value: 'AUDIT_REPORT', label: 'Audit Report' },
  { value: 'BYLAWS', label: 'Bylaws & Rules' },
  { value: 'NOC_FORMS', label: 'NOC Forms' },
  { value: 'LEGAL', label: 'Legal Documents' },
  { value: 'CONTRACTS', label: 'Vendor Contracts' },
  { value: 'OTHER', label: 'Other' },
] as const

export const EXPENSE_CATEGORIES = [
  { value: 'SECURITY', label: 'Security' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'GARDENING', label: 'Gardening' },
  { value: 'REPAIRS', label: 'Repairs & Maintenance' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'SALARIES', label: 'Staff Salaries' },
  { value: 'WATER', label: 'Water' },
  { value: 'LIFT_MAINTENANCE', label: 'Lift Maintenance' },
  { value: 'PEST_CONTROL', label: 'Pest Control' },
  { value: 'OTHER', label: 'Other' },
] as const

export const COMPLAINT_CATEGORIES = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'CLEANLINESS', label: 'Cleanliness' },
  { value: 'NOISE', label: 'Noise' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'WATER', label: 'Water Supply' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'OTHER', label: 'Other' },
] as const

export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'EVENT', label: 'Event' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'GENERAL', label: 'General' },
] as const

export const TENDER_CATEGORIES = [
  { value: 'SECURITY', label: 'Security Services' },
  { value: 'CLEANING', label: 'Housekeeping' },
  { value: 'GARDENING', label: 'Gardening & Landscaping' },
  { value: 'MAINTENANCE', label: 'Maintenance Work' },
  { value: 'ELECTRICAL', label: 'Electrical Work' },
  { value: 'PLUMBING', label: 'Plumbing Work' },
  { value: 'PAINTING', label: 'Painting' },
  { value: 'LIFT', label: 'Lift Maintenance' },
  { value: 'OTHER', label: 'Other' },
] as const
