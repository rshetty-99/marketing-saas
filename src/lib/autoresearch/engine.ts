/**
 * Autoresearch Engine — Core Loop
 * Inspired by Karpathy's autoresearch pattern.
 *
 * Generate → Score → Evaluate → Improve → Repeat
 *
 * One engine, many scorers, pluggable into any feature.
 */

import type { AutoResearchConfig, AutoResearchResult, IterationResult, ScoreResult } from './types';

/**
 * Run the autoresearch improvement loop.
 *
 * @param initialContent - Starting content (can be empty for generation from scratch)
 * @param prompt - The generation prompt
 * @param config - Full configuration including scorers, thresholds, and generate function
 * @returns AutoResearchResult with best content, scores, and iteration history
 */
export async function runAutoResearch(
  initialContent: string,
  prompt: string,
  config: AutoResearchConfig,
): Promise<AutoResearchResult> {
  const startTime = Date.now();
  const iterations: IterationResult[] = [];
  let bestContent = initialContent;
  let bestScore = 0;
  let bestScores: ScoreResult[] = [];
  let allFeedback: string[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let i = 0; i < config.maxIterations; i++) {
    // 1. GENERATE (or use initial content on first iteration if provided)
    let content: string;
    if (i === 0 && initialContent) {
      content = initialContent;
    } else {
      content = await config.generateFn(prompt, allFeedback, i);
    }

    // 2. SCORE — run all scorers in parallel
    const scoreResults = await Promise.all(
      config.scorers.map((scorer) => scorer.scoreFn(content, config.context)),
    );

    // 3. COMPUTE composite score (weighted average)
    const totalWeight = scoreResults.reduce((sum, s) => sum + s.weight, 0);
    const compositeScore = totalWeight > 0
      ? scoreResults.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
      : 0;

    // Merge all feedback
    const iterationFeedback = scoreResults.flatMap((s) => s.feedback);

    // Record iteration
    const iteration: IterationResult = {
      iteration: i + 1,
      content,
      compositeScore: Math.round(compositeScore * 10) / 10,
      scores: scoreResults,
      feedback: iterationFeedback,
      timestamp: Date.now(),
    };
    iterations.push(iteration);

    // 4. EVALUATE — is this the best so far?
    if (compositeScore > bestScore) {
      bestContent = content;
      bestScore = compositeScore;
      bestScores = scoreResults;
    }

    // Notify progress
    if (config.onIteration) {
      config.onIteration(iteration);
    }

    // 5. CHECK THRESHOLD — are we done?
    if (compositeScore >= config.threshold) {
      return {
        content: bestContent,
        compositeScore: Math.round(bestScore * 10) / 10,
        scores: bestScores,
        iterations,
        totalIterations: i + 1,
        reachedThreshold: true,
        durationMs: Date.now() - startTime,
        tokensUsed: { input: totalInputTokens, output: totalOutputTokens },
      };
    }

    // 6. PREPARE FEEDBACK for next iteration
    allFeedback = iterationFeedback;
  }

  // Max iterations reached — return best attempt
  return {
    content: bestContent,
    compositeScore: Math.round(bestScore * 10) / 10,
    scores: bestScores,
    iterations,
    totalIterations: config.maxIterations,
    reachedThreshold: false,
    durationMs: Date.now() - startTime,
    tokensUsed: { input: totalInputTokens, output: totalOutputTokens },
  };
}
