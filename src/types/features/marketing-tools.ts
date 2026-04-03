/**
 * Phase 9: Marketing Tools Types
 *
 * A/B Testing, Client Reports, Link Shortener, Hashtags,
 * Bulk Scheduling, Content Library, Saved Replies,
 * AI Content Scoring, Influencer Management, Video Editing,
 * Ad Campaigns, Visual Workflows, Competitor Benchmarking, RSS Auto-Post.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// A/B TESTING ENGINE
// ═══════════════════════════════════════════════════════════

export type ABTestType = 'email_subject' | 'email_content' | 'social_copy' | 'social_media' | 'landing_page' | 'cta';
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface ABTestVariant {
  id: string;
  label: string;                      // 'A', 'B', 'C', etc.
  content: Record<string, unknown>;   // Type-specific content
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  isWinner: boolean;
}

export interface ABTest {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  testType: ABTestType;
  status: ABTestStatus;

  // Variants
  variants: ABTestVariant[];
  trafficSplit: number[];             // e.g., [50, 50] or [33, 33, 34]

  // Configuration
  resourceId?: string;                // Campaign ID, landing page ID, etc.
  targetMetric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'engagement_rate';
  confidenceThreshold: number;        // Default 0.95
  minimumSampleSize: number;          // Min impressions before declaring winner
  autoSelectWinner: boolean;          // Auto-apply winner when confidence met

  // Results
  winnerVariantId?: string;
  statisticalSignificance?: number;   // 0-1
  completedAt?: FirestoreTimestamp;

  startedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// CLIENT REPORT BUILDER
// ═══════════════════════════════════════════════════════════

export type ReportFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'on_demand';
export type ReportFormat = 'pdf' | 'html' | 'csv';

export interface ReportSection {
  id: string;
  type: 'analytics_overview' | 'social_performance' | 'content_summary' | 'seo_snapshot' | 'email_stats' | 'lead_pipeline' | 'custom_text' | 'comparison_chart';
  title: string;
  config: Record<string, unknown>;
  order: number;
  isVisible: boolean;
}

export interface ReportTemplate {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  description?: string;
  sections: ReportSection[];
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    headerHtml?: string;
    footerHtml?: string;
    coverPageEnabled: boolean;
  };
  frequency: ReportFrequency;
  format: ReportFormat;
  recipientEmails: string[];
  scheduleDay?: number;               // Day of month (1-28) or day of week (0-6)
  scheduleTime?: string;              // HH:mm UTC
  lastGeneratedAt?: FirestoreTimestamp;
  lastSentAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  workspaceId: string;
  clientId?: string;
  periodStart: FirestoreTimestamp;
  periodEnd: FirestoreTimestamp;
  format: ReportFormat;
  fileUrl: string;
  fileSizeBytes: number;
  sentTo: string[];
  sentAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// LINK SHORTENER + UTM BUILDER
// ═══════════════════════════════════════════════════════════

export interface ShortLink {
  id: string;
  workspaceId: string;
  clientId?: string;
  originalUrl: string;
  shortCode: string;                  // Unique short code
  shortUrl: string;                   // Full short URL
  customAlias?: string;               // User-defined alias
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  clicks: number;
  uniqueClicks: number;
  lastClickedAt?: FirestoreTimestamp;
  expiresAt?: FirestoreTimestamp;
  isActive: boolean;
  tags: string[];
  qrCodeUrl?: string;                // Generated QR code
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface UTMTemplate {
  id: string;
  workspaceId: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  createdAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// HASHTAG RESEARCH & MANAGEMENT
// ═══════════════════════════════════════════════════════════

export interface HashtagGroup {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  hashtags: string[];
  platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'all';
  category: 'brand' | 'industry' | 'trending' | 'campaign' | 'location' | 'custom';
  usageCount: number;
  lastUsedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface HashtagAnalytics {
  hashtag: string;
  platform: string;
  postCount?: number;
  avgEngagement?: number;
  reachEstimate?: number;
  difficulty: 'low' | 'medium' | 'high';
  trending: boolean;
  relatedHashtags: string[];
  lastUpdatedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// BULK SCHEDULING / CSV IMPORT
// ═══════════════════════════════════════════════════════════

export type BulkImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

export interface BulkScheduleJob {
  id: string;
  workspaceId: string;
  clientId?: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
  status: BulkImportStatus;
  createdContentIds: string[];
  createdAt: FirestoreTimestamp;
  completedAt?: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// CONTENT LIBRARY / REUSABLE SNIPPETS
// ═══════════════════════════════════════════════════════════

export type SnippetType = 'text_block' | 'cta' | 'disclaimer' | 'hashtag_set' | 'signature' | 'bio' | 'boilerplate';

export interface ContentSnippet {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  content: string;
  snippetType: SnippetType;
  tags: string[];
  platform?: string;                  // Platform-specific or 'all'
  usageCount: number;
  isFavorite: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// SAVED REPLIES / RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════════

export interface SavedReply {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  shortcut?: string;                  // e.g., '/thanks' triggers this reply
  category: 'general' | 'support' | 'sales' | 'complaint' | 'follow_up' | 'custom';
  variables: string[];                // e.g., ['{{name}}', '{{company}}']
  platform?: string;                  // Platform-specific or all
  usageCount: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// AI CONTENT SCORING / PREDICTIVE PERFORMANCE
// ═══════════════════════════════════════════════════════════

export interface ContentScore {
  id: string;
  contentDraftId: string;
  workspaceId: string;

  // Overall score
  overallScore: number;               // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';

  // Sub-scores
  readabilityScore: number;
  engagementPrediction: number;       // Predicted engagement rate
  seoScore: number;
  brandAlignmentScore: number;
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed';
  viralPotential: 'low' | 'medium' | 'high';

  // Suggestions
  suggestions: {
    category: 'readability' | 'engagement' | 'seo' | 'brand' | 'hook' | 'cta';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }[];

  // Benchmark
  benchmarkPercentile: number;        // How this compares to industry avg (0-100)
  predictedReach?: number;
  predictedEngagementRate?: number;

  scoredAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// INFLUENCER DISCOVERY & MANAGEMENT
// ═══════════════════════════════════════════════════════════

export type InfluencerTier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
export type InfluencerStatus = 'discovered' | 'contacted' | 'negotiating' | 'active' | 'completed' | 'declined';

export interface Influencer {
  id: string;
  workspaceId: string;
  clientId?: string;

  // Profile
  name: string;
  handle: string;
  platform: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  engagementRate: number;
  tier: InfluencerTier;
  niche: string[];                    // e.g., ['fitness', 'wellness', 'nutrition']
  location?: string;
  language?: string;

  // Relationship
  status: InfluencerStatus;
  contactEmail?: string;
  contactPhone?: string;
  assignedTo?: string;
  notes: string;

  // Campaign tracking
  campaignIds: string[];
  totalSpend: number;
  totalImpressions: number;
  totalEngagement: number;
  roi?: number;
  costPerEngagement?: number;

  tags: string[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface InfluencerCampaign {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  influencerIds: string[];
  budget: number;
  spent: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: FirestoreTimestamp;
  endDate: FirestoreTimestamp;
  deliverables: {
    type: 'post' | 'story' | 'reel' | 'video' | 'review';
    platform: string;
    quantity: number;
    completed: number;
  }[];
  totalReach: number;
  totalEngagement: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// VIDEO EDITING / REELS CREATOR
// ═══════════════════════════════════════════════════════════

export type VideoProjectStatus = 'editing' | 'rendering' | 'completed' | 'failed';

export interface VideoProject {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  status: VideoProjectStatus;

  // Composition
  width: number;
  height: number;
  durationSeconds: number;
  fps: number;
  clips: VideoClip[];
  overlays: VideoOverlay[];
  audioTrack?: { url: string; volume: number; startAt: number };

  // Output
  outputUrl?: string;
  thumbnailUrl?: string;
  outputFormat: 'mp4' | 'mov' | 'webm';
  outputSizeBytes?: number;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface VideoClip {
  id: string;
  sourceUrl: string;
  startTime: number;
  endTime: number;
  order: number;
  trim: { start: number; end: number };
  transitions?: { type: 'fade' | 'slide' | 'dissolve'; durationMs: number };
}

export interface VideoOverlay {
  id: string;
  type: 'text' | 'image' | 'logo' | 'caption';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  startTime: number;
  endTime: number;
  style: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════
// AD CAMPAIGN MANAGEMENT
// ═══════════════════════════════════════════════════════════

export type AdPlatform = 'meta' | 'google' | 'linkedin' | 'twitter' | 'tiktok' | 'pinterest';
export type AdCampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';
export type AdObjective = 'awareness' | 'traffic' | 'engagement' | 'leads' | 'conversions' | 'app_installs';

export interface AdCampaign {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  platform: AdPlatform;
  externalCampaignId?: string;        // Platform's campaign ID
  status: AdCampaignStatus;
  objective: AdObjective;

  // Budget
  dailyBudget: number;
  totalBudget: number;
  currency: string;
  spent: number;

  // Targeting
  targeting: {
    locations: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: string[];
    interests?: string[];
    customAudiences?: string[];
    lookalikes?: string[];
  };

  // Creatives
  adSets: AdSet[];

  // Performance
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;

  startDate: FirestoreTimestamp;
  endDate?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface AdSet {
  id: string;
  name: string;
  headline: string;
  description: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'carousel';
  callToAction: string;
  landingPageUrl: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

// ═══════════════════════════════════════════════════════════
// VISUAL WORKFLOW BUILDER
// ═══════════════════════════════════════════════════════════

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'split' | 'end';
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface VisualWorkflow {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'form_submit' | 'lead_created' | 'tag_added' | 'date_trigger' | 'webhook' | 'manual';
  enrollmentCount: number;
  completionCount: number;
  lastTriggeredAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// COMPETITOR SOCIAL BENCHMARKING
// ═══════════════════════════════════════════════════════════

export interface CompetitorProfile {
  id: string;
  workspaceId: string;
  name: string;
  websiteUrl?: string;
  socialAccounts: {
    platform: string;
    handle: string;
    followerCount: number;
    engagementRate: number;
    lastUpdatedAt: FirestoreTimestamp;
  }[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface BenchmarkSnapshot {
  id: string;
  workspaceId: string;
  competitorId: string;
  platform: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    followers: number;
    followerGrowth: number;
    postsPublished: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    engagementRate: number;
    topPostUrl?: string;
  };
  snapshotDate: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// RSS-TO-SOCIAL AUTO-POSTING
// ═══════════════════════════════════════════════════════════

export interface RSSFeed {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  feedUrl: string;
  isActive: boolean;
  pollIntervalMinutes: number;        // Default 60
  lastPolledAt?: FirestoreTimestamp;
  lastItemPublishedAt?: FirestoreTimestamp;

  // Auto-post config
  autoPost: boolean;
  postTo: { platform: string; connectionId: string }[];
  contentTemplate: string;            // e.g., '{{title}} - {{link}} #blog'
  includeImage: boolean;
  maxPostsPerPoll: number;            // Default 3

  // Filters
  titleFilter?: string;               // Regex to match titles
  categoryFilter?: string[];

  itemsProcessed: number;
  itemsPosted: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface RSSItem {
  id: string;
  feedId: string;
  workspaceId: string;
  title: string;
  link: string;
  description?: string;
  imageUrl?: string;
  publishedAt: FirestoreTimestamp;
  autoPosted: boolean;
  postedContentIds: string[];         // Content draft IDs created
  processedAt: FirestoreTimestamp;
}
