# Angel Jupiter Society Portal - Product Documentation

## Overview

Angel Jupiter Society Portal is a comprehensive digital platform designed to modernize housing society management. It provides transparency, efficiency, and ease of access for all stakeholders - from administrators to residents.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| **Admin** | Society secretary/manager with full system control |
| **Committee** | Managing committee members who handle day-to-day operations |
| **Resident** | Flat owners who need visibility into society operations |
| **Tenant** | Rented occupants with limited access |

---

## Core Modules

### 1. Dashboard
**Purpose:** Central hub providing quick overview of society status

**Features:**
- Total flats and occupancy statistics
- Active polls and participation rates
- Pending complaints count
- Recent announcements
- Quick action buttons for common tasks
- Monthly expense summary

---

### 2. Document Management
**Purpose:** Centralized repository for all society documents

**Document Categories:**
- Meeting Minutes
- Audit Reports
- Society Bylaws
- NOC Forms
- Legal Documents
- Contracts

**Features:**
- Upload documents with version control
- Category-based organization
- Search and filter capabilities
- Download tracking for audit compliance
- Access restricted to authenticated users

**User Permissions:**
| Action | Admin | Committee | Resident |
|--------|-------|-----------|----------|
| Upload | Yes | Yes | No |
| View/Download | Yes | Yes | Yes |
| Delete | Yes | Yes | No |

---

### 3. Financial Management
**Purpose:** Complete transparency into society finances

**Expense Categories:**
- Security
- Cleaning & Housekeeping
- Gardening & Landscaping
- Repairs & Maintenance
- Electricity (Common Areas)
- Staff Salaries
- Water Supply
- Lift Maintenance
- Pest Control
- Other

**Features:**
- Record expenses with vendor details
- Attach receipts and invoices
- Approval workflow for large expenses
- Monthly budget vs actual comparison
- Category-wise expense breakdown
- Vendor payment tracking
- Export reports to CSV/PDF

**Payment Modes Supported:**
- Bank Transfer
- Cheque
- UPI
- Cash

---

### 4. Voting & Elections
**Purpose:** Democratic decision-making and committee elections

**Poll Types:**
- General Polls (facility decisions, rule changes)
- Elections (committee member selection)

**Features:**
- Create polls with multiple options
- Set start and end dates
- Anonymous voting option for sensitive topics
- One vote per flat (not per person)
- Real-time participation tracking
- Live results visualization
- Draft, Active, and Closed states

**Voting Rules:**
- Only one vote allowed per flat
- Cannot change vote once submitted
- Anonymous votes hide voter identity in results
- Results visible only after poll closes (configurable)

---

### 5. Tender Management
**Purpose:** Transparent vendor selection process

**Tender Lifecycle:**
```
OPEN → EVALUATION → AWARDED/CANCELLED
```

**Features:**
- Post tenders with detailed specifications
- Set budget range (min/max)
- Specify required documents from vendors
- Collect bids from interested vendors
- Compare bids side-by-side
- Award with documented reasoning
- Public tender page for vendors

**Tender Categories:**
- Security Services
- Housekeeping
- Lift Maintenance
- Electrical Work
- Plumbing
- Civil Work
- Painting
- Landscaping
- Other

---

### 6. Announcements
**Purpose:** Official communication channel to all residents

**Priority Levels:**
- Normal (routine updates)
- Important (requires attention)
- Urgent (immediate action needed)

**Features:**
- Create announcements with rich text
- Pin important announcements to top
- Set expiry dates for time-sensitive notices
- Category-based organization
- Public announcements (no login required)
- Search and filter by date/priority

---

### 7. Complaint Management
**Purpose:** Track and resolve resident issues

**Complaint Categories:**
- Plumbing Issues
- Electrical Problems
- Security Concerns
- Parking Disputes
- Noise Complaints
- Common Area Issues
- Lift Problems
- Water Supply
- Other

**Priority Levels:**
- Low
- Medium
- High
- Urgent

**Status Workflow:**
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

**Features:**
- Residents can raise complaints
- Attach photos/documents
- Track status in real-time
- Committee assignment
- Resolution documentation
- Escalation for unresolved issues

---

### 8. AMC (Annual Maintenance Contracts)
**Purpose:** Track and manage service contracts

**Features:**
- Register all AMC contracts
- Track contract start/end dates
- Expiry alerts (30/60 days before)
- Service history logging
- Vendor contact information
- Contract document storage
- Renewal reminders

