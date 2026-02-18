# Angel Jupiter Society Portal - Technical Documentation

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.2.35 (App Router) |
| **Language** | TypeScript 5.x |
| **Database** | SQLite (dev) / PostgreSQL (prod ready) |
| **ORM** | Prisma 5.22 |
| **Authentication** | NextAuth.js 4.24 |
| **UI Components** | Radix UI + shadcn/ui |
| **Styling** | Tailwind CSS 3.4 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts 3.7 |
| **Icons** | Lucide React |

---

## Project Structure

```
society-portal/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeder
│   └── dev.db             # SQLite database file
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/           # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   ├── register/
│   │   │   │   ├── validate-token/   # Token validation
│   │   │   │   └── set-password/     # Set password
│   │   │   └── admin/
│   │   │       ├── flats/            # Flat listing
│   │   │       └── bulk-import/      # CSV import
│   │   ├── dashboard/     # Protected routes
│   │   │   ├── admin/
│   │   │   ├── amc/
│   │   │   ├── announcements/
│   │   │   ├── complaints/
│   │   │   ├── documents/
│   │   │   ├── finances/
│   │   │   ├── maintenance/
│   │   │   ├── residents/
│   │   │   ├── tenders/
│   │   │   └── voting/
│   │   ├── set-password/  # Password setup page
│   │   ├── public/        # Public pages
│   │   ├── error.tsx      # Error boundary
│   │   ├── global-error.tsx
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── layout/        # Header, Sidebar, MobileNav
│   │   ├── providers/     # Session, Toast providers
│   │   └── ui/            # Radix UI components
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── index.ts       # TypeScript interfaces
├── public/                # Static assets
├── .env                   # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

### Entity Relationship Diagram

```
User ─────┬───── Flat
          │
          ├───── Document ───── DocumentAccess
          │
          ├───── Expense
          │
          ├───── Poll ───── PollOption ───── PollVote
          │
          ├───── Tender ───── TenderBid
          │
          ├───── Announcement
          │
          └───── Complaint

Vendor ───── AMC ───── AMCService

MaintenanceTask (standalone)
MonthlyBudget (standalone)
```

### Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String
  phone         String?
  role          String    @default("RESIDENT")
  flatId        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  flat          Flat?     @relation(...)
  // ... relations to other models
}
```

**Role Values:** `ADMIN`, `COMMITTEE`, `RESIDENT`, `TENANT`

#### Flat
```prisma
model Flat {
  id          String    @id @default(cuid())
  flatNumber  String    @unique
  block       String?
  floor       Int?
  area        Float?
  ownerName   String?
  ownerPhone  String?
  ownerEmail  String?
  isOccupied  Boolean   @default(true)
}
```

#### Document
```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String
  fileUrl     String
  fileName    String
  fileSize    Int
  mimeType    String?
  version     Int      @default(1)
  uploadedById String
  isActive    Boolean  @default(true)
}
```

**Categories:** `MEETING_MINUTES`, `AUDIT_REPORT`, `BYLAWS`, `NOC_FORMS`, `LEGAL`, `CONTRACTS`, `OTHER`

#### Expense
```prisma
model Expense {
  id            String   @id @default(cuid())
  category      String
  description   String
  amount        Float
  vendorName    String?
  invoiceNumber String?
  date          DateTime
  receiptUrl    String?
  paymentMode   String   @default("BANK_TRANSFER")
  isApproved    Boolean  @default(false)
  approvedById  String?
  createdById   String
}
```

**Categories:** `SECURITY`, `CLEANING`, `GARDENING`, `REPAIRS`, `ELECTRICITY`, `SALARIES`, `WATER`, `LIFT_MAINTENANCE`, `PEST_CONTROL`, `OTHER`

**Payment Modes:** `BANK_TRANSFER`, `CHEQUE`, `UPI`, `CASH`

#### Poll / PollOption / PollVote
```prisma
model Poll {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   @default("POLL")  // POLL, ELECTION
  startDate   DateTime
  endDate     DateTime
  isAnonymous Boolean  @default(false)
  status      String   @default("DRAFT") // DRAFT, ACTIVE, CLOSED
  createdById String
}

model PollVote {
  // Unique constraint: one vote per flat per poll
  @@unique([pollId, flatId])
}
```

