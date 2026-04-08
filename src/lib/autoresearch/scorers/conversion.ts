/**
 * Conversion Copy Scorer — Scores landing page copy, CTAs, ad text
 * Measures: urgency, benefit-focus, social proof, clarity, specificity
 */

import type { ScoreResult, ScorerContext } from '../types';

export async function scoreConversionCopy(content: string, _context: ScorerContext): Promise<ScoreResult> {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const feedback: string[] = [];
  let score = 60;

  // 1. Benefit-focused language (vs feature-focused)
  const benefitWords = /save|grow|increase|boost|improve|transform|achieve|unlock|discover|get|gain|earn|reduce|eliminate|simplify/i;
  const benefitCount = (text.match(benefitWords) ?? []).length;
  if (benefitCount >= 3) { score += 15; }
  else if (benefitCount >= 1) { score += 8; }
  else { feedback.push('Focus on benefits over features — what does the user GAIN? Use words like "save", "grow", "achieve"'); }

  // 2. Urgency/scarcity
  const urgencyWords = /limited|today|now|last chance|expires|hurry|only \d+|ending soon|don't miss|act fast/i;
  if (urgencyWords.test(text)) { score += 8; }
  else { feedback.push('Add urgency — "limited time", "starts today", or "only X spots left" increases conversion 20-30%'); }

  // 3. Social proof
  const socialProof = /\d+\+?\s*(agencies|clients|users|businesses|customers|teams|companies)|trusted by|used by|rated|stars|reviews|testimonial/i;
  if (socialProof.test(text)) { score += 10; }
  else { feedback.push('Add social proof — "500+ agencies trust us" or "4.9/5 rating" builds credibility'); }

  // 4. Specificity (numbers beat vague claims)
  const numbers = (text.match(/\d+/g) ?? []).length;
  if (numbers >= 2) { score += 8; }
  else { feedback.push('Add specific numbers — "save 15 hours/week" beats "save time". Specificity builds trust.'); }

  // 5. Clear CTA
  const strongCTA = /start free|try free|get started|book a demo|sign up free|claim your|start your trial/i;
  const weakCTA = /learn more|read more|click here|submit/i;
  if (strongCTA.test(text)) { score += 10; }
  else if (weakCTA.test(text)) { score += 3; feedback.push('Weak CTA — "Learn more" converts less than "Start your free trial" or "Book a demo"'); }
  else { feedback.push('No CTA found — add a clear action: "Start your free trial", "Book a demo", "Get started free"'); score -= 10; }

  // 6. "You" language (second person)
  const youCount = (text.match(/\byou\b|\byour\b|\byou're\b/g) ?? []).length;
  if (youCount >= 3) { score += 5; }
  else { feedback.push('Use more "you/your" language — speak directly to the reader, not about yourself'); }

  // 7. Risk reversal
  const riskReversal = /no credit card|cancel anytime|money.back|free trial|no obligation|risk.free|30.day|14.day|15.day/i;
  if (riskReversal.test(text)) { score += 8; }
  else { feedback.push('Add risk reversal — "No credit card required", "Cancel anytime" reduces signup friction'); }

  // 8. Power words
  const powerWords = /exclusive|proven|guaranteed|instant|revolutionary|effortless|breakthrough|secret|ultimate/i;
  if (powerWords.test(text)) { score += 5; }

  return {
    name: 'conversion',
    score: Math.min(100, Math.max(0, Math.round(score))),
    weight: 1,
    feedback,
    details: { benefitCount, numbers, youCount },
  };
}
