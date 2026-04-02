/**
 * Content Pipeline Zod Schemas — F1, F2, F3, F4, F6
 */

import { z } from 'zod';

// ─── Shared Enums ───────────────────────────────────────────

export const contentTypeEnum = z.enum([
  'blog_post', 'social_post', 'email_newsletter', 'email_sequence',
  'headline', 'ad_copy', 'product_description', 'video_script',
  'press_release', 'case_study', 'whitepaper', 'landing_page_copy',
]);

export const channelEnum = z.enum([
  'linkedin', 'twitter', 'instagram', 'facebook', 'tiktok',
  'youtube', 'pinterest', 'blog', 'email', 'website',
]);

export const contentStatusEnum = z.enum([
  'draft', 'submitted', 'rejected', 'approved',
  'scheduled', 'published', 'retracted', 'archived',
]);

// ═══════════════════════════════════════════════════════════
// F1: CONTENT DRAFTS
// ═══════════════════════════════════════════════════════════

export const createDraftSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().max(100000),
  contentType: contentTypeEnum,
  channel: channelEnum.optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  labels: z.array(z.string().max(50)).max(20).optional(),
  campaignId: z.string().optional(),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  // SEO
  excerpt: z.string().max(500).optional(),
  seoMetaTitle: z.string().max(70).optional(),
  seoMetaDescription: z.string().max(170).optional(),
  focusKeyword: z.string().max(100).optional(),
  secondaryKeywords: z.array(z.string().max(100)).max(10).optional(),

  // Email-specific
  subjectLine: z.string().max(200).optional(),
  preheaderText: z.string().max(200).optional(),

  // Ad-specific
  headline: z.string().max(200).optional(),
  callToAction: z.string().max(100).optional(),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;

export const updateDraftSchema = createDraftSchema.partial().extend({
  status: contentStatusEnum.optional(),
});

export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;

export const generateContentSchema = z.object({
  prompt: z.string().min(5).max(5000),
  contentType: contentTypeEnum,
  channel: channelEnum.optional(),
  tone: z.string().max(100).optional(),
  targetAudience: z.string().max(500).optional(),
  keywords: z.array(z.string().max(100)).max(20).optional(),
  aiCreativityLevel: z.enum(['conservative', 'balanced', 'creative']).optional(),
  maxLength: z.number().int().min(50).max(10000).optional(),
  clientId: z.string().optional(),
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;

// F2: Repurpose
export const repurposeSchema = z.object({
  sourceDraftId: z.string().min(1),
  targetChannels: z.array(channelEnum).min(1).max(10),
});

export type RepurposeInput = z.infer<typeof repurposeSchema>;

// ═══════════════════════════════════════════════════════════
// F6: APPROVAL WORKFLOWS
// ═══════════════════════════════════════════════════════════

export const submitForApprovalSchema = z.object({
  contentDraftId: z.string().min(1),
  approverUserId: z.string().optional(),  // For single-stage
  workflowTemplateId: z.string().optional(), // For multi-stage
});

export type SubmitForApprovalInput = z.infer<typeof submitForApprovalSchema>;

export const approvalDecisionSchema = z.object({
  action: z.enum(['approved', 'rejected', 'changes_requested', 'reassigned']),
  feedback: z.array(z.object({
    feedbackCategory: z.enum(['tone', 'accuracy', 'brand_voice', 'legal', 'visual', 'grammar', 'strategy', 'other']).optional(),
    body: z.string().max(2000),
    visibility: z.enum(['internal_only', 'all_stakeholders']).optional(),
    suggestedFix: z.string().max(2000).optional(),
    annotationData: z.object({
      startOffset: z.number().optional(),
      endOffset: z.number().optional(),
      selectedText: z.string().optional(),
    }).optional(),
  })).optional(),
  reassignedToId: z.string().optional(),
});

export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;

export const approvalStageTemplateSchema = z.object({
  stageName: z.string().min(1).max(100),
  stageType: z.enum(['internal', 'client', 'legal', 'executive']),
  approvalMode: z.enum(['any_one', 'all_required']),
  approverUserIds: z.array(z.string()).max(20).optional(),
  approverMinRole: z.enum(['owner', 'admin', 'manager']).optional(),
  slaHours: z.number().int().min(1).max(720).optional(),
  autoApproveOnExpiry: z.boolean().optional(),
  reminderScheduleHours: z.array(z.number().int()).max(10).optional(),
  isOptional: z.boolean().optional(),
});

export const createWorkflowTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  isDefault: z.boolean().optional(),
  stages: z.array(approvalStageTemplateSchema).min(1).max(10),
});

