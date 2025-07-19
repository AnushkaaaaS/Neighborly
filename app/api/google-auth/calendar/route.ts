import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { google } from 'googleapis';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies(); // no await needed

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider?.googleAccessToken) {
    return NextResponse.json({ error: 'Not connected to Google' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: provider.googleAccessToken,
    refresh_token: provider.googleRefreshToken,
  });

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });

    return NextResponse.json({ events: response.data.items || [] });
  } catch (error) {
    console.error('[Google Calendar Fetch Error]', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
