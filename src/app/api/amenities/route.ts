import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/amenities - List all amenities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amenities' },
      { status: 500 }
    );
  }
}

// POST /api/amenities - Create new amenity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can create amenities
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can create amenities' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      location,
      capacity,
      hourlyRate,
      halfDayRate,
      fullDayRate,
      securityDeposit,
      rules,
      imageUrl,
      operatingHours,
      advanceBookingDays,
      minBookingHours,
      maxBookingHours,
      requiresApproval,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Check if amenity with same name exists
    const existing = await prisma.amenity.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An amenity with this name already exists' },
        { status: 400 }
      );
    }

    const amenity = await prisma.amenity.create({
      data: {
        name,
        description: description || null,
        category,
        location: location || null,
        capacity: capacity ? parseInt(capacity) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        halfDayRate: halfDayRate ? parseFloat(halfDayRate) : null,
        fullDayRate: fullDayRate ? parseFloat(fullDayRate) : null,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        rules: rules || null,
        imageUrl: imageUrl || null,
        operatingHours: operatingHours || null,
        advanceBookingDays: advanceBookingDays ? parseInt(advanceBookingDays) : 30,
        minBookingHours: minBookingHours ? parseInt(minBookingHours) : 1,
        maxBookingHours: maxBookingHours ? parseInt(maxBookingHours) : 8,
        requiresApproval: requiresApproval || false,
        isActive: true,
      },
    });

    return NextResponse.json(amenity, { status: 201 });
  } catch (error) {
    console.error('Failed to create amenity:', error);
    return NextResponse.json(
      { error: 'Failed to create amenity' },
      { status: 500 }
    );
  }
}
