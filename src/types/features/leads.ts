/**
 * F12: Lead Management / CRM-lite Types
 *
 * Customizable pipeline, lead scoring, activity timeline,
 * attribution, nurture automation, duplicate detection, recycling.
 */

import type { FirestoreTimestamp, Address, SocialLinks } from './f0';

// ═══════════════════════════════════════════════════════════
// PIPELINE CONFIG — workspaces/{workspaceId}/settings/pipeline_config
// ═══════════════════════════════════════════════════════════

export interface PipelineStage {
  id: string;
  label: string;
  order: number;
  color: string;                       // Hex
  isWon?: boolean;                     // Terminal won stage
  isLost?: boolean;                    // Terminal lost stage
  defaultProbability?: number;         // Auto-set when lead enters this stage
}

export interface PipelineConfig {
  workspaceId: string;
  stages: PipelineStage[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// LEAD — workspaces/{workspaceId}/leads/{leadId}
// ═══════════════════════════════════════════════════════════

export type LeadSource =
  | 'web_form' | 'referral' | 'paid_ad' | 'cold_outreach'
  | 'social' | 'event' | 'partner' | 'inbound_email' | 'other';

export interface LeadScoreBreakdown {
  signal: string;
  points: number;
  occurredAt: FirestoreTimestamp;
}

export interface LeadStageMovement {
  fromStage: string;
  toStage: string;
  movedAt: FirestoreTimestamp;
  movedBy: string;
}

// ─── Activity Timeline ──────────────────────────────────────
export type LeadActivityType =
  | 'call' | 'email' | 'meeting' | 'note' | 'task'
  | 'sms' | 'chat' | 'deal_stage_change' | 'document_viewed';

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: LeadActivityType;
  subject?: string;
  body?: string;
  durationSeconds?: number;            // Calls/meetings
  direction?: 'inbound' | 'outbound';  // Calls/emails
  outcome?: 'connected' | 'no_answer' | 'voicemail' | 'busy';
  attendees?: string[];                // Meeting emails
  recordingUrl?: string;
  performedBy: string;                 // userId
  occurredAt: FirestoreTimestamp;
  isAutomated: boolean;
  createdAt: FirestoreTimestamp;
}

// ─── Attribution ────────────────────────────────────────────
export interface LeadTouchpoint {
  channel: string;
  campaignId?: string;
  campaignName?: string;
  touchpointType: 'first' | 'middle' | 'last';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  timestamp: FirestoreTimestamp;
}

// ─── Nurture Automation ─────────────────────────────────────
export type NurtureActionType = 'assign_task' | 'send_email' | 'change_stage' | 'notify_owner' | 'add_tag';

export interface NurtureRule {
  id: string;
  trigger: 'stage_change' | 'score_threshold' | 'inactivity' | 'tag_added';
  condition: Record<string, unknown>;
  actions: { type: NurtureActionType; config: Record<string, unknown> }[];
  delayMinutes?: number;
  templateId?: string;
  isActive: boolean;
}

export interface NurtureHistory {
  ruleId: string;
  triggeredAt: FirestoreTimestamp;
  actionsTaken: string[];
}

// ─── Duplicate Detection ────────────────────────────────────
export type DuplicateStatus = 'unique' | 'suspected' | 'confirmed' | 'merged';

// ─── Import Job ─────────────────────────────────────────────
export type DedupStrategy = 'email' | 'email_company' | 'phone' | 'skip_duplicates' | 'update_existing' | 'create_duplicates';

export interface LeadImportJob {
  id: string;
  workspaceId: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errorRows: { row: number; error: string }[];
  dedupStrategy: DedupStrategy;
  status: 'processing' | 'complete' | 'failed';
  createdBy: string;
  createdAt: FirestoreTimestamp;
}

// ─── Main Lead Document ─────────────────────────────────────
export interface Lead {
  id: string;
  workspaceId: string;
  clientId?: string;                   // Agency: which client this lead is for

  // Contact info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  companyName?: string;
  companySize?: string;
  jobTitle?: string;
  industry?: string;
  website?: string;
  address?: Address;
  socialProfiles?: SocialLinks;

  // Pipeline
  stage: string;                       // References PipelineConfig.stages[].id
  previousStage?: string;
  stageMovements: LeadStageMovement[];

  // Deal info
  dealValue?: number;                  // Cents
  currency?: string;                   // ISO 4217
  probability?: number;                // 0-100
  expectedCloseDate?: FirestoreTimestamp;
  lostReason?: string;

  // Source & attribution
  leadSource: LeadSource;
  leadSourceDetail?: string;           // Campaign name, referrer, etc.
  touchpoints?: LeadTouchpoint[];
  attributionModel?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';

  // Scoring
  leadScore: number;
  scoreBreakdown?: LeadScoreBreakdown[];
  scoringModel: 'manual' | 'rule_based';

  // Assignment
  assignedTo?: string;                 // userId
  tags: string[];
  customFields?: Record<string, string | number | boolean | string[]>;

  // Activity
  lastContactedAt?: FirestoreTimestamp;
  lastActivityAt?: FirestoreTimestamp;
  nextFollowUpAt?: FirestoreTimestamp;

  // Nurture automation
  nurtureCampaignId?: string;
  automationRules?: NurtureRule[];
  automationHistory?: NurtureHistory[];

  // Duplicate detection
  duplicateStatus: DuplicateStatus;
  duplicateGroupId?: string;
  duplicateConfidence?: number;        // 0-1
  duplicateMatchFields?: string[];
  mergedFromIds?: string[];
  masterRecordId?: string;

  // Lead recycling
  recycledAt?: FirestoreTimestamp;
  recycleCount: number;
  recycleReason?: 'stale' | 'lost_re_engage' | 'nurture_complete';
  originalLostReason?: string;
  cooldownUntil?: FirestoreTimestamp;

  // Conversion to client (F14 bridge)
  convertedToClientId?: string;
  convertedAt?: FirestoreTimestamp;
  convertedBy?: string;
  conversionSnapshot?: {
    dealValue?: number;
    stage: string;
    leadScore: number;
    assignedTo?: string;
  };

  // Metadata
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// PIPELINE ANALYTICS (computed)
// ═══════════════════════════════════════════════════════════

export interface PipelineAnalytics {
  conversionRateByStage: Record<string, number>;
  avgTimeInStageSeconds: Record<string, number>;
  dealVelocityDays: number;
  winRate: number;
  pipelineValue: number;               // Cents
  weightedPipelineValue: number;       // dealValue * probability
  leadCountByStage: Record<string, number>;
}
