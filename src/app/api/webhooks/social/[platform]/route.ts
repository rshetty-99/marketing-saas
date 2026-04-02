/**
 * POST /api/webhooks/social/[platform] — Receive webhook events from social platforms
 * Generic endpoint — normalizes events and routes to consumers (inbox, analytics, etc.)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const body = await request.json();

  // Generate deduplication key
  const platformEventId = body.id ?? body.entry?.[0]?.id ?? `${Date.now()}`;
  const deduplicationKey = createHash('sha256').update(`${platform}:${platformEventId}`).digest('hex');

  // Store raw event
  const eventRef = adminDb.collection('webhook_events').doc();
  await eventRef.set({
    id: eventRef.id,
    platform,
    eventType: body.object ?? body.type ?? 'unknown',
    platformEventId,
    deduplicationKey,
    rawPayload: body,
    status: 'pending',
    processAttempts: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Return 200 immediately (async processing)
  return NextResponse.json({ received: true, eventId: eventRef.id });
}

// Meta webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}
