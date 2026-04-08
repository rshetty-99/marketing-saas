/**
 * POST /api/brand/generate-sample — Generate a sample post using the brand voice
 * Uses Claude API to produce real content matching the brand's tone and personality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getBrandProfile, buildVoiceSystemPrompt } from '@/lib/f8/brand-service';
import { z } from 'zod';

const schema = z.object({
  topic: z.string().min(1).max(500).default('our latest product launch'),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'blog']).default('linkedin'),
});

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('brand.view_profile');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const brand = await getBrandProfile(authResult.workspaceId);
  if (!brand?.brandVoice) {
    return NextResponse.json({ error: 'No brand voice configured. Set up your voice settings first.' }, { status: 404 });
  }

  const systemPrompt = buildVoiceSystemPrompt(brand.brandVoice);
  const { topic, platform } = parsed.data;

  const platformGuidance: Record<string, string> = {
    linkedin: 'Write a professional LinkedIn post (150-300 words). Use line breaks for readability. Include relevant hashtags.',
    twitter: 'Write a tweet (max 280 characters). Be concise and punchy. Include 1-2 hashtags.',
    instagram: 'Write an Instagram caption (100-200 words). Be visual and engaging. Include emojis and 5-10 hashtags at the end.',
    blog: 'Write the opening 2 paragraphs of a blog post (200-400 words). Hook the reader immediately.',
  };

  // Check if ANTHROPIC_API_KEY is set for real generation
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic();
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `${platformGuidance[platform]}\n\nTopic: ${topic}`,
        }],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return NextResponse.json({ sample: content, platform, topic, model: 'claude-sonnet' });
    } catch (error) {
      return NextResponse.json({
        error: 'AI generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  }

  // Mock sample for dev (no API key)
  const mockSamples: Record<string, string> = {
    linkedin: `🚀 Exciting news about ${topic}!\n\nWe've been working on something special, and today we're thrilled to share it with you.\n\nHere's what makes this different:\n→ Built with our customers' feedback\n→ Designed for real-world workflows\n→ Ready to scale with your team\n\nThe best part? We're just getting started.\n\nTry it free for 15 days — no credit card required.\n\n#Innovation #Marketing #AI #GrowthMindset`,
    twitter: `Big news: We just shipped ${topic}. 🎯\n\nEarly users are already seeing 3x results.\n\nTry it free → #Marketing #AI`,
    instagram: `✨ Something new just dropped!\n\nWe poured our hearts into ${topic} and we can't wait for you to try it.\n\nSwipe to see what's new 👉\n\n💡 Pro tip: Start with the free trial to explore everything at your own pace.\n\n#Marketing #AI #ContentCreation #DigitalMarketing #SocialMedia #Agency #Growth #Innovation #MarketingTips #ContentStrategy`,
    blog: `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nIn today's fast-moving marketing landscape, staying ahead means embracing tools that work as hard as you do. That's exactly why we built this — not as another feature to learn, but as a genuine force multiplier for your team.\n\nThe reality is simple: agencies managing 20+ clients can't afford to spend hours on repetitive tasks. Every minute spent on manual scheduling, report formatting, or content repurposing is a minute not spent on strategy. And strategy is what your clients are actually paying for.`,
  };

  return NextResponse.json({
    sample: mockSamples[platform] ?? mockSamples.linkedin,
    platform, topic, model: 'mock',
  });
}
