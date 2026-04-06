/**
 * Cortex Health Check — Claude API availability detection
 * Returns degradation level: full | degraded | slash_only | offline
 */

import type { DegradationLevel } from '@/types/features/cortex';

let lastCheckTime = 0;
let cachedLevel: DegradationLevel = 'full';
const CACHE_TTL_MS = 30_000; // Cache health status for 30 seconds

export async function checkCortexHealth(): Promise<DegradationLevel> {
  const now = Date.now();
  if (now - lastCheckTime < CACHE_TTL_MS) return cachedLevel;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    cachedLevel = 'slash_only';
    lastCheckTime = now;
    return cachedLevel;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok || response.status === 200) {
      cachedLevel = 'full';
    } else if (response.status === 429) {
      cachedLevel = 'degraded'; // Rate limited — still works but slower
    } else if (response.status === 401 || response.status === 403) {
      cachedLevel = 'slash_only'; // Invalid key
    } else {
      cachedLevel = 'slash_only'; // Other error
    }
  } catch {
    cachedLevel = 'slash_only'; // Network error
  }

  lastCheckTime = now;
  return cachedLevel;
}
