import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

// GET provider profile by ID
export async function GET(req: NextRequest) {
  try {
    const providerId = req.nextUrl.searchParams.get('id');
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      include: {
        providerProfile: true
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const data = {
      name: provider.name,
      phone: provider.phone,
      location: provider.location,
      avatarUrl: provider.avatarUrl,
      bio: provider.providerProfile?.bio || '',
      experience: provider.providerProfile?.experience || 0,
      serviceTypes: provider.providerProfile?.serviceTypes || []
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[PROVIDER_PROFILE_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT to update provider profile
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id: string;
      name: string;
      phone: string;
      location: string;
      avatarUrl?: string;
      bio?: string;
      experience?: number;
      serviceTypes?: string[];
    };

    const { id, name, phone, location, avatarUrl, bio, experience, serviceTypes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        location,
        avatarUrl,
        updatedAt: new Date()
      }
    });

    const updatedProfile = await prisma.providerProfile.upsert({
      where: { userId: id },
      update: {
        bio,
        experience: Number(experience) || 0,
        serviceTypes,
      },
      create: {
        userId: id,
        bio,
        experience: Number(experience) || 0,
        serviceTypes,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        providerProfile: updatedProfile
      }
    });
  } catch (error) {
    console.error('[PROVIDER_PROFILE_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// POST not allowed
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
