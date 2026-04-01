import type {
  WorkspaceRole,
  PlatformRole,
  AccountType,
  Tier,
  WorkspaceStatus,
} from '../roles';

/**
 * Portable Timestamp type — compatible with firebase-admin's Timestamp
 * but importable from client components without pulling in firebase-admin.
 * The actual Timestamp class is used in server code (converters, API routes).
 */
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

// ═══════════════════════════════════════════════════════════
// SHARED EMBEDDED TYPES
// ═══════════════════════════════════════════════════════════

export interface Address {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-2
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

export interface SocialAccount {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'pinterest' | 'threads' | 'google_business' | 'other';
  handle: string;
  url?: string;
}

export interface ContactEntry {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  role?: string;
}

export interface MemberPreferences {
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  weeklyDigest?: boolean;
  locale?: string;
}

export interface PlatformUserPreferences {
  emailNotifications?: boolean;
  slackNotifications?: boolean;
  darkMode?: boolean;
}

// ═══════════════════════════════════════════════════════════
// WORKSPACE — workspaces/{workspaceId}
// Lean tenant shell: system data only.
// Business identity lives in entity_profiles/{workspaceId}.
// ═══════════════════════════════════════════════════════════

export interface Workspace {
  id: string;
  clerkOrgId: string;
  name: string;
  ownerId: string;
  accountType: AccountType;
  tier: Tier;
  status: WorkspaceStatus;
  industry?: string;
  trialEndsAt?: FirestoreTimestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  parentWorkspaceId?: string;
  agencyWorkspaceId?: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  onboardingCompletedAt?: FirestoreTimestamp;
  timezone?: string;      // IANA (auto-detected during onboarding)
  locale?: string;        // BCP 47
  primaryEmail?: string;  // Main workspace contact
  deletedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// ENTITY PROFILE — entity_profiles/{workspaceId}
// Business identity + marketing defaults + customization.
// One doc per workspace, polymorphic by accountType.
// ═══════════════════════════════════════════════════════════

// ─── Content Strategy Defaults ──────────────────────────────
export interface ContentStrategyDefaults {
  contentPillars?: string[];
  targetAudience?: string;
  competitorNames?: string[];
  hashtagSets?: Record<string, string[]>;
  defaultBrandVoiceNotes?: string;
  doNotUseWords?: string[];
  boilerplateIntro?: string;
  boilerplateOutro?: string;
  standardDisclaimers?: string[];
  contentLengthPrefs?: Record<string, string>;  // {blog_post: 'long', social_post: 'short'}
  toneVariations?: Record<string, string>;       // {linkedin: 'professional', instagram: 'playful'}
}

// ─── AI Generation Defaults ─────────────────────────────────
export interface AiGenerationDefaults {
  aiModel?: string;
  aiCreativityLevel?: 'conservative' | 'balanced' | 'creative';
  aiDefaultLanguage?: string;
  aiAdditionalLanguages?: string[];
  industryJargon?: string[];
  aiStyleGuideNotes?: string;
}

// ─── Campaign & Budget ──────────────────────────────────────
export interface CampaignBudgetDefaults {
  fiscalYearStart?: number;          // 1-12
  annualMarketingBudget?: number;    // cents
  budgetCurrency?: string;           // ISO 4217
  budgetAlertThreshold?: number;     // percentage
}

// ─── Reporting Defaults ─────────────────────────────────────
export interface ReportingDefaults {
  defaultDateRange?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month';
  reportFormat?: 'pdf' | 'csv' | 'both';
  autoReportSchedule?: 'weekly' | 'biweekly' | 'monthly' | 'none';
  autoReportDay?: number;
  autoReportRecipients?: string[];
  kpiDashboardWidgets?: string[];
  benchmarkIndustry?: string;
}

// ─── Integration & Scheduling Defaults ──────────────────────
export interface IntegrationDefaults {
  plannedIntegrations?: string[];
  defaultPostingTimes?: Record<string, string>;  // {instagram: '09:00'}
  preferredPostingDays?: string[];
  autoScheduleEnabled?: boolean;
  contentApprovalDefault?: 'auto_approve' | 'single_approval' | 'multi_stage';
}

// ─── Workflow & Template Defaults ───────────────────────────
export interface WorkflowDefaults {
  defaultApprovalChain?: string;
  defaultEmailTemplateId?: string;
  defaultReportTemplateId?: string;
  socialPostTemplateIds?: string[];
  notificationPrefs?: Record<string, boolean>;
}

// ─── Base Entity Profile (shared across all account types) ──
interface EntityProfileBase {
  workspaceId: string;
  accountType: AccountType;

