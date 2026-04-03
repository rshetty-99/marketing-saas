/**
 * POST /api/email/unsubscribe — Public endpoint for CAN-SPAM/GDPR compliance
 * No auth required — anyone with the unsubscribe link can use it.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, workspaceId } = body;

  if (!email || !workspaceId) {
    return NextResponse.json({ error: 'Email and workspaceId required' }, { status: 400 });
  }

  // Find subscriber and update status
  const subscribers = await adminDb
    .collection('workspaces').doc(workspaceId)
    .collection('email_subscribers')
    .where('email', '==', email).limit(1).get();

  if (!subscribers.empty) {
    await subscribers.docs[0].ref.update({
      status: 'unsubscribed',
      unsubscribedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({ success: true, message: 'You have been unsubscribed.' });
}

// GET for one-click unsubscribe (RFC 8058 List-Unsubscribe header)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const workspaceId = searchParams.get('wid');

  if (!email || !workspaceId) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const subscribers = await adminDb
    .collection('workspaces').doc(workspaceId)
    .collection('email_subscribers')
    .where('email', '==', email).limit(1).get();

  if (!subscribers.empty) {
    await subscribers.docs[0].ref.update({
      status: 'unsubscribed',
      unsubscribedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return new NextResponse(
    '<html><body><h1>Unsubscribed</h1><p>You have been successfully unsubscribed.</p></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  );
}
