// app/api/add-calendar-event/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token, title, start, description, location } = await req.json();

    if (!token || !title || !start) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials(JSON.parse(token));

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
      summary: title,
      description,
      location,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
        timeZone: 'Asia/Kolkata',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ message: 'Event created', eventId: response.data.id });
  } catch (error) {
    console.error('[GOOGLE CALENDAR ERROR]', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