  // Core identity
  legalName?: string;
  primaryEmail?: string;
  billingEmail?: string;
  phone?: string;
  website?: string;
  address?: Address;
  timezone?: string;
  locale?: string;
  socialLinks?: SocialLinks;
  logoUrl?: string;
  logomarkUrl?: string;
  companySize?: 'solo' | '2-10' | '11-50' | '51-200' | '201-500' | '500+';
  foundedYear?: number;
  description?: string;

  // Marketing defaults
  contentStrategy?: ContentStrategyDefaults;
  aiDefaults?: AiGenerationDefaults;
  campaignBudget?: CampaignBudgetDefaults;
  reporting?: ReportingDefaults;
  integrations?: IntegrationDefaults;
  workflow?: WorkflowDefaults;

  // Timestamps
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ─── Freelancer Profile ─────────────────────────────────────
export interface FreelancerProfile extends EntityProfileBase {
  accountType: 'freelancer';
  specializations?: string[];
  yearsOfExperience?: number;
  portfolioUrl?: string;
  availabilityStatus?: 'available' | 'busy' | 'not_taking_clients';
  hourlyRate?: number;   // cents
  rateCurrency?: string; // ISO 4217
}

// ─── Organization Profile ───────────────────────────────────
export interface OrganizationProfile extends EntityProfileBase {
  accountType: 'organization';
  industry?: string;
  department?: string;
  departments?: string[];
  taxId?: string;
  taxIdType?: 'ein' | 'vat' | 'gst' | 'abn' | 'other';
  businessType?: 'llc' | 'corporation' | 'sole_proprietor' | 'partnership' | 'other';
}

// ─── Agency Profile ─────────────────────────────────────────
export interface AgencyProfile extends EntityProfileBase {
  accountType: 'agency';
  agencyType?: 'full_service' | 'digital' | 'social_media' | 'seo' | 'content' | 'pr' | 'performance' | 'creative' | 'other';
  specializations?: string[];
  serviceOfferings?: string[];
  industriesServed?: string[];
  maxClients?: number;
  taxId?: string;
  taxIdType?: 'ein' | 'vat' | 'gst' | 'abn' | 'other';
  businessType?: 'llc' | 'corporation' | 'sole_proprietor' | 'partnership' | 'other';
  whiteLabel?: boolean;
  customDomain?: string;
  clientPortalSubdomain?: string;
  emailFromName?: string;
  emailReplyTo?: string;
  reportBranding?: 'aura' | 'co_branded' | 'white_label';
  hidePoweredByAura?: boolean;
}

export type EntityProfile = FreelancerProfile | OrganizationProfile | AgencyProfile;

// ═══════════════════════════════════════════════════════════
// WORKSPACE MEMBER — workspaces/{workspaceId}/members/{userId}
// ═══════════════════════════════════════════════════════════

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  status: 'active' | 'invited' | 'deactivated';
  email: string;
  displayName: string;
  avatarUrl?: string;
  invitedBy: string;
  joinedAt?: FirestoreTimestamp;
  assignedClientIds?: string[];
  deletedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
  // Extended fields
  title?: string;
  department?: string;
  phone?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  skills?: string[];
  timezone?: string;
  isContractor?: boolean;
  weeklyCapacityHours?: number;
  lastActiveAt?: FirestoreTimestamp;
  preferences?: MemberPreferences;
}

// ═══════════════════════════════════════════════════════════
// PLATFORM USER — platform_users/{userId}
// ═══════════════════════════════════════════════════════════

export interface PlatformUser {
  userId: string;
  email: string;
  displayName: string;
  role: PlatformRole;
  status: 'active' | 'invited' | 'deactivated';
  invitedBy: string;
  lastLoginAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
  // Extended fields
  title?: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  preferences?: PlatformUserPreferences;
}

// ═══════════════════════════════════════════════════════════
// CLIENT — clients/{clientId}
// Flat top-level collection. Scoped by agencyWorkspaceId.
// Full CRM-lite: lifecycle, health, billing, service scope.
// ═══════════════════════════════════════════════════════════

export type ClientStatus = 'prospect' | 'onboarding' | 'active' | 'paused' | 'offboarding' | 'churned' | 'archived';
export type LifecycleStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'active_client' | 'at_risk' | 'churned';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type RiskLevel = 'low' | 'medium' | 'high';
export type BillingModel = 'retainer' | 'project' | 'hourly' | 'performance' | 'hybrid';
export type BillingCycle = 'monthly' | 'quarterly' | 'annually';
export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt';
export type ClientSource = 'manual' | 'claimed' | 'imported';

export interface ClientBrandProfile {
  brandName?: string;
  brandVoiceTone?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'technical' | 'inspirational';
  brandVoiceNotes?: string;
  targetAudience?: string;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandLogoUrl?: string;
  brandGuidelinesUrl?: string;
  competitorNames?: string[];
  contentPillars?: string[];
  hashtagSets?: Record<string, string[]>;
  doNotUseWords?: string[];
}

export interface AgencyClient {
  clientId: string;
  agencyWorkspaceId: string;
  clerkOrgId?: string;
  childWorkspaceId?: string;
  name: string;
  clientCode?: string;
  legalName?: string;
  industry?: string;
  website?: string;
  description?: string;

