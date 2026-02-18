import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/amenities/[id] - Get single amenity
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const amenity = await prisma.amenity.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!amenity) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Failed to fetch amenity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amenity' },
      { status: 500 }
    );
  }
}

// PUT /api/amenities/[id] - Update amenity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and COMMITTEE can update amenities
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Only committee members can update amenities' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    // Check if name is being changed to an existing name
    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.amenity.findUnique({
        where: { name: body.name },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'An amenity with this name already exists' },
          { status: 400 }
        );
      }
    }

    const amenity = await prisma.amenity.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        location: body.location ?? existing.location,
        capacity: body.capacity !== undefined ? (body.capacity ? parseInt(body.capacity) : null) : existing.capacity,
        hourlyRate: body.hourlyRate !== undefined ? (body.hourlyRate ? parseFloat(body.hourlyRate) : null) : existing.hourlyRate,
        halfDayRate: body.halfDayRate !== undefined ? (body.halfDayRate ? parseFloat(body.halfDayRate) : null) : existing.halfDayRate,
        fullDayRate: body.fullDayRate !== undefined ? (body.fullDayRate ? parseFloat(body.fullDayRate) : null) : existing.fullDayRate,
        securityDeposit: body.securityDeposit !== undefined ? (body.securityDeposit ? parseFloat(body.securityDeposit) : null) : existing.securityDeposit,
        rules: body.rules ?? existing.rules,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        operatingHours: body.operatingHours ?? existing.operatingHours,
        advanceBookingDays: body.advanceBookingDays !== undefined ? parseInt(body.advanceBookingDays) : existing.advanceBookingDays,
        minBookingHours: body.minBookingHours !== undefined ? parseInt(body.minBookingHours) : existing.minBookingHours,
        maxBookingHours: body.maxBookingHours !== undefined ? parseInt(body.maxBookingHours) : existing.maxBookingHours,
        requiresApproval: body.requiresApproval !== undefined ? body.requiresApproval : existing.requiresApproval,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      },
    });

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Failed to update amenity:', error);
    return NextResponse.json(
      { error: 'Failed to update amenity' },
      { status: 500 }
    );
  }
}

// DELETE /api/amenities/[id] - Deactivate amenity (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete amenities
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete amenities' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    // Soft delete - just mark as inactive
    await prisma.amenity.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Amenity deactivated successfully' });
  } catch (error) {
    console.error('Failed to delete amenity:', error);
    return NextResponse.json(
      { error: 'Failed to delete amenity' },
      { status: 500 }
    );
  }
}
