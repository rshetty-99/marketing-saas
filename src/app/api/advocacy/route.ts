/**
 * Employee Advocacy API
 * GET: List programs or posts
 * POST: Create program or post
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listPrograms, createProgram, listAdvocacyPosts, createAdvocacyPost } from '@/lib/platform/advocacy-service';
import { z } from 'zod';

const programSchema = z.object({ name: z.string().min(1).max(200) });
const postSchema = z.object({
  programId: z.string(), title: z.string().min(1),
  suggestedCaption: z.string(), targetPlatforms: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'posts') {
    const programId = req.nextUrl.searchParams.get('programId') ?? undefined;
    return NextResponse.json({ posts: await listAdvocacyPosts(auth.workspaceId, programId) });
  }
  return NextResponse.json({ programs: await listPrograms(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  if (body.type === 'post') {
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const id = await createAdvocacyPost(auth.workspaceId, parsed.data, auth.userId);
    return NextResponse.json({ id }, { status: 201 });
  }
  const parsed = programSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createProgram(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
