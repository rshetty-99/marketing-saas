/**
 * GEO (Generative Engine Optimization) Types
 * AI search optimization — get cited by ChatGPT, Perplexity, Claude, Copilot, Google AI Overviews.
 */

import type { FirestoreTimestamp } from './f0';

// ── GEO Citability Score ───────────────────────────────────

export interface GeoCitabilityScore {
  overallScore: number;               // 0-100
  dimensions: {
    directAnswers: GeoScoreDimension;      // Does content lead with clear answers?
    structuredData: GeoScoreDimension;     // Schema markup (Article, FAQ, HowTo)
    entityAuthority: GeoScoreDimension;    // Brand mentions, author credibility
    contentStructure: GeoScoreDimension;   // H2/H3 hierarchy, FAQ sections, TL;DR
    freshness: GeoScoreDimension;          // Last updated, current data, recent sources
    citationReadiness: GeoScoreDimension;  // Quotable passages, stats, unique data
  };
  suggestions: string[];
}

export interface GeoScoreDimension {
  name: string;
  score: number;                      // 0-100
  weight: number;
  findings: string[];
  recommendations: string[];
}

// ── AI Crawler Audit ───────────────────────────────────────

export type AICrawler = 'GPTBot' | 'ClaudeBot' | 'PerplexityBot' | 'GoogleOther' | 'CohereBot' | 'Meta-ExternalAgent';

export interface CrawlerAuditResult {
  crawler: AICrawler;
  allowed: boolean;
  source: 'robots.txt' | 'not_found' | 'default_allow';
  details: string;
}

export interface AICrawlerAudit {
  id: string;
  workspaceId: string;
  url: string;
  crawlers: CrawlerAuditResult[];
  hasLlmsTxt: boolean;
  llmsTxtUrl?: string;
  overallStatus: 'all_allowed' | 'some_blocked' | 'all_blocked' | 'unknown';
  recommendations: string[];
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ── Schema Markup ──────────────────────────────────────────

export type SchemaType = 'Article' | 'FAQ' | 'HowTo' | 'Organization' | 'Person' | 'Product' | 'Breadcrumb' | 'WebSite' | 'LocalBusiness';

export interface SchemaMarkup {
  type: SchemaType;
  jsonLd: Record<string, unknown>;    // The actual JSON-LD object
  description: string;
}

// ── Citation Tracking ──────────────────────────────────────

export type AIEngine = 'chatgpt' | 'perplexity' | 'claude' | 'copilot' | 'google_ai' | 'gemini';

export interface CitationRecord {
  id: string;
  workspaceId: string;
  engine: AIEngine;
  query: string;                      // The query that triggered the citation
  citedUrl: string;
  citedText: string;                  // The excerpt that was cited
  sentiment: 'positive' | 'neutral' | 'negative';
  position: number;                   // 1st, 2nd, 3rd citation in the response
  detectedAt: FirestoreTimestamp;
}

export interface ShareOfVoice {
  workspaceId: string;
  period: string;                     // e.g., '2026-04'
  brandCitations: number;
  competitorCitations: { competitor: string; count: number }[];
  totalCitationsInCategory: number;
  sharePercent: number;               // brand / total * 100
  engines: { engine: AIEngine; citations: number }[];
}

// ── GEO Report ─────────────────────────────────────────────

export interface GeoReport {
  id: string;
  workspaceId: string;
  type: 'citability_score' | 'crawler_audit' | 'citation_tracking' | 'share_of_voice' | 'content_geo_audit';
  url?: string;
  contentDraftId?: string;
  data: Record<string, unknown>;
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ── llms.txt ───────────────────────────────────────────────

export interface LlmsTxtConfig {
  workspaceId: string;
  companyName: string;
  description: string;
  keyTopics: string[];
  preferredCitations: string[];       // URLs to prefer citing
  doNotCite: string[];                // URLs/topics to avoid
  brandGuidelines: string;
  lastGenerated?: FirestoreTimestamp;
}
