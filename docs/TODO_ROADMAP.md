# Society Portal - Upcoming Tasks

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

## Next Session (Tomorrow)

### 1. Testing Environment Setup
- [ ] Set up proper testing environment
- [ ] Configure CI/CD pipeline
- [ ] Add automated tests (unit, integration)

### 2. AI Summarization & Hindi Support

**API Choice:** Google Gemini (Free - 1500 requests/day)

**Summarization Features:**
- [ ] Set up Gemini API key
- [ ] Create `/api/summarize` endpoint
- [ ] Add `summary` field to Document model
- [ ] Add `summary` field to Announcement model
- [ ] Auto-summarize on document upload
- [ ] "Generate Summary" button for existing docs
- [ ] Summary preview in document list cards
- [ ] Meeting minutes TL;DR generation
- [ ] Financial report insights ("₹2.5L spent, 15% over budget")

**Where Summaries Appear:**
- [ ] Dashboard announcement cards
- [ ] Document list preview
- [ ] Announcement feed (long posts)
- [ ] Meeting minutes header
- [ ] Financial reports overview

**Hindi Language Support:**
- [ ] Summarize in Hindi option
- [ ] UI language toggle (English/Hindi)
- [ ] Translate announcements to Hindi
- [ ] Bilingual document summaries

**Implementation Flow:**
```
Upload PDF → Extract text (pdf-parse) → Send to Gemini →
Store summary → Display in cards/lists
```

### 3. Financial Data Structure & Analysis
- [ ] Restructure financial data schema for proper analysis
- [ ] Define clear categories, sub-categories
- [ ] Income vs Expense tracking
- [ ] Budget allocation and comparison
- [ ] Monthly/Quarterly/Yearly reports
- [ ] Charts and visualizations for insights
- [ ] Export capabilities (CSV, PDF)

### 4. Document Storage Setup
- [ ] Configure Supabase Storage (1 GB free)
- [ ] Create upload API endpoint
- [ ] Organize bucket structure (documents/, receipts/, complaints/)
- [ ] Add file validation (type, size limits)
- [ ] Implement signed URLs for sensitive docs
- [ ] Move to S3/DigitalOcean when scaling

### 5. Notifications

**Reality Check - WhatsApp:**
```
Official Group Auto-Post API?  ❌ Doesn't exist
Free + Safe + Automated?       ❌ Not possible
Meta blocks this intentionally to push paid Business API
```

**Our Approach: Semi-Automated (Free + Safe)**

- [ ] "Copy for WhatsApp" button on announcements
- [ ] Pre-formatted message with emojis, title, summary
- [ ] One-tap copy to clipboard
- [ ] Admin pastes in WhatsApp Group (10 seconds)
- [ ] Toast notification: "Message copied! Paste in WhatsApp Group"

**Implementation:**
```typescript
const copyForWhatsApp = (announcement) => {
  const text = `📢 *${title}*\n\n${summary}\n\n🔗 ${link}`;
  navigator.clipboard.writeText(text);
  toast("Copied! Paste in WhatsApp Group");
};
```

**Automated Channels (Free):**
- [ ] Email notifications (Resend - 3000/month free)
- [ ] In-app notification bell
- [ ] Browser push notifications (future)

**Notification Flow:**
```
Admin posts announcement
        ↓
├── ✅ Auto: Email sent to all residents
├── ✅ Auto: In-app notification
└── 📋 Manual: "Copy for WhatsApp" (10 sec effort)
```

**SMS for Urgent Alerts (Low Cost):**
```
Cost: ₹90 per blast (600 flats × ₹0.15)
Reach: 100% (works without internet/smartphone)
Open rate: 95%
```

- [ ] Choose provider (MSG91/Fast2SMS - ₹0.10-0.18/SMS)
- [ ] Complete DLT registration (mandatory in India)
  - Register on DLT portal (Jio/Airtel/Vodafone)
  - Create sender ID (e.g., "AJSOCI")
  - Register message templates
  - Wait for approval (2-5 days)
- [ ] Create `/api/notify/sms` endpoint
- [ ] Use for: Emergency, Security alerts, Payment deadlines

**Notification Priority:**
```
🚨 Urgent (Emergency):     SMS (₹90) - reaches everyone
📢 Important (Payments):   WhatsApp manual (free)
📝 Normal (Events):        Email + In-app (free)
```

