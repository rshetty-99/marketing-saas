/**
 * White-Label Branding API
 * GET: Fetch current config
 * PATCH: Update branding settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getWhiteLabelConfig, upsertWhiteLabelConfig } from '@/lib/whitelabel/whitelabel-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth('settings.manage');
  if (isAuthError(authResult)) return authResult;

  const config = await getWhiteLabelConfig(authResult.workspaceId);
  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('settings.manage');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const updated = await upsertWhiteLabelConfig(authResult.workspaceId, body);
  return NextResponse.json({ config: updated });
}
