import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/amenities/[id]/availability - Check availability for a date
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse the date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get the amenity
    const amenity = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenity) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    // Set start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all bookings for this amenity on this date (excluding cancelled and rejected)
    const bookings = await prisma.amenityBooking.findMany({
      where: {
        amenityId: id,
        bookingDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        bookingType: true,
        flat: {
          select: {
            flatNumber: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Parse operating hours if available
    let operatingHours = { start: '06:00', end: '22:00' };
    if (amenity.operatingHours) {
      try {
        operatingHours = JSON.parse(amenity.operatingHours);
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Generate available time slots (hourly)
    const availableSlots: { start: string; end: string; available: boolean }[] = [];
    const startHour = parseInt(operatingHours.start.split(':')[0]);
    const endHour = parseInt(operatingHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if this slot overlaps with any booking
      const isBooked = bookings.some((booking) => {
        const bookingStart = parseInt(booking.startTime.split(':')[0]);
        const bookingEnd = parseInt(booking.endTime.split(':')[0]);
        return hour >= bookingStart && hour < bookingEnd;
      });

      availableSlots.push({
        start: slotStart,
        end: slotEnd,
        available: !isBooked,
      });
    }

    return NextResponse.json({
      amenityId: id,
      amenityName: amenity.name,
      date: dateParam,
      operatingHours,
      bookedSlots: bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        bookingType: b.bookingType,
        flatNumber: b.flat?.flatNumber,
      })),
      availableSlots,
      isFullyBooked: availableSlots.every((slot) => !slot.available),
    });
  } catch (error) {
    console.error('Failed to check availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
