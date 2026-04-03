import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listHashtagGroups, createHashtagGroup, mockHashtagAnalytics } from '@/lib/marketing/hashtag-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  hashtags: z.array(z.string()).min(1).max(30),
  platform: z.enum(['instagram', 'twitter', 'linkedin', 'tiktok', 'all']).optional(),
  category: z.enum(['brand', 'industry', 'trending', 'campaign', 'location', 'custom']).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;

  const analyze = req.nextUrl.searchParams.get('analyze');
  if (analyze) {
    const hashtags = analyze.split(',');
    return NextResponse.json({ analytics: mockHashtagAnalytics(hashtags) });
  }

  return NextResponse.json({ groups: await listHashtagGroups(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createHashtagGroup(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
