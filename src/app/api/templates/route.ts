/**
 * Starter Templates API
 * GET: List templates by category
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listStarterTemplates } from '@/lib/onboarding-tours/tour-service';

export async function GET(req: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const category = req.nextUrl.searchParams.get('category') ?? undefined;
  const templates = await listStarterTemplates(category);
  return NextResponse.json({ templates });
}
