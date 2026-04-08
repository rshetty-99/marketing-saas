/**
 * POST /api/brand/analyze-voice — Analyze speech transcript to extract brand voice traits
 * Accepts a transcript (from Web Speech API) and uses Claude to detect
 * tone, formality, energy, vocabulary, personality traits.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { z } from 'zod';

const schema = z.object({
  transcript: z.string().min(20).max(10000),
});

interface VoiceAnalysis {
  tone: string;
  formalityLevel: number;
  energyLevel: string;
  vocabularyComplexity: string;
  personalityTraits: string[];
  toneDescriptors: string[];
  emojiTendency: string;
  sentenceStyle: string;
  confidence: number;
  summary: string;
}

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('brand.view_profile');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { transcript } = parsed.data;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic();

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are a brand voice analyst. Given a speech transcript, analyze the speaker's communication style and extract brand voice characteristics. Return JSON only.`,
        messages: [{
          role: 'user',
          content: `Analyze this speech transcript and extract brand voice traits. Return JSON with these exact fields:

{
  "tone": "professional|casual|friendly|authoritative|playful|technical|inspirational",
  "formalityLevel": 1-10 (1=very casual, 10=very formal),
  "energyLevel": "calm|moderate|enthusiastic|intense",
  "vocabularyComplexity": "simple|moderate|advanced|technical",
  "personalityTraits": ["trait1", "trait2", "trait3"] (max 5),
  "toneDescriptors": ["descriptor1", "descriptor2", "descriptor3"] (max 5),
  "emojiTendency": "none|minimal|moderate|heavy",
  "sentenceStyle": "short_punchy|balanced|long_flowing|mixed",
  "confidence": 0.0-1.0 (how confident you are in the analysis),
  "summary": "One sentence describing the overall voice"
}

Transcript:
"""
${transcript}
"""`,
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]) as VoiceAnalysis;
        return NextResponse.json({ analysis, model: 'claude-sonnet' });
      }

      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 });
    } catch (error) {
      return NextResponse.json({
        error: 'Voice analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  }

  // Mock analysis for dev (no API key)
  const wordCount = transcript.split(/\s+/).length;
  const avgWordLength = transcript.replace(/\s+/g, '').length / wordCount;
  const hasFormalWords = /furthermore|therefore|consequently|regarding|pursuant/i.test(transcript);
  const hasCasualWords = /awesome|cool|yeah|gonna|wanna|hey|stuff/i.test(transcript);

  const mockAnalysis: VoiceAnalysis = {
    tone: hasFormalWords ? 'professional' : hasCasualWords ? 'casual' : 'friendly',
    formalityLevel: hasFormalWords ? 8 : hasCasualWords ? 3 : 5,
    energyLevel: transcript.includes('!') ? 'enthusiastic' : 'moderate',
    vocabularyComplexity: avgWordLength > 6 ? 'advanced' : avgWordLength > 4.5 ? 'moderate' : 'simple',
    personalityTraits: ['confident', 'approachable', 'knowledgeable'],
    toneDescriptors: ['warm', 'direct', 'engaging'],
    emojiTendency: 'minimal',
    sentenceStyle: wordCount / (transcript.split(/[.!?]+/).length || 1) > 15 ? 'long_flowing' : 'short_punchy',
    confidence: 0.72,
    summary: `The speaker has a ${hasFormalWords ? 'professional' : 'conversational'} tone with ${avgWordLength > 5 ? 'sophisticated' : 'accessible'} vocabulary and a ${transcript.includes('!') ? 'high-energy' : 'measured'} delivery style.`,
  };

  return NextResponse.json({ analysis: mockAnalysis, model: 'mock' });
}