**AMC Categories:**
- Elevator
- Generator
- Fire Safety
- CCTV
- Water Pump
- STP/WTP
- Intercom
- Other

---

### 9. Maintenance Tasks
**Purpose:** Track repair and maintenance work

**Task Categories:**
- Plumbing
- Electrical
- Civil
- Mechanical
- Painting
- Carpentry
- Cleaning

**Features:**
- Create tasks with descriptions
- Set priority and due dates
- Assign to vendors/staff
- Track estimated vs actual cost
- Status updates throughout lifecycle
- Location tracking within society

---

### 10. Resident Directory
**Purpose:** Contact information for all residents

**Features:**
- Searchable resident list
- Flat and block information
- Phone and email contacts
- Role badges (Admin, Committee, Resident)
- Privacy-conscious display

---

### 11. Admin Panel

#### User Management
**Features:**
- Create new user accounts
- Assign/change roles
- Link users to flats
- Activate/deactivate accounts
- View login history

#### Flat Management
**Features:**
- Add/edit flat details
- Owner information
- Occupancy status
- Area specifications
- Block and floor mapping
- Bulk import via CSV

#### Bulk Import (CSV Upload)
**Purpose:** Quickly onboard all flats and residents by importing from CSV

**How It Works:**
1. Admin prepares CSV with flat details (flatNumber, ownerName, ownerEmail, ownerPhone)
2. Admin uploads CSV via "Bulk Import" button in Flat Management
3. System automatically:
   - Creates flat records (or updates existing ones)
   - Creates user accounts for each owner
   - Generates unique "Set Password" links (valid for 7 days)
4. Admin shares links with respective residents (via WhatsApp/Email)
5. Residents click link to set their password
6. After setting password, residents can login to the portal

**CSV Columns:**
| Column | Required | Description |
|--------|----------|-------------|
| flatNumber | Yes | Flat number (e.g., A-101) |
| ownerName | Yes | Owner's full name |
| ownerEmail | Yes | Owner's email (becomes login ID) |
| ownerPhone | Yes | Owner's mobile number |
| block | No | Block/Wing/Tower (e.g., A, B, Tower-1) |
| floor | No | Floor number |

**Import Results:**
- Success count: Flats and accounts created
- Failure count: Skipped rows with reasons
- Invite links: Copy and share with residents

**Error Handling:**
- Duplicate emails are skipped
- Invalid email formats are skipped
- Missing required fields are skipped

---

## Public Pages (No Login Required)

### Public Announcements
- View society announcements
- Filter by priority
- Search functionality

### Open Tenders
- View current open tenders
- Submit bids as a vendor
- Download tender documents

---

## User Journeys

### Resident Journey
1. Login with credentials
2. View dashboard overview
3. Check latest announcements
4. View society documents
5. Participate in active polls
6. Raise complaints if needed
7. Track complaint status
8. View expense reports for transparency

### Committee Member Journey
1. Login with credentials
2. Review dashboard metrics
3. Post new announcements
4. Upload meeting minutes
5. Record society expenses
6. Create polls for decisions
7. Manage complaints
8. Post tenders for services
9. Track AMC renewals

### Admin Journey
1. All committee capabilities plus:
2. Manage user accounts
3. Control flat registry
4. Assign roles and permissions
5. Configure system settings

---

## Benefits

### For Residents
- **Transparency:** See where maintenance money goes
- **Convenience:** Vote from home, no need to attend meetings
- **Communication:** Stay updated with announcements
- **Accountability:** Track complaint resolution

### For Committee
- **Efficiency:** Digital record-keeping
- **Compliance:** Audit trails for all actions
- **Fairness:** Transparent tender process
- **Organization:** Centralized document storage

### For Society
- **Modernization:** Replace paper-based processes
- **Accessibility:** 24/7 access from anywhere
- **Historical Records:** Searchable archives
- **Dispute Resolution:** Clear documentation

---

## Security & Privacy

- Passwords encrypted with bcrypt
- Session-based authentication
- Role-based access control
- Secure document storage
- Activity logging for compliance

---

## Future Roadmap

### Phase 2 (Planned)
- Maintenance bill generation
- Online payment integration
- SMS/Email notifications
- Mobile app (React Native)

### Phase 3 (Planned)
- Visitor management
- Facility booking (clubhouse, parking)
- Intercom integration
- CCTV dashboard

---

## Support

For issues or feedback:
- Contact: Society Admin
- Email: admin@society.com