**Future (if society pays more):**
- WhatsApp Business API (~₹300 per announcement)

### 6. UX Improvements

**Dashboard Simplification:**
- [ ] Max 4-5 main action buttons
- [ ] Big touch-friendly buttons
- [ ] One-tap complaint raising
- [ ] Color coding (Red=urgent, Yellow=pending, Green=done)

**User-Friendly Features:**
- [ ] Hindi/English toggle
- [ ] WhatsApp-style message bubbles for announcements
- [ ] Quick actions on home screen
- [ ] Clear navigation (no more than 2 taps to any feature)
- [ ] Mobile-first responsive design

**Reduce Confusion:**
- [ ] Onboarding tour for new users
- [ ] Tooltips on complex features
- [ ] Clear labels (no jargon)
- [ ] Consistent icons throughout

### 7. Amenity Booking System

**Amenities to Track:**
- Clubhouse / Party Hall
- Swimming Pool
- Gym / Fitness Center
- Badminton / Tennis Court
- Guest Rooms
- Terrace / BBQ Area
- Community Hall
- Kids Play Area

**Features:**
- [ ] Amenity listing with photos, capacity, rules
- [ ] Availability calendar (date-wise view)
- [ ] Booking form (date, time slot, purpose)
- [ ] Booking approval workflow (auto/manual)
- [ ] Conflict detection (no double booking)
- [ ] Cancellation policy & refunds

**Booking Records:**
- [ ] Who booked (flat number, resident name)
- [ ] What amenity
- [ ] Date & time slot
- [ ] Duration (hours)
- [ ] Purpose (party, meeting, personal)
- [ ] Booking amount (if paid)
- [ ] Status (Pending, Approved, Rejected, Completed, Cancelled)

**Database Schema:**
```prisma
model Amenity {
  id          String   @id
  name        String   // "Party Hall"
  description String?
  capacity    Int?     // 50 people
  pricePerHour Float?  // ₹500/hr or ₹0 if free
  rules       String?  // "No loud music after 10 PM"
  images      String?  // JSON array of URLs
  isActive    Boolean  @default(true)
  bookings    AmenityBooking[]
}

model AmenityBooking {
  id          String   @id
  amenityId   String
  flatId      String
  bookedById  String
  date        DateTime
  startTime   String   // "10:00"
  endTime     String   // "14:00"
  duration    Int      // hours
  purpose     String?
  status      String   @default("PENDING") // PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
  amount      Float?
  createdAt   DateTime @default(now())

  amenity     Amenity  @relation(...)
  flat        Flat     @relation(...)
  bookedBy    User     @relation(...)
}
```

**UI Views:**
```
┌─────────────────────────────────────────┐
│ 🏊 Amenities                            │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ 🎉      │ │ 🏊      │ │ 🏋️      │    │
│ │ Party   │ │ Pool    │ │ Gym     │    │
│ │ Hall    │ │         │ │         │    │
│ │ [Book]  │ │ [View]  │ │ [Book]  │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│ 📅 Upcoming Bookings                    │
│ • Party Hall - 25 Jan - Flat 101        │
│ • Guest Room - 28 Jan - Flat 305        │
└─────────────────────────────────────────┘
```

**Calendar View:**
```
┌─────────────────────────────────────────┐
│ Party Hall - January 2025               │
├────┬────┬────┬────┬────┬────┬────┤
│ Su │ Mo │ Tu │ We │ Th │ Fr │ Sa │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │    │ 1  │ 2  │ 3  │ 4  │
│    │    │    │ 🟢 │ 🟢 │ 🔴 │ 🔴 │
├────┼────┼────┼────┼────┼────┼────┤
│ 5  │ 6  │ 7  │ 8  │ ...                 │
│ 🟢 │ 🟢 │ 🟢 │ 🟡 │                      │
└────────────────────────────────────────┘
🟢 Available  🟡 Partially Booked  🔴 Full
```

**Admin Reports:**
- [ ] Most booked amenities
- [ ] Revenue from bookings
- [ ] Booking frequency by flat
- [ ] Peak hours/days analysis

### 8. Governance & Transparency Features (YOUR USP)

**Financial Transparency:**
- [ ] Public expense dashboard (all residents can view)
- [ ] Mandatory receipt upload for every expense
- [ ] Vendor payment history
- [ ] Monthly expense comparison charts
- [ ] Budget vs Actual variance alerts
- [ ] Category-wise spending breakdown

