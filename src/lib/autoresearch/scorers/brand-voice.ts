/**
 * Brand Voice Scorer — Measures how well content matches the brand voice profile
 * Uses heuristic analysis (no AI call needed) for fast scoring.
 */

import type { ScoreResult, ScorerContext } from '../types';

// Tone word banks for heuristic matching
const TONE_WORDS: Record<string, string[]> = {
  professional: ['furthermore', 'regarding', 'implement', 'strategic', 'optimize', 'leverage', 'enterprise', 'stakeholder', 'deliverable', 'roi'],
  casual: ['hey', 'awesome', 'cool', 'gonna', 'totally', 'btw', 'tbh', 'vibe', 'stuff', 'super'],
  friendly: ['love', 'amazing', 'excited', 'happy', 'welcome', 'wonderful', 'enjoy', 'great', 'fantastic', 'community'],
  authoritative: ['research shows', 'data proves', 'evidence', 'according to', 'studies indicate', 'experts agree', 'industry standard', 'benchmark'],
  playful: ['woohoo', 'yay', 'fun', 'surprise', 'magic', 'sparkle', 'wild', 'adventure', 'whoa', 'boom'],
  technical: ['algorithm', 'implementation', 'architecture', 'scalable', 'infrastructure', 'api', 'deployment', 'configuration', 'integration'],
  inspirational: ['dream', 'vision', 'believe', 'transform', 'empower', 'journey', 'limitless', 'possibilities', 'change', 'breakthrough'],
};

const FORMALITY_INDICATORS = {
  formal: ['therefore', 'consequently', 'furthermore', 'nevertheless', 'accordingly', 'henceforth', 'notwithstanding'],
  informal: ["don't", "can't", "won't", "it's", "you're", "they're", "we're", "let's", "!", "?!", "..."],
};

export async function scoreBrandVoice(content: string, context: ScorerContext): Promise<ScoreResult> {
  const brandVoice = context.brandVoice;
  if (!brandVoice) {
    return { name: 'brand_voice', score: 70, weight: 1, feedback: ['No brand voice configured — using default scoring'] };
  }

  const textLower = content.toLowerCase();
  const feedback: string[] = [];
  let score = 70; // Start at baseline

  // 1. Tone matching (0-20 points)
  const targetTone = brandVoice.tone?.toLowerCase() ?? 'professional';
  const toneWords = TONE_WORDS[targetTone] ?? [];
  const toneMatches = toneWords.filter((w) => textLower.includes(w)).length;
  const toneScore = Math.min(20, toneMatches * 4);
  score += toneScore - 10; // -10 baseline, up to +10

  if (toneMatches === 0) {
    feedback.push(`Content doesn't use ${targetTone} tone language — add words that convey ${targetTone} voice`);
  }

  // Check for conflicting tones
  for (const [tone, words] of Object.entries(TONE_WORDS)) {
    if (tone !== targetTone) {
      const conflicts = words.filter((w) => textLower.includes(w)).length;
      if (conflicts > 3) {
        feedback.push(`Content has ${conflicts} words matching "${tone}" tone, but brand voice is "${targetTone}" — remove conflicting language`);
        score -= conflicts * 2;
      }
    }
  }

  // 2. Formality level matching (0-15 points)
  const targetFormality = brandVoice.formalityLevel ?? 5;
  const formalCount = FORMALITY_INDICATORS.formal.filter((w) => textLower.includes(w)).length;
  const informalCount = FORMALITY_INDICATORS.informal.filter((w) => content.includes(w)).length;
  const detectedFormality = formalCount > informalCount ? 8 : informalCount > formalCount ? 3 : 5;
  const formalityDiff = Math.abs(targetFormality - detectedFormality);

  if (formalityDiff <= 2) {
    score += 10;
  } else if (formalityDiff <= 4) {
    score += 5;
    feedback.push(`Formality level (${detectedFormality}/10) doesn't match brand target (${targetFormality}/10) — ${targetFormality > detectedFormality ? 'make more formal' : 'make more casual'}`);
  } else {
    feedback.push(`Formality mismatch: content is ${detectedFormality}/10 but brand target is ${targetFormality}/10 — significant adjustment needed`);
    score -= 5;
  }

  // 3. Personality trait presence (0-15 points)
  const traits = brandVoice.personalityTraits ?? [];
  if (traits.length > 0) {
    const traitMatches = traits.filter((trait) => textLower.includes(trait.toLowerCase())).length;
    score += Math.min(15, traitMatches * 5);
    if (traitMatches === 0) {
      feedback.push(`Content doesn't reflect brand personality traits: ${traits.join(', ')} — weave these into the writing`);
    }
  }

  // 4. Emoji policy (0-5 points)
  const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) ?? []).length;
  const emojiPolicy = brandVoice.toneDescriptors?.includes('emoji-friendly') ? 'moderate' : 'minimal';

  if (emojiPolicy === 'minimal' && emojiCount > 3) {
    feedback.push(`Too many emojis (${emojiCount}) for brand voice — keep to 0-2 max`);
    score -= 5;
  } else if (emojiPolicy === 'moderate' && emojiCount === 0 && context.platform !== 'blog') {
    feedback.push('Add 2-3 relevant emojis to match brand voice on social platforms');
    score -= 3;
  }

  // 5. Target audience language
  const audience = brandVoice.targetAudience?.toLowerCase() ?? '';
  if (audience && !textLower.includes('you') && !textLower.includes('your')) {
    feedback.push('Address the reader directly with "you/your" — makes content more engaging for your target audience');
    score -= 3;
  }

  return {
    name: 'brand_voice',
    score: Math.min(100, Math.max(0, Math.round(score))),
    weight: 1,
    feedback,
    details: {
      targetTone,
      detectedFormality,
      targetFormality,
      toneMatches,
      emojiCount,
    },
  };
}