#### Tender / TenderBid
```prisma
model Tender {
  id                String   @id @default(cuid())
  title             String
  description       String
  category          String
  deadline          DateTime
  minBudget         Float?
  maxBudget         Float?
  requiredDocuments String?  // JSON string
  status            String   @default("OPEN")
  awardedToId       String?
  awardReason       String?
}
```

**Status Values:** `OPEN`, `EVALUATION`, `AWARDED`, `CANCELLED`

#### AMC
```prisma
model AMC {
  id              String    @id @default(cuid())
  title           String
  vendorId        String
  category        String
  startDate       DateTime
  endDate         DateTime
  amount          Float
  paymentFrequency String   @default("YEARLY")
  status          String    @default("ACTIVE")
  reminderDays    Int       @default(30)
}
```

**Status Values:** `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `CANCELLED`

#### PasswordResetToken
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Purpose:** Manages password reset tokens for bulk-imported users and forgot password functionality.

**Token Lifecycle:**
- Created during bulk import (7-day expiry)
- Validated when user accesses set-password page
- Marked as `used: true` after password is set

#### BulkImportLog
```prisma
model BulkImportLog {
  id            String   @id @default(cuid())
  fileName      String
  totalRows     Int
  successCount  Int
  failureCount  Int
  errors        String?  // JSON string of errors
  importedById  String
  createdAt     DateTime @default(now())
}
```

**Purpose:** Audit trail for all bulk import operations.

---

## Authentication

### NextAuth Configuration

**File:** `src/lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate credentials exist
        // 2. Find user by email (case-insensitive)
        // 3. Check if user is active
        // 4. Verify password with bcrypt
        // 5. Return user object with role
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role and flatId to JWT
    },
    async session({ session, token }) {
      // Add role and flatId to session
    },
  },
}
```

### Session Object Shape
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'COMMITTEE' | 'RESIDENT' | 'TENANT'
    flatId?: string | null
    flatNumber?: string | null
  }
}
```

### Password Hashing
```typescript
// Hash password (registration)
const hashed = await bcrypt.hash(password, 12)

// Verify password (login)
const isValid = await bcrypt.compare(password, hashedPassword)
```

---

## Authorization Helpers

**File:** `src/lib/auth.ts`

```typescript
export function isAdmin(role: Role): boolean {
  return role === 'ADMIN'
}

export function isCommittee(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageDocuments(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageExpenses(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canCreatePoll(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageTenders(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageAnnouncements(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageComplaints(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}
```

---

## API Routes

### Authentication

**POST `/api/auth/register`**
```typescript
// Request
{
  email: string
  password: string
  name: string
  phone?: string
  flatId: string
}

// Response
{ message: "User registered successfully", userId: string }
```

**POST `/api/auth/[...nextauth]`**
- Handled by NextAuth.js
- Supports: signIn, signOut, session, csrf

### Bulk Import

**POST `/api/admin/bulk-import`**
```typescript
// Request: multipart/form-data
FormData: {
  file: File  // CSV file
}

// Response
{
  success: true,
  totalProcessed: number,
  successCount: number,
  failureCount: number,
  results: Array<{
    success: boolean,
    flatNumber: string,
    message: string,
    userId?: string
  }>,
  passwordResetTokens: Array<{
    email: string,
    token: string,
    name: string
  }>
}
```

**CSV Processing Flow:**
1. Parse CSV file
2. Normalize header names (supports variations like 'flat', 'unit', 'phone', 'mobile')
3. For each row:
   - Check if email already exists → Skip
   - Find or create Flat record
   - Create User with temporary password
   - Generate PasswordResetToken (7-day expiry)
4. Return results with invite links

### Password Reset

**GET `/api/auth/validate-token?token={token}`**
```typescript
// Response (valid)
{
  valid: true,
  userName: string
}

// Response (invalid)
{
  valid: false,
  error: string  // "Invalid token", "This link has already been used", "This link has expired"
}
```

**POST `/api/auth/set-password`**
```typescript
// Request
{
  token: string,
  password: string  // min 8 characters
}

// Response (success)
{ success: true }

// Response (error)
{ error: string }
```

### Admin APIs

**GET `/api/admin/flats`**
```typescript
// Response
Array<{
  id: string,
  flatNumber: string,
  block: string | null,
  floor: string | null,
  area: number | null,
  ownerName: string | null,
  ownerPhone: string | null,
  ownerEmail: string | null,
  status: string,
  _count: {
    users: number
  }
}>
```

