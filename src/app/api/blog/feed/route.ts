/**
 * Blog RSS Feed
 * GET: Returns Atom/RSS 2.0 feed with excerpts only (no full content).
 * Public endpoint — rate limited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { checkRateLimit, getClientIp, BLOG_RATE_LIMITS } from '@/lib/blog/blog-rate-limiter';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`blog:rss:${ip}`, BLOG_RATE_LIMITS.publicRead.max, BLOG_RATE_LIMITS.publicRead.windowMs)) {
    return new Response('Too many requests', { status: 429 });
  }

  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return new Response('workspaceId required', { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Fetch latest 20 published posts
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('blog_posts')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(20)
    .get();

  const posts = snap.docs.map((d) => d.data());

  // Get workspace name for feed title
  const wsDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
  const wsName = wsDoc.data()?.name ?? 'Aura Blog';

  const rssItems = posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${appUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${appUrl}/blog/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <author>${p.author?.name ?? 'Unknown'}</author>
      <category>${p.category}</category>
      <pubDate>${p.publishedAt?.toDate?.()?.toUTCString?.() ?? new Date().toUTCString()}</pubDate>
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${wsName} Blog</title>
    <link>${appUrl}/blog</link>
    <description>Latest marketing insights and product updates from ${wsName}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${appUrl}/api/blog/feed?workspaceId=${workspaceId}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
