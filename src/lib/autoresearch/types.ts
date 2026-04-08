/**
 * Autoresearch Engine — Type Definitions
 * Inspired by Karpathy's autoresearch: Modify → Score → Keep/Discard → Repeat
 */

/** Individual score from a single scorer */
export interface ScoreResult {
  name: string;                       // e.g., 'seo', 'readability', 'brand_voice'
  score: number;                      // 0-100
  weight: number;                     // Multiplier for composite score
  feedback: string[];                 // Actionable improvement suggestions
  details?: Record<string, unknown>;  // Scorer-specific metadata
}

/** Combined result from all scorers for one iteration */
export interface IterationResult {
  iteration: number;
  content: string;
  compositeScore: number;             // Weighted average of all scores
  scores: ScoreResult[];
  feedback: string[];                 // All feedback merged
  timestamp: number;
}

/** Final output from the autoresearch loop */
export interface AutoResearchResult {
  content: string;                    // Best content produced
  compositeScore: number;             // Final composite score
  scores: ScoreResult[];              // Detailed score breakdown
  iterations: IterationResult[];      // Full history of all iterations
  totalIterations: number;
  reachedThreshold: boolean;
  durationMs: number;
  tokensUsed: { input: number; output: number };
}

/** Configuration for a single scorer */
export interface ScorerConfig {
  name: string;
  weight: number;                     // 0-1, all weights should sum to 1
  scoreFn: (content: string, context: ScorerContext) => Promise<ScoreResult>;
}

/** Context passed to every scorer — contains workspace data needed for scoring */
export interface ScorerContext {
  workspaceId: string;
  brandVoice?: {
    tone: string;
    personalityTraits: string[];
    formalityLevel: number;
    toneDescriptors: string[];
    targetAudience: string;
  };
  platform?: string;                  // 'linkedin', 'twitter', 'instagram', 'blog', 'email'
  contentType?: string;               // 'blog_post', 'social_post', 'email_subject', 'email_body', 'ad_copy', 'landing_page'
  targetKeyword?: string;
  targetWordCount?: number;
  title?: string;
  additionalContext?: Record<string, unknown>;
}

/** Full configuration for an autoresearch run */
export interface AutoResearchConfig {
  useCase: string;                    // Key into the scorer registry
  maxIterations: number;              // Safety limit
  threshold: number;                  // Composite score to beat (0-100)
  scorers: ScorerConfig[];            // Array of scorers with weights
  context: ScorerContext;             // Workspace/brand context
  generateFn: (prompt: string, feedback: string[], iteration: number) => Promise<string>;
  onIteration?: (result: IterationResult) => void; // Progress callback
}

/** Preset use case config from the registry */
export interface UseCasePreset {
  name: string;
  description: string;
  defaultThreshold: number;
  defaultMaxIterations: number;
  scorerNames: string[];              // Which scorers to use
  scorerWeights: number[];            // Weight per scorer
  tierLimits: {                       // Max iterations per pricing tier
    starter: number;
    growth: number;
    agency: number;
    agency_pro: number;
    white_label: number;
  };
}
