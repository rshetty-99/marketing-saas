/**
 * POST /api/content/auto-improve
 * Runs the autoresearch improvement loop on content server-side.
 * Auth required — content.create_edit_drafts permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { autoImprove, scoreContent } from '@/lib/autoresearch';
import { z } from 'zod';

const scoreSchema = z.object({
  action: z.literal('score'),
  content: z.string().min(1),
  useCase: z.string().min(1),
  platform: z.string().optional(),
  targetKeyword: z.string().optional(),
  title: z.string().optional(),
});

const improveSchema = z.object({
  action: z.literal('improve'),
  content: z.string().min(1),
  prompt: z.string().min(1),
  useCase: z.string().min(1),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  targetKeyword: z.string().optional(),
  targetWordCount: z.number().optional(),
  title: z.string().optional(),
  maxIterations: z.number().min(1).max(10).optional(),
  threshold: z.number().min(0).max(100).optional(),
});

const requestSchema = z.discriminatedUnion('action', [scoreSchema, improveSchema]);

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.action === 'score') {
    const result = await scoreContent(data.useCase, data.content, {
      workspaceId: auth.workspaceId,
      platform: data.platform,
      contentType: data.useCase,
      targetKeyword: data.targetKeyword,
      title: data.title,
    });

    return NextResponse.json({
      composite: result.composite,
      scores: result.scores.map((s) => ({
        name: s.name,
        score: s.score,
        feedback: s.feedback,
      })),
    });
  }

  // action === 'improve'
  const result = await autoImprove(data.useCase, data.prompt, {
    workspaceId: auth.workspaceId,
    platform: data.platform,
    contentType: data.contentType,
    targetKeyword: data.targetKeyword,
    targetWordCount: data.targetWordCount,
    title: data.title,
    maxIterations: data.maxIterations,
    threshold: data.threshold,
    generateFn: async (prompt: string, feedback: string[], iteration: number) => {
      // Mock generation: in production this calls Claude API
      // For dev, we apply a simple feedback-driven transformation
      if (iteration === 0) return data.content;
      const feedbackSummary = feedback.slice(0, 3).join('. ');
      return `${data.content}\n\n<!-- Auto-improved: iteration ${iteration + 1}. Applied feedback: ${feedbackSummary} -->`;
    },
  });

  return NextResponse.json({
    content: result.content,
    compositeScore: result.compositeScore,
    scores: result.scores.map((s) => ({
      name: s.name,
      score: s.score,
      feedback: s.feedback,
    })),
    totalIterations: result.totalIterations,
    reachedThreshold: result.reachedThreshold,
    durationMs: result.durationMs,
  });
}
