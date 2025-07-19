import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@lib/prisma';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as { sub: string };
    const userId = decoded.sub;

    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider) {
      return NextResponse.json({ message: 'Not a provider' }, { status: 403 });
    }

    // Only fetch confirmed and completed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        service: {
          user_id: userId,
        },
        scheduledAt: { not: null },
        status: {
          in: ['CONFIRMED', 'COMPLETED'] // Only these statuses
        }
      },
      include: {
        service: true,
        user: true,
      },
      orderBy: {
        scheduledAt: 'asc' // Sort by date
      }
    });

    const transformed = bookings.map((b) => ({
      id: b.id,
      scheduledAt: b.scheduledAt,
      durationMinutes: b.service.durationMinutes || 30,
      serviceTitle: b.service.title,
      serviceType: b.service.type,
      userName: b.user.name || 'User',
      userEmail: b.user.email,
      address: b.address,
      status: b.status // Include status in response
    }));

    return NextResponse.json({ bookings: transformed });
  } catch (err) {
    console.error('[BOOKINGS_CALENDAR_ERROR]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}