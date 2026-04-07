/**
 * Blog Analytics API
 * POST: Record analytics event (public, rate-limited, bot-filtered)
 * GET: Get post analytics (auth + blog.view_analytics)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { recordView, recordScroll, recordShare, recordCtaClick, getPostAnalytics } from '@/lib/blog/blog-analytics-service';
import { blogAnalyticsEventSchema } from '@/lib/validations/blog';
import { checkRateLimit, getClientIp, BLOG_RATE_LIMITS } from '@/lib/blog/blog-rate-limiter';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Rate limit: 5 analytics events per minute per IP
  if (!checkRateLimit(`blog:analytics:${ip}`, BLOG_RATE_LIMITS.analytics.max, BLOG_RATE_LIMITS.analytics.windowMs)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  // Validate referer — must be from our domain (or empty for direct)
  const referer = req.headers.get('referer') ?? '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  if (referer && !referer.startsWith(appUrl)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = blogAnalyticsEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Reject events with timestamps more than 5 minutes old
  const now = Date.now();
  if (Math.abs(now - parsed.data.timestamp) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Stale event' }, { status: 400 });
  }

  const { postId, eventType, data } = parsed.data;

  // Need workspaceId from body
  const workspaceId = (body.workspaceId as string) ?? '';
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  switch (eventType) {
    case 'view':
      await recordView(workspaceId, postId, req.headers, data);
      break;
    case 'scroll':
      await recordScroll(workspaceId, postId, req.headers, {
        scrollDepth: data.scrollDepth ?? 0,
        readCompleted: data.readCompleted ?? false,
        timeOnPageSeconds: data.timeOnPageSeconds ?? 0,
      });
      break;
    case 'share':
      await recordShare(workspaceId, postId, req.headers, data.sharePlatform ?? 'unknown');
      break;
    case 'cta_click':
      await recordCtaClick(workspaceId, postId, req.headers);
      break;
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('blog.view_analytics');
  if (isAuthError(auth)) return auth;

  const postId = req.nextUrl.searchParams.get('postId');
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const analytics = await getPostAnalytics(auth.workspaceId, postId);
  return NextResponse.json({ analytics });
}
