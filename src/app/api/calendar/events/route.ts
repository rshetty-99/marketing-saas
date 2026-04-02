/**
 * GET /api/calendar/events — List calendar events within date range
 * POST /api/calendar/events — Create a calendar event
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createCalendarEvent, listCalendarEvents } from '@/lib/f4/calendar-service';
import { createCalendarEventSchema } from '@/lib/validations/content';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('calendar.view');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { searchParams } = new URL(request.url);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to) {
    return NextResponse.json({ error: 'from and to query params required' }, { status: 400 });
  }

  const events = await listCalendarEvents(workspaceId, from, to, {
    eventType: searchParams.get('eventType') ?? undefined,
    linkedClientId: searchParams.get('clientId') ?? undefined,
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('calendar.create_edit');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = createCalendarEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const eventId = await createCalendarEvent(workspaceId, parsed.data, userId);

  return NextResponse.json({ eventId });
}
