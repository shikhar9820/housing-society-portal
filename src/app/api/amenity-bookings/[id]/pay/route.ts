import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/amenity-bookings/[id]/pay - Mark booking as paid and create finance record
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can process payments
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can process payments' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { paymentMode, paymentReference: _paymentReference } = body;

    const booking = await prisma.amenityBooking.findUnique({
      where: { id },
      include: {
        amenity: true,
        flat: true,
        createdBy: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Only confirmed bookings can be marked as paid' },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Create expense record for income tracking
    const bookingDateStr = booking.bookingDate.toISOString().split('T')[0];
    const expense = await prisma.expense.create({
      data: {
        category: 'AMENITY_INCOME',
        description: `Amenity Booking - ${booking.amenity.name} - ${booking.flat?.flatNumber || 'Unknown Flat'} (${bookingDateStr})`,
        amount: booking.totalAmount,
        vendorName: null,
        invoiceNumber: `AMB-${booking.id.slice(-8).toUpperCase()}`,
        date: new Date(),
        paidTo: `${booking.createdBy.name} - ${booking.flat?.flatNumber || 'N/A'}`,
        paymentMode: paymentMode || 'CASH',
        isApproved: true,
        approvedById: session.user.id,
        approvedAt: new Date(),
        createdById: session.user.id,
      },
    });

    // Update booking with payment info
    const updated = await prisma.amenityBooking.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        paymentMode: paymentMode || 'CASH',
        expenseId: expense.id,
      },
      include: {
        amenity: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        flat: {
          select: {
            flatNumber: true,
            block: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        confirmedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      booking: updated,
      expense: {
        id: expense.id,
        amount: expense.amount,
        invoiceNumber: expense.invoiceNumber,
      },
    });
  } catch (error) {
    console.error('Failed to process payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