  // Contacts
  primaryContact?: ContactEntry;
  billingContact?: ContactEntry;
  additionalContacts?: ContactEntry[];

  // Address & social
  address?: Address;
  socialAccounts?: SocialAccount[];
  logoUrl?: string;

  // Lifecycle & health
  status: ClientStatus;
  lifecycleStage?: LifecycleStage;
  healthScore?: number;
  healthStatus?: HealthStatus;
  clientSince?: FirestoreTimestamp;
  nextReviewDate?: FirestoreTimestamp;
  riskLevel?: RiskLevel;
  riskNotes?: string;

  // Billing & contract
  billingModel?: BillingModel;
  retainerAmount?: number;
  retainerCurrency?: string;
  billingCycle?: BillingCycle;
  paymentTerms?: PaymentTerms;
  contractStartDate?: FirestoreTimestamp;
  contractEndDate?: FirestoreTimestamp;
  totalContractValue?: number;
  autoRenew?: boolean;

  // Service scope
  servicesProvided?: string[];
  platforms?: string[];
  contentTypes?: string[];
  monthlyContentQuota?: number;
  postingFrequency?: Record<string, number>;

  // Per-client brand
  brand?: ClientBrandProfile;

  // Team & portal
  assignedTeamMemberIds: string[];
  accountManagerId?: string;
  strategistId?: string;
  portalEnabled?: boolean;
  portalUserIds?: string[];

  // Metadata
  tags?: string[];
  source?: ClientSource;
  internalNotes?: string;
  deletedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// PROFILE SCORE — workspaces/{workspaceId}/profile_score/current
// ═══════════════════════════════════════════════════════════

export interface ProfileScore {
  workspaceId: string;
  accountType: AccountType;
  completedActions: string[];
  score: number;
  maxScore: number;
  percentage: number;
  widgetDismissed: boolean;
  calculatedAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// UPGRADE REQUEST — upgrade_requests/{requestId}
// ═══════════════════════════════════════════════════════════

export interface UpgradeRequest {
  id: string;
  workspaceId: string;
  requestedBy: string;
  currentAccountType: AccountType;
  requestedAccountType: AccountType;
  currentTier: Tier;
  requestedTier?: Tier;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATION — notifications/{userId}/items/{notificationId}
// ═══════════════════════════════════════════════════════════

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  workspaceId?: string;
  isRead: boolean;
  readAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
