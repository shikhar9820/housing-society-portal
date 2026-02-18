import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/complaints - List complaints
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const myComplaints = searchParams.get('my') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    // Residents can only see their own complaints unless they're committee/admin
    if (session.user.role === 'RESIDENT' || session.user.role === 'TENANT' || myComplaints) {
      where.createdById = session.user.id;
    }

    const complaints = await prisma.complaint.findMany({
      where,
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
      orderBy: [
        { status: 'asc' }, // OPEN first
        { priority: 'desc' }, // URGENT first
        { createdAt: 'desc' },
      ],
    });

    // Get summary stats for committee/admin
    let stats = null;
    if (session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE') {
      const [open, inProgress, resolved, total] = await Promise.all([
        prisma.complaint.count({ where: { status: 'OPEN' } }),
        prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.complaint.count({ where: { status: 'RESOLVED' } }),
        prisma.complaint.count(),
      ]);
      stats = { open, inProgress, resolved, total };
    }

    return NextResponse.json({ complaints, stats });
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, priority, attachments } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: 'OPEN',
        createdById: session.user.id,
      },
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
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Failed to create complaint:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
