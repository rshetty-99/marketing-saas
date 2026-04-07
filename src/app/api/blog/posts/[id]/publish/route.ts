/**
 * Blog Post Publish/Unpublish/Schedule API
 * POST: Publish, unpublish, or schedule a post (auth + blog.publish)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { publishPost, unpublishPost, schedulePost, getPost } from '@/lib/blog/blog-service';
import { publishBlogPostSchema } from '@/lib/validations/blog';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('blog.publish');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const post = await getPost(auth.workspaceId, id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const body = await req.json();
  const parsed = publishBlogPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  switch (parsed.data.action) {
    case 'publish':
      await publishPost(auth.workspaceId, id);
      return NextResponse.json({ success: true, status: 'published' });
    case 'unpublish':
      await unpublishPost(auth.workspaceId, id);
      return NextResponse.json({ success: true, status: 'draft' });
    case 'schedule':
      if (!parsed.data.scheduledAt) return NextResponse.json({ error: 'scheduledAt required' }, { status: 400 });
      await schedulePost(auth.workspaceId, id, parsed.data.scheduledAt);
      return NextResponse.json({ success: true, status: 'scheduled' });
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
