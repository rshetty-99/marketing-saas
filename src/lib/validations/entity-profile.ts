import { z } from 'zod';

// ─── Shared Schemas ─────────────────────────────────────────────────

export const addressSchema = z.object({
  street1: z.string().max(200).optional(),
  street2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2
});

export const socialLinksSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().max(200).optional(),
  instagram: z.string().max(200).optional(),
  facebook: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().max(200).optional(),
  youtube: z.string().url().optional().or(z.literal('')),
});

export const socialAccountSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest', 'threads', 'google_business', 'other']),
  handle: z.string().min(1).max(200),
  url: z.string().url().optional(),
});

export const contactEntrySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  title: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
});

// ─── Content Strategy Defaults ──────────────────────────────────────

export const contentStrategySchema = z.object({
  contentPillars: z.array(z.string().max(100)).max(20).optional(),
  targetAudience: z.string().max(1000).optional(),
  competitorNames: z.array(z.string().max(200)).max(20).optional(),
  hashtagSets: z.record(z.string(), z.array(z.string().max(100))).optional(),
  defaultBrandVoiceNotes: z.string().max(2000).optional(),
  doNotUseWords: z.array(z.string().max(100)).max(50).optional(),
  boilerplateIntro: z.string().max(1000).optional(),
  boilerplateOutro: z.string().max(1000).optional(),
  standardDisclaimers: z.array(z.string().max(500)).max(10).optional(),
  contentLengthPrefs: z.record(z.string(), z.string()).optional(),
  toneVariations: z.record(z.string(), z.string()).optional(),
});

// ─── AI Generation Defaults ─────────────────────────────────────────

export const aiDefaultsSchema = z.object({
  aiModel: z.string().max(100).optional(),
  aiCreativityLevel: z.enum(['conservative', 'balanced', 'creative']).optional(),
  aiDefaultLanguage: z.string().max(10).optional(),
  aiAdditionalLanguages: z.array(z.string().max(10)).max(10).optional(),
  industryJargon: z.array(z.string().max(100)).max(50).optional(),
  aiStyleGuideNotes: z.string().max(2000).optional(),
});

// ─── Campaign & Budget ──────────────────────────────────────────────

export const campaignBudgetSchema = z.object({
  fiscalYearStart: z.number().int().min(1).max(12).optional(),
  annualMarketingBudget: z.number().int().nonnegative().optional(),
  budgetCurrency: z.string().length(3).optional(),
  budgetAlertThreshold: z.number().min(0).max(100).optional(),
});

// ─── Reporting Defaults ─────────────────────────────────────────────

export const reportingDefaultsSchema = z.object({
  defaultDateRange: z.enum(['last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month']).optional(),
  reportFormat: z.enum(['pdf', 'csv', 'both']).optional(),
  autoReportSchedule: z.enum(['weekly', 'biweekly', 'monthly', 'none']).optional(),
  autoReportDay: z.number().int().min(1).max(28).optional(),
  autoReportRecipients: z.array(z.string().email()).max(20).optional(),
  kpiDashboardWidgets: z.array(z.string().max(100)).max(20).optional(),
  benchmarkIndustry: z.string().max(100).optional(),
});

// ─── Integration & Scheduling ───────────────────────────────────────

export const integrationDefaultsSchema = z.object({
  plannedIntegrations: z.array(z.string().max(100)).max(20).optional(),
  defaultPostingTimes: z.record(z.string(), z.string()).optional(),
  preferredPostingDays: z.array(z.string()).max(7).optional(),
  autoScheduleEnabled: z.boolean().optional(),
  contentApprovalDefault: z.enum(['auto_approve', 'single_approval', 'multi_stage']).optional(),
});

// ─── Workflow & Template ────────────────────────────────────────────

export const workflowDefaultsSchema = z.object({
  defaultApprovalChain: z.string().max(100).optional(),
  defaultEmailTemplateId: z.string().max(100).optional(),
  defaultReportTemplateId: z.string().max(100).optional(),
  socialPostTemplateIds: z.array(z.string().max(100)).max(20).optional(),
  notificationPrefs: z.record(z.string(), z.boolean()).optional(),
});

// ─── Entity Profile Update (partial, all optional) ──────────────────

const companySizeEnum = z.enum(['solo', '2-10', '11-50', '51-200', '201-500', '500+']);
const taxIdTypeEnum = z.enum(['ein', 'vat', 'gst', 'abn', 'other']);
const businessTypeEnum = z.enum(['llc', 'corporation', 'sole_proprietor', 'partnership', 'other']);

