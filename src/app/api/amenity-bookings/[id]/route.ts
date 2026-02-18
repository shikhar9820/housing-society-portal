import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/amenity-bookings/[id] - Get single booking
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.amenityBooking.findUnique({
      where: { id },
      include: {
        amenity: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            rules: true,
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
            phone: true,
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access - user can view their own bookings, admins can view all
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';
    if (!isAdmin && booking.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/amenity-bookings/[id] - Update booking (only if pending)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.amenityBooking.findUnique({
      where: { id },
      include: { amenity: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';
    if (!isAdmin && existing.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only update pending bookings
    if (existing.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only update pending bookings' },
        { status: 400 }
      );
    }

    // Update allowed fields
    const booking = await prisma.amenityBooking.update({
      where: { id },
      data: {
        purpose: body.purpose ?? existing.purpose,
        attendeesCount: body.attendeesCount !== undefined
          ? (body.attendeesCount ? parseInt(body.attendeesCount) : null)
          : existing.attendeesCount,
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

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/amenity-bookings/[id] - Cancel booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.amenityBooking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';
    if (!isAdmin && existing.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only cancel pending or confirmed bookings
    if (!['PENDING', 'CONFIRMED'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this booking' },
        { status: 400 }
      );
    }

    await prisma.amenityBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: 'Cancelled by user',
      },
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
