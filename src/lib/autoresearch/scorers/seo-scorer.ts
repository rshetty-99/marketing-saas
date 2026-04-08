/**
 * SEO Scorer — Wraps the existing F10 SEO service
 */

import { scoreOnPageSEO } from '@/lib/f10/seo-service';
import type { ScoreResult, ScorerContext } from '../types';

export async function scoreSEO(content: string, context: ScorerContext): Promise<ScoreResult> {
  const keyword = context.targetKeyword ?? '';
  const title = context.title ?? '';

  const result = scoreOnPageSEO(content, title, keyword);
  const score = (result as unknown as Record<string, unknown>).overallScore as number ?? 50;

  const feedback: string[] = [];
  const suggestions = (result as unknown as Record<string, unknown>).suggestions as { message: string }[] | undefined;
  if (suggestions) {
    for (const s of suggestions) {
      feedback.push(s.message);
    }
  }

  if (!keyword) feedback.push('No focus keyword provided — add one for better SEO scoring');
  if (!title) feedback.push('No title provided — title tag is critical for SEO');

  return {
    name: 'seo',
    score: Math.min(100, Math.max(0, score)),
    weight: 1,
    feedback,
    details: result as unknown as Record<string, unknown>,
  };
}