**Anomaly Detection (AI):**
- [ ] "Electricity bill 3x higher than average"
- [ ] "Security cost increased 40% this month"
- [ ] "Unusual expense pattern detected"
- [ ] Auto-flag expenses above threshold
- [ ] Notify committee of anomalies

**Committee Accountability:**
- [ ] Committee promises tracker (what they said vs did)
- [ ] Task completion rate per member
- [ ] Response time to complaints
- [ ] Meeting attendance record
- [ ] Public committee scoreboard

**Decision Audit Trail:**
- [ ] Every vote recorded permanently
- [ ] Who voted what (for non-anonymous polls)
- [ ] Decision history searchable
- [ ] Cannot delete/modify past records
- [ ] Export for legal/audit purposes

**Tender Transparency:**
- [ ] All tenders visible to residents
- [ ] Bid amounts visible after deadline
- [ ] Award reason documented
- [ ] Vendor comparison matrix
- [ ] Past vendor performance ratings

**Audit Mode:**
- [ ] One-click annual audit report
- [ ] Income vs Expense summary
- [ ] Pending dues list
- [ ] All receipts downloadable
- [ ] Compliance checklist

**Resident Grievance Tracking:**
- [ ] Complaint resolution rate
- [ ] Average resolution time
- [ ] Pending complaints aging report
- [ ] Escalation tracking

### 9. Committee Members Directory

**Display Current Elected Members:**
- [ ] Committee members listing page
- [ ] Photo, name, flat number
- [ ] Designation (Chairman, Secretary, Treasurer, etc.)
- [ ] Contact info (phone, email)
- [ ] Term period (elected date, tenure end)
- [ ] Responsibilities / Portfolio

**Designations:**
```
├── Chairman / President
├── Vice Chairman
├── Secretary
├── Joint Secretary
├── Treasurer
├── Committee Member (multiple)
└── Special Invitee (optional)
```

**Database Schema:**
```prisma
model CommitteeMember {
  id            String   @id
  userId        String   @unique
  designation   String   // "CHAIRMAN", "SECRETARY", etc.
  portfolio     String?  // "Maintenance", "Security", "Finance"
  electedDate   DateTime
  termEndDate   DateTime
  isActive      Boolean  @default(true)
  order         Int      @default(0) // Display order

  user          User     @relation(...)
}
```

**UI View:**
```
┌─────────────────────────────────────────┐
│ 👥 Managing Committee (2024-2026)       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Rajesh Sharma                    │ │
│ │ Chairman | Flat 101                 │ │
│ │ 📞 98765-43210                      │ │
│ │ Term: Jan 2024 - Dec 2026           │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Priya Patel                      │ │
│ │ Secretary | Flat 205                │ │
│ │ 📞 98765-11111                      │ │
│ │ Portfolio: Documentation            │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Amit Kumar                       │ │
│ │ Treasurer | Flat 302                │ │
│ │ 📞 98765-22222                      │ │
│ │ Portfolio: Finance & Accounts       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [View All Members]                      │
└─────────────────────────────────────────┘
```

**Features:**
- [ ] Public page (no login required)
- [ ] Admin can add/remove members
- [ ] Archive past committees
- [ ] Link to election results (polls)
- [ ] Show on dashboard sidebar

**History:**
- [ ] Past committee records
- [ ] Previous terms archive
- [ ] Election results linked

### 9. Multi-Tenant Architecture (100+ Societies)

**Current:** Single society
**Target:** 100+ societies on same platform

**Multi-Tenant Strategy:**
```
┌─────────────────────────────────────────┐
│           Your SaaS Platform            │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │Society 1│ │Society 2│ │Society N│    │
│ │ Angel   │ │ Sunshine│ │  ...    │    │
│ │ Jupiter │ │ Heights │ │         │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│         Shared Infrastructure           │
│     (DB, Storage, APIs, Auth)           │
└─────────────────────────────────────────┘
```

