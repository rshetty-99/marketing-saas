/**
 * F16: Digital Asset Management Types
 *
 * Asset library, versioning, tagging, folders, usage tracking,
 * auto-tagging, format conversion, brand asset injection.
 */

import type { FirestoreTimestamp } from './f0';

export type AssetType = 'image' | 'video' | 'document' | 'audio' | 'font' | 'logo' | 'icon' | 'template';
export type AssetStatus = 'active' | 'archived' | 'processing' | 'failed';

export interface AssetVersion {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  fileSizeBytes: number;
  uploadedBy: string;
  uploadedAt: FirestoreTimestamp;
  changeSummary?: string;
}

export interface AssetTag {
  tag: string;
  source: 'manual' | 'ai_generated';
  confidence?: number;                 // 0-1 for AI tags
}

export interface DAMAsset {
  id: string;
  workspaceId: string;
  clientId?: string;

  // File info
  name: string;
  description?: string;
  assetType: AssetType;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;            // Video/audio

  // Organization
  folderId?: string;
  tags: AssetTag[];
  colors?: string[];                   // Dominant colors extracted

  // Versioning
  currentVersionNumber: number;
  versions: AssetVersion[];

  // Usage tracking
  usageCount: number;
  linkedContentIds: string[];
  linkedCampaignIds: string[];
  lastUsedAt?: FirestoreTimestamp;

  // Status
  status: AssetStatus;

  // Metadata
  copyright?: string;
  license?: string;
  altText?: string;
  exifData?: Record<string, string>;

  // Optimized variants
  optimizedVariants?: {
    format: 'webp' | 'avif' | 'png' | 'jpg';
    fileUrl: string;
    fileSizeBytes: number;
  }[];

