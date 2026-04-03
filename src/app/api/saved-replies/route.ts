import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listSavedReplies, createSavedReply } from '@/lib/marketing/saved-replies-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  shortcut: z.string().max(50).optional(),
  category: z.enum(['general', 'support', 'sales', 'complaint', 'follow_up', 'custom']).optional(),
  platform: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('inbox.view');
  if (isAuthError(auth)) return auth;
  const category = req.nextUrl.searchParams.get('category') ?? undefined;
  return NextResponse.json({ replies: await listSavedReplies(auth.workspaceId, category) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('inbox.respond');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createSavedReply(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
