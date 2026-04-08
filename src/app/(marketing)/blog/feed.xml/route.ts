/**
 * Blog RSS Feed
 * GET /blog/feed.xml — Returns RSS 2.0 XML with published post excerpts.
 * Public endpoint, cached for 1 hour.
 */

import { listPublishedPosts } from '@/lib/blog/blog-service';

const BLOG_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_BLOG_WORKSPACE_ID ?? 'org_3BrAQY4IeIQF7yjqSP74lqSF2jT';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://aura.ai';

  const posts = await listPublishedPosts(BLOG_WORKSPACE_ID, { limit: 30 });

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const rssItems = posts
    .map((p) => {
      const post = p as Record<string, unknown>;
      const title = escapeXml((post.title as string) ?? '');
      const slug = post.slug as string;
      const excerpt = escapeXml((post.excerpt as string) ?? '');
      const authorObj = post.author as Record<string, unknown> | undefined;
      const authorName = escapeXml((authorObj?.name as string) ?? 'Aura Team');
      const category = escapeXml((post.category as string) ?? '');
      const publishedAt = post.publishedAt as { toDate?: () => Date } | undefined;
      const pubDate = publishedAt?.toDate?.()?.toUTCString?.() ?? new Date().toUTCString();

      return `    <item>
      <title>${title}</title>
      <link>${appUrl}/blog/${slug}</link>
      <guid isPermaLink="true">${appUrl}/blog/${slug}</guid>
      <description>${excerpt}</description>
      <author>${authorName}</author>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aura.ai Blog</title>
    <link>${appUrl}/blog</link>
    <description>Latest marketing insights, AI tips, and product updates from Aura.ai</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${appUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
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