export type CreateWorkflowTemplateInput = z.infer<typeof createWorkflowTemplateSchema>;

export const approvalSettingsSchema = z.object({
  requireApproval: z.boolean(),
  requireExternalApproval: z.boolean().optional(),
  defaultWorkflowTemplateId: z.string().optional(),
  escalationThresholdHours: z.number().int().min(1).max(720).optional(),
  autoApproveForRoles: z.array(z.enum(['owner', 'admin', 'manager', 'editor'])).optional(),
  defaultReminderScheduleHours: z.array(z.number().int()).max(10).optional(),
  resetsChainOnReject: z.boolean().optional(),
});

export type ApprovalSettingsInput = z.infer<typeof approvalSettingsSchema>;

// ═══════════════════════════════════════════════════════════
// F3: PUBLISHING
// ═══════════════════════════════════════════════════════════

export const createPublishJobSchema = z.object({
  contentDraftId: z.string().min(1),
  platforms: z.array(channelEnum).min(1),
  scheduledAt: z.string().datetime().optional(),
  publishMode: z.enum(['auto', 'manual', 'mock']).optional(),
  utmConfig: z.object({
    enabled: z.boolean(),
    template: z.object({
      utmSource: z.string().max(100).optional(),
      utmMedium: z.string().max(100).optional(),
      utmCampaign: z.string().max(100).optional(),
      utmContent: z.string().max(100).optional(),
      utmTerm: z.string().max(100).optional(),
    }).optional(),
  }).optional(),
  firstComment: z.string().max(2200).optional(), // Instagram/LinkedIn
});

export type CreatePublishJobInput = z.infer<typeof createPublishJobSchema>;

export const markManuallyPublishedSchema = z.object({
  platformUrls: z.record(z.string(), z.string().url()),
  notes: z.string().max(500).optional(),
});

export type MarkManuallyPublishedInput = z.infer<typeof markManuallyPublishedSchema>;

export const retractPublishJobSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ═══════════════════════════════════════════════════════════
// F4: CALENDAR
// ═══════════════════════════════════════════════════════════

export const createCalendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['publish', 'approval_deadline', 'content_due', 'meeting', 'campaign_launch', 'review', 'deadline', 'custom']),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().max(50),
  allDay: z.boolean().optional(),
  color: z.string().max(20).optional(),
  linkedContentDraftId: z.string().optional(),
  linkedPublishJobId: z.string().optional(),
  linkedCampaignId: z.string().optional(),
  linkedClientId: z.string().optional(),
  notificationMinutesBefore: z.array(z.number().int().positive()).max(5).optional(),
  attendeeUserIds: z.array(z.string()).max(50).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
    interval: z.number().int().positive().optional(),
    endDate: z.string().datetime().optional(),
    byDayOfWeek: z.array(z.string()).max(7).optional(),
    byDayOfMonth: z.array(z.number().int().min(1).max(31)).max(5).optional(),
  }).optional(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;

export const updateCalendarEventSchema = createCalendarEventSchema.partial().extend({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
});

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;

// ─── List / Query Schemas ───────────────────────────────────

export const listDraftsQuerySchema = z.object({
  status: contentStatusEnum.optional(),
  contentType: contentTypeEnum.optional(),
  channel: channelEnum.optional(),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  campaignId: z.string().optional(),
  sortBy: z.enum(['updatedAt', 'createdAt', 'dueDate', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export const listCalendarEventsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  eventType: z.enum(['publish', 'approval_deadline', 'content_due', 'meeting', 'campaign_launch', 'review', 'deadline', 'custom']).optional(),
  linkedClientId: z.string().optional(),
});
