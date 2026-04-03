/**
 * Phase 10: Platform Completeness Types
 *
 * Public API, CRM Sync, Content Briefs, Stock Photos,
 * Localization, Auto-Moderation, Employee Advocacy,
 * Custom Dashboards, Migration Tool.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// PUBLIC REST API / DEVELOPER API
// ═══════════════════════════════════════════════════════════

export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyHash: string;                    // SHA-256 hash of the key (key itself shown once)
  keyPrefix: string;                  // First 8 chars for identification
  scopes: ApiScope[];
  rateLimit: number;                  // Requests per minute
  lastUsedAt?: FirestoreTimestamp;
  expiresAt?: FirestoreTimestamp;
  isActive: boolean;
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

export type ApiScope =
  | 'content:read' | 'content:write'
  | 'analytics:read'
  | 'leads:read' | 'leads:write'
  | 'social:read' | 'social:write'
  | 'email:read' | 'email:write'
  | 'dam:read' | 'dam:write'
  | 'clients:read' | 'clients:write';

export interface ApiUsageLog {
  id: string;
  apiKeyId: string;
  workspaceId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string;
  timestamp: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// TWO-WAY CRM SYNC
// ═══════════════════════════════════════════════════════════

export type CrmProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'gohighlevel' | 'zoho';
export type SyncDirection = 'push' | 'pull' | 'bidirectional';
export type SyncStatus = 'connected' | 'syncing' | 'error' | 'disconnected';

export interface CrmConnection {
  id: string;
  workspaceId: string;
  clientId?: string;
  provider: CrmProvider;
  status: SyncStatus;
  direction: SyncDirection;
  accessToken?: string;               // Encrypted
  refreshToken?: string;              // Encrypted
  instanceUrl?: string;               // Salesforce instance
  portalId?: string;                  // HubSpot portal
  fieldMapping: CrmFieldMapping[];
  syncFrequencyMinutes: number;
  lastSyncAt?: FirestoreTimestamp;
  lastSyncError?: string;
  totalSynced: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface CrmFieldMapping {
  auraField: string;                  // e.g., 'email', 'firstName', 'stage'
  crmField: string;                   // e.g., 'Email', 'firstname', 'dealstage'
  direction: 'push' | 'pull' | 'both';
}

export interface CrmSyncLog {
  id: string;
  connectionId: string;
  workspaceId: string;
  direction: 'push' | 'pull';
  recordType: 'lead' | 'contact' | 'deal';
  recordCount: number;
  successCount: number;
  errorCount: number;
  errors: { recordId: string; message: string }[];
  startedAt: FirestoreTimestamp;
  completedAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// CONTENT BRIEF / ASSIGNMENT WORKFLOW
// ═══════════════════════════════════════════════════════════

export type BriefStatus = 'draft' | 'assigned' | 'in_progress' | 'review' | 'approved' | 'published';

export interface ContentBrief {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  status: BriefStatus;

  // Brief details
  objective: string;
  targetAudience: string;
  platform: string;
  contentType: string;
  toneOfVoice: string;
  keyMessages: string[];
  keywords: string[];
  referenceLinks: string[];
  competitorExamples: string[];
  doList: string[];                   // "Do" guidelines
  dontList: string[];                 // "Don't" guidelines

  // Assignment
  assignedTo?: string;                // userId of writer
  assignedAt?: FirestoreTimestamp;
  dueDate?: FirestoreTimestamp;
  wordCountTarget?: number;

  // Linked output
  contentDraftId?: string;            // Links to created content

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// STOCK PHOTO LIBRARY (Unsplash / Pexels)
// ═══════════════════════════════════════════════════════════

export interface StockPhotoResult {
  id: string;
  provider: 'unsplash' | 'pexels' | 'pixabay';
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  description?: string;
  downloadUrl: string;
  license: string;
}

export interface StockPhotoSearch {
  query: string;
  provider: 'unsplash' | 'pexels' | 'pixabay';
  page: number;
  perPage: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
}

// ═══════════════════════════════════════════════════════════
// MULTI-LANGUAGE / LOCALIZATION
// ═══════════════════════════════════════════════════════════

export interface ContentLocale {
  id: string;
  contentDraftId: string;             // Parent draft
  workspaceId: string;
  locale: string;                     // e.g., 'es', 'fr', 'de', 'ja'
  title: string;
  content: string;
  translationMethod: 'ai' | 'manual' | 'imported';
  translationStatus: 'pending' | 'in_progress' | 'review' | 'approved';
  translatedBy?: string;
  reviewedBy?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface LocaleConfig {
  workspaceId: string;
  defaultLocale: string;
  enabledLocales: string[];
  autoTranslate: boolean;
  translationProvider: 'claude' | 'google_translate' | 'deepl' | 'manual';
}

// ═══════════════════════════════════════════════════════════
// COMMENT AUTO-MODERATION
// ═══════════════════════════════════════════════════════════

export type ModerationAction = 'hide' | 'flag' | 'delete' | 'auto_reply';

export interface ModerationRule {
  id: string;
  workspaceId: string;
  name: string;
  isActive: boolean;
  conditions: {
    type: 'contains_word' | 'regex' | 'sentiment' | 'spam_score' | 'competitor_mention';
    value: string;
    caseSensitive?: boolean;
  }[];
  action: ModerationAction;
  autoReplyTemplate?: string;
  platform?: string;                  // Platform-specific or all
  matchCount: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// EMPLOYEE ADVOCACY
// ═══════════════════════════════════════════════════════════

export type AdvocacyPostStatus = 'draft' | 'approved' | 'shared' | 'expired';

export interface AdvocacyProgram {
  id: string;
  workspaceId: string;
  name: string;
  isActive: boolean;
  memberIds: string[];                // Employee userIds
  totalShares: number;
  totalReach: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface AdvocacyPost {
  id: string;
  programId: string;
  workspaceId: string;
  title: string;
  suggestedCaption: string;
  mediaUrl?: string;
  targetPlatforms: string[];
  status: AdvocacyPostStatus;
  shareCount: number;
  expiresAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// CUSTOM DASHBOARD WIDGETS
// ═══════════════════════════════════════════════════════════

export type WidgetType =
  | 'stat_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table'
  | 'funnel' | 'leaderboard' | 'text_note' | 'recent_activity' | 'goal_tracker';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;                 // e.g., 'analytics.followers', 'leads.pipeline'
  config: Record<string, unknown>;    // Widget-specific configuration
  position: { x: number; y: number; w: number; h: number }; // Grid position
}

export interface CustomDashboard {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// CONTENT MIGRATION TOOL
// ═══════════════════════════════════════════════════════════

export type MigrationSource = 'hootsuite' | 'buffer' | 'later' | 'sprout_social' | 'hubspot' | 'csv' | 'wordpress';
export type MigrationStatus = 'pending' | 'analyzing' | 'ready' | 'migrating' | 'completed' | 'failed';

export interface MigrationJob {
  id: string;
  workspaceId: string;
  source: MigrationSource;
  status: MigrationStatus;
  totalItems: number;
  migratedItems: number;
  skippedItems: number;
  errors: { item: string; message: string }[];
  config: {
    importContent: boolean;
    importScheduled: boolean;
    importAnalytics: boolean;
    importSubscribers: boolean;
    dateRange?: { start: string; end: string };
  };
  startedAt?: FirestoreTimestamp;
  completedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  createdBy: string;
}
