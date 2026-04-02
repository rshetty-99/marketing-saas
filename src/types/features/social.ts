/**
 * F9: Social Connections + F5: Analytics Types
 */

import type { FirestoreTimestamp } from './f0';
import type { Channel } from './content';

// ═══════════════════════════════════════════════════════════
// F9: SOCIAL CONNECTIONS
// workspaces/{workspaceId}/social_connections/{connId}
// ═══════════════════════════════════════════════════════════

export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'google_business' | 'tiktok' | 'youtube' | 'pinterest';

export type ConnectionAccountType = 'personal' | 'page' | 'business' | 'channel' | 'creator';

export type ConnectionHealthStatus = 'healthy' | 'warning' | 'error' | 'expired' | 'revoked';

export type ConnectionPermission = 'publish' | 'read_analytics' | 'read_inbox' | 'manage_ads' | 'manage_comments';

export interface PlatformMetricsSnapshot {
  followerCount?: number;
  followingCount?: number;
  totalPosts?: number;
  avgEngagementRate?: number;        // 0-1, rolling 30-day
  avgReach?: number;                 // Rolling 30-day
  avgImpressions?: number;           // Rolling 30-day
  lastUpdatedAt?: FirestoreTimestamp;
}

export interface ConnectionTeamPermission {
  userId: string;
  canPublish: boolean;
  canViewAnalytics: boolean;
  requiresApproval: boolean;         // Posts from this user need approval before publishing
}

export interface SocialConnection {
  id: string;
  workspaceId: string;

  // Platform identity
  platform: SocialPlatform;
  accountType: ConnectionAccountType;
  platformAccountId: string;         // Platform's native ID
  platformPageId?: string;           // For pages/channels (LinkedIn company, Facebook page, YouTube channel)
  platformPageName?: string;
  platformUsername: string;           // @handle
  platformDisplayName: string;
  platformAvatarUrl?: string;
  platformProfileUrl?: string;       // Direct link to profile/page

  // OAuth tokens (AES encrypted with workspace key)
  accessToken: string;               // Encrypted
  refreshToken?: string;             // Encrypted (not all platforms provide)
  tokenExpiresAt?: FirestoreTimestamp;
  tokenScopes: string[];             // Granted OAuth scopes

  // Connection status & health
  status: 'active' | 'expired' | 'revoked' | 'disconnected';
  healthStatus: ConnectionHealthStatus;
  consecutiveFailures: number;       // API call failures in a row
  lastSuccessfulSync?: FirestoreTimestamp;
  lastSyncAt?: FirestoreTimestamp;
  lastSyncStatus?: 'success' | 'partial' | 'failed';
  lastErrorMessage?: string;
  lastErrorAt?: FirestoreTimestamp;

  // Rate limiting
  rateLimitRemaining?: number;
  rateLimitResetsAt?: FirestoreTimestamp;

  // Permissions
  permissions: ConnectionPermission[];

  // Team-level access (who can publish to this account)
  teamPermissions?: ConnectionTeamPermission[];

  // Cached metrics (updated on each sync)
  metricsSnapshot?: PlatformMetricsSnapshot;

  // Ownership
  connectedBy: string;               // userId who initiated OAuth
  connectedAt: FirestoreTimestamp;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// F5: ANALYTICS SNAPSHOTS
// workspaces/{workspaceId}/analytics_snapshots/{date_platform}
// One doc per workspace per platform per day.
// ═══════════════════════════════════════════════════════════

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface ContentTypeBreakdown {
  contentType: string;
  count: number;
  impressions: number;
  engagement: number;
  clicks: number;
}

export interface PipelineHealth {
  draft: number;
  submitted: number;
  approved: number;
  scheduled: number;
  published: number;
  rejected: number;
  archived: number;
}

export interface ComparisonDelta {
  impressions?: number;              // % change from previous period
  reach?: number;
  engagement?: number;
  clicks?: number;
  followerGrowth?: number;
  engagementRate?: number;
  publishedCount?: number;
}

export interface AnomalyAlert {
  id: string;
  metricName: string;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  direction: 'spike' | 'drop';
  severity: 'low' | 'medium' | 'high';
  detectedAt: FirestoreTimestamp;
}

export interface AnalyticsSnapshot {
  id: string;
  workspaceId: string;
  platform: SocialPlatform | 'all';  // 'all' for cross-platform aggregate
  date: string;                      // YYYY-MM-DD
  periodType: PeriodType;
  clientId?: string;                 // For agency per-client analytics

  // Core metrics
  impressions: number;
  reach: number;
  engagement: number;                // likes + comments + shares + saves
  clicks: number;
  shares: number;
  saves: number;
  videoViews: number;

  // Calculated rates
  engagementRate: number;            // 0-1
  clickThroughRate: number;          // 0-1

  // Follower tracking
  followerCount: number;
  followerDelta: number;             // Net change in period
  audienceGrowthRate: number;        // % growth

  // Content metrics
  contentPublishedCount: number;
  contentBreakdown?: ContentTypeBreakdown[];

  // Top performers
  topPostId?: string;
  topPostTitle?: string;
  topPostEngagement?: number;
  bestPostingHour?: number;          // 0-23, derived from per-post analysis

  // Brand voice
  brandVoiceAvgScore?: number;       // 0-100 average across published content

  // Pipeline health (workspace-wide, not per-platform)
  pipelineHealth?: PipelineHealth;

  // Comparison with previous period
  comparisonDelta?: ComparisonDelta;

  // Anomalies detected
  anomalies?: AnomalyAlert[];

  // Sync metadata
  syncedAt: FirestoreTimestamp;
  syncDurationMs?: number;
  dataSource: 'live' | 'mock';      // Track whether data is real or mocked

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ─── Anomaly Alert Configuration ────────────────────────────
export interface AnomalyAlertConfig {
  enabled: boolean;
  thresholds: Record<string, {
    deviationPercent: number;        // e.g., 30 = alert if 30% above/below baseline
    minAbsoluteChange: number;       // Minimum absolute change to trigger (avoids noise)
  }>;
  notifyRoles: string[];             // Which roles get notified
  baselinePeriodDays: number;        // How many days to use for baseline (default 30)
}

// ─── Analytics Dashboard Widget Config ──────────────────────
export type DashboardWidgetType =
  | 'kpi_card'
  | 'engagement_chart'
  | 'platform_breakdown'
  | 'content_type_performance'
  | 'publishing_frequency'
  | 'follower_growth'
  | 'top_posts'
  | 'pipeline_health'
  | 'brand_voice_trend'
  | 'best_posting_times';

export interface DashboardWidgetConfig {
  widgetType: DashboardWidgetType;
  title: string;
  position: number;                  // Order on dashboard
  size: 'small' | 'medium' | 'large';
  isVisible: boolean;
}
