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
  { value: 'AMENITY_INCOME', label: 'Amenity Booking Income' },
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

// Amenity Booking Types & Constants
export const AMENITY_CATEGORIES = [
  { value: 'CLUBHOUSE', label: 'Clubhouse' },
  { value: 'PARTY_HALL', label: 'Party Hall' },
  { value: 'GARDEN', label: 'Garden/Lawn' },
  { value: 'GUEST_ROOM', label: 'Guest Room' },
  { value: 'TERRACE', label: 'Terrace' },
  { value: 'GYM', label: 'Gymnasium' },
  { value: 'SWIMMING_POOL', label: 'Swimming Pool' },
  { value: 'SPORTS_COURT', label: 'Sports Court' },
  { value: 'COMMUNITY_HALL', label: 'Community Hall' },
  { value: 'OTHER', label: 'Other' },
] as const

export const BOOKING_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-600' },
] as const

export const PAYMENT_STATUS = [
  { value: 'UNPAID', label: 'Unpaid', color: 'bg-orange-500' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-500' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-purple-500' },
] as const

export const BOOKING_TYPES = [
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'FULL_DAY', label: 'Full Day' },
] as const

export interface Amenity {
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
  imageUrl: string | null
  operatingHours: string | null
  advanceBookingDays: number
  minBookingHours: number
  maxBookingHours: number
  requiresApproval: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AmenityBooking {
  id: string
  amenityId: string
  flatId: string
  bookingDate: Date
  startTime: string
  endTime: string
  purpose: string | null
  attendeesCount: number | null
  bookingType: string
  amount: number
  securityDeposit: number
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMode: string | null
  expenseId: string | null
  rejectionReason: string | null
  cancelReason: string | null
  confirmedById: string | null
  confirmedAt: Date | null
  cancelledAt: Date | null
  completedAt: Date | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface AmenityBookingWithDetails extends AmenityBooking {
  amenity: {
    id: string
    name: string
    category: string
    location: string | null
  }
  flat: {
    flatNumber: string
    block: string | null
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  confirmedBy?: {
    id: string
    name: string
  } | null
}
