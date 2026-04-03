/**
 * POST /api/email/campaigns/[id]/send — Trigger immediate send
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { sendCampaign } from '@/lib/f11/email-service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await sendCampaign(auth.workspaceId, id, auth.userId);
  return NextResponse.json({ success: true, status: 'sent' });
}
