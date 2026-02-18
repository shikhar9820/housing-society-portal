import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/complaints/[id] - Get a single complaint
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            flat: {
              select: {
                flatNumber: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Residents can only view their own complaints
    if (
      (session.user.role === 'RESIDENT' || session.user.role === 'TENANT') &&
      complaint.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Failed to fetch complaint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaint' },
      { status: 500 }
    );
  }
}

// PUT /api/complaints/[id] - Update a complaint
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if complaint exists
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, category, priority, status, assignedToId, resolution } = body;

    // Residents can only update their own complaints (and only title/description)
    const isOwner = existingComplaint.createdById === session.user.id;
    const isCommittee = session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE';

    if (!isOwner && !isCommittee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build update data based on role
    const updateData: Record<string, unknown> = {};

    if (isOwner && !isCommittee) {
      // Residents can only update title and description of OPEN complaints
      if (existingComplaint.status !== 'OPEN') {
        return NextResponse.json(
          { error: 'Cannot update a complaint that is already being processed' },
          { status: 400 }
        );
      }
      if (title) updateData.title = title;
      if (description) updateData.description = description;
    } else {
      // Committee/Admin can update everything
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (priority) updateData.priority = priority;
      if (status) {
        updateData.status = status;
        if (status === 'RESOLVED' || status === 'CLOSED') {
          updateData.resolvedAt = new Date();
        }
      }
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
      if (resolution !== undefined) updateData.resolution = resolution;
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            flat: {
              select: {
                flatNumber: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Failed to update complaint:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}

// DELETE /api/complaints/[id] - Delete a complaint
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if complaint exists
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Only Admin or the creator (for OPEN complaints) can delete
    const isOwner = existingComplaint.createdById === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (isOwner && !isAdmin && existingComplaint.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Cannot delete a complaint that is already being processed' },
        { status: 400 }
      );
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Failed to delete complaint:', error);
    return NextResponse.json(
      { error: 'Failed to delete complaint' },
      { status: 500 }
    );
  }
}
