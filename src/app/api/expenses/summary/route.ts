import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/expenses/summary - Get expense statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month'); // optional, format: 1-12

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    // This month dates
    const thisMonthStart = new Date(currentYear, currentMonth, 1);
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Last month dates
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Year to date (April to March for Indian financial year)
    const fyStartMonth = currentMonth >= 3 ? 3 : -9; // April = 3, or previous year's April
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const ytdStart = new Date(fyStartYear, fyStartMonth < 0 ? 12 + fyStartMonth : fyStartMonth, 1);
    const ytdEnd = currentDate;

    // Aggregate this month's expenses
    const thisMonthTotal = await prisma.expense.aggregate({
      where: {
        date: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Aggregate last month's expenses
    const lastMonthTotal = await prisma.expense.aggregate({
      where: {
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Year to date expenses
    const ytdTotal = await prisma.expense.aggregate({
      where: {
        date: {
          gte: ytdStart,
          lte: ytdEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get monthly budget total for current month
    const monthlyBudgets = await prisma.monthlyBudget.findMany({
      where: {
        month: currentMonth + 1, // 1-indexed in DB
        year: currentYear,
      },
    });

    const totalBudget = monthlyBudgets.reduce((sum, b) => sum + b.budgetedAmount, 0);
    const thisMonth = thisMonthTotal._sum.amount || 0;
    const budgetUsed = totalBudget > 0 ? Math.round((thisMonth / totalBudget) * 100) : 0;

    // Category-wise breakdown for current month
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Vendor-wise summary for current month
    const vendorSummary = await prisma.expense.groupBy({
      by: ['vendorName'],
      where: {
        date: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        },
        vendorName: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 10,
    });

    // Budget vs Actual comparison
    const budgetComparison = await Promise.all(
      monthlyBudgets.map(async (budget) => {
        const actual = await prisma.expense.aggregate({
          where: {
            category: budget.category,
            date: {
              gte: thisMonthStart,
              lte: thisMonthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        });

        return {
          category: budget.category,
          budgeted: budget.budgetedAmount,
          actual: actual._sum.amount || 0,
          variance: budget.budgetedAmount - (actual._sum.amount || 0),
          percentUsed: budget.budgetedAmount > 0
            ? Math.round(((actual._sum.amount || 0) / budget.budgetedAmount) * 100)
            : 0,
        };
      })
    );

    // Pending approvals count
    const pendingApprovals = await prisma.expense.count({
      where: {
        isApproved: false,
      },
    });

    return NextResponse.json({
      summary: {
        thisMonth: thisMonthTotal._sum.amount || 0,
        lastMonth: lastMonthTotal._sum.amount || 0,
        yearToDate: ytdTotal._sum.amount || 0,
        budgetUsed,
        totalBudget,
        pendingApprovals,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        amount: c._sum.amount || 0,
        percentage: thisMonth > 0 ? Math.round(((c._sum.amount || 0) / thisMonth) * 100) : 0,
      })),
      vendorSummary: vendorSummary.map((v) => ({
        vendor: v.vendorName,
        amount: v._sum.amount || 0,
        payments: v._count.id,
      })),
      budgetComparison,
      period: {
        thisMonthStart: thisMonthStart.toISOString(),
        thisMonthEnd: thisMonthEnd.toISOString(),
        fyStart: ytdStart.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to fetch expense summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense summary' },
      { status: 500 }
    );
  }
}
