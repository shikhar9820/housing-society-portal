import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/expenses - List all expenses with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const month = searchParams.get('month'); // format: YYYY-MM
    const year = searchParams.get('year');
    const isApproved = searchParams.get('isApproved');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (isApproved !== null && isApproved !== undefined && isApproved !== '') {
      where.isApproved = isApproved === 'true';
    }

    // Date filtering
    if (month) {
      const [yearPart, monthPart] = month.split('-');
      const startDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1);
      const endDate = new Date(parseInt(yearPart), parseInt(monthPart), 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    // Get total count for pagination
    const total = await prisma.expense.count({ where });

    return NextResponse.json({
      expenses,
      total,
      hasMore: offset && limit ? parseInt(offset) + expenses.length < total : false,
    });
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can create expenses
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can add expenses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      category,
      description,
      amount,
      vendorName,
      vendorId,
      invoiceNumber,
      date,
      receiptUrl,
      paidTo,
      paymentMode,
    } = body;

    // Validation
    if (!category || !description || !amount || !date) {
      return NextResponse.json(
        { error: 'Category, description, amount, and date are required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount,
        vendorName: vendorName || null,
        vendorId: vendorId || null,
        invoiceNumber: invoiceNumber || null,
        date: new Date(date),
        receiptUrl: receiptUrl || null,
        paidTo: paidTo || null,
        paymentMode: paymentMode || 'BANK_TRANSFER',
        createdById: session.user.id,
        isApproved: false,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
