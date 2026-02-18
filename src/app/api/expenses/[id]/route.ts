import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/expenses/[id] - Get a single expense
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id },
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
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to fetch expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can update expenses
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can update expenses' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Don't allow editing approved expenses (unless admin)
    if (existingExpense.isApproved && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot edit an approved expense' },
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
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(description && { description }),
        ...(amount && { amount }),
        ...(vendorName !== undefined && { vendorName }),
        ...(vendorId !== undefined && { vendorId }),
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(date && { date: new Date(date) }),
        ...(receiptUrl !== undefined && { receiptUrl }),
        ...(paidTo !== undefined && { paidTo }),
        ...(paymentMode && { paymentMode }),
      },
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
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete expenses
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete expenses' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
