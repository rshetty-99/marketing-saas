/**
 * GET /api/email/campaigns/[id]/stats — Live campaign statistics
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('email.view_analytics');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const doc = await adminDb.collection('workspaces').doc(auth.workspaceId)
    .collection('email_campaigns').doc(id).get();

  if (!doc.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  const data = doc.data()!;
  return NextResponse.json({
    campaignId: id,
    status: data.status,
    analytics: data.analytics ?? null,
    sentAt: data.sentAt ?? null,
  });
}
