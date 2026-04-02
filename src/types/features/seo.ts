/**
 * F10: SEO & Keywords Types
 *
 * On-page scoring, keyword research, content briefs, topic clusters,
 * ranking tracking, competitor gap analysis, content decay, cannibalization.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// SEO REPORT — workspaces/{workspaceId}/seo_reports/{reportId}
// ═══════════════════════════════════════════════════════════

export type SEOReportType =
  | 'on_page_audit'
  | 'keyword_research'
  | 'competitor_gap'
  | 'content_brief'
  | 'ranking_snapshot'
  | 'content_decay'
  | 'cannibalization';

export type SearchIntent = 'informational' | 'navigational' | 'transactional' | 'commercial';

export type SERPFeature =
  | 'featured_snippet' | 'people_also_ask' | 'local_pack' | 'image_pack'
  | 'video' | 'knowledge_panel' | 'sitelinks' | 'ai_overview'
  | 'top_stories' | 'shopping' | 'reviews';

export type SEOSuggestionType =
  | 'keyword_density' | 'meta_title' | 'meta_description' | 'heading_structure'
  | 'readability' | 'content_length' | 'internal_links' | 'external_links'
  | 'image_alt' | 'image_size' | 'schema_markup' | 'featured_snippet'
  | 'mobile_friendly' | 'page_speed' | 'url_structure';

export interface SEOSuggestion {
  type: SEOSuggestionType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  currentValue?: string;
  recommendedValue?: string;
  impactScore?: number;               // 0-100, how much fixing this helps
}

// ─── On-Page SEO Score ──────────────────────────────────────
export interface OnPageSEOScore {
  overallScore: number;                // 0-100
  keywordDensity: { score: number; current: number; recommended: { min: number; max: number } };
  metaTitle: { score: number; length: number; hasKeyword: boolean; recommended: string };
  metaDescription: { score: number; length: number; hasKeyword: boolean };
  headingStructure: { score: number; h1Count: number; h2Count: number; hasKeywordInH1: boolean };
  readability: { score: number; gradeLevel: string; sentenceCount: number; avgWordsPerSentence: number };
  contentLength: { score: number; wordCount: number; recommended: number };
  internalLinks: { score: number; count: number; recommended: number };
  imageAudit: { score: number; totalImages: number; missingAlt: number; oversized: number };
  suggestions: SEOSuggestion[];
}

// ─── Keyword Data ───────────────────────────────────────────
export interface KeywordData {
  keyword: string;
  searchVolume: number;                // Monthly search volume
  difficulty: number;                  // 0-100
  cpc?: number;                        // Cost per click (cents)
  intent: SearchIntent;
  serpFeatures: SERPFeature[];
  trend?: number[];                    // 12-month search volume trend
  relatedKeywords?: string[];
}

// ─── Topic Cluster ──────────────────────────────────────────
export interface TopicCluster {
  id: string;
  workspaceId: string;
  pillarKeyword: string;
  pillarUrl?: string;
  pillarDraftId?: string;
  clusterKeywords: {
    keyword: string;
    volume: number;
    difficulty: number;
    intent: SearchIntent;
    assignedDraftId?: string;
    status: 'uncovered' | 'draft' | 'published';
  }[];
  totalVolume: number;
  avgDifficulty: number;
  coveragePercent: number;             // % of cluster keywords with content
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ─── Content Brief ──────────────────────────────────────────
export interface ContentBrief {
  targetKeyword: string;
  targetWordCount: { min: number; max: number; recommended: number };
  targetHeadingCount: number;
  targetImageCount: number;
  suggestedHeadings: { tag: 'h2' | 'h3' | 'h4'; text: string }[];
  questionsToAnswer: string[];         // People Also Ask
  nlpTerms: { term: string; importance: number; recommendedCount: number }[];
  relatedKeywords: { keyword: string; volume: number; relevanceScore: number }[];
  competitorAnalysis: { url: string; wordCount: number; contentScore: number; headings: string[] }[];
  contentScore: number;                // 0-100 target
  readabilityTarget: string;           // Grade level
  searchIntent: SearchIntent;
}

// ─── Ranking Entry ──────────────────────────────────────────
export interface RankingEntry {
  keyword: string;
  url: string;
  position: number;                    // 1-100
  previousPosition?: number;
  positionDelta?: number;
  searchVolume: number;
  serpFeatures: SERPFeature[];
  checkedAt: FirestoreTimestamp;
}

// ─── Content Decay ──────────────────────────────────────────
export interface ContentDecaySignal {
  pageUrl: string;
  contentDraftId?: string;
  keyword: string;
  peakRanking: number;
  peakDate: string;
  currentRanking: number;
  positionDelta: number;
  trafficDropPercent: number;
  lastChecked: string;
  status: 'stable' | 'declining' | 'critical';
  suggestedAction?: string;
}

// ─── Cannibalization ────────────────────────────────────────
export interface CannibalizationGroup {
  keyword: string;
  competingPageUrls: string[];
  competingDraftIds: string[];
  recommendedCanonical: string;
  severity: 'low' | 'medium' | 'high';
}

// ─── Featured Snippet ───────────────────────────────────────
export interface FeaturedSnippetOpportunity {
  keyword: string;
  snippetType: 'paragraph' | 'list' | 'table' | 'video';
  currentHolder?: string;              // Competitor URL
  isOpportunity: boolean;
  suggestedFormat: string;
  suggestedContent?: string;
}

// ─── Schema Markup ──────────────────────────────────────────
export interface SchemaMarkupAudit {
  schemaType: 'Article' | 'HowTo' | 'FAQ' | 'Product' | 'Recipe' | 'LocalBusiness' | 'BreadcrumbList';
  isValid: boolean;
  errors: { path: string; message: string; severity: 'error' | 'warning' }[];
}

// ─── Page Experience ────────────────────────────────────────
export interface PageExperienceSignals {
  coreWebVitals?: { lcp: number; fid: number; cls: number; status: 'good' | 'needs_improvement' | 'poor' };
  mobileFriendly: boolean;
  httpsEnabled: boolean;
  pageSpeedScore: number;              // 0-100
  noIntrusiveInterstitials: boolean;
}

// ─── Main SEO Report ────────────────────────────────────────
export interface SEOReport {
  id: string;
  workspaceId: string;
  type: SEOReportType;
  contentDraftId?: string;
  targetKeyword?: string;
  clientId?: string;

  // On-page analysis
  onPageScore?: OnPageSEOScore;

  // Keyword research
  keywords?: KeywordData[];

  // Content brief
  brief?: ContentBrief;

  // Rankings
  rankings?: RankingEntry[];

  // Competitor gap
  competitorUrls?: string[];
  contentGaps?: { keyword: string; competitorUrls: string[]; difficulty: number }[];

  // Topic cluster
  topicCluster?: TopicCluster;

  // Content decay
  decaySignals?: ContentDecaySignal[];

  // Cannibalization
  cannibalizationGroups?: CannibalizationGroup[];

  // Featured snippets
  snippetOpportunities?: FeaturedSnippetOpportunity[];

  // Schema markup
  schemaAudit?: SchemaMarkupAudit;

  // Page experience
  pageExperience?: PageExperienceSignals;

  // SERP features present for target keyword
  serpFeatures?: SERPFeature[];

  // Metadata
  dataSource: 'live' | 'mock';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
