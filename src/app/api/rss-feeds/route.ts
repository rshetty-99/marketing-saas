import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listRSSFeeds, createRSSFeed } from '@/lib/marketing/rss-auto-post-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  feedUrl: z.string().url(),
  autoPost: z.boolean().optional(),
  pollIntervalMinutes: z.number().min(15).max(1440).optional(),
  contentTemplate: z.string().optional(),
  postTo: z.array(z.object({ platform: z.string(), connectionId: z.string() })).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ feeds: await listRSSFeeds(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createRSSFeed(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
