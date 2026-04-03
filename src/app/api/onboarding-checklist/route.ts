/**
 * Onboarding Checklist API
 * GET: Fetch checklist
 * PATCH: Complete item or dismiss
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import {
  getOnboardingChecklist,
  completeChecklistItem,
  dismissChecklist,
} from '@/lib/onboarding-tours/tour-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const checklist = await getOnboardingChecklist(authResult.workspaceId);
  return NextResponse.json({ checklist });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();

  if (body.action === 'dismiss') {
    await dismissChecklist(authResult.workspaceId);
    return NextResponse.json({ success: true });
  }

  if (body.itemId) {
    await completeChecklistItem(authResult.workspaceId, body.itemId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
