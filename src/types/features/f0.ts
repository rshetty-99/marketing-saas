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

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'freelancer';
export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'on_leave';
export type EmojiPolicy = 'encouraged' | 'allowed' | 'discouraged' | 'banned';

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
// Business identity + brand voice + marketing defaults.
// One doc per workspace, polymorphic by accountType.
// ═══════════════════════════════════════════════════════════

// ─── Brand Voice Profile (F8) ──────────────────────────────
export interface PersonalityTrait {
  trait: string;       // e.g., "witty", "authoritative", "warm"
  intensity: number;   // 1-10
}

export interface WritingSample {
  content: string;     // The actual text sample
  source?: string;     // Where it came from (blog post title, URL, etc.)
  isApproved: boolean; // Whether this is an approved "gold standard" sample
}

export interface VocabularyTerm {
  term: string;
  replacement?: string; // For banned terms: what to use instead
  context?: string;     // When/how to use (for caution terms)
  reason?: string;      // Why this rule exists
}

export interface ChannelVoiceOverride {
  channel: string;     // 'linkedin' | 'instagram' | 'twitter' | 'email' | 'blog' | 'ad_copy'
  formalityLevel?: number;        // 1-10, overrides base
  toneDescriptors?: string[];     // Overrides base for this channel
  emojiPolicy?: EmojiPolicy;      // Overrides base
  maxSentenceLength?: number;     // Overrides base
  notes?: string;                 // Channel-specific voice instructions
}

export interface BrandVoiceProfile {
  // Core voice identity
  personalityTraits?: PersonalityTrait[];      // 3-5 traits with intensity
  formalityLevel?: number;                     // 1 (very casual) to 10 (very formal)
  toneDescriptors?: string[];                  // On-brand tones (from ~50 options)
  antiToneDescriptors?: string[];              // Off-brand tones to avoid
  voiceDescription?: string;                   // Auto-generated or manual summary

  // Writing samples for AI matching
  writingSamples?: WritingSample[];            // Reference content (min 300 words total recommended)

  // Vocabulary controls
  approvedTerms?: VocabularyTerm[];            // Terms to always use
  bannedTerms?: VocabularyTerm[];              // Terms to never use (with replacements)
  cautionTerms?: VocabularyTerm[];             // Terms to use carefully (with context)

  // Content rules
  maxSentenceLength?: number;                  // e.g., 20 words
  targetReadingLevel?: string;                 // e.g., "grade-8"
  preferredCTAStyle?: string;                  // e.g., "action-verb-first"
  emojiPolicy?: EmojiPolicy;
  formattingPreferences?: {
    bulletPoints?: boolean;
    shortParagraphs?: boolean;
    headingStyle?: string;                     // 'sentence_case' | 'title_case' | 'all_caps'
  };

  // Per-channel overrides (inherits base, specifies deltas)
  channelOverrides?: ChannelVoiceOverride[];

  // Voice consistency scoring weights (0-1, must sum to 1)
  scoringWeights?: {
    vocabulary?: number;    // default 0.25
    tone?: number;          // default 0.25
    structure?: number;     // default 0.15
    readability?: number;   // default 0.15
    identity?: number;      // default 0.20
  };
}

// ─── Brand Assets (F8) ──────────────────────────────────────
export interface BrandColor {
  role: string;        // 'primary' | 'secondary' | 'accent' | 'background' | 'success' | 'warning' | 'error' | custom
  name?: string;       // Human-readable name (e.g., "Sunset Orange")
  hex: string;         // #RRGGBB
  rgb?: string;        // rgb(R, G, B)
}

export interface ColorPalette {
  name: string;        // 'Core' | 'Extended' | 'Functional' | custom
  colors: BrandColor[];
}

export interface BrandTypography {
  heading?: { family: string; weights?: number[]; fallback?: string };
  body?: { family: string; weights?: number[]; fallback?: string };
  accent?: { family: string; weights?: number[]; fallback?: string };
  lineHeight?: { heading?: number; body?: number };
  letterSpacing?: { heading?: string; body?: string };
}

export interface LogoVariant {
  variant: 'primary' | 'icon' | 'wordmark' | 'horizontal' | 'stacked';
  colorMode: 'full_color' | 'monochrome' | 'dark_bg' | 'light_bg';
  fileUrl: string;
  fileType?: 'svg' | 'png' | 'jpg';
  width?: number;
  height?: number;
  minDisplaySize?: number;  // px
}