export const updateEntityProfileSchema = z.object({
  // Core identity
  legalName: z.string().max(200).optional(),
  primaryEmail: z.string().email().optional(),
  billingEmail: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: addressSchema.optional(),
  timezone: z.string().max(50).optional(),
  locale: z.string().max(10).optional(),
  socialLinks: socialLinksSchema.optional(),
  logoUrl: z.string().max(500).optional(),
  logomarkUrl: z.string().max(500).optional(),
  companySize: companySizeEnum.optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  description: z.string().max(1000).optional(),

  // Marketing defaults
  contentStrategy: contentStrategySchema.optional(),
  aiDefaults: aiDefaultsSchema.optional(),
  campaignBudget: campaignBudgetSchema.optional(),
  reporting: reportingDefaultsSchema.optional(),
  integrations: integrationDefaultsSchema.optional(),
  workflow: workflowDefaultsSchema.optional(),

  // Freelancer
  specializations: z.array(z.string().max(100)).max(20).optional(),
  yearsOfExperience: z.number().int().nonnegative().max(100).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  availabilityStatus: z.enum(['available', 'busy', 'not_taking_clients']).optional(),
  hourlyRate: z.number().int().nonnegative().optional(),
  rateCurrency: z.string().length(3).optional(),

  // Organization
  industry: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  departments: z.array(z.string().max(100)).max(50).optional(),
  taxId: z.string().max(50).optional(),
  taxIdType: taxIdTypeEnum.optional(),
  businessType: businessTypeEnum.optional(),

  // Agency
  agencyType: z.enum(['full_service', 'digital', 'social_media', 'seo', 'content', 'pr', 'performance', 'creative', 'other']).optional(),
  serviceOfferings: z.array(z.string().max(100)).max(30).optional(),
  industriesServed: z.array(z.string().max(100)).max(30).optional(),
  maxClients: z.number().int().nonnegative().max(1000).optional(),
  whiteLabel: z.boolean().optional(),
  customDomain: z.string().max(200).optional(),
  clientPortalSubdomain: z.string().max(100).optional(),
  emailFromName: z.string().max(200).optional(),
  emailReplyTo: z.string().email().optional().or(z.literal('')),
  reportBranding: z.enum(['aura', 'co_branded', 'white_label']).optional(),
  hidePoweredByAura: z.boolean().optional(),
});

export type UpdateEntityProfileInput = z.infer<typeof updateEntityProfileSchema>;

// ─── Client Brand Profile ───────────────────────────────────────────

export const clientBrandSchema = z.object({
  brandName: z.string().max(200).optional(),
  brandVoiceTone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful', 'technical', 'inspirational']).optional(),
  brandVoiceNotes: z.string().max(2000).optional(),
  targetAudience: z.string().max(1000).optional(),
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }).optional(),
  brandLogoUrl: z.string().max(500).optional(),
  brandGuidelinesUrl: z.string().max(500).optional(),
  competitorNames: z.array(z.string().max(200)).max(20).optional(),
  contentPillars: z.array(z.string().max(100)).max(20).optional(),
  hashtagSets: z.record(z.string(), z.array(z.string().max(100))).optional(),
  doNotUseWords: z.array(z.string().max(100)).max(50).optional(),
});

// ─── Client Update ──────────────────────────────────────────────────

export const updateClientSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  clientCode: z.string().max(50).optional(),
  legalName: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),

  primaryContact: contactEntrySchema.optional(),
  billingContact: contactEntrySchema.partial().optional(),
  additionalContacts: z.array(contactEntrySchema).max(10).optional(),

  address: addressSchema.optional(),
  socialAccounts: z.array(socialAccountSchema).max(10).optional(),
  logoUrl: z.string().max(500).optional(),

  status: z.enum(['prospect', 'onboarding', 'active', 'paused', 'offboarding', 'churned', 'archived']).optional(),
  lifecycleStage: z.enum(['lead', 'qualified', 'proposal', 'won', 'active_client', 'at_risk', 'churned']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  riskNotes: z.string().max(1000).optional(),
  nextReviewDate: z.string().datetime().optional(),

  billingModel: z.enum(['retainer', 'project', 'hourly', 'performance', 'hybrid']).optional(),
  retainerAmount: z.number().int().nonnegative().optional(),
  retainerCurrency: z.string().length(3).optional(),
  billingCycle: z.enum(['monthly', 'quarterly', 'annually']).optional(),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt']).optional(),
  totalContractValue: z.number().int().nonnegative().optional(),
  autoRenew: z.boolean().optional(),

  servicesProvided: z.array(z.string().max(100)).max(20).optional(),
  platforms: z.array(z.string().max(50)).max(15).optional(),
  contentTypes: z.array(z.string().max(100)).max(20).optional(),
  monthlyContentQuota: z.number().int().nonnegative().optional(),
  postingFrequency: z.record(z.string(), z.number().int().nonnegative()).optional(),

  brand: clientBrandSchema.optional(),

  assignedTeamMemberIds: z.array(z.string()).max(50).optional(),
  accountManagerId: z.string().optional(),
  strategistId: z.string().optional(),
  portalEnabled: z.boolean().optional(),

  tags: z.array(z.string().max(50)).max(30).optional(),
  internalNotes: z.string().max(2000).optional(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ─── Member Profile Update (self-edit) ──────────────────────────────

export const updateMemberProfileSchema = z.object({
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(300).optional(),
  socialLinks: socialLinksSchema.optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  timezone: z.string().max(50).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    locale: z.string().max(10).optional(),
  }).optional(),
});

export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileSchema>;

// ─── Platform User Profile Update ───────────────────────────────────

export const updatePlatformUserProfileSchema = z.object({
  title: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(300).optional(),
  timezone: z.string().max(50).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    slackNotifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
  }).optional(),
});

export type UpdatePlatformUserProfileInput = z.infer<typeof updatePlatformUserProfileSchema>;
