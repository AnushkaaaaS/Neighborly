import { prisma } from '@lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, serviceId, scheduledAt, address, userNotes } = await req.json();

    if (!userId || !serviceId || !scheduledAt || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);

    // Fetch service details including pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { 
        durationMinutes: true,
        isCustomPricing: true,
        basePrice: true,
        startingFromPrice: true 
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const duration = service.durationMinutes || 30;
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);

    // Check for conflicting bookings
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId,
        status: { notIn: ['CANCELLED'] },
        scheduledAt: {
          gte: scheduledDate,
          lt: endTime,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is already booked.' },
        { status: 409 }
      );
    }

    // Determine quoted price based on pricing model
    const quotedPrice = service.isCustomPricing 
      ? service.startingFromPrice 
      : service.basePrice;

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        scheduledAt: scheduledDate,
        address,
        userNotes,
        quotedPrice,
      },
    });

    return NextResponse.json(booking);
  } catch (err) {
    console.error('[BOOKING POST ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}