/**
 * Composite Scorer — Combines multiple scorers with configurable weights
 */

import type { ScoreResult, ScorerConfig, ScorerContext } from '../types';
import { scoreSEO } from './seo-scorer';
import { scoreReadability } from './readability';
import { scoreBrandVoice } from './brand-voice';
import { scorePlatformCompliance } from './platform';
import { scoreEmailSubject, scoreEmailBody } from './email';
import { scoreConversionCopy } from './conversion';
import { scoreGeo } from './geo-scorer';

/** Registry of all available scorers */
export const SCORER_FUNCTIONS: Record<string, (content: string, context: ScorerContext) => Promise<ScoreResult>> = {
  seo: scoreSEO,
  geo: scoreGeo,
  readability: scoreReadability,
  brand_voice: scoreBrandVoice,
  platform: scorePlatformCompliance,
  email_subject: scoreEmailSubject,
  email_body: scoreEmailBody,
  conversion: scoreConversionCopy,
};

/**
 * Build an array of ScorerConfig from scorer names and weights.
 */
export function buildScorerConfigs(
  scorerNames: string[],
  weights: number[],
): ScorerConfig[] {
  return scorerNames.map((name, i) => {
    const fn = SCORER_FUNCTIONS[name];
    if (!fn) throw new Error(`Unknown scorer: ${name}`);
    return {
      name,
      weight: weights[i] ?? 1,
      scoreFn: fn,
    };
  });
}

/**
 * Score content with multiple scorers and return all results + composite.
 */
export async function scoreComposite(
  content: string,
  context: ScorerContext,
  scorerNames: string[],
  weights: number[],
): Promise<{ composite: number; scores: ScoreResult[] }> {
  const configs = buildScorerConfigs(scorerNames, weights);
  const scores = await Promise.all(
    configs.map((c) => c.scoreFn(content, context)),
  );

  // Apply weights from config (override the scorer's default weight)
  scores.forEach((s, i) => { s.weight = weights[i] ?? 1; });

  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const composite = totalWeight > 0
    ? scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
    : 0;

  return { composite: Math.round(composite * 10) / 10, scores };
}
