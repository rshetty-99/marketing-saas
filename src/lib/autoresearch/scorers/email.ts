/**
 * Email Scorer — Scores email subject lines and body content
 * Checks: subject line length, urgency, personalization, CTA, compliance
 */

import type { ScoreResult, ScorerContext } from '../types';

export async function scoreEmailSubject(content: string, _context: ScorerContext): Promise<ScoreResult> {
  const subject = content.trim();
  const feedback: string[] = [];
  let score = 70;

  // Length (40-60 chars is optimal)
  if (subject.length < 20) { feedback.push('Subject too short — aim for 40-60 characters'); score -= 15; }
  else if (subject.length > 70) { feedback.push('Subject too long — may get truncated on mobile. Aim for 40-60 chars.'); score -= 10; }
  else if (subject.length >= 40 && subject.length <= 60) { score += 10; }

  // Urgency/curiosity words
  const urgencyWords = /limited|last chance|expires|urgent|now|today|don't miss|exclusive|breaking|new/i;
  if (urgencyWords.test(subject)) { score += 8; }
  else { feedback.push('Add urgency or curiosity — words like "limited", "new", "exclusive" boost open rates'); }

  // Personalization
  if (subject.includes('{{') || subject.includes('{name}')) { score += 5; }
  else { feedback.push('Consider personalization (e.g., "{{firstName}}") — personalized subjects get 26% higher open rates'); }

  // Numbers
  if (/\d/.test(subject)) { score += 5; }

  // ALL CAPS penalty
  if (subject === subject.toUpperCase() && subject.length > 5) { feedback.push('Avoid ALL CAPS — triggers spam filters'); score -= 15; }

  // Spam trigger words
  const spamWords = /free|guarantee|act now|click here|buy now|winner|congratulations|cash/i;
  if (spamWords.test(subject)) { feedback.push('Contains spam trigger words — may hurt deliverability'); score -= 10; }

  // Emoji (moderate use helps)
  const emojiCount = (subject.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) ?? []).length;
  if (emojiCount === 1) { score += 3; }
  else if (emojiCount > 2) { feedback.push('Too many emojis in subject — 0-1 is ideal'); score -= 5; }

  return { name: 'email_subject', score: Math.min(100, Math.max(0, score)), weight: 1, feedback };
}

export async function scoreEmailBody(content: string, _context: ScorerContext): Promise<ScoreResult> {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const feedback: string[] = [];
  let score = 70;

  // CTA presence
  const hasCTA = /sign up|start|try|get started|learn more|click|subscribe|book|buy|download|shop now/i.test(text);
  if (!hasCTA) { feedback.push('Missing clear CTA — every email must have one primary action'); score -= 20; }
  else { score += 10; }

  // Multiple CTAs (bad)
  const ctaCount = (text.match(/(?:sign up|start|try|get started|learn more|click here|subscribe|book now|buy now|download|shop now)/gi) ?? []).length;
  if (ctaCount > 3) { feedback.push(`Too many CTAs (${ctaCount}) — focus on one primary action`); score -= 10; }

  // Unsubscribe link (compliance)
  const hasUnsubscribe = /unsubscribe/i.test(content);
  if (!hasUnsubscribe) { feedback.push('Missing unsubscribe link — required by CAN-SPAM law'); score -= 15; }

  // Physical address (compliance)
  const hasAddress = /\d+\s+\w+\s+(st|ave|rd|blvd|ln|dr|way|ct)/i.test(text);
  if (!hasAddress) { feedback.push('Missing physical address — required by CAN-SPAM'); score -= 10; }

  // Length
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 50) { feedback.push('Email body too short — add more value before the CTA'); score -= 10; }
  else if (wordCount > 500) { feedback.push('Email body too long — keep under 400 words for best engagement'); score -= 5; }

  return { name: 'email_body', score: Math.min(100, Math.max(0, score)), weight: 1, feedback };
}
