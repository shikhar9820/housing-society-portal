# Angel Jupiter Society Portal - Documentation

## Quick Links

| Document | Description |
|----------|-------------|
| [Product Documentation](./PRODUCT_DOCUMENTATION.md) | Features, user journeys, permissions |
| [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) | Architecture, API, database schema |

---

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev -- -p 3001
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@society.com | admin123 |
| Committee | committee@society.com | committee123 |
| Resident | resident@society.com | resident123 |

---

## Feature Summary

| Module | Status |
|--------|--------|
| Authentication | Implemented |
| Dashboard | Implemented |
| Documents | Implemented |
| Finances | Implemented |
| Voting | Implemented |
| Tenders | Implemented |
| Announcements | Implemented |
| Complaints | Implemented |
| AMC Management | Implemented |
| Maintenance | Implemented |
| User Management | Implemented |
| Flat Management | Implemented |

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, shadcn/ui
- **Database:** SQLite (Prisma ORM)
- **Auth:** NextAuth.js
- **Charts:** Recharts
