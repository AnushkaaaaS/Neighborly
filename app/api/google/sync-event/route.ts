import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export async function POST(req: Request) {
  const { bookingId } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      service: {
        include: {
          user: {
            include: {
              providerProfile: true,
            },
          },
        },
      },
    },
  });

  if (!booking || booking.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
  }

  const provider = booking.service.user.providerProfile;

  if (!provider?.googleAccessToken || !provider.googleRefreshToken) {
    return NextResponse.json({ error: 'No Google tokens' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  oauth2Client.setCredentials({
    access_token: provider.googleAccessToken,
    refresh_token: provider.googleRefreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `${booking.service.title} booking`,
        description: `Service booked by ${booking.user.name}`,
        start: {
          dateTime: new Date(booking.scheduledAt).toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: new Date(new Date(booking.scheduledAt).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
          timeZone: 'Asia/Kolkata',
        },
        attendees: [{ email: booking.user.email }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Google Calendar error:', err);
    return NextResponse.json({ error: 'Calendar sync failed' }, { status: 500 });
  }
}
