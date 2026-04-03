/**
 * POST /api/clients/[id]/reports/[reportId]/send — Email report to client
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reportId: string }> },
) {
  const auth = await requireWorkspaceAuth('clients.switch_context');
  if (isAuthError(auth)) return auth;

  const { reportId } = await params;
  const body = await req.json();
  const recipients = (body.recipients as string[]) ?? [];

  const ref = adminDb.collection('client_reports').doc(reportId);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  // In production: send email via SendGrid with PDF attachment
  await ref.update({
    status: 'sent',
    sentTo: recipients,
    sentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, sentTo: recipients });
}
