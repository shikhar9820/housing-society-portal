# Society Portal - Development Roadmap

> **Last Updated:** February 19, 2026
> **Deployment Target:** Vercel (https://vercel.com)

---

## Product Positioning

**Niche:** Society Governance & Transparency Platform

**Tagline:** "NoBrokerHood secures your gate. We secure your society's money."

**We are NOT:** A NoBrokerHood competitor
**We ARE:** A complement to security apps

```
┌─────────────────────────────────────────────────────────┐
│              Society Tech Stack                         │
├─────────────────────────────────────────────────────────┤
│  NoBrokerHood          │  Your App                      │
│  (Security Layer)      │  (Governance Layer)            │
├────────────────────────┼────────────────────────────────┤
│  Visitor management    │  Financial transparency        │
│  Guard app             │  Tender management             │
│  Entry/exit logs       │  Voting & elections            │
│  Intercom              │  AI meeting summaries          │
│  Parking               │  Committee accountability      │
│  Delivery tracking     │  Audit trail & reports         │
└────────────────────────┴────────────────────────────────┘
```

**Target Societies:**
- Societies with trust/transparency issues
- Societies that had financial disputes
- Large societies (200+ flats) needing accountability
- New committees wanting to prove transparency
- Societies already using NoBrokerHood (complement it)

**USP Features:**
- 100% Financial Transparency (every rupee visible)
- AI-Powered Summaries (meetings, docs, Hindi)
- Tender Transparency (open bidding, no backroom deals)
- Committee Accountability (promises vs delivered)
- Decision History (permanent audit trail)
- Anomaly Detection ("Why is bill 3x higher?")

---

## Current Status

### Infrastructure (DONE)
- [x] Supabase PostgreSQL database connected (ap-southeast-2)
- [x] 19 database tables created via Prisma
- [x] NextAuth.js authentication with JWT
- [x] Role-based access (ADMIN, COMMITTEE, RESIDENT, TENANT)
- [x] Session pooler connection for IPv4 compatibility

### APIs Built (DONE)
- [x] **Expenses API** - Full CRUD + approval workflow + summary stats
- [x] **Announcements API** - Full CRUD with priority/pinning
- [x] **Complaints API** - Full CRUD with status tracking
- [x] **Auth API** - Login, register, password reset
- [x] **Admin API** - Bulk import, flat management

### UI Pages (DONE - Using Mock Data for Some)
- [x] Dashboard with stats overview
- [x] Finances page (connected to real API)
- [x] Announcements page (UI ready, needs API connection)
- [x] Complaints page (UI ready, needs API connection)
- [x] Voting/Polls page (UI only)
- [x] Tenders page (UI only)
- [x] Documents page (UI only)
- [x] AMC page (UI only)
- [x] Maintenance page (UI only)
- [x] Residents directory (UI only)

### Test Data Seeded
- 20 flats (Block A, floors 1-5)
- 3 users (admin, committee, resident)
- 5 expenses (3 approved, 2 pending)
- 4 announcements
- 3 complaints
- 7 monthly budgets
- 1 vendor, 1 AMC contract

### Test Credentials
```
Admin:     admin@society.com / admin123
Committee: committee@society.com / admin123
Resident:  resident@society.com / admin123
```

---

## Next Session Tasks

### Priority 1: Vercel Deployment
- [ ] Create Vercel account (if not exists)
- [ ] Connect GitHub repository
- [ ] Configure environment variables on Vercel:
  - DATABASE_URL
  - DIRECT_URL
  - NEXTAUTH_URL (production URL)
  - NEXTAUTH_SECRET (generate new for production)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- [ ] Deploy to Vercel
- [ ] Test production build
- [ ] Set up custom domain (optional)

### Priority 2: Connect Remaining Pages to APIs
- [ ] Connect Announcements page to `/api/announcements`
- [ ] Connect Complaints page to `/api/complaints`
- [ ] Add loading states and error handling
- [ ] Test all CRUD operations

### Priority 3: Document Storage (Supabase Storage)
- [ ] Create storage bucket in Supabase
- [ ] Install @supabase/supabase-js
- [ ] Create upload API endpoint
- [ ] Connect document upload UI
- [ ] Implement signed URLs for secure downloads

### Priority 4: Dashboard Stats API
- [ ] Create `/api/dashboard/stats` endpoint
- [ ] Connect dashboard to real data
- [ ] Show actual counts for:
  - Total residents
  - Active polls
  - Open complaints
  - Pending approvals
  - This month's expenses

---

## Future Tasks (Post-MVP)

### AI Summarization & Hindi Support
**API Choice:** Google Gemini (Free - 1500 requests/day)

- [ ] Set up Gemini API key
- [ ] Create `/api/summarize` endpoint
- [ ] Add `summary` field to Document model
- [ ] Auto-summarize on document upload
- [ ] Hindi language toggle
- [ ] Bilingual document summaries

### Notifications
- [ ] "Copy for WhatsApp" button on announcements
- [ ] Email notifications (Resend - 3000/month free)
- [ ] In-app notification bell
- [ ] SMS for urgent alerts (MSG91/Fast2SMS)

### UX Improvements
- [ ] Mobile-first responsive design improvements
- [ ] Hindi/English toggle
- [ ] Onboarding tour for new users
- [ ] Quick actions on home screen

### Governance Features (USP)
- [ ] Public expense dashboard
- [ ] Anomaly detection (AI)
- [ ] Committee promises tracker
- [ ] Decision audit trail
- [ ] Tender transparency

### Amenity Booking System
- [ ] Amenity listing
- [ ] Availability calendar
- [ ] Booking workflow
- [ ] Conflict detection

### Multi-Tenant Architecture
- [ ] Add Society model
- [ ] Add societyId to all models
- [ ] Subdomain or path-based routing
- [ ] Society-level isolation

### Security Enhancements
- [ ] Rate limiting
- [ ] Input validation (Zod)
- [ ] CSRF tokens
- [ ] Audit logs

---

## Completed Tasks

### Session: February 19, 2026

**Infrastructure:**
- [x] Migrated from SQLite to Supabase PostgreSQL
- [x] Configured session pooler (aws-1-ap-southeast-2)
- [x] Fixed IPv4 connectivity issues

**APIs Created:**
- [x] Expenses API (`/api/expenses/*`)
  - GET /api/expenses (list with filters)
  - POST /api/expenses (create)
  - GET /api/expenses/[id] (single)
  - PUT /api/expenses/[id] (update)
  - DELETE /api/expenses/[id] (delete)
  - POST /api/expenses/[id]/approve (approve)
  - GET /api/expenses/summary (stats)
- [x] Announcements API (`/api/announcements/*`)
- [x] Complaints API (`/api/complaints/*`)

**UI Updates:**
- [x] Connected Finances page to real Expenses API
- [x] Added loading states and error handling
- [x] Added expense approval for admins

**Database:**
- [x] Seeded test data (users, flats, expenses, announcements, complaints, budgets)

**Code Quality:**
- [x] Fixed TypeScript errors (Role type)
- [x] Committed all changes to git

### Previous Session
- [x] CSV bulk import for flats and residents
- [x] Auto-create user accounts
- [x] Password reset token system
- [x] Set password page
- [x] Full UI component library (shadcn/ui)
- [x] Dashboard layout with sidebar

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Auth | NextAuth.js (JWT) |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| File Storage | Supabase Storage (planned) |
| Deployment | **Vercel** (planned) |
| Icons | Lucide React |

---

## Environment Variables Required

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"  # Change for production
NEXTAUTH_SECRET="your-secret-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

---

## Notes
- Deploying to **Vercel** for production
- Supabase project is in ap-southeast-2 (Sydney) region
- Using session pooler for database connections (IPv4 compatible)
- All passwords for test users are `admin123`
- The dev server runs on port 3000
