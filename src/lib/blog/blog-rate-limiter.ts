/**
 * Blog Rate Limiter
 * In-memory rate limiting for public blog endpoints.
 * Separate from the integrations rate limiter (which is per-platform).
 */

import crypto from 'crypto';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

// Daily salt for hashing IPs (rotates every 24h)
let dailySalt = crypto.randomBytes(16).toString('hex');
let saltCreatedAt = Date.now();
const SALT_TTL_MS = 24 * 60 * 60 * 1000;

function getDailySalt(): string {
  if (Date.now() - saltCreatedAt > SALT_TTL_MS) {
    dailySalt = crypto.randomBytes(16).toString('hex');
    saltCreatedAt = Date.now();
  }
  return dailySalt;
}

/**
 * Hash an IP address for privacy-safe dedup.
 * Uses SHA-256 with a daily rotating salt — cannot reverse to IP.
 */
export function hashVisitorId(ip: string, userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${getDailySalt()}`)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Check and record a rate limit.
 * Returns true if within limit, false if exceeded.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// Rate limit presets
export const BLOG_RATE_LIMITS = {
  publicRead: { max: 60, windowMs: 60_000 },      // 60/min per IP
  analytics: { max: 5, windowMs: 60_000 },         // 5/min per IP
  like: { max: 1, windowMs: 86_400_000 },          // 1/day per IP per post
  comment: { max: 3, windowMs: 60_000 },           // 3/min per user
} as const;

// Known bot user-agent patterns
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baidu/i, /duckduckbot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegram/i, /discordbot/i,
  /semrush/i, /ahrefs/i, /mj12bot/i, /dotbot/i,
  /headlesschrome/i, /phantomjs/i, /puppeteer/i,
];

/**
 * Detect if a user-agent is a known bot.
 */
export function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Extract client IP from request headers.
 * Checks x-forwarded-for (behind proxy/CDN) then falls back.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return '0.0.0.0';
}

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits) {
    if (now > entry.resetAt) limits.delete(key);
  }
}, 5 * 60 * 1000);