  // Base64 endpoint (for AI image generation injection)
  base64Cached?: boolean;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface DAMFolder {
  id: string;
  workspaceId: string;
  name: string;
  parentFolderId?: string;             // For nested folders
  description?: string;
  assetCount: number;
  color?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// WHITE-LABEL BRANDING
// ═══════════════════════════════════════════════════════════

export interface WhiteLabelConfig {
  workspaceId: string;
  enabled: boolean;

  // Custom domain
  customDomain?: string;               // e.g., 'app.agencyname.com'
  domainVerified: boolean;
  sslCertificateStatus?: 'pending' | 'active' | 'failed';

  // Branding
  logoUrl?: string;
  logomarkUrl?: string;                // Square icon
  faviconUrl?: string;
  primaryColor?: string;               // Hex
  accentColor?: string;
  appName?: string;                    // Replaces "Aura" in UI

  // Email branding
  emailFromName?: string;
  emailReplyTo?: string;
  emailFooterHtml?: string;
  hideAuraBranding: boolean;           // "Powered by Aura" toggle

  // Report branding
  reportHeaderHtml?: string;
  reportFooterHtml?: string;
  reportCoverLogoUrl?: string;

  // Portal branding
  portalWelcomeMessage?: string;
  portalLogoUrl?: string;
  portalPrimaryColor?: string;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// GDPR / CCPA COMPLIANCE
// ═══════════════════════════════════════════════════════════

export type DataRequestType = 'export' | 'deletion' | 'rectification';
export type DataRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataSubjectRequest {
  id: string;
  workspaceId: string;
  requestType: DataRequestType;
  requestedBy: string;                 // userId or email
  requestedAt: FirestoreTimestamp;
  status: DataRequestStatus;
  completedAt?: FirestoreTimestamp;
  exportUrl?: string;                  // Download link for exports
  exportExpiresAt?: FirestoreTimestamp;
  deletionConfirmedAt?: FirestoreTimestamp;
  notes?: string;
}

export interface ConsentRecord {
  id: string;
  email: string;
  workspaceId: string;
  consentType: 'marketing' | 'analytics' | 'functional' | 'all';
  granted: boolean;
  grantedAt?: FirestoreTimestamp;
  revokedAt?: FirestoreTimestamp;
  source: string;                      // Where consent was collected
  ipAddress?: string;
}

export interface DataRetentionPolicy {
  workspaceId: string;
  analyticsRetentionDays: number;      // Default 365
  contentRetentionDays: number;        // Default -1 (forever)
  auditLogRetentionDays: number;       // Default 730 (2 years)
  inboxRetentionDays: number;          // Default 90
  autoDeleteEnabled: boolean;
  lastPurgeAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// LANDING PAGE / FUNNEL BUILDER
// ═══════════════════════════════════════════════════════════

export type PageBlockType =
  | 'hero' | 'text' | 'image' | 'video' | 'form' | 'cta_button'
  | 'testimonial' | 'pricing' | 'faq' | 'countdown' | 'social_proof'
  | 'two_column' | 'divider' | 'custom_html';

export interface PageBlock {
  id: string;
  type: PageBlockType;
  order: number;
  content: Record<string, unknown>;    // Block-type-specific data
  styles?: Record<string, string>;     // CSS overrides
  isVisible: boolean;
}

export type LandingPageStatus = 'draft' | 'published' | 'archived';

export interface LandingPage {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  slug: string;                        // URL path
  description?: string;
  status: LandingPageStatus;

  // Content
  blocks: PageBlock[];
  customCss?: string;
  customJs?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;

  // Branding (inherits from workspace or overrides)
  primaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Tracking
  utmConfig?: { source: string; medium: string; campaign: string };
  trackingPixelIds?: string[];         // GA4, Meta Pixel, etc.

  // Analytics
  views: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;

  // A/B testing
  isVariant: boolean;
  parentPageId?: string;
  variantLabel?: string;

  publishedAt?: FirestoreTimestamp;
  publishedUrl?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface Funnel {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  description?: string;
  steps: { pageId: string; order: number; label: string }[];
  totalConversions: number;
  overallConversionRate: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// AI CHATBOT / LEAD CAPTURE
// ═══════════════════════════════════════════════════════════

export interface ChatbotConfig {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  isActive: boolean;

  // Appearance
  primaryColor?: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  avatarUrl?: string;
  headerTitle?: string;

  // Behavior
  aiEnabled: boolean;                  // Use Claude for responses
  aiSystemPrompt?: string;            // Custom instructions
  aiModel?: string;
  fallbackMessage: string;            // When AI can't answer
  collectEmail: boolean;
  collectPhone: boolean;
  collectName: boolean;
  qualificationQuestions?: { question: string; options?: string[] }[];

  // Routing
  routeToCrm: boolean;                // Create lead on conversation end
  routeToCalendar: boolean;           // Offer booking link
  calendarUrl?: string;
  notifyTeamOnLead: boolean;
  notifyEmail?: string;

  // Embed
  embedCode?: string;                 // Auto-generated <script> tag
  allowedDomains?: string[];

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  chatbotId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: FirestoreTimestamp;
}

export interface ChatSession {
  id: string;
  chatbotId: string;
  workspaceId: string;
  visitorEmail?: string;
  visitorName?: string;
  visitorPhone?: string;
  status: 'active' | 'completed' | 'converted';
  convertedToLeadId?: string;
  messageCount: number;
  startedAt: FirestoreTimestamp;
  endedAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// TWO-WAY SMS / WHATSAPP
// ═══════════════════════════════════════════════════════════

export type MessagingChannel = 'sms' | 'whatsapp' | 'mms';

export interface MessagingConfig {
  workspaceId: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  twilioAccountSid?: string;           // Encrypted
  twilioAuthToken?: string;            // Encrypted
  twilioPhoneNumber?: string;
  whatsappBusinessId?: string;
  defaultCountryCode?: string;
}

export interface SmsConversation {
  id: string;
  workspaceId: string;
  clientId?: string;
  contactPhone: string;
  contactName?: string;
  channel: MessagingChannel;
  status: 'active' | 'archived';
  linkedLeadId?: string;
  linkedInboxItemId?: string;          // Sync with unified inbox
  lastMessageAt: FirestoreTimestamp;
  messageCount: number;
  createdAt: FirestoreTimestamp;
}

export interface SmsMessage {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  mediaUrl?: string;                   // MMS
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
  twilioSid?: string;
  sentAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// IN-APP GUIDED TOURS / ONBOARDING
// ═══════════════════════════════════════════════════════════

export interface GuidedTour {
  id: string;
  featureId: string;                   // e.g., 'F1', 'brand_voice', 'calendar'
  title: string;
  steps: {
    targetSelector: string;            // CSS selector for tooltip anchor
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  }[];
}

export interface StarterTemplate {
  id: string;
  category: 'content_calendar' | 'automation' | 'report' | 'email_campaign' | 'social_strategy';
  industry?: string;                   // 'restaurant', 'saas', 'real_estate', etc.
  title: string;
  description: string;
  thumbnailUrl?: string;
  templateData: Record<string, unknown>; // Feature-specific template content
  usageCount: number;
}

export interface OnboardingChecklist {
  workspaceId: string;
  items: {
    id: string;
    label: string;
    description: string;
    featureLink: string;               // Dashboard URL to complete this
    completed: boolean;
    completedAt?: FirestoreTimestamp;
  }[];
  dismissedAt?: FirestoreTimestamp;
}
