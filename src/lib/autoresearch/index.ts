/**
 * Autoresearch Public API
 *
 * Single entry point for all auto-improvement features.
 * Any feature in the app calls autoImprove() with a use case key.
 *
 * Usage:
 *   import { autoImprove, scoreContent } from '@/lib/autoresearch';
 *
 *   // Auto-improve content through the loop
 *   const result = await autoImprove('linkedin_post', prompt, {
 *     workspaceId: 'ws_123',
 *     brandVoice: { tone: 'professional', ... },
 *     platform: 'linkedin',
 *     generateFn: async (p, feedback) => callClaude(p, feedback),
 *   });
 *
 *   // Or just score content without improving
 *   const scores = await scoreContent('blog_post', content, context);
 */

import { runAutoResearch } from './engine';
import { getPreset, getMaxIterationsForTier } from './scorers/registry';
import { buildScorerConfigs } from './scorers/composite';
import { scoreComposite } from './scorers/composite';
import type { AutoResearchResult, IterationResult, ScorerContext, ScoreResult } from './types';

export type { AutoResearchResult, IterationResult, ScorerContext, ScoreResult };

interface AutoImproveOptions {
  workspaceId: string;
  brandVoice?: ScorerContext['brandVoice'];
  platform?: string;
  contentType?: string;
  targetKeyword?: string;
  targetWordCount?: number;
  title?: string;
  tier?: string;                        // Pricing tier for iteration limits
  maxIterations?: number;               // Override preset max iterations
  threshold?: number;                   // Override preset threshold
  onIteration?: (result: IterationResult) => void;
  generateFn: (prompt: string, feedback: string[], iteration: number) => Promise<string>;
}

/**
 * Auto-improve content using the autoresearch loop.
 *
 * @param useCase - Key from the use case registry (e.g., 'blog_post', 'linkedin_post', 'email_subject')
 * @param prompt - The generation prompt
 * @param options - Configuration including workspace context and generate function
 */
export async function autoImprove(
  useCase: string,
  prompt: string,
  options: AutoImproveOptions,
): Promise<AutoResearchResult> {
  const preset = getPreset(useCase, options.platform);
  if (!preset) {
    throw new Error(`Unknown autoresearch use case: ${useCase}. Available: blog_post, linkedin_post, twitter_post, instagram_post, email_subject, email_body, landing_page, ad_copy, etc.`);
  }

  // Build scorer configs from preset
  const scorers = buildScorerConfigs(preset.scorerNames, preset.scorerWeights);

  // Determine max iterations (tier-gated or override)
  const tierMaxIterations = options.tier
    ? getMaxIterationsForTier(preset, options.tier)
    : preset.defaultMaxIterations;
  const maxIterations = options.maxIterations ?? tierMaxIterations;

  // Build context
  const context: ScorerContext = {
    workspaceId: options.workspaceId,
    brandVoice: options.brandVoice,
    platform: options.platform ?? useCase.split('_')[0],
    contentType: options.contentType ?? useCase,
    targetKeyword: options.targetKeyword,
    targetWordCount: options.targetWordCount,
    title: options.title,
  };

  return runAutoResearch('', prompt, {
    useCase,
    maxIterations,
    threshold: options.threshold ?? preset.defaultThreshold,
    scorers,
    context,
    generateFn: options.generateFn,
    onIteration: options.onIteration,
  });
}

/**
 * Score content without running the improvement loop.
 * Use this for display purposes (show score badge on existing content).
 *
 * @param useCase - Key from the use case registry
 * @param content - The content to score
 * @param context - Workspace/brand context for scoring
 */
export async function scoreContent(
  useCase: string,
  content: string,
  context: ScorerContext,
): Promise<{ composite: number; scores: ScoreResult[] }> {
  const preset = getPreset(useCase, context.platform);
  if (!preset) {
    throw new Error(`Unknown autoresearch use case: ${useCase}`);
  }

  return scoreComposite(content, context, preset.scorerNames, preset.scorerWeights);
}

/**
 * Get available use cases and their descriptions.
 */
export { USE_CASE_PRESETS } from './scorers/registry';
