import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create flats
  const flats = []
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const flatNumber = `${floor}0${unit}`
      const flat = await prisma.flat.upsert({
        where: { flatNumber },
        update: {},
        create: {
          flatNumber,
          block: 'A',
          floor,
          area: 1200 + (floor * 50),
          isOccupied: true,
        },
      })
      flats.push(flat)
    }
  }
  console.log(`Created ${flats.length} flats`)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@society.com' },
    update: {},
    create: {
      email: 'admin@society.com',
      password: adminPassword,
      name: 'Society Admin',
      phone: '9876543210',
      role: 'ADMIN',
      flatId: flats[0].id,
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // Create committee member
  const committeePassword = await bcrypt.hash('admin123', 12)
  const committee = await prisma.user.upsert({
    where: { email: 'committee@society.com' },
    update: {},
    create: {
      email: 'committee@society.com',
      password: committeePassword,
      name: 'Priya Patel (Secretary)',
      phone: '9876543211',
      role: 'COMMITTEE',
      flatId: flats[1].id,
    },
  })
  console.log(`Created committee member: ${committee.email}`)

  // Create a resident
  const residentPassword = await bcrypt.hash('admin123', 12)
  const resident = await prisma.user.upsert({
    where: { email: 'resident@society.com' },
    update: {},
    create: {
      email: 'resident@society.com',
      password: residentPassword,
      name: 'Amit Kumar',
      phone: '9876543212',
      role: 'RESIDENT',
      flatId: flats[2].id,
    },
  })
  console.log(`Created resident: ${resident.email}`)

  // Create sample expenses
  const currentDate = new Date()
  const expenses = [
    {
      category: 'SECURITY',
      description: 'Security guard salaries - Monthly',
      amount: 250000,
      vendorName: 'SecureGuard Services',
      invoiceNumber: 'SG-2026-001',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      paymentMode: 'BANK_TRANSFER',
      isApproved: true,
      createdById: admin.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
    {
      category: 'CLEANING',
      description: 'Housekeeping services - Monthly',
      amount: 180000,
      vendorName: 'CleanPro Services',
      invoiceNumber: 'CP-2026-001',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
      paymentMode: 'BANK_TRANSFER',
      isApproved: true,
      createdById: admin.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
    {
      category: 'ELECTRICITY',
      description: 'Common area electricity bill',
      amount: 145000,
      vendorName: 'State Electricity Board',
      invoiceNumber: 'EB-2026-001',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      paymentMode: 'BANK_TRANSFER',
      isApproved: true,
      createdById: admin.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
    {
      category: 'REPAIRS',
      description: 'Water pump motor repair',
      amount: 35000,
      vendorName: 'Sharma Electricals',
      invoiceNumber: 'SE-2026-001',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      paymentMode: 'UPI',
      isApproved: false,
      createdById: committee.id,
    },
    {
      category: 'GARDENING',
      description: 'Garden maintenance and new plants',
      amount: 45000,
      vendorName: 'Green Garden Co.',
      invoiceNumber: 'GG-2026-001',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
      paymentMode: 'CHEQUE',
      isApproved: false,
      createdById: committee.id,
    },
  ]

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense })
  }
  console.log(`Created ${expenses.length} expenses`)

  // Create monthly budgets
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()
  const budgets = [
    { month, year, category: 'SECURITY', budgetedAmount: 260000, actualAmount: 250000 },
    { month, year, category: 'CLEANING', budgetedAmount: 190000, actualAmount: 180000 },
    { month, year, category: 'ELECTRICITY', budgetedAmount: 150000, actualAmount: 145000 },
    { month, year, category: 'REPAIRS', budgetedAmount: 100000, actualAmount: 35000 },
    { month, year, category: 'GARDENING', budgetedAmount: 50000, actualAmount: 45000 },
    { month, year, category: 'WATER', budgetedAmount: 40000, actualAmount: 38000 },
    { month, year, category: 'LIFT_MAINTENANCE', budgetedAmount: 30000, actualAmount: 25000 },
  ]

  for (const budget of budgets) {
    await prisma.monthlyBudget.upsert({
      where: { month_year_category: { month: budget.month, year: budget.year, category: budget.category } },
      update: { budgetedAmount: budget.budgetedAmount, actualAmount: budget.actualAmount },
      create: budget,
    })
  }
  console.log(`Created ${budgets.length} monthly budgets`)

  // Create sample announcements
  const announcements = [
    {
      title: 'Water Tank Cleaning - 25th February',
      content: 'Dear Residents,\n\nPlease note that the overhead water tanks will be cleaned on 25th February 2026. Water supply will be disrupted from 9 AM to 2 PM.\n\nPlease store sufficient water for your needs.\n\nRegards,\nManagement Committee',
      priority: 'IMPORTANT',
      category: 'MAINTENANCE',
      isPinned: true,
      createdById: admin.id,
    },
    {
      title: 'Annual General Meeting - 5th March',
      content: 'The Annual General Meeting (AGM) will be held on 5th March 2026 at 6:00 PM in the Community Hall.\n\nAgenda:\n1. Annual Financial Report\n2. Maintenance Budget 2026-27\n3. Committee Elections\n4. Open Discussion\n\nAll flat owners are requested to attend.',
      priority: 'URGENT',
      category: 'MEETING',
      isPinned: true,
      createdById: admin.id,
    },
    {
      title: 'Holi Celebration Event',
      content: 'Join us for Holi celebrations on 14th March 2026!\n\nVenue: Society Garden\nTime: 10 AM onwards\n\nOrganic colors will be provided. Snacks and refreshments included.',
      priority: 'NORMAL',
      category: 'EVENT',
      isPinned: false,
      createdById: committee.id,
    },
    {
      title: 'New Security Protocol',
      content: 'Starting 1st March, all visitors must register at the gate with valid ID proof. Residents are requested to inform guests about this new protocol.\n\nFor delivery personnel, OTP verification will be mandatory.',
      priority: 'IMPORTANT',
      category: 'GENERAL',
      isPinned: false,
      createdById: admin.id,
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement })
  }
  console.log(`Created ${announcements.length} announcements`)

  // Create sample complaints
  const complaints = [
    {
      title: 'Water leakage in parking area',
      description: 'There is continuous water leakage near parking slot B-15. This is causing water accumulation and slippery conditions.',
      category: 'MAINTENANCE',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdById: resident.id,
      assignedToId: committee.id,
    },
    {
      title: 'Lift not working in Tower A',
      description: 'The lift has been non-functional since yesterday evening. Senior citizens are facing difficulty climbing stairs.',
      category: 'MAINTENANCE',
      priority: 'URGENT',
      status: 'OPEN',
      createdById: resident.id,
    },
    {
      title: 'Noise complaint - Flat 301',
      description: 'Loud music playing from flat 301 late at night (after 11 PM) for the past 3 days. Disturbing neighbors.',
      category: 'NOISE',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      resolution: 'Spoke with the resident. They apologized and agreed to keep volume low after 10 PM.',
      createdById: resident.id,
      assignedToId: admin.id,
      resolvedAt: new Date(),
    },
  ]

  for (const complaint of complaints) {
    await prisma.complaint.create({ data: complaint })
  }
  console.log(`Created ${complaints.length} complaints`)

  // Create sample vendor
  const vendor = await prisma.vendor.upsert({
    where: { id: 'sample-vendor' },
    update: {},
    create: {
      id: 'sample-vendor',
      name: 'ABC Security Services',
      email: 'contact@abcsecurity.com',
      phone: '9876543200',
      category: 'SECURITY',
      isActive: true,
    },
  })
  console.log('Created sample vendor')

  // Create sample AMC
  await prisma.aMC.upsert({
    where: { id: 'sample-amc' },
    update: {},
    create: {
      id: 'sample-amc',
      title: 'Elevator Maintenance Contract',
      description: 'Annual maintenance for all elevators',
      vendorId: vendor.id,
      category: 'ELEVATOR',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      amount: 120000,
      paymentFrequency: 'YEARLY',
      status: 'ACTIVE',
    },
  })
  console.log('Created sample AMC')

  console.log('\n✅ Seeding complete!')
  console.log('\n📋 Login credentials (all use same password):')
  console.log('─────────────────────────────────────')
  console.log('Admin:     admin@society.com / admin123')
  console.log('Committee: committee@society.com / admin123')
  console.log('Resident:  resident@society.com / admin123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
