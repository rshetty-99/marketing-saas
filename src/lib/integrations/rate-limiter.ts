/**
 * Rate Limiter for External API Calls
 *
 * Per CLAUDE.md: "Rate-limited APIs go through src/lib/integrations/rate-limiter.ts"
 * Tracks calls per platform per connection. Queues when approaching limits.
 *
 * Platform rate limits (approximate):
 *   LinkedIn: 100 calls/day per member token
 *   Twitter:  300 calls/15min per user token
 *   Instagram: 200 calls/hour per user
 *   Facebook:  200 calls/hour per user
 *   TikTok:   100 calls/day
 *   YouTube:  10,000 units/day
 *   Pinterest: 1,000 calls/hour
 *   Google Business: 60 calls/min
 */

interface RateLimitEntry {
  callCount: number;
  windowStart: number;
  windowMs: number;
  maxCalls: number;
}

const PLATFORM_LIMITS: Record<string, { maxCalls: number; windowMs: number }> = {
  linkedin: { maxCalls: 100, windowMs: 24 * 60 * 60 * 1000 },       // 100/day
  twitter: { maxCalls: 300, windowMs: 15 * 60 * 1000 },              // 300/15min
  instagram: { maxCalls: 200, windowMs: 60 * 60 * 1000 },            // 200/hour
  facebook: { maxCalls: 200, windowMs: 60 * 60 * 1000 },             // 200/hour
  tiktok: { maxCalls: 100, windowMs: 24 * 60 * 60 * 1000 },          // 100/day
  youtube: { maxCalls: 10000, windowMs: 24 * 60 * 60 * 1000 },       // 10000/day
  pinterest: { maxCalls: 1000, windowMs: 60 * 60 * 1000 },           // 1000/hour
  google_business: { maxCalls: 60, windowMs: 60 * 1000 },            // 60/min
};

// In-memory rate limit tracking (per connection)
const rateLimitMap = new Map<string, RateLimitEntry>();

function getKey(platform: string, connectionId: string): string {
  return `${platform}:${connectionId}`;
}

/**
 * Check if a call can proceed. Returns true if within limits.
 */
export function canMakeCall(platform: string, connectionId: string): boolean {
  const key = getKey(platform, connectionId);
  const limits = PLATFORM_LIMITS[platform];
  if (!limits) return true; // Unknown platform, allow

  const entry = rateLimitMap.get(key);
  const now = Date.now();

  if (!entry || now - entry.windowStart > entry.windowMs) {
    // Window expired or first call — reset
    rateLimitMap.set(key, {
      callCount: 0,
      windowStart: now,
      windowMs: limits.windowMs,
      maxCalls: limits.maxCalls,
    });
    return true;
  }

  return entry.callCount < entry.maxCalls;
}

/**
 * Record an API call. Call this after each successful API request.
 */
export function recordCall(platform: string, connectionId: string): void {
  const key = getKey(platform, connectionId);
  const entry = rateLimitMap.get(key);

  if (entry) {
    entry.callCount++;
  } else {
    const limits = PLATFORM_LIMITS[platform] ?? { maxCalls: 100, windowMs: 60 * 60 * 1000 };
    rateLimitMap.set(key, {
      callCount: 1,
      windowStart: Date.now(),
      windowMs: limits.windowMs,
      maxCalls: limits.maxCalls,
    });
  }
}

/**
 * Get remaining calls for a connection.
 */
export function getRateLimitStatus(platform: string, connectionId: string): {
  remaining: number;
  resetsAt: Date;
  maxCalls: number;
} {
  const key = getKey(platform, connectionId);
  const limits = PLATFORM_LIMITS[platform] ?? { maxCalls: 100, windowMs: 60 * 60 * 1000 };
  const entry = rateLimitMap.get(key);

  if (!entry) {
    return {
      remaining: limits.maxCalls,
      resetsAt: new Date(Date.now() + limits.windowMs),
      maxCalls: limits.maxCalls,
    };
  }

  const resetsAt = new Date(entry.windowStart + entry.windowMs);
  return {
    remaining: Math.max(0, entry.maxCalls - entry.callCount),
    resetsAt,
    maxCalls: entry.maxCalls,
  };
}

/**
 * Execute a rate-limited API call. Throws if rate limited.
 */
export async function rateLimitedCall<T>(
  platform: string,
  connectionId: string,
  apiCall: () => Promise<T>,
): Promise<T> {
  if (!canMakeCall(platform, connectionId)) {
    const status = getRateLimitStatus(platform, connectionId);
    throw new Error(
      `Rate limit exceeded for ${platform}. Resets at ${status.resetsAt.toISOString()}. Remaining: ${status.remaining}/${status.maxCalls}`,
    );
  }

  const result = await apiCall();
  recordCall(platform, connectionId);
  return result;
}