**Database Schema Changes:**
```prisma
model Society {
  id            String   @id
  name          String   // "Angel Jupiter Society"
  slug          String   @unique // "angel-jupiter"
  address       String?
  city          String?
  state         String?
  pincode       String?
  logo          String?
  contactEmail  String?
  contactPhone  String?
  totalFlats    Int?
  subscription  String   @default("FREE") // FREE, BASIC, PRO
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  // Relations
  flats         Flat[]
  users         User[]
  amenities     Amenity[]
  announcements Announcement[]
  // ... all other models
}

// Every model gets societyId
model Flat {
  id         String  @id
  societyId  String  // 👈 Added
  flatNumber String
  // ...
  society    Society @relation(...)

  @@unique([societyId, flatNumber]) // Flat unique per society
}

model User {
  id         String  @id
  societyId  String  // 👈 Added
  email      String
  // ...
  society    Society @relation(...)

  @@unique([societyId, email]) // Email unique per society
}
```

**Dynamic Configuration (Per Society):**
- [ ] Society profile (name, logo, address)
- [ ] Amenities list (configurable)
- [ ] Expense categories (customizable)
- [ ] Complaint categories (customizable)
- [ ] Committee designations (configurable)
- [ ] Notification preferences
- [ ] Branding (colors, logo)

**URL Structure:**
```
Option A: Subdomain
├── angeljupiter.yourapp.com
├── sunshineheights.yourapp.com
└── greenvalley.yourapp.com

Option B: Path-based
├── yourapp.com/angeljupiter
├── yourapp.com/sunshineheights
└── yourapp.com/greenvalley
```

**Data Isolation:**
- [ ] Every query filtered by societyId
- [ ] Middleware to inject societyId automatically
- [ ] No cross-society data leakage
- [ ] Society-specific file storage folders

### 10. Security

**Authentication:**
- [ ] Secure password hashing (bcrypt, 12 rounds)
- [ ] JWT tokens with expiry
- [ ] Refresh token rotation
- [ ] Session management
- [ ] Force logout capability

**Authorization:**
- [ ] Role-based access control (RBAC)
  ```
  SUPER_ADMIN  → Platform owner (you)
  ADMIN        → Society admin
  COMMITTEE    → Committee members
  RESIDENT     → Flat owners
  TENANT       → Renters (limited access)
  ```
- [ ] Permission matrix per role
- [ ] Society-level isolation

**API Security:**
- [ ] Rate limiting (prevent abuse)
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] CORS configuration

**Data Security:**
- [ ] Encrypt sensitive data at rest
- [ ] HTTPS everywhere (SSL/TLS)
- [ ] Secure file uploads (type validation, size limits)
- [ ] No sensitive data in URLs
- [ ] Audit logs for critical actions

**Infrastructure Security:**
- [ ] Environment variables for secrets
- [ ] Database access restricted
- [ ] Regular backups
- [ ] DDoS protection (Cloudflare)
- [ ] Dependency vulnerability scanning

**Compliance:**
- [ ] GDPR-friendly (data export, deletion)
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Data retention policy

**Security Checklist:**
```
[ ] No hardcoded secrets
[ ] Password strength requirements
[ ] Account lockout after failed attempts
[ ] Secure password reset flow
[ ] Session timeout
[ ] Activity logging
[ ] Admin action audit trail
```

### 11. Scalability

**Database:**
- [ ] PostgreSQL for production (not SQLite)
- [ ] Connection pooling
- [ ] Database indexes on frequently queried fields
- [ ] Read replicas (if needed at scale)

**Performance:**
- [ ] API response caching (Redis)
- [ ] Static asset CDN
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Pagination everywhere

**Infrastructure:**
- [ ] Horizontal scaling (multiple instances)
- [ ] Load balancer
- [ ] Auto-scaling based on traffic
- [ ] Separate file storage (S3/Supabase)

**Monitoring:**
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database query analysis
- [ ] API response time tracking

### 12. Production Deployment
- [ ] Prepare production environment
- [ ] Database migration strategy (Prisma migrate)
- [ ] Environment variables setup
- [ ] Deploy to production (Vercel/Railway)
- [ ] Custom domain setup
- [ ] SSL certificate
- [ ] Backup strategy
- [ ] Monitoring setup

---

## Completed Tasks

### Bulk Import Feature (Done)
- [x] CSV upload for flats and residents
- [x] Auto-create user accounts
- [x] Password reset token system
- [x] Set password page
- [x] Documentation updated

---

## Notes
- Get clearer requirements for summarization feature
- Decide on Hindi language scope (UI translation vs document translation)
- Choose hosting platform for production
