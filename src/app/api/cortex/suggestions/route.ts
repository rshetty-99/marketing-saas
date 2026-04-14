/**
 * Cortex Proactive Suggestions API — Phase 11D
 * GET: Get dashboard suggestions for current user
 */

import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getDashboardSuggestions } from '@/lib/cortex/proactive-suggestions';

export async function GET() {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;
  const suggestions = await getDashboardSuggestions(auth.workspaceId, auth.userId);
  return NextResponse.json({ suggestions });
}
