/**
 * Blog Post Detail API
 * GET: Get single post by ID
 * PATCH: Update post (auth + blog.edit_own/edit_all)
 * DELETE: Archive post (auth + blog.delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getPost, updatePost, deletePost } from '@/lib/blog/blog-service';
import { updateBlogPostSchema } from '@/lib/validations/blog';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const post = await getPost(auth.workspaceId, id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('blog.edit_own');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const post = await getPost(auth.workspaceId, id) as Record<string, unknown> | null;
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // Check if user can edit this post (own vs all)
  if (post.createdBy !== auth.userId) {
    const allAuth = await requireWorkspaceAuth('blog.edit_all');
    if (isAuthError(allAuth)) return NextResponse.json({ error: 'Cannot edit others\' posts' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateBlogPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await updatePost(auth.workspaceId, id, parsed.data);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('blog.delete');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await deletePost(auth.workspaceId, id);
  return NextResponse.json({ success: true });
}