export interface BrandAssets {
  colorPalettes?: ColorPalette[];
  typography?: BrandTypography;
  logoVariants?: LogoVariant[];
  brandGuidelinesUrl?: string;
  faviconUrl?: string;
}

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

  // Brand identity (F8 — absorbed from brand_profiles)
  brandName?: string;
  primaryColor?: string;        // hex
  voiceTone?: string;           // legacy single tone (from onboarding)

  // Brand voice profile (F8 — rich voice config)
  brandVoice?: BrandVoiceProfile;

  // Brand assets (F8)
  brandAssets?: BrandAssets;

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

  // Profile fields
  title?: string;
  department?: string;
  phone?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  skills?: string[];
  timezone?: string;

  // Employment & capacity (F7)
  employmentType?: EmploymentType;
  availabilityStatus?: AvailabilityStatus;
  costRate?: number;               // cents/hour — admin-only visible
  billRate?: number;               // cents/hour — admin-only visible
  startDate?: FirestoreTimestamp;   // employment start
  endDate?: FirestoreTimestamp;     // employment end (for contractors/offboarding)
  reportsTo?: string;              // userId of manager
  maxClientAccounts?: number;      // capacity ceiling
  weeklyCapacityHours?: number;

  // Activity
  lastActiveAt?: FirestoreTimestamp;
  preferences?: MemberPreferences;

  // Offboarding (F7)
  deactivatedAt?: FirestoreTimestamp;
  deactivatedBy?: string;
  deactivationReason?: string;
  reassignedTo?: string;           // userId content/clients were reassigned to
}

// ═══════════════════════════════════════════════════════════
// INVITE LINK — workspaces/{workspaceId}/invite_links/{linkId}
// Shareable invite URL with pre-assigned role.
// ═══════════════════════════════════════════════════════════

export interface InviteLink {
  linkId: string;
  workspaceId: string;
  token: string;                   // unique URL token
  role: WorkspaceRole;
  maxUses?: number;                // null = unlimited
  usedCount: number;
  expiresAt?: FirestoreTimestamp;
  createdBy: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// AUDIT LOG — workspaces/{workspaceId}/audit_log/{entryId}
// Workspace-level activity trail for compliance + debugging.
// ═══════════════════════════════════════════════════════════

export type AuditAction =
  | 'member.invited' | 'member.joined' | 'member.role_changed' | 'member.deactivated' | 'member.removed' | 'member.reactivated'
  | 'workspace.settings_updated' | 'workspace.logo_changed' | 'workspace.archived' | 'workspace.deleted' | 'workspace.ownership_transferred'
  | 'brand.voice_updated' | 'brand.assets_updated' | 'brand.strategy_updated'
  | 'content.created' | 'content.updated' | 'content.published' | 'content.deleted' | 'content.approved' | 'content.rejected'
  | 'integration.connected' | 'integration.disconnected' | 'integration.sync_failed'
  | 'billing.plan_changed' | 'billing.payment_method_updated'
  | 'auth.login' | 'auth.logout' | 'auth.failed_login'
  | 'export.requested' | 'export.completed';

export type AuditResourceType =
  | 'workspace' | 'member' | 'content' | 'brand' | 'integration' | 'billing' | 'auth' | 'export' | 'client';

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;             // ID of the affected resource
  resourceName?: string;           // Human-readable name
  actorId: string;                 // userId who performed the action
  actorName?: string;              // Display name for convenience
  actorIp?: string;
  details?: Record<string, unknown>; // JSON diff or context (e.g., {oldRole: 'editor', newRole: 'viewer'})
  createdAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// WORKSPACE NOTIFICATION SETTINGS — workspaces/{id}/settings/notifications
// Per-workspace notification configuration.
// ═══════════════════════════════════════════════════════════

export interface NotificationChannel {
  inApp: boolean;
  email: boolean;
  slack?: boolean;
}

export interface WorkspaceNotificationSettings {
  workspaceId: string;

  // Per-category toggles
  content: NotificationChannel;
  collaboration: NotificationChannel;
  workspace: NotificationChannel;
  billing: NotificationChannel;
  integration: NotificationChannel;
  analytics: NotificationChannel;

  // Digest
  digestFrequency?: 'realtime' | 'daily' | 'weekly';
  digestTime?: string;             // HH:mm
  digestDay?: number;              // 1-7 for weekly

  // Quiet hours
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;        // HH:mm
  quietHoursEnd?: string;          // HH:mm
  quietHoursDays?: string[];       // ['monday', 'tuesday', ...]

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// BRAND VOICE SCORE — computed per content piece against brand profile
// ═══════════════════════════════════════════════════════════

export interface BrandVoiceScore {
  overallScore: number;            // 0-100
  dimensions: {
    vocabulary: number;            // 0-100 — lexicon coverage + banned term compliance
    tone: number;                  // 0-100 — NLP alignment against baseline
    structure: number;             // 0-100 — sentence/paragraph patterns
    readability: number;           // 0-100 — reading level consistency
    identity: number;              // 0-100 — brand-specific markers
  };
  suggestions?: string[];          // Actionable improvement suggestions
  flaggedTerms?: { term: string; reason: string; replacement?: string }[];
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
  // Rich voice profile (same structure as workspace, per-client)
  brandVoice?: BrandVoiceProfile;
  brandAssets?: BrandAssets;
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
