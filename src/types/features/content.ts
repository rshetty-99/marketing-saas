/**
 * Content Pipeline Types — F1, F2, F3, F4, F6
 *
 * Single file for all content-related types since they're deeply interconnected.
 * Content flows: Create (F1) → Approve (F6) → Publish (F3) → Calendar (F4)
 * Repurpose (F2) is a creation method within F1.
 */

import type { FirestoreTimestamp, BrandVoiceScore } from './f0';
import type { WorkspaceRole } from '../roles';

// ═══════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════

export type ContentType =
  | 'blog_post'
  | 'social_post'
  | 'email_newsletter'
  | 'email_sequence'
  | 'headline'
  | 'ad_copy'
  | 'product_description'
  | 'video_script'
  | 'press_release'
  | 'case_study'
  | 'whitepaper'
  | 'landing_page_copy';

export type Channel =
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'blog'
  | 'email'
  | 'website';

export type ContentStatus =
  | 'draft'
  | 'submitted'
  | 'rejected'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'retracted'
  | 'archived';

export type CreationMethod = 'manual' | 'ai_generated' | 'repurposed';

// ═══════════════════════════════════════════════════════════
// F1: CONTENT DRAFT — workspaces/{workspaceId}/content_drafts/{draftId}
// Single collection for all content types.
// ═══════════════════════════════════════════════════════════

// ─── AI Generation Metadata ─────────────────────────────────
export interface AiGenerationMetadata {
  promptText: string;                    // The command/prompt sent to AI
  promptContext?: string;                // Background context alongside prompt
  modelId: string;                       // e.g., 'claude-sonnet-4-6'
  modelVersion?: string;
  brandVoiceProfileUsed?: boolean;       // Whether brand voice was applied
  tokensInput?: number;                  // Prompt tokens consumed
  tokensOutput?: number;                 // Completion tokens
  totalTokens?: number;
  generationTimeMs?: number;             // Time to generate
  estimatedCostCents?: number;           // Generation cost
  regenerationCount: number;             // How many times user clicked "regenerate"
  selectedVariantIndex?: number;         // Which variant user chose (if multiple)
  humanEditPercentage?: number;          // 0-100: how much was manually changed after AI
  generatedAt: FirestoreTimestamp;
}

// ─── Content Scores ─────────────────────────────────────────
export interface ContentScores {
  brandVoice?: BrandVoiceScore;          // F8 brand voice consistency
  readability?: number;                  // 0-100 Flesch-Kincaid based
  readabilityGrade?: string;             // e.g., "grade-8"
  seo?: number;                          // 0-100 SEO optimization
  seoDetails?: {
    keywordDensity?: number;
    titleOptimization?: number;
    metaLength?: boolean;
    headingStructure?: boolean;
  };
  engagementPrediction?: number;         // 0-100 predicted engagement
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;               // -1 to 1
  aiDetection?: number;                  // 0-1 probability of AI detection
  scoredAt?: FirestoreTimestamp;
}

// ─── Media Attachment ───────────────────────────────────────
export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gif' | 'document' | 'audio';
  url: string;                           // Storage URL
  thumbnailUrl?: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;              // For video/audio
  altText?: string;
  caption?: string;
  position: number;                      // Ordering within content
  platformVariants?: Record<string, {    // Per-platform crops
    url: string;
    width: number;
    height: number;
    aspectRatio: string;
  }>;
}

// ─── Platform-Specific Data ─────────────────────────────────
export interface TwitterPlatformData {
  isThread: boolean;
  threadTweets?: { text: string; mediaIds?: string[] }[];
  replySettings?: 'everyone' | 'mentioned_users' | 'followers';
  quotedTweetUrl?: string;
}

export interface LinkedInPlatformData {
  postType: 'post' | 'article' | 'document' | 'poll';
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  articleTitle?: string;
  articleBody?: string;
  documentUrl?: string;
  pollOptions?: string[];
}

export interface InstagramPlatformData {
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'STORIES' | 'REELS';
  carouselItems?: { mediaUrl: string; mediaType: string }[];
  coverImageUrl?: string;
  firstComment?: string;                 // Hashtag strategy
  collaboratorUsernames?: string[];
}

export interface FacebookPlatformData {
  postType: 'status' | 'link' | 'photo' | 'video' | 'carousel' | 'reel';
  linkUrl?: string;
  linkPreview?: { title?: string; description?: string; imageUrl?: string };
  carouselCards?: { imageUrl: string; title: string; description: string; url: string }[];
}

