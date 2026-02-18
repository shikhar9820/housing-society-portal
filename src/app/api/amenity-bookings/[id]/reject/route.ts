import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/amenity-bookings/[id]/reject - Reject a booking
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can reject bookings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can reject bookings' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.amenityBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending bookings can be rejected' },
        { status: 400 }
      );
    }

    const updated = await prisma.amenityBooking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
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
    console.error('Failed to reject booking:', error);
    return NextResponse.json(
      { error: 'Failed to reject booking' },
      { status: 500 }
    );
  }
}
