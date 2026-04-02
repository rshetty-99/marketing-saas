/**
 * F14: Client Management Types (extends AgencyClient from f0.ts)
 *
 * Onboarding workflows, communication logs, SOW tracking,
 * white-label reports, multi-stakeholder management, portal.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// CLIENT ONBOARDING — extends AgencyClient
// ═══════════════════════════════════════════════════════════

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'stalled';

export interface OnboardingChecklistItem {
  id: string;
  label: string;
  order: number;
  completed: boolean;
  completedAt?: FirestoreTimestamp;
  completedBy?: string;
}

export interface ClientOnboarding {
  status: OnboardingStatus;
  kickoffDate?: FirestoreTimestamp;
  expectedCompletionDate?: FirestoreTimestamp;
  checklist: OnboardingChecklistItem[];
  templateId?: string;                 // Reusable template
  welcomeEmailSentAt?: FirestoreTimestamp;
  brandAssetsReceived: boolean;
  accessCredentials?: {
    platform: string;
    status: 'pending' | 'received' | 'verified';
    receivedAt?: FirestoreTimestamp;
  }[];
}

// ═══════════════════════════════════════════════════════════
// CLIENT OFFBOARDING
// ═══════════════════════════════════════════════════════════

export interface ClientOffboarding {
  checklist: OnboardingChecklistItem[];
  churnReason?: string;
  churnDate?: FirestoreTimestamp;
  dataExportUrl?: string;
  dataRetentionExpiry?: FirestoreTimestamp;
  accessRevocationDate?: FirestoreTimestamp;
  winbackEligible: boolean;
  finalReportSentAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// COMMUNICATION LOG — clients/{clientId}/communications/{logId}
// ═══════════════════════════════════════════════════════════

export type CommunicationType =
  | 'meeting_note' | 'email_thread' | 'call_recording'
  | 'internal_note' | 'slack_message' | 'status_update';

export interface CommunicationAttachment {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CommunicationLog {
  id: string;
  clientId: string;
  agencyWorkspaceId: string;
  communicationType: CommunicationType;
  subject: string;
  body: string;
  attachments?: CommunicationAttachment[];
  participants?: string[];             // userIds or emails
  meetingDate?: FirestoreTimestamp;
  durationMinutes?: number;
  recordingUrl?: string;
  visibility: 'internal' | 'client_visible';
  createdBy: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// SOW / DELIVERABLES — clients/{clientId}/scopes/{scopeId}
// ═══════════════════════════════════════════════════════════

export type DeliverableStatus = 'pending' | 'in_progress' | 'delivered' | 'approved' | 'overdue';

export interface Deliverable {
  id: string;
  name: string;
  type: string;                        // e.g., 'blog_post', 'social_pack', 'report'
  quantity: number;
  completedCount: number;
  status: DeliverableStatus;
  dueDate?: FirestoreTimestamp;
  approvedAt?: FirestoreTimestamp;
  approvedBy?: string;
}

export interface ScopeOfWork {
  id: string;
  clientId: string;
  periodStart: FirestoreTimestamp;
  periodEnd: FirestoreTimestamp;
  deliverables: Deliverable[];
  sowDocumentUrl?: string;
  monthlyCapacity?: {
    totalHours: number;
    allocatedHours: number;
  };
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// RETAINER / BUDGET TRACKING — on AgencyClient
// ═══════════════════════════════════════════════════════════

export type RetainerType = 'hourly' | 'fixed' | 'project_based' | 'hybrid';

export interface RetainerTracking {
  retainerType: RetainerType;
  allocatedHours?: number;             // Per billing period
  usedHours: number;
  budgetAmount: number;                // Cents
  budgetSpent: number;                 // Cents
  budgetPeriod: 'monthly' | 'quarterly' | 'annual' | 'project';
  billingCycleStart?: FirestoreTimestamp;
  rolloverUnusedHours: boolean;
  rolloverCap?: number;
  overageRate?: number;                // Cents per hour
  overageAlertThresholds?: number[];   // e.g., [75, 90, 100] %
  burnRate?: number;                   // Computed: spent / elapsed period %
  estimatedOverageAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// WHITE-LABEL REPORT — clients/{clientId}/reports/{reportId}
// ═══════════════════════════════════════════════════════════

export type ReportSectionType =
  | 'metrics_summary' | 'chart' | 'table'
  | 'text_block' | 'content_showcase';

export interface ReportSection {
  id: string;
  type: ReportSectionType;
  title: string;
  order: number;
  visible: boolean;
  dataSourceId?: string;
}

export interface ClientReportConfig {
  reportTemplateId?: string;
  clientBranding: {
    logoUrl: string;
    primaryColor: string;
    accentColor?: string;
    companyName: string;
    customDomain?: string;
  };
  sections: ReportSection[];
  scheduleFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'manual';
  scheduleDay?: number;                // Day of week/month
  recipientEmails: string[];
  includeExecutiveSummary: boolean;
  dateRange: 'last_7d' | 'last_30d' | 'last_quarter' | 'custom';
  reportFormat: 'pdf' | 'web_link' | 'both';
  coverPageEnabled: boolean;
}

export interface ClientReport {
  id: string;
  clientId: string;
  agencyWorkspaceId: string;
  config: ClientReportConfig;
  status: 'generating' | 'ready' | 'sent' | 'failed';
  pdfUrl?: string;
  webUrl?: string;
  generatedAt?: FirestoreTimestamp;
  sentAt?: FirestoreTimestamp;
  sentTo?: string[];
  lastSentAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// MULTI-STAKEHOLDER CONTACTS — on AgencyClient
// ═══════════════════════════════════════════════════════════

export type ContactAccessLevel = 'full' | 'reports_only' | 'none';

export interface ClientStakeholder {
  userId?: string;                     // If they have a portal account
  name: string;
  email: string;
  role: 'primary' | 'billing' | 'reviewer' | 'viewer';
  portalAccessLevel: ContactAccessLevel;
  notificationPrefs?: {
    email: boolean;
    inApp: boolean;
  };
  invitedAt?: FirestoreTimestamp;
  lastActiveAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// CLIENT SATISFACTION
// ═══════════════════════════════════════════════════════════

export interface SurveyResponse {
  surveyId: string;
  score: number;
  feedback?: string;
  submittedAt: FirestoreTimestamp;
}

export interface ClientSatisfaction {
  npsScore?: number;                   // 0-10
  npsCategory?: 'detractor' | 'passive' | 'promoter';
  csatScore?: number;                  // 1-5
  surveyResponses: SurveyResponse[];
  surveyFrequency: 'monthly' | 'quarterly' | 'per_project' | 'manual';
  lastSurveySentAt?: FirestoreTimestamp;
  nextSurveyDueAt?: FirestoreTimestamp;
  checkInCadence: 'weekly' | 'biweekly' | 'monthly';
  lastCheckInAt?: FirestoreTimestamp;
  nextCheckInDueAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// CLIENT HEALTH SCORE (computed — 5 weighted categories)
// ═══════════════════════════════════════════════════════════

export interface HealthSignal {
  signal: string;
  category: 'content_activity' | 'engagement' | 'responsiveness' | 'financial' | 'satisfaction';
  weight: number;
  value: number;                       // 0-100
  rawData?: Record<string, unknown>;
}

export interface ClientHealthScore {
  overallScore: number;                // 0-100
  healthStatus: 'green' | 'yellow' | 'red';
  churnRisk: 'low' | 'medium' | 'high';
  signals: HealthSignal[];
  categories: {
    contentActivity: number;           // 0-100
    engagement: number;
    responsiveness: number;
    financial: number;
    satisfaction: number;
  };
  computedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// ONBOARDING TEMPLATE — workspaces/{workspaceId}/settings/onboarding_templates/{templateId}
// Reusable checklist templates for new client onboarding.
// ═══════════════════════════════════════════════════════════

export interface OnboardingTemplate {
  id: string;
  workspaceId: string;
  name: string;                        // e.g., "Social Media Client", "Full-Service Client"
  description?: string;
  checklist: { label: string; order: number }[];
  isDefault: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