export interface TikTokPlatformData {
  privacyLevel: 'PUBLIC' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

export interface YouTubePlatformData {
  videoType: 'video' | 'short';
  description: string;
  tags?: string[];
  category?: string;
  thumbnailUrl?: string;
  visibility: 'public' | 'unlisted' | 'private';
}

export interface PinterestPlatformData {
  boardId: string;
  boardSectionId?: string;
  pinTitle: string;
  destinationUrl: string;
  altText?: string;
}

export type PlatformData = {
  twitter?: TwitterPlatformData;
  linkedin?: LinkedInPlatformData;
  instagram?: InstagramPlatformData;
  facebook?: FacebookPlatformData;
  tiktok?: TikTokPlatformData;
  youtube?: YouTubePlatformData;
  pinterest?: PinterestPlatformData;
};

// ─── Content Version ────────────────────────────────────────
export interface ContentVersion {
  versionId: string;
  versionNumber: number;
  content: string;                       // Full snapshot
  title?: string;
  changeType: 'autosave' | 'manual_save' | 'ai_generation' | 'ai_regeneration' | 'publish' | 'restore';
  changeSummary?: string;
  changedBy: string;
  createdAt: FirestoreTimestamp;
}

// ─── Post-Publish Metrics ───────────────────────────────────
export interface PostPublishMetrics {
  impressions?: number;
  reach?: number;
  clicks?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  videoViews?: number;
  engagementRate?: number;               // 0-1
  clickThroughRate?: number;             // 0-1
  followerGainedFromPost?: number;
  lastSyncedAt?: FirestoreTimestamp;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

// ─── Content Draft (main document) ──────────────────────────
export interface ContentDraft {
  id: string;
  workspaceId: string;

  // Core content
  title: string;
  content: string;                       // Markdown
  contentType: ContentType;
  channel?: Channel;
  status: ContentStatus;

  // Creation context
  creationMethod: CreationMethod;
  sourceDraftId?: string;                // If repurposed — links to original (F2)
  sourceChannel?: string;                // Original channel if repurposed

  // Organization
  tags?: string[];
  labels?: string[];
  campaignId?: string;                   // Links to marketing campaign
  clientId?: string;                     // For agency: which client this is for

  // Assignment & deadlines
  assignedTo?: string;                   // userId responsible
  dueDate?: FirestoreTimestamp;          // Deadline — feeds into F4 calendar
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  // SEO (blog posts, landing pages, website content)
  excerpt?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  slug?: string;

  // Email-specific
  subjectLine?: string;
  preheaderText?: string;

  // Ad-specific
  headline?: string;
  callToAction?: string;

  // Media
  mediaAttachments?: MediaAttachment[];
  featuredImageUrl?: string;
  featuredImageAltText?: string;

  // Platform-specific overrides
  platformData?: PlatformData;

  // AI generation
  aiMetadata?: AiGenerationMetadata;

  // Scoring
  scores?: ContentScores;

  // Version history
  versionHistory?: ContentVersion[];
  currentVersionNumber: number;

  // Approval link (F6)
  linkedApprovalId?: string;

  // Publish link (F3)
  linkedPublishJobId?: string;

  // Post-publish metrics (synced back from platforms)
  postPublishMetrics?: Record<string, PostPublishMetrics>; // keyed by channel

  // Counts
  wordCount: number;
  characterCount?: number;
  readingTimeMinutes?: number;

