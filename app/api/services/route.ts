// /app/api/services/route.ts
import { prisma } from '@lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')?.toLowerCase() || '';

  try {
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { title: { contains: location, mode: 'insensitive' } },
          { category: { contains: location, mode: 'insensitive' } },
          { description: { contains: location, mode: 'insensitive' } },
          { location: { contains: location, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
            phone: true,
            location: true,
            providerProfile: {
              select: {
                bio: true,
                experience: true,
                serviceTypes: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
