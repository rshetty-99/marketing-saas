/**
 * Blog Post Like API
 * POST: Toggle like (public, IP-deduplicated)
 * GET: Check if current visitor has liked
 */

import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, hasLiked } from '@/lib/blog/blog-service';
import { hashVisitorId, getClientIp, checkRateLimit, BLOG_RATE_LIMITS } from '@/lib/blog/blog-rate-limiter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(req.headers);
  const userAgent = req.headers.get('user-agent') ?? '';
  const visitorHash = hashVisitorId(ip, userAgent);
  const { id: postId } = await params;
  const { workspaceId } = await req.json();
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  // Rate limit: 1 like toggle per post per IP per day
  if (!checkRateLimit(`blog:like:${ip}:${postId}`, BLOG_RATE_LIMITS.like.max, BLOG_RATE_LIMITS.like.windowMs)) {
    return NextResponse.json({ error: 'Already liked today' }, { status: 429 });
  }

  const liked = await toggleLike(workspaceId, postId, visitorHash);
  return NextResponse.json({ liked });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(req.headers);
  const userAgent = req.headers.get('user-agent') ?? '';
  const visitorHash = hashVisitorId(ip, userAgent);
  const { id: postId } = await params;
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  const liked = await hasLiked(workspaceId, postId, visitorHash);
  return NextResponse.json({ liked });
}