  // Timestamps
  publishedAt?: FirestoreTimestamp;
  scheduledAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
  updatedBy?: string;
}

// ═══════════════════════════════════════════════════════════
// F6: APPROVAL WORKFLOW
// ═══════════════════════════════════════════════════════════

// ─── Workflow Template ──────────────────────────────────────
export interface ApprovalWorkflowTemplate {
  id: string;
  workspaceId: string;
  name: string;                          // e.g., "Blog Post Review", "Social Quick Approve"
  isDefault: boolean;
  isActive: boolean;
  stages: ApprovalStageTemplate[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface ApprovalStageTemplate {
  stageId: string;
  stageOrder: number;
  stageName: string;                     // e.g., "Content Review", "Manager Sign-off"
  stageType: 'internal' | 'client' | 'legal' | 'executive';
  approvalMode: 'any_one' | 'all_required';
  approverUserIds?: string[];            // Specific users
  approverMinRole?: WorkspaceRole;       // Or role-based
  slaHours?: number;                     // Deadline for this stage
  autoApproveOnExpiry: boolean;
  reminderScheduleHours?: number[];      // e.g., [6, 12, 24, 48]
  isOptional: boolean;                   // Can be skipped
  skipConditions?: {                     // Auto-skip if criteria met
    contentTypes?: ContentType[];        // Skip for these types
    autoApproveForRoles?: WorkspaceRole[]; // Skip if submitter has this role
  };
}

// ─── Approval Request (instance) ────────────────────────────
export type ApprovalStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'reassigned'
  | 'auto_approved'
  | 'escalated'
  | 'cancelled';

export type FeedbackCategory =
  | 'tone'
  | 'accuracy'
  | 'brand_voice'
  | 'legal'
  | 'visual'
  | 'grammar'
  | 'strategy'
  | 'other';

export interface ApprovalComment {
  id: string;
  authorId: string;
  authorType: 'internal' | 'external_client';
  visibility: 'internal_only' | 'all_stakeholders';
  commentType: 'text' | 'annotation' | 'suggestion';
  body: string;
  feedbackCategory?: FeedbackCategory;
  annotationData?: {                     // For inline content annotations
    startOffset?: number;
    endOffset?: number;
    selectedText?: string;
  };
  suggestedFix?: string;
  resolvedAt?: FirestoreTimestamp;
  resolvedBy?: string;
  createdAt: FirestoreTimestamp;
}

export interface ApprovalStageInstance {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageType: 'internal' | 'client' | 'legal' | 'executive';
  approvalMode: 'any_one' | 'all_required';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'skipped';
  assignedApproverIds: string[];

  // Per-approver decisions
  decisions: ApprovalDecision[];

  // SLA tracking
  slaHours?: number;
  startedAt?: FirestoreTimestamp;
  dueAt?: FirestoreTimestamp;
  completedAt?: FirestoreTimestamp;
  escalatedAt?: FirestoreTimestamp;

  // Comments for this stage
  comments: ApprovalComment[];
}

export interface ApprovalDecision {
  approverId: string;
  approverName?: string;
  action: 'approved' | 'rejected' | 'changes_requested' | 'reassigned';
  feedback?: ApprovalComment[];
  reassignedToId?: string;
  decidedAt: FirestoreTimestamp;
}

export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  contentDraftId: string;
  workflowTemplateId?: string;          // Which template was used

  // Submitter
  submittedBy: string;
  submittedAt: FirestoreTimestamp;

  // Overall status
  status: ApprovalStatus;
  currentStageIndex: number;

  // Stages (instances)
  stages: ApprovalStageInstance[];

  // Revision tracking
  revisionNumber: number;               // Increments on each re-submit after rejection
  resetsChainOnReject: boolean;          // Restart from stage 1 or continue from rejection

  // Content snapshot (what was approved/rejected — for audit)
  contentSnapshot: {
    title: string;
    content: string;
    contentType: ContentType;
    versionNumber: number;
  };

  // External approval
  externalApprovalLinks?: ExternalApprovalLink[];

  // Final outcome
  approvedAt?: FirestoreTimestamp;
  approvedBy?: string;
  rejectedAt?: FirestoreTimestamp;
  rejectedBy?: string;

  // Linked publish job (created after approval)
  linkedPublishJobId?: string;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface ExternalApprovalLink {
  id: string;
  approvalRequestId: string;
  stageId: string;
  token: string;                         // Cryptographic, one-time
  approverEmail: string;
  approverName?: string;
  expiresAt: FirestoreTimestamp;
  accessedAt?: FirestoreTimestamp;
  decidedAt?: FirestoreTimestamp;
  decision?: 'approved' | 'rejected' | 'changes_requested';
}

// ─── Workspace Approval Settings ────────────────────────────
export interface ApprovalSettings {
  requireApproval: boolean;              // default: true for org/agency, false for freelancer
  requireExternalApproval: boolean;      // default: false
  defaultWorkflowTemplateId?: string;
  escalationThresholdHours: number;      // default: 48
  autoApproveForRoles: WorkspaceRole[];  // default: ['owner', 'admin']
  defaultReminderScheduleHours: number[]; // default: [6, 12, 24, 48]
  resetsChainOnReject: boolean;          // default: true
}

// ═══════════════════════════════════════════════════════════
// F3: PUBLISHING
// ═══════════════════════════════════════════════════════════

export type PublishStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'partial_success'
  | 'failed'
  | 'retracted'
  | 'paused';

export type PublishMode = 'auto' | 'manual' | 'mock';

// ─── UTM Configuration ──────────────────────────────────────
export interface UtmConfig {
  enabled: boolean;
  template: {
    utmSource?: string;                  // "{{platform}}" or custom
    utmMedium?: string;                  // "social", "email", etc.
    utmCampaign?: string;                // Campaign name
    utmContent?: string;                 // Variant identifier (A/B)
    utmTerm?: string;                    // Keyword tracking
  };
  linkShortener?: 'bitly' | 'rebrandly' | 'none';
}

// ─── Recycling / Evergreen Config ───────────────────────────
export interface RecyclingConfig {
  isEvergreen: boolean;
  maxRepublishCount?: number;            // null = unlimited
  republishGapDays?: number;             // Min days between republishes
  currentRepublishCount: number;
  lastRepublishedAt?: FirestoreTimestamp;
  status: 'active' | 'paused' | 'expired';
}

// ─── Platform Publish Result ────────────────────────────────
export interface PlatformPublishResult {
  platform: Channel;
  status: 'pending' | 'publishing' | 'published' | 'failed' | 'retracted';
  platformPostId?: string;               // Native platform post ID
  platformPostUrl?: string;              // Direct URL to live post
  publishedAt?: FirestoreTimestamp;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: FirestoreTimestamp;
  firstComment?: string;                 // Instagram/LinkedIn first comment
  metrics?: PostPublishMetrics;
}

// ─── Publish Job ────────────────────────────────────────────
export interface PublishJob {
  id: string;
  workspaceId: string;
  contentDraftId: string;
  approvalRequestId?: string;            // F6 link

  // Publishing config
  status: PublishStatus;
  publishMode: PublishMode;              // auto / manual / mock
  platforms: Channel[];

  // Scheduling
  scheduledAt?: FirestoreTimestamp;
  publishedAt?: FirestoreTimestamp;
  timezone: string;                      // IANA
  optimalTimeUsed: boolean;              // Whether AI-suggested time was used

  // Per-platform results
  platformResults: PlatformPublishResult[];

  // UTM tracking
  utmConfig?: UtmConfig;

  // Evergreen / recycling
  recycling?: RecyclingConfig;

  // Content snapshot (what was published)
  contentSnapshot: {
    title: string;
    content: string;
    contentType: ContentType;
    channel?: Channel;
    mediaAttachments?: MediaAttachment[];
    platformData?: PlatformData;
  };

  // Manual publish tracking
  manualPublishData?: {
    markedPublishedBy: string;
    markedPublishedAt: FirestoreTimestamp;
    platformUrls: Record<string, string>;  // platform → URL of live post
    notes?: string;
  };

  // Retraction
  retractedAt?: FirestoreTimestamp;
  retractedBy?: string;
  retractionReason?: string;

  // Client context (agency)
  clientId?: string;

  // Calendar event link (F4)
  linkedCalendarEventId?: string;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// F4: CALENDAR
// ═══════════════════════════════════════════════════════════

export type CalendarEventType =
  | 'publish'              // Auto-created from F3 publish job
  | 'approval_deadline'    // Auto-created from F6 approval SLA
  | 'content_due'          // Auto-created from F1 draft dueDate
  | 'meeting'              // Manual
  | 'campaign_launch'      // Manual
  | 'review'               // Manual
  | 'deadline'             // Manual
  | 'custom';              // Manual

export type CalendarEventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  interval?: number;                     // Every N frequency units
  endDate?: FirestoreTimestamp;
  byDayOfWeek?: string[];               // ['MON', 'WED', 'FRI']
  byDayOfMonth?: number[];              // [1, 15]
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;

  // Core
  title: string;
  description?: string;
  eventType: CalendarEventType;
  status: CalendarEventStatus;
  color?: string;                        // Hex or theme color name

  // Timing
  startAt: FirestoreTimestamp;
  endAt?: FirestoreTimestamp;
  timezone: string;                      // IANA
  allDay: boolean;
  recurrence?: RecurrenceRule;

  // Links to other features
  linkedContentDraftId?: string;         // F1
  linkedPublishJobId?: string;           // F3
  linkedApprovalId?: string;             // F6
  linkedCampaignId?: string;
  linkedClientId?: string;               // Agency client

  // Notifications
  notificationMinutesBefore?: number[];  // [15, 60] = notify 15min and 1hr before
  attendeeUserIds?: string[];

  // Metadata
  isAutoGenerated: boolean;              // true if created by system (from F3/F6)
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
