/**
 * POST /api/cortex/chat — Main Cortex streaming endpoint
 * Receives user message, returns SSE stream with Claude response + tool results.
 */

import { NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { cortexChatSchema } from '@/lib/validations/cortex';
import { handleCortexStream } from '@/lib/cortex/stream-handler';
import { checkCortexHealth } from '@/lib/cortex/health-check';

// Per-user concurrency tracking (in-memory, resets on server restart)
const activeRequests = new Map<string, number>();
const MAX_CONCURRENT = 1;
const MAX_QUEUED = 3;

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const parsed = cortexChatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Health check
  const health = await checkCortexHealth();
  if (health === 'offline') {
    return new Response(JSON.stringify({ error: 'Cortex is temporarily unavailable' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }
  if (health === 'slash_only') {
    return new Response(JSON.stringify({ error: 'AI is offline. Use slash commands instead.', degradationLevel: 'slash_only' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Concurrency check
  const userKey = `${authResult.workspaceId}:${authResult.userId}`;
  const current = activeRequests.get(userKey) ?? 0;
  if (current >= MAX_CONCURRENT + MAX_QUEUED) {
    return new Response(JSON.stringify({ error: 'Please wait for current requests to complete' }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }
  activeRequests.set(userKey, current + 1);

  try {
    const stream = await handleCortexStream({
      workspaceId: authResult.workspaceId,
      userId: authResult.userId,
      ...parsed.data,
    });

    // Wrap stream to track completion
    const trackedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          const remaining = (activeRequests.get(userKey) ?? 1) - 1;
          if (remaining <= 0) activeRequests.delete(userKey);
          else activeRequests.set(userKey, remaining);
          controller.close();
        }
      },
    });

    return new Response(trackedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const remaining = (activeRequests.get(userKey) ?? 1) - 1;
    if (remaining <= 0) activeRequests.delete(userKey);
    else activeRequests.set(userKey, remaining);

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Stream failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
