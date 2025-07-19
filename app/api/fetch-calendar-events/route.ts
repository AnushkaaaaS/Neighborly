// app/api/fetch-calendar-events/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials(JSON.parse(token));

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const now = new Date().toISOString();
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ events: events.data.items || [] });
  } catch (err) {
    console.error('[FETCH CALENDAR ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
