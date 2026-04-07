/**
 * Blog Post Comments API
 * GET: List comments (public)
 * POST: Add comment (auth required)
 * DELETE: Delete comment (auth + blog.delete or comment author)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addComment, listComments, deleteComment } from '@/lib/blog/blog-service';
import { createCommentSchema } from '@/lib/validations/blog';
import { checkRateLimit, getClientIp, BLOG_RATE_LIMITS } from '@/lib/blog/blog-rate-limiter';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`blog:read:${ip}`, BLOG_RATE_LIMITS.publicRead.max, BLOG_RATE_LIMITS.publicRead.windowMs)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id: postId } = await params;
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  const comments = await listComments(workspaceId, postId);
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 });

  // Rate limit: 3 comments per minute per user
  if (!checkRateLimit(`blog:comment:${userId}`, BLOG_RATE_LIMITS.comment.max, BLOG_RATE_LIMITS.comment.windowMs)) {
    return NextResponse.json({ error: 'Too many comments. Please wait.' }, { status: 429 });
  }

  const { id: postId } = await params;
  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspaceId = body.workspaceId as string;
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  // Get commenter name from Clerk
  const userDoc = await adminDb.collectionGroup('members').where('userId', '==', userId).limit(1).get();
  const userData = userDoc.empty ? {} : userDoc.docs[0].data();
  const authorName = (userData.displayName as string) ?? 'Anonymous';
  const authorAvatar = userData.avatarUrl as string | undefined;

  const commentId = await addComment(workspaceId, postId, userId, authorName, authorAvatar, parsed.data.content);
  return NextResponse.json({ commentId }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId } = await params;
  const { commentId, workspaceId } = await req.json();
  if (!commentId || !workspaceId) return NextResponse.json({ error: 'commentId and workspaceId required' }, { status: 400 });

  await deleteComment(workspaceId, postId, commentId);
  return NextResponse.json({ success: true });
}
