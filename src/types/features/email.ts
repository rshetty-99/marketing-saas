/**
 * F11: Email Campaign Types
 *
 * Campaign management, subscriber lists, templates, analytics,
 * automation sequences, compliance, deliverability.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// EMAIL CAMPAIGN — workspaces/{workspaceId}/email_campaigns/{campaignId}
// ═══════════════════════════════════════════════════════════

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';
export type CampaignType = 'regular' | 'automated' | 'ab_test' | 'rss' | 'transactional';

export interface AbTestVariant {
  variantId: string;
  variantLabel: string;                // 'A', 'B', 'C'
  subjectLine: string;
  previewText?: string;
  fromName?: string;
  content?: string;
  recipientPercent: number;
  sendAt?: FirestoreTimestamp;
}

export interface AbTestConfig {
  enabled: boolean;
  testType: 'subject' | 'from_name' | 'content' | 'send_time';
  variants: AbTestVariant[];
  testSizePercent: number;             // % of list used for testing
  testDurationMinutes: number;
  winnerCriteria: 'open_rate' | 'click_rate' | 'revenue' | 'manual';
  winnerId?: string;
  winnerSelectedAt?: FirestoreTimestamp;
}

export interface SendConfig {
  batchSize: number;                   // Emails per batch
  batchIntervalMinutes: number;
  maxSendsPerHour: number;
  throttleEnabled: boolean;
}

export interface DynamicContentBlock {
  blockId: string;
  variableName: string;
  fallbackContent: string;
  rules: { segmentTag: string; content: string }[];
}

export interface CampaignUtmConfig {
  autoAppend: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface ComplianceFields {
  physicalAddress: string;             // Required by CAN-SPAM
  unsubscribeUrl: string;
  unsubscribeLinkPresent: boolean;
  listUnsubscribeHeader: boolean;      // RFC 8058 one-click
  gdprCompliant: boolean;
  doubleOptIn: boolean;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  deliveryRate: number;                // 0-1
  uniqueOpens: number;
  totalOpens: number;
  openRate: number;                    // 0-1
  uniqueClicks: number;
  totalClicks: number;
  clickRate: number;                   // 0-1
  clickToOpenRate: number;             // 0-1 (CTOR)
  hardBounces: number;
  softBounces: number;
  bounceRate: number;                  // 0-1
  spamComplaints: number;
  complaintRate: number;               // 0-1
  unsubscribes: number;
  unsubscribeRate: number;             // 0-1
  forwardCount: number;
  topClickedLinks: { url: string; clicks: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  emailClientBreakdown?: Record<string, number>;
  geoBreakdown?: Record<string, number>;
  revenue?: { orders: number; totalGross: number; totalNet: number; avgOrderValue: number };
  lastUpdatedAt: FirestoreTimestamp;
}

export interface EmailCampaign {
  id: string;
  workspaceId: string;
  name: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  clientId?: string;                   // Agency per-client

  // Content
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  templateId?: string;
  htmlContent: string;
  plainTextContent?: string;

  // Dynamic content
  dynamicBlocks?: DynamicContentBlock[];

  // Recipients
  listId?: string;
  segmentId?: string;
  tagFilters?: string[];
  excludeTags?: string[];
  recipientCount?: number;

  // Scheduling
  scheduledAt?: FirestoreTimestamp;
  sentAt?: FirestoreTimestamp;

  // A/B Testing
  abTest?: AbTestConfig;

  // Send configuration
  sendConfig?: SendConfig;
  sendTimeOptimization?: { enabled: boolean; method: 'ai_optimized' | 'manual' | 'timezone_based' };

  // Tracking
  utmConfig?: CampaignUtmConfig;
  customTrackingDomain?: string;
  clickTrackingEnabled: boolean;
  openTrackingEnabled: boolean;

  // Deliverability
  spamScore?: number;                  // 0-10
  inboxPlacementRate?: number;         // 0-1

  // Compliance
  compliance: ComplianceFields;

  // Analytics
  analytics?: CampaignAnalytics;

  // Metadata
  dataSource: 'live' | 'mock';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// SUBSCRIBER — workspaces/{workspaceId}/email_subscribers/{subscriberId}
// ═══════════════════════════════════════════════════════════

export type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'bounced' | 'complained';

export interface EmailSubscriber {
  id: string;
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: SubscriberStatus;
  tags: string[];
  segments: string[];
  source: 'import' | 'form' | 'api' | 'manual' | 'landing_page';
  mergeFields?: Record<string, string>;
  customFields?: Record<string, unknown>;

  // Engagement
  engagementScore: number;             // 0-100
  engagementRating: 'cold' | 'warm' | 'hot';
  totalOpens: number;
  totalClicks: number;
  lastOpenedAt?: FirestoreTimestamp;
  lastClickedAt?: FirestoreTimestamp;

  // Consent / GDPR
  consentDate?: FirestoreTimestamp;
  consentSource?: string;
  ipOptIn?: string;

  subscribedAt: FirestoreTimestamp;
  unsubscribedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// EMAIL TEMPLATE — workspaces/{workspaceId}/email_templates/{templateId}
// ═══════════════════════════════════════════════════════════

export type TemplateCategory = 'welcome' | 'newsletter' | 'promotion' | 'product_update' | 'event' | 'follow_up' | 'case_study' | 'plain_text' | 'custom';

export interface EmailTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: TemplateCategory;
  description?: string;
  htmlContent: string;
  thumbnailUrl?: string;
  variables: string[];                 // e.g., ['{{brandName}}', '{{subject}}', '{{ctaUrl}}']
  isBuiltIn: boolean;                  // Pre-built vs user-created
  isActive: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// AUTOMATION SEQUENCE — workspaces/{workspaceId}/email_sequences/{sequenceId}
// ═══════════════════════════════════════════════════════════

export type SequenceTriggerType =
  | 'tag_added' | 'form_submitted' | 'link_clicked'
  | 'purchase' | 'date_field' | 'segment_entered'
  | 'manual' | 'api';

export type SequenceStepType = 'email' | 'delay' | 'condition' | 'action';

export interface SequenceStep {
  id: string;
  stepType: SequenceStepType;
  order: number;

  // Email step
  emailTemplateId?: string;
  emailSubject?: string;
  emailContent?: string;

  // Delay step
  delayValue?: number;
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';

  // Condition step
  condition?: { field: string; operator: string; value: unknown; trueBranch: string; falseBranch: string };

  // Action step
  action?: { type: 'add_tag' | 'remove_tag' | 'move_to_list' | 'webhook' | 'update_field'; config: Record<string, unknown> };
}

export interface EmailSequence {
  id: string;
  workspaceId: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  triggerType: SequenceTriggerType;
  triggerConfig?: Record<string, unknown>;
  steps: SequenceStep[];
  exitConditions?: { type: string; value: unknown }[];
  enrollmentCount: number;
  completionCount: number;
  clientId?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// DOMAIN HEALTH
// ═══════════════════════════════════════════════════════════

export interface DomainHealth {
  domain: string;
  spfStatus: 'pass' | 'fail' | 'missing';
  dkimStatus: 'pass' | 'fail' | 'missing';
  dmarcStatus: 'pass' | 'fail' | 'missing';
  reputationScore: number;             // 0-100
  warmUpPhase: 'cold' | 'warming' | 'warm';
  dailySendLimit: number;
  currentDailySent: number;
  blacklistedOn?: string[];
  lastCheckedAt?: FirestoreTimestamp;
}
