import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listSnippets, createSnippet } from '@/lib/marketing/content-library-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  snippetType: z.enum(['text_block', 'cta', 'disclaimer', 'hashtag_set', 'signature', 'bio', 'boilerplate']),
  tags: z.array(z.string()).optional(),
  platform: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const snippetType = req.nextUrl.searchParams.get('type') ?? undefined;
  return NextResponse.json({ snippets: await listSnippets(auth.workspaceId, snippetType) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createSnippet(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
