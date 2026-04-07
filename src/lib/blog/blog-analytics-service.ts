/**
 * Blog Analytics Service
 * Tracks views, scroll depth, time on page, traffic sources, shares, CTA clicks.
 * Privacy-safe: hashed visitor IDs, no cookies, no raw IPs.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { hashVisitorId, isBot, getClientIp, checkRateLimit, BLOG_RATE_LIMITS } from './blog-rate-limiter';
import { incrementViews, incrementUniqueVisitors } from './blog-service';

const analyticsCol = (wid: string, postId: string) =>
  adminDb.collection('workspaces').doc(wid).collection('blog_posts').doc(postId).collection('analytics');

/**
 * Record a page view event.
 * Deduplicates by visitor hash — same visitor within 24h = 1 view.
 */
export async function recordView(
  workspaceId: string,
  postId: string,
  headers: Headers,
  data: { referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string },
) {
  const ip = getClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';
  const visitorHash = hashVisitorId(ip, userAgent);

  // Bot detection — track but flag
  const bot = isBot(userAgent);

  // Rate limit
  if (!checkRateLimit(`blog:view:${ip}`, BLOG_RATE_LIMITS.analytics.max, BLOG_RATE_LIMITS.analytics.windowMs)) {
    return { recorded: false, reason: 'rate_limited' };
  }

  // Validate referrer matches our domain (if provided)
  const referer = headers.get('referer') ?? data.referrer ?? '';

  // Check if this visitor already viewed this post today
  const existingView = await analyticsCol(workspaceId, postId)
    .where('visitorHash', '==', visitorHash)
    .where('eventType', '==', 'view')
    .limit(1)
    .get();

  const isUnique = existingView.empty;

  // Always increment total views
  await incrementViews(workspaceId, postId);

  // Only increment unique if first visit
  if (isUnique) {
    await incrementUniqueVisitors(workspaceId, postId);
  }

  // Classify traffic source
  const source = classifyTrafficSource(referer, data.utmSource, data.utmMedium);

  // Store event
  const ref = analyticsCol(workspaceId, postId).doc();
  await ref.set({
    id: ref.id, eventType: 'view', visitorHash,
    referrer: referer || null, source,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    isBot: bot, isUnique,
    timestamp: FieldValue.serverTimestamp(),
  });

  return { recorded: true, isUnique, isBot: bot };
}

/**
 * Record scroll depth event.
 */
export async function recordScroll(
  workspaceId: string,
  postId: string,
  headers: Headers,
  data: { scrollDepth: number; readCompleted: boolean; timeOnPageSeconds: number },
) {
  const ip = getClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';
  const visitorHash = hashVisitorId(ip, userAgent);

  if (isBot(userAgent)) return { recorded: false, reason: 'bot' };

  // Validate data ranges
  const depth = Math.min(100, Math.max(0, data.scrollDepth));
  const time = Math.min(7200, Math.max(0, data.timeOnPageSeconds));

  const ref = analyticsCol(workspaceId, postId).doc();
  await ref.set({
    id: ref.id, eventType: 'scroll', visitorHash,
    scrollDepth: depth, readCompleted: data.readCompleted, timeOnPageSeconds: time,
    isBot: false,
    timestamp: FieldValue.serverTimestamp(),
  });

  return { recorded: true };
}

/**
 * Record share click.
 */
export async function recordShare(
  workspaceId: string,
  postId: string,
  headers: Headers,
  platform: string,
) {
  const ip = getClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';

  if (!checkRateLimit(`blog:share:${ip}`, 30, 60_000)) {
    return { recorded: false };
  }

  const ref = analyticsCol(workspaceId, postId).doc();
  await ref.set({
    id: ref.id, eventType: 'share', visitorHash: hashVisitorId(ip, userAgent),
    platform, isBot: isBot(userAgent),
    timestamp: FieldValue.serverTimestamp(),
  });
  return { recorded: true };
}

