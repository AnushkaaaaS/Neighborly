import { prisma } from '@lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { bookingId, userId, rating, comment } = await req.json();

    if (!bookingId || !userId || rating == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        userId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
