/**
 * Landing Pages API
 * GET: List pages
 * POST: Create new page
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listLandingPages, createLandingPage } from '@/lib/landing-pages/landing-page-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  clientId: z.string().optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
});

export async function GET() {
  const authResult = await requireWorkspaceAuth('content.view');
  if (isAuthError(authResult)) return authResult;

  const pages = await listLandingPages(authResult.workspaceId);
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await createLandingPage(authResult.workspaceId, parsed.data, authResult.userId);
  return NextResponse.json({ id }, { status: 201 });
}