---

## Frontend Architecture

### Route Groups

**`(auth)`** - Authentication pages (no sidebar)
- `/login` - Login form
- `/register` - Registration form

**`dashboard`** - Protected area (with sidebar)
- All routes require authentication
- Sidebar navigation based on role

### Component Patterns

#### Server Components (Default)
```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await prisma.announcement.findMany()
  return <Dashboard data={data} />
}
```

#### Client Components
```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const handleSubmit = async (e) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
  }
}
```

### UI Components

Using shadcn/ui pattern with Radix UI primitives:

```typescript
// src/components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center...',
  {
    variants: {
      variant: {
        default: '...',
        destructive: '...',
        outline: '...',
      },
      size: {
        default: '...',
        sm: '...',
        lg: '...',
      },
    },
  }
)
```

---

## Environment Variables

**File:** `.env`

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# File Upload (optional)
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
UPLOAD_DIR="./uploads"
```

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repo-url>
cd society-portal

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

### Database Commands
```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Seed database
npx prisma db seed
```

---

## Production Deployment

### Build
```bash
npm run build
npm start
```

### Environment Setup
1. Update `DATABASE_URL` to production database
2. Set secure `NEXTAUTH_SECRET`
3. Update `NEXTAUTH_URL` to production domain
4. Configure file storage (Supabase/S3)

### Database Migration
```bash
# For production, use migrations
npx prisma migrate deploy
```

---

## Security Considerations

### Implemented
- Password hashing with bcrypt (12 rounds)
- JWT session tokens
- CSRF protection (NextAuth)
- Role-based access control
- Input validation with Zod
- SQL injection prevention (Prisma)

### Recommendations for Production
- Enable HTTPS
- Set secure cookie flags
- Implement rate limiting
- Add request logging
- Configure CORS properly
- Use environment-specific secrets
- Enable audit logging

---

## Testing

### Manual Testing Accounts
```
Admin:     admin@society.com / admin123
Committee: committee@society.com / committee123
Resident:  resident@society.com / resident123
```

### Future Testing Setup
```bash
# Recommended testing stack
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress  # E2E testing
```

---

## Performance Considerations

### Current Optimizations
- Next.js App Router (RSC)
- Prisma connection pooling
- Static page generation where possible

### Recommended Optimizations
- Add Redis for session storage
- Implement API response caching
- Use CDN for static assets
- Add database indexes (already in schema)
- Implement pagination for large lists

---

## Monitoring & Logging

### Recommended Setup
```typescript
// Add to lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
})
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
```

---

## File Structure Conventions

| Pattern | Usage |
|---------|-------|
| `page.tsx` | Route page component |
| `layout.tsx` | Shared layout wrapper |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `route.ts` | API route handler |

---

## Type Definitions

**File:** `src/types/index.ts`

```typescript
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export const DOCUMENT_CATEGORIES = [
  'MEETING_MINUTES',
  'AUDIT_REPORT',
  'BYLAWS',
  // ...
] as const

export const EXPENSE_CATEGORIES = [
  'SECURITY',
  'CLEANING',
  // ...
] as const
```

---

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

### Branch Strategy
```
main        # Production
├── develop # Integration
└── feature/* # Feature branches
```

---

## Troubleshooting

### Common Issues

**Prisma Client Not Generated**
```bash
npx prisma generate
```

**Port Already in Use**
```bash
npx kill-port 3000
# or use different port
npm run dev -- -p 3001
```

**Database Not Found**
```bash
npx prisma db push
npx prisma db seed
```

**NextAuth Session Issues**
- Check `NEXTAUTH_URL` matches actual URL
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies

---

## Changelog

### v0.2.0 (Bulk Import & Onboarding)
- CSV bulk import for flats and residents
- Auto-create user accounts from CSV
- Password reset token system
- Set password page for new users
- Flat management API endpoints
- Import logging and audit trail
- Enhanced flat management UI with real data

### v0.1.0 (Initial Release)
- Core authentication system
- Dashboard with stats
- Document management
- Financial tracking
- Voting/polls system
- Tender management
- Announcements
- Complaint management
- AMC tracking
- Maintenance tasks
- User/Flat management
