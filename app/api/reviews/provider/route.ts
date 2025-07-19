import { prisma } from '@lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
  }

  try {
  const reviews = await prisma.review.findMany({
  where: {
    booking: {
      service: {
        user_id: uid, // ✅ this is correct
      },
    },
  },
  include: {
    user: true, // to get info about the user who gave the review
    booking: {
      include: {
        service: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});


    return NextResponse.json(reviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
