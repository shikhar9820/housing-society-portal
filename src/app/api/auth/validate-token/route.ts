import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid token' });
    }

    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: 'This link has already been used' });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ valid: false, error: 'This link has expired' });
    }

    return NextResponse.json({
      valid: true,
      userName: resetToken.user.name,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate token' });
  }
}
