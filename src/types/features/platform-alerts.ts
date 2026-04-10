/**
 * Algorithm Change Alerts Types
 * Monitor platform algorithm changes, policy updates, new features.
 */

import type { FirestoreTimestamp } from './f0';

export type AlertPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'pinterest' | 'google';
export type AlertCategory = 'algorithm_change' | 'policy_update' | 'new_feature' | 'deprecation' | 'api_change' | 'best_practice';
export type AlertSeverity = 'critical' | 'important' | 'informational';
export type AlertStatus = 'unread' | 'read' | 'dismissed' | 'actioned';

export interface PlatformAlert {
  id: string;
  workspaceId: string;
  platform: AlertPlatform;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  summary: string;                    // AI-generated impact summary
  details: string;                    // Full description
  sourceUrl?: string;                 // Link to official announcement
  sourceDate: string;                 // When the change was announced
  impactAnalysis: string;             // "This affects your scheduled posts because..."
  actionItems: string[];              // What the user should do
  affectedFeatures: string[];         // e.g., ['publishing', 'analytics', 'hashtags']
  status: AlertStatus;
  readAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

export interface AlertPreferences {
  workspaceId: string;
  emailDigest: 'off' | 'daily' | 'weekly';
  emailAddress?: string;
  enabledPlatforms: AlertPlatform[];
  enabledCategories: AlertCategory[];
  minSeverity: AlertSeverity;
}

// ── Interactive Content Types ──────────────────────────────

export type InteractiveContentType = 'quiz' | 'calculator' | 'assessment';
export type QuestionType = 'multiple_choice' | 'single_choice' | 'range' | 'text_input' | 'yes_no' | 'rating';

export interface InteractiveQuestion {
  id: string;
  order: number;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: { label: string; value: string; score?: number }[];
  min?: number;                       // For range type
  max?: number;
  placeholder?: string;               // For text_input
  imageUrl?: string;
}

export interface InteractiveResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  minScore: number;
  maxScore: number;
  ctaText?: string;
  ctaUrl?: string;
}

export interface InteractiveContent {
  id: string;
  workspaceId: string;
  clientId?: string;
  type: InteractiveContentType;
  title: string;
  description: string;
  coverImageUrl?: string;

  // Content
  questions: InteractiveQuestion[];
  results: InteractiveResult[];
  scoringMethod: 'sum' | 'average' | 'weighted' | 'custom';

  // Lead capture
  collectEmail: boolean;
  collectName: boolean;
  collectPhone: boolean;
  collectCompany: boolean;
  captureBeforeResults: boolean;      // Require email to see results
  gdprConsentRequired: boolean;

  // Appearance
  primaryColor?: string;
  logoUrl?: string;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;

  // Embed
  embedCode?: string;
  allowedDomains?: string[];

  // Analytics
  views: number;
  starts: number;                     // How many started
  completions: number;                // How many finished
  leadsCaptures: number;
  completionRate: number;
  avgTimeSeconds: number;

  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface InteractiveSubmission {
  id: string;
  contentId: string;
  workspaceId: string;
  answers: { questionId: string; value: string; score?: number }[];
  totalScore: number;
  resultId: string;
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  gdprConsent?: boolean;
  leadId?: string;                    // Linked lead in CRM
  completedAt: FirestoreTimestamp;
}
