import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/amenity-bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const amenityId = searchParams.get('amenityId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const myBookings = searchParams.get('myBookings') === 'true';

    const where: Record<string, unknown> = {};

    // Filter by amenity
    if (amenityId) {
      where.amenityId = amenityId;
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.bookingDate = {};
      if (fromDate) {
        (where.bookingDate as Record<string, Date>).gte = new Date(fromDate);
      }
      if (toDate) {
        (where.bookingDate as Record<string, Date>).lte = new Date(toDate);
      }
    }

    // For non-admin users showing only their bookings, or when explicitly requested
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';
    if (!isAdmin || myBookings) {
      where.createdById = session.user.id;
    }

    const bookings = await prisma.amenityBooking.findMany({
      where,
      include: {
        amenity: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
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
      orderBy: { bookingDate: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/amenity-bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amenityId,
      bookingDate,
      startTime,
      endTime,
      purpose,
      attendeesCount,
      bookingType,
    } = body;

    // Validate required fields
    if (!amenityId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Amenity, booking date, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Get the amenity
    const amenity = await prisma.amenity.findUnique({
      where: { id: amenityId },
    });

    if (!amenity) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    if (!amenity.isActive) {
      return NextResponse.json(
        { error: 'This amenity is not available for booking' },
        { status: 400 }
      );
    }

    // Get user's flat
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { flat: true },
    });

    if (!user?.flatId) {
      return NextResponse.json(
        { error: 'You must be associated with a flat to make a booking' },
        { status: 400 }
      );
    }

    // Parse dates and times
    const bookingDateObj = new Date(bookingDate);
    bookingDateObj.setHours(0, 0, 0, 0);

    // Check for advance booking limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((bookingDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return NextResponse.json(
        { error: 'Cannot book for past dates' },
        { status: 400 }
      );
    }

    if (daysDiff > amenity.advanceBookingDays) {
      return NextResponse.json(
        { error: `Bookings can only be made up to ${amenity.advanceBookingDays} days in advance` },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const dayStart = new Date(bookingDateObj);
    const dayEnd = new Date(bookingDateObj);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.amenityBooking.findMany({
      where: {
        amenityId,
        bookingDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
    });

    // Check for time slot conflicts
    const newStartHour = parseInt(startTime.split(':')[0]);
    const newEndHour = parseInt(endTime.split(':')[0]);

    const hasConflict = existingBookings.some((booking) => {
      const existingStart = parseInt(booking.startTime.split(':')[0]);
      const existingEnd = parseInt(booking.endTime.split(':')[0]);

      // Check if time ranges overlap
      return (newStartHour < existingEnd && newEndHour > existingStart);
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Calculate amount based on booking type
    let amount = 0;
    const type = bookingType || 'HOURLY';

    if (type === 'FULL_DAY' && amenity.fullDayRate) {
      amount = amenity.fullDayRate;
    } else if (type === 'HALF_DAY' && amenity.halfDayRate) {
      amount = amenity.halfDayRate;
    } else if (amenity.hourlyRate) {
      const hours = newEndHour - newStartHour;
      amount = amenity.hourlyRate * hours;
    }

    const securityDeposit = amenity.securityDeposit || 0;
    const totalAmount = amount + securityDeposit;

    // Create the booking
    const booking = await prisma.amenityBooking.create({
      data: {
        amenityId,
        flatId: user.flatId,
        bookingDate: bookingDateObj,
        startTime,
        endTime,
        purpose: purpose || null,
        attendeesCount: attendeesCount ? parseInt(attendeesCount) : null,
        bookingType: type,
        amount,
        securityDeposit,
        totalAmount,
        status: amenity.requiresApproval ? 'PENDING' : 'CONFIRMED',
        paymentStatus: 'UNPAID',
        createdById: session.user.id,
        confirmedById: amenity.requiresApproval ? null : session.user.id,
        confirmedAt: amenity.requiresApproval ? null : new Date(),
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

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
