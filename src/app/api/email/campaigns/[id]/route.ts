/**
 * Email Campaign Detail API
 * GET: Fetch campaign with stats
 * PATCH: Update campaign draft
 * POST: Send or schedule campaign
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { sendCampaign } from '@/lib/f11/email-service';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

function campaignRef(workspaceId: string, campaignId: string) {
  return adminDb.collection('workspaces').doc(workspaceId).collection('email_campaigns').doc(campaignId);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('email.view_analytics');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const doc = await campaignRef(authResult.workspaceId, id).get();
  if (!doc.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  return NextResponse.json({ campaign: { id: doc.id, ...doc.data() } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const body = await req.json();
  const ref = campaignRef(authResult.workspaceId, id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ success: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const body = await req.json();
  const action = body.action as string;

  if (action === 'send') {
    await sendCampaign(authResult.workspaceId, id, authResult.userId);
    return NextResponse.json({ success: true, status: 'sent' });
  }

  if (action === 'schedule') {
    if (!body.scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
    }
    const ref = campaignRef(authResult.workspaceId, id);
    await ref.update({
      status: 'scheduled',
      scheduledAt: new Date(body.scheduledAt),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, status: 'scheduled' });
  }

  return NextResponse.json({ error: 'Invalid action. Use "send" or "schedule".' }, { status: 400 });
}
