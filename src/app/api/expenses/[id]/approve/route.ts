import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/expenses/[id]/approve - Approve an expense
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can approve expenses
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can approve expenses' },
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

    if (existingExpense.isApproved) {
      return NextResponse.json(
        { error: 'Expense is already approved' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        isApproved: true,
        approvedById: session.user.id,
        approvedAt: new Date(),
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
    console.error('Failed to approve expense:', error);
    return NextResponse.json(
      { error: 'Failed to approve expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id]/approve - Revoke expense approval
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can revoke approval
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can revoke expense approval' },
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

    if (!existingExpense.isApproved) {
      return NextResponse.json(
        { error: 'Expense is not approved' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        isApproved: false,
        approvedById: null,
        approvedAt: null,
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

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to revoke expense approval:', error);
    return NextResponse.json(
      { error: 'Failed to revoke expense approval' },
      { status: 500 }
    );
  }
}
