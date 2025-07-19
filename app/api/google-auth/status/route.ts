// pages/api/google-auth/calendar.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ message: 'Unauthorized: No user found' }, { status: 401 });
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
  });

  if (!provider || !provider.googleAccessToken) {
    return NextResponse.json({ message: 'Google access token not found' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: provider.googleAccessToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const eventsRes = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsRes.data.items || [];
    return NextResponse.json({ events });
  } catch (err) {
    console.error('Google Calendar API error:', err);
    return NextResponse.json({ message: 'Failed to fetch Google Calendar events' }, { status: 500 });
  }
}
