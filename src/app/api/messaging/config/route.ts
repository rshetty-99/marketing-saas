/**
 * Messaging Config API
 * GET: Fetch messaging config (Twilio settings)
 * PATCH: Update messaging config
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getMessagingConfig, upsertMessagingConfig } from '@/lib/messaging/messaging-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth('settings.manage');
  if (isAuthError(authResult)) return authResult;

  const config = await getMessagingConfig(authResult.workspaceId);
  // Strip encrypted tokens from response
  if (config) {
    delete config.twilioAuthToken;
  }
  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('settings.manage');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  await upsertMessagingConfig(authResult.workspaceId, body);
  return NextResponse.json({ success: true });
}
