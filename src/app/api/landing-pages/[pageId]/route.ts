/**
 * Landing Page Detail API
 * GET: Fetch single page
 * PATCH: Update page (blocks, settings, publish)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getLandingPage, updateLandingPage, publishLandingPage } from '@/lib/landing-pages/landing-page-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const authResult = await requireWorkspaceAuth('content.view');
  if (isAuthError(authResult)) return authResult;

  const { pageId } = await params;
  const page = await getLandingPage(authResult.workspaceId, pageId);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const authResult = await requireWorkspaceAuth('content.create');
  if (isAuthError(authResult)) return authResult;

  const { pageId } = await params;
  const body = await req.json();

  if (body.action === 'publish') {
    await publishLandingPage(authResult.workspaceId, pageId);
    return NextResponse.json({ status: 'published' });
  }

  await updateLandingPage(authResult.workspaceId, pageId, body);
  return NextResponse.json({ success: true });
}
