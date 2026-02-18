import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/amenity-bookings/[id]/cancel - Cancel a booking
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const booking = await prisma.amenityBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions - owner can cancel their own, admins can cancel any
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';
    if (!isAdmin && booking.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only cancel pending or confirmed bookings
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this booking' },
        { status: 400 }
      );
    }

    const updated = await prisma.amenityBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || 'Cancelled by user',
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
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
