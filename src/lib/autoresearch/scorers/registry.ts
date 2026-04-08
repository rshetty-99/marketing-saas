/**
 * Use Case Registry — Maps feature use cases to scorer configurations
 *
 * Usage:
 *   const preset = USE_CASE_PRESETS['linkedin_post'];
 *   const configs = buildScorerConfigs(preset.scorerNames, preset.scorerWeights);
 */

import type { UseCasePreset } from '../types';

export const USE_CASE_PRESETS: Record<string, UseCasePreset> = {
  // ── Content Generation ─────────────────────────────────
  blog_post: {
    name: 'Blog Post',
    description: 'Long-form blog content optimized for SEO and readability',
    defaultThreshold: 80,
    defaultMaxIterations: 3,
    scorerNames: ['seo', 'readability', 'brand_voice', 'platform'],
    scorerWeights: [0.35, 0.25, 0.20, 0.20],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },
  linkedin_post: {
    name: 'LinkedIn Post',
    description: 'Professional social post for LinkedIn',
    defaultThreshold: 78,
    defaultMaxIterations: 3,
    scorerNames: ['brand_voice', 'platform', 'readability'],
    scorerWeights: [0.40, 0.35, 0.25],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },
  twitter_post: {
    name: 'Twitter/X Post',
    description: 'Short-form tweet optimized for engagement',
    defaultThreshold: 75,
    defaultMaxIterations: 2,
    scorerNames: ['brand_voice', 'platform'],
    scorerWeights: [0.45, 0.55],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },
  instagram_post: {
    name: 'Instagram Caption',
    description: 'Visual-first caption with hashtags',
    defaultThreshold: 76,
    defaultMaxIterations: 2,
    scorerNames: ['brand_voice', 'platform', 'readability'],
    scorerWeights: [0.35, 0.40, 0.25],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },
  facebook_post: {
    name: 'Facebook Post',
    description: 'Conversational social post for Facebook',
    defaultThreshold: 75,
    defaultMaxIterations: 2,
    scorerNames: ['brand_voice', 'platform', 'readability'],
    scorerWeights: [0.35, 0.40, 0.25],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },
  tiktok_post: {
    name: 'TikTok Caption',
    description: 'Casual, trend-aware caption',
    defaultThreshold: 72,
    defaultMaxIterations: 2,
    scorerNames: ['brand_voice', 'platform'],
    scorerWeights: [0.40, 0.60],
    tierLimits: { starter: 1, growth: 2, agency: 2, agency_pro: 3, white_label: 3 },
  },
  youtube_description: {
    name: 'YouTube Description',
    description: 'Video description with timestamps and links',
    defaultThreshold: 75,
    defaultMaxIterations: 2,
    scorerNames: ['seo', 'platform', 'readability'],
    scorerWeights: [0.35, 0.35, 0.30],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },

  // ── Email ──────────────────────────────────────────────
  email_subject: {
    name: 'Email Subject Line',
    description: 'Optimized for open rates',
    defaultThreshold: 80,
    defaultMaxIterations: 3,
    scorerNames: ['email_subject', 'brand_voice'],
    scorerWeights: [0.65, 0.35],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },
  email_body: {
    name: 'Email Campaign Body',
    description: 'Email content with compliance and conversion',
    defaultThreshold: 78,
    defaultMaxIterations: 3,
    scorerNames: ['email_body', 'readability', 'brand_voice', 'conversion'],
    scorerWeights: [0.30, 0.20, 0.20, 0.30],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },

  // ── Landing Pages & Ads ────────────────────────────────
  landing_page: {
    name: 'Landing Page Copy',
    description: 'Conversion-optimized page content',
    defaultThreshold: 80,
    defaultMaxIterations: 3,
    scorerNames: ['conversion', 'readability', 'seo', 'brand_voice'],
    scorerWeights: [0.35, 0.20, 0.25, 0.20],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },
  ad_copy: {
    name: 'Ad Copy',
    description: 'Paid social or search ad text',
    defaultThreshold: 78,
    defaultMaxIterations: 3,
    scorerNames: ['conversion', 'platform', 'brand_voice'],
    scorerWeights: [0.45, 0.30, 0.25],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 5, white_label: 5 },
  },

  // ── Repurposing ────────────────────────────────────────
  repurpose_to_social: {
    name: 'Content Repurpose (Social)',
    description: 'Adapt long-form content to social platform',
    defaultThreshold: 76,
    defaultMaxIterations: 2,
    scorerNames: ['brand_voice', 'platform', 'readability'],
    scorerWeights: [0.30, 0.45, 0.25],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },

  // ── Reports & Summaries ────────────────────────────────
  client_report_summary: {
    name: 'Client Report Summary',
    description: 'Executive summary for client reports',
    defaultThreshold: 80,
    defaultMaxIterations: 2,
    scorerNames: ['readability', 'brand_voice'],
    scorerWeights: [0.55, 0.45],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },

  // ── Chatbot ────────────────────────────────────────────
  chatbot_response: {
    name: 'Chatbot Response',
    description: 'AI chatbot reply optimized for helpfulness',
    defaultThreshold: 75,
    defaultMaxIterations: 2,
    scorerNames: ['readability', 'brand_voice', 'conversion'],
    scorerWeights: [0.30, 0.35, 0.35],
    tierLimits: { starter: 1, growth: 1, agency: 2, agency_pro: 2, white_label: 2 },
  },

  // ── SEO Content Brief ──────────────────────────────────
  seo_brief: {
    name: 'SEO Content Brief',
    description: 'Content brief optimized for keyword targeting',
    defaultThreshold: 80,
    defaultMaxIterations: 2,
    scorerNames: ['seo', 'readability'],
    scorerWeights: [0.65, 0.35],
    tierLimits: { starter: 1, growth: 2, agency: 3, agency_pro: 3, white_label: 3 },
  },
};

/**
 * Get the use case preset, with platform auto-detection.
 */
export function getPreset(useCase: string, platform?: string): UseCasePreset | null {
  // Try exact match first
  if (USE_CASE_PRESETS[useCase]) return USE_CASE_PRESETS[useCase];

  // Auto-detect from platform
  if (platform) {
    const platformKey = `${platform}_post`;
    if (USE_CASE_PRESETS[platformKey]) return USE_CASE_PRESETS[platformKey];
  }

  return null;
}

/**
 * Get max iterations for a tier.
 */
export function getMaxIterationsForTier(preset: UseCasePreset, tier: string): number {
  return preset.tierLimits[tier as keyof typeof preset.tierLimits] ?? 1;
}
