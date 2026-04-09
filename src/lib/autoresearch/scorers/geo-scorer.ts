/**
 * GEO Scorer for Autoresearch Engine
 * Scores content for AI search citability (GEO) alongside SEO.
 */

import { scoreGeoCitability } from '@/lib/geo/geo-scorer';
import type { ScoreResult, ScorerContext } from '../types';

export async function scoreGeo(content: string, context: ScorerContext): Promise<ScoreResult> {
  const title = context.title ?? '';
  const result = scoreGeoCitability(content, title, {
    hasSchemaMarkup: false, // Would need page-level check in production
    hasFaqSection: /<h[2-4][^>]*>.*\?<\/h[2-4]>/i.test(content),
    hasLastUpdated: /last updated|updated on|modified/i.test(content),
    authorBio: /about the author|written by|by [A-Z]/i.test(content),
  });

  return {
    name: 'geo',
    score: result.overallScore,
    weight: 1,
    feedback: result.suggestions,
    details: {
      directAnswers: result.dimensions.directAnswers.score,
      structuredData: result.dimensions.structuredData.score,
      entityAuthority: result.dimensions.entityAuthority.score,
      contentStructure: result.dimensions.contentStructure.score,
      freshness: result.dimensions.freshness.score,
      citationReadiness: result.dimensions.citationReadiness.score,
    },
  };
}
