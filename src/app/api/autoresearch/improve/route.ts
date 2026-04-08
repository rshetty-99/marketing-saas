/**
 * POST /api/autoresearch/improve — Run the auto-improvement loop
 * Generates content, scores it, improves iteratively, returns best result.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { autoImprove } from '@/lib/autoresearch';
import { z } from 'zod';

const schema = z.object({
  useCase: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  platform: z.string().optional(),
  targetKeyword: z.string().optional(),
  targetWordCount: z.number().optional(),
  title: z.string().optional(),
  maxIterations: z.number().min(1).max(5).optional(),
  threshold: z.number().min(0).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Load brand voice
  const { adminDb } = await import('@/lib/firebase/admin');
  const profileDoc = await adminDb.collection('entity_profiles').doc(auth.workspaceId).get();
  const brandVoice = profileDoc.exists ? (profileDoc.data()?.brandVoice as Record<string, unknown>) ?? undefined : undefined;

  // Load workspace tier
  const wsDoc = await adminDb.collection('workspaces').doc(auth.workspaceId).get();
  const tier = (wsDoc.data()?.tier as string) ?? 'starter';

  const result = await autoImprove(parsed.data.useCase, parsed.data.prompt, {
    workspaceId: auth.workspaceId,
    brandVoice: brandVoice as never,
    platform: parsed.data.platform,
    targetKeyword: parsed.data.targetKeyword,
    targetWordCount: parsed.data.targetWordCount,
    title: parsed.data.title,
    tier,
    maxIterations: parsed.data.maxIterations,
    threshold: parsed.data.threshold,
    generateFn: async (prompt, feedback, iteration) => {
      // Use Claude API if available, otherwise mock
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic();
        const feedbackSection = feedback.length > 0
          ? `\n\nIMPROVEMENT FEEDBACK (from iteration ${iteration}):\n${feedback.map((f) => `- ${f}`).join('\n')}\n\nAddress each feedback point in your rewrite.`
          : '';

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt + feedbackSection }],
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
      }

      // Mock generation for dev
      const mockContent = iteration === 0
        ? `# ${parsed.data.title ?? 'Generated Content'}\n\nThis is a generated draft about ${parsed.data.prompt.slice(0, 100)}...\n\nKey points:\n- First important point\n- Second important point\n- Third important point\n\nConclusion with a call to action. Start your free trial today.`
        : `# ${parsed.data.title ?? 'Improved Content'}\n\n## Introduction\n\nThis improved draft addresses the feedback from iteration ${iteration}.\n\n${feedback.map((f) => `Addressed: ${f}`).join('\n')}\n\n## Key Takeaways\n\n- Improved point one with better specificity\n- Enhanced point two with data: 500+ agencies trust this approach\n- Refined point three with clear benefit to you\n\n## Start Your Free Trial\n\nReady to transform your marketing? Start your 15-day free trial today — no credit card required.\n\n#Marketing #AI #ContentCreation`;

      return mockContent;
    },
  });

  return NextResponse.json(result);
}
