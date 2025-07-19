import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@lib/prisma';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { bookingId, status } = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as { sub: string };
    const userId = decoded.sub;

    // Verify the booking belongs to this provider
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        service: {
          user_id: userId
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        service: true,
        user: true
      }
    });

    // If marking as completed, create a review opportunity
    if (status === 'COMPLETED') {
      await prisma.review.create({
        data: {
          bookingId: bookingId,
          providerId: updatedBooking.service.user_id,
          userId: updatedBooking.userId,
          rating: 0, // Default unrated
          comment: ''
        }
      });
    }

    return NextResponse.json({ 
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        scheduledAt: updatedBooking.scheduledAt,
        userName: updatedBooking.user.name || 'User'
      }
    });
  } catch (err) {
    console.error('[BOOKING_STATUS_ERROR]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}