/**
 * Record CTA click.
 */
export async function recordCtaClick(
  workspaceId: string,
  postId: string,
  headers: Headers,
) {
  const ip = getClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';

  const ref = analyticsCol(workspaceId, postId).doc();
  await ref.set({
    id: ref.id, eventType: 'cta_click', visitorHash: hashVisitorId(ip, userAgent),
    isBot: isBot(userAgent),
    timestamp: FieldValue.serverTimestamp(),
  });
  return { recorded: true };
}

/**
 * Get aggregated analytics for a post.
 */
export async function getPostAnalytics(workspaceId: string, postId: string) {
  const snap = await analyticsCol(workspaceId, postId)
    .where('isBot', '==', false)
    .orderBy('timestamp', 'desc')
    .limit(1000)
    .get();

  const events = snap.docs.map((d) => d.data());
  const views = events.filter((e) => e.eventType === 'view');
  const scrolls = events.filter((e) => e.eventType === 'scroll');
  const shares = events.filter((e) => e.eventType === 'share');
  const ctaClicks = events.filter((e) => e.eventType === 'cta_click');

  const uniqueVisitors = new Set(views.filter((v) => v.isUnique).map((v) => v.visitorHash)).size;
  const avgTime = scrolls.length > 0
    ? scrolls.reduce((sum, s) => sum + (s.timeOnPageSeconds ?? 0), 0) / scrolls.length
    : 0;
  const completions = scrolls.filter((s) => s.readCompleted).length;
  const completionRate = scrolls.length > 0 ? (completions / scrolls.length) * 100 : 0;

  // Traffic sources
  const sources = { direct: 0, social: 0, organic: 0, referral: 0, email: 0 };
  for (const v of views) {
    const src = (v.source as string) ?? 'direct';
    if (src in sources) sources[src as keyof typeof sources]++;
  }

  // Top referrers
  const referrerCounts = new Map<string, number>();
  for (const v of views) {
    if (v.referrer) {
      try {
        const host = new URL(v.referrer).hostname;
        referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
      } catch { /* ignore invalid URLs */ }
    }
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Share clicks by platform
  const shareCounts = new Map<string, number>();
  for (const s of shares) {
    const platform = s.platform as string;
    shareCounts.set(platform, (shareCounts.get(platform) ?? 0) + 1);
  }
  const shareClicks = Array.from(shareCounts.entries())
    .map(([platform, count]) => ({ platform, count }));

  // Scroll depth buckets
  const scrollDepth = { pct25: 0, pct50: 0, pct75: 0, pct100: 0 };
  for (const s of scrolls) {
    const depth = s.scrollDepth as number;
    if (depth >= 25) scrollDepth.pct25++;
    if (depth >= 50) scrollDepth.pct50++;
    if (depth >= 75) scrollDepth.pct75++;
    if (depth >= 100) scrollDepth.pct100++;
  }

  return {
    postId,
    totalViews: views.length,
    uniqueVisitors,
    avgTimeOnPage: Math.round(avgTime),
    completionRate: Math.round(completionRate),
    scrollDepth,
    trafficSources: sources,
    topReferrers,
    shareClicks,
    ctaClicks: ctaClicks.length,
  };
}

// ── Helpers ────────────────────────────────────────────────

function classifyTrafficSource(referrer: string, utmSource?: string, utmMedium?: string): string {
  if (utmMedium === 'email' || utmSource === 'email' || utmSource === 'newsletter') return 'email';
  if (utmMedium === 'social' || utmMedium === 'cpc') return 'social';
  if (!referrer) return 'direct';

  try {
    const host = new URL(referrer).hostname;
    const socialDomains = ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'pinterest.com', 't.co'];
    const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.com'];

    if (socialDomains.some((d) => host.includes(d))) return 'social';
    if (searchDomains.some((d) => host.includes(d))) return 'organic';
    return 'referral';
  } catch {
    return 'direct';
  }
}
