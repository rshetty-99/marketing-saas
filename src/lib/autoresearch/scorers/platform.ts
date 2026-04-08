/**
 * Platform Compliance Scorer — Checks content against platform-specific best practices
 * Each platform has unique requirements for length, hashtags, formatting, etc.
 */

import type { ScoreResult, ScorerContext } from '../types';

interface PlatformRules {
  name: string;
  maxChars?: number;
  idealWordRange: [number, number];
  hashtagRange: [number, number];
  requiresCTA: boolean;
  requiresEmoji: boolean;
  requiresLineBreaks: boolean;
  format: string;
}

const PLATFORM_RULES: Record<string, PlatformRules> = {
  linkedin: {
    name: 'LinkedIn',
    idealWordRange: [150, 300],
    hashtagRange: [3, 5],
    requiresCTA: true,
    requiresEmoji: false,
    requiresLineBreaks: true,
    format: 'Use line breaks between paragraphs. Professional but conversational. Hook in first line.',
  },
  twitter: {
    name: 'Twitter/X',
    maxChars: 280,
    idealWordRange: [20, 50],
    hashtagRange: [1, 2],
    requiresCTA: false,
    requiresEmoji: false,
    requiresLineBreaks: false,
    format: 'Punchy and concise. One strong idea. No fluff.',
  },
  instagram: {
    name: 'Instagram',
    idealWordRange: [80, 200],
    hashtagRange: [5, 15],
    requiresCTA: true,
    requiresEmoji: true,
    requiresLineBreaks: true,
    format: 'Visual-first caption. Emojis encouraged. Hashtags at end.',
  },
  facebook: {
    name: 'Facebook',
    idealWordRange: [40, 150],
    hashtagRange: [0, 3],
    requiresCTA: true,
    requiresEmoji: true,
    requiresLineBreaks: false,
    format: 'Conversational. Question hooks perform well. Tag people when relevant.',
  },
  tiktok: {
    name: 'TikTok',
    maxChars: 2200,
    idealWordRange: [20, 80],
    hashtagRange: [3, 8],
    requiresCTA: true,
    requiresEmoji: true,
    requiresLineBreaks: false,
    format: 'Casual, trend-aware. Hook in first 3 seconds worth of text.',
  },
  youtube: {
    name: 'YouTube',
    idealWordRange: [100, 500],
    hashtagRange: [0, 3],
    requiresCTA: true,
    requiresEmoji: false,
    requiresLineBreaks: true,
    format: 'Description with timestamps. Hook + value proposition + CTA. Link in bio.',
  },
  blog: {
    name: 'Blog',
    idealWordRange: [800, 2500],
    hashtagRange: [0, 0],
    requiresCTA: true,
    requiresEmoji: false,
    requiresLineBreaks: true,
    format: 'Long-form with H2/H3 headings, internal links, conclusion with CTA.',
  },
  email: {
    name: 'Email',
    idealWordRange: [100, 400],
    hashtagRange: [0, 0],
    requiresCTA: true,
    requiresEmoji: false,
    requiresLineBreaks: true,
    format: 'Personal tone. One clear CTA. Mobile-friendly paragraphs (2-3 sentences max).',
  },
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function scorePlatformCompliance(content: string, context: ScorerContext): Promise<ScoreResult> {
  const platform = context.platform ?? 'blog';
  const rules = PLATFORM_RULES[platform] ?? PLATFORM_RULES.blog;
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;
  const hashtags = (content.match(/#\w+/g) ?? []).length;
  const emojis = (content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) ?? []).length;
  const hasLineBreaks = content.includes('\n') || content.includes('<br') || content.includes('</p>');
  const hasCTA = /sign up|start|try|get started|learn more|click|subscribe|book|buy|download|join|register|contact/i.test(text);

  const feedback: string[] = [];
  let score = 80; // Start at good baseline

  // Character limit check
  if (rules.maxChars && charCount > rules.maxChars) {
    feedback.push(`${rules.name} has a ${rules.maxChars} character limit — content is ${charCount} chars. Shorten by ${charCount - rules.maxChars} characters.`);
    score -= 25;
  }

  // Word count range
  const [minWords, maxWords] = rules.idealWordRange;
  if (wordCount < minWords) {
    feedback.push(`${rules.name} posts perform best at ${minWords}-${maxWords} words — currently ${wordCount}. Add more substance.`);
    score -= 15;
  } else if (wordCount > maxWords * 1.5) {
    feedback.push(`Content is ${wordCount} words — ${rules.name} ideal is ${minWords}-${maxWords}. Trim for better engagement.`);
    score -= 10;
  } else if (wordCount >= minWords && wordCount <= maxWords) {
    score += 5; // Bonus for hitting sweet spot
  }

  // Hashtag check
  const [minHash, maxHash] = rules.hashtagRange;
  if (hashtags < minHash) {
    feedback.push(`Add ${minHash - hashtags} more hashtag${minHash - hashtags > 1 ? 's' : ''} — ${rules.name} posts with ${minHash}-${maxHash} hashtags get more reach.`);
    score -= 8;
  } else if (hashtags > maxHash && maxHash > 0) {
    feedback.push(`Too many hashtags (${hashtags}) — ${rules.name} best practice is ${minHash}-${maxHash}. Remove ${hashtags - maxHash}.`);
    score -= 5;
  }

  // CTA check
  if (rules.requiresCTA && !hasCTA) {
    feedback.push(`Missing call-to-action — ${rules.name} posts with a clear CTA drive 2-3x more engagement.`);
    score -= 12;
  }

  // Emoji check
  if (rules.requiresEmoji && emojis === 0) {
    feedback.push(`Add 2-3 relevant emojis — ${rules.name} posts with emojis get higher engagement.`);
    score -= 5;
  }

  // Line breaks
  if (rules.requiresLineBreaks && !hasLineBreaks && wordCount > 50) {
    feedback.push(`Add line breaks between paragraphs — wall-of-text posts get skipped on ${rules.name}.`);
    score -= 8;
  }

  // Bonus: Hook in first line
  const firstSentence = text.split(/[.!?]/)[0] ?? '';
  if (firstSentence.length > 100) {
    feedback.push('First sentence is too long — lead with a punchy hook under 15 words.');
    score -= 5;
  }

  return {
    name: 'platform',
    score: Math.min(100, Math.max(0, Math.round(score))),
    weight: 1,
    feedback,
    details: {
      platform: rules.name,
      wordCount,
      charCount,
      hashtags,
      emojis,
      hasCTA,
      hasLineBreaks,
    },
  };
}
