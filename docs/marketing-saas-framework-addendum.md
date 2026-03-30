# Marketing SaaS — Agent Framework Addendum
## Full Feature Registry + F9–F15 Contracts & Pipeline Specs

---

## MASTER FEATURE REGISTRY (All 15 Features)

| # | Feature | Phase | Firestore Root | Key Integrations | Depends On |
|---|---------|-------|---------------|-----------------|------------|
| F1 | AI Content Generation | MVP | `content_drafts` | Claude API, Firebase Storage | F8 |
| F2 | Content Repurposing | MVP | `repurposed_content` | Claude API | F1 |
| F3 | Multi-Platform Publishing | MVP | `publish_jobs` | LinkedIn, X, Instagram, FB, WP APIs | F1, F6 |
| F4 | Content Calendar & Scheduling | MVP | `calendar_events` | Cloud Functions cron | F3 |
| F5 | Analytics & Insights | MVP | `analytics_snapshots` | Platform APIs, BigQuery | F3 |
| F6 | Approval Workflows | MVP | `approvals` | Notifications, F3 | F7 |
| F7 | Team Workspaces | MVP | `workspaces` | Clerk Orgs | All |
| F8 | Brand Voice & Templates | MVP | `brand_profiles` | Claude API | — |
| F9 | Social Media Integration | MVP+ | `social_connections` | OAuth 5 platforms | F3, F5 |
| F10 | SEO & Competitor Intelligence | MVP+ | `seo_reports` | SEMrush/Ahrefs API, Claude | F1, F5 |
| F11 | Email & Newsletter Builder | MVP+ | `email_campaigns` | SendGrid/Resend, Firestore | F7 |
| F12 | Lead Generation & CRM-lite | Growth | `leads`, `crm_contacts` | Form embeds, enrichment APIs | F11 |
| F13 | AI Image Generation | Growth | `generated_images` | DALL-E / Stability AI | F1, F2 |
| F14 | Client Management (Agency) | Growth | `clients`, `client_reports` | F1–F8, White-label | F7 |
| F15 | Social Listening & Alerts | Growth | `listening_feeds` | Social APIs, Google Alerts | F5, F9 |

---

## UPDATED REPO STRUCTURE (F9–F15 additions)

```
src/app/(dashboard)/
├── social/              # F9 — Social Media Integration
├── seo/                 # F10 — SEO & Competitor Intelligence
├── email/               # F11 — Email & Newsletter Builder
├── crm/                 # F12 — Lead Generation & CRM-lite
├── images/              # F13 — AI Image Generation
├── clients/             # F14 — Client Management
└── listening/           # F15 — Social Listening & Alerts

tests/e2e/
├── F9-social-integration/
├── F10-seo-intelligence/
├── F11-email-newsletter/
├── F12-lead-crm/
├── F13-image-generation/
├── F14-client-management/
└── F15-social-listening/

.claude/feature-contracts/
├── F9-social-integration.md
├── F10-seo-intelligence.md
├── F11-email-newsletter.md
├── F12-lead-crm.md
├── F13-image-generation.md
├── F14-client-management.md
└── F15-social-listening.md
```

---

## FEATURE CONTRACTS — F9 through F15

---

### F9 — Social Media Integration

**Purpose**  
Connect user social accounts (LinkedIn, X/Twitter, Instagram, Facebook, Google Business Profile) via OAuth, enable native content publishing directly from the platform, and surface social engagement metrics back into the analytics layer.

**User Stories**
- As a marketer, I want to connect my LinkedIn and Instagram accounts so I can publish directly without leaving the app
- As a solo creator, I want to see my post engagement (likes, shares, reach) in one dashboard
- As an agency manager, I want clients' social accounts connected to our workspace

**Acceptance Criteria**
- [ ] AC1: User can OAuth-connect any of 5 platforms (LinkedIn, X, Instagram, Facebook, Google Business)
- [ ] AC2: Connection tokens stored encrypted in Firestore, never exposed in client
- [ ] AC3: Disconnect flow revokes token and removes from Firestore
- [ ] AC4: Publishing via F3 uses these connections as the channel source
- [ ] AC5: Social profile preview (name, avatar, follower count) shown on connections page
- [ ] AC6: Token refresh handled silently on expiry (OAuth2 refresh flow)
- [ ] AC7: Expired/revoked connections surface an alert with re-auth CTA

**Firestore Schema**
```typescript
// Collection: social_connections
interface SocialConnection {
  id: string;
  workspaceId: string;
  userId: string;                   // who connected
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'google_business';
  platformAccountId: string;
  platformUsername: string;
  platformDisplayName: string;
  platformAvatarUrl: string;
  followerCount: number;
  accessToken: string;              // encrypted at rest
  refreshToken: string;             // encrypted at rest
  tokenExpiresAt: Timestamp;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

**API Routes**
- `GET /api/social/connections` — list workspace connections
- `GET /api/social/auth/[platform]` — initiate OAuth PKCE flow
- `GET /api/social/callback/[platform]` — OAuth callback handler
- `DELETE /api/social/connections/[id]` — disconnect and revoke
- `POST /api/social/connections/[id]/refresh` — manual token refresh

**External Dependencies**
- LinkedIn OAuth: `w_member_social`, `r_basicprofile`, `r_emailaddress`
- Twitter OAuth2: `tweet.read`, `tweet.write`, `users.read`
- Instagram Basic Display API: `instagram_basic`, `instagram_content_publish`
- Facebook Graph API: `pages_manage_posts`, `pages_read_engagement`
- Google My Business API: `business.manage`
- Env vars: `[PLATFORM]_CLIENT_ID`, `[PLATFORM]_CLIENT_SECRET`, `OAUTH_REDIRECT_BASE`

**Risk Flags**
- Instagram requires business account — handle personal account error gracefully
- Token encryption: use Firebase Secret Manager, not Firestore plain text
- Rate limits vary per platform — enforce per-connection, not per-workspace

---

### F10 — SEO & Competitor Intelligence

**Purpose**  
Provide AI-assisted SEO recommendations for content drafts, keyword tracking, and competitor content gap analysis. Surfaces actionable SEO data alongside the content creation workflow so users optimize before publishing.

**User Stories**
- As a content marketer, I want keyword suggestions while writing so I can optimize without switching tools
- As a strategist, I want to see what topics my competitors are ranking for that I'm not covering
- As a team lead, I want weekly SEO performance snapshots for our published content

**Acceptance Criteria**
- [ ] AC1: Keyword suggestion panel in content editor (F1) — real-time as user types
- [ ] AC2: On-page SEO score (0–100) with specific improvement suggestions per draft
- [ ] AC3: Competitor URL input → AI-generated content gap report
- [ ] AC4: Published content tracked for ranking changes weekly (Cloud Function)
- [ ] AC5: SEO report exportable as PDF
- [ ] AC6: Keyword difficulty and search volume shown alongside suggestions
- [ ] AC7: Content brief generator — given a keyword, output recommended structure

**Firestore Schema**
```typescript
// Collection: seo_reports
interface SEOReport {
  id: string;
  workspaceId: string;
  type: 'content_score' | 'competitor_gap' | 'ranking_snapshot' | 'brief';
  contentDraftId?: string;          // links to F1 draft if applicable
  targetKeyword?: string;
  seoScore?: number;                // 0–100
  suggestions: SEOSuggestion[];
  competitorUrls?: string[];
  gapKeywords?: GapKeyword[];
  rankingData?: RankingEntry[];
  generatedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  workspaceId: string;
  createdBy: string;
}

interface SEOSuggestion {
  type: 'title' | 'meta' | 'heading' | 'keyword_density' | 'readability' | 'internal_link';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}
```

**API Routes**
- `POST /api/seo/score` — analyze draft content, return SEO score + suggestions
- `POST /api/seo/competitor-gap` — analyze competitor URLs, return gap keywords
- `POST /api/seo/brief` — generate content brief for a keyword
- `GET /api/seo/reports/[workspaceId]` — list SEO reports
- `GET /api/seo/rankings` — current ranking snapshots (Cloud Function triggers weekly)

**External Dependencies**
- SEMrush API or Ahrefs API (keyword data, competitor analysis)
- Claude API (gap analysis reasoning, brief generation)
- Alternatively: DataForSEO API (more affordable for startups)
- Env vars: `SEMRUSH_API_KEY` or `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`

**Risk Flags**
- SEMrush/Ahrefs are expensive at scale — consider DataForSEO as fallback
- Competitor scraping must respect `robots.txt` and rate limits
- SEO scoring logic should be in a separate service module so it can be swapped

---

### F11 — Email & Newsletter Builder

**Purpose**  
Enable users to build, send, and track email campaigns and newsletters directly to their subscriber lists — with AI-assisted copy generation tied to F1's content engine and performance analytics in F5.

**User Stories**
- As a content creator, I want to send a newsletter to my subscribers featuring my latest posts
- As an agency, I want to send branded email campaigns on behalf of clients
- As a marketer, I want to track open rate, click rate, and unsubscribes per campaign

**Acceptance Criteria**
- [ ] AC1: Drag-and-drop email builder with block types (text, image, button, divider, social links)
- [ ] AC2: AI "write this section" inline within email builder (Claude API)
- [ ] AC3: Import subscriber list via CSV or connect via API (Mailchimp, ConvertKit)
- [ ] AC4: Send campaign or schedule for future send (Cloud Function)
- [ ] AC5: Real-time delivery stats: sent, delivered, opened, clicked, bounced, unsubscribed
- [ ] AC6: Unsubscribe handling — auto-suppression list enforced on all sends
- [ ] AC7: Preview in mobile/desktop before send
- [ ] AC8: Plain text version auto-generated from HTML

**Firestore Schema**
```typescript
// Collection: email_campaigns
interface EmailCampaign {
  id: string;
  workspaceId: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  htmlContent: string;
  textContent: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  listId: string;                   // subscriber list ref
  stats: CampaignStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface CampaignStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  lastUpdated: Timestamp;
}

// Collection: subscriber_lists
interface SubscriberList {
  id: string;
  workspaceId: string;
  name: string;
  subscriberCount: number;
  suppressionCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

**API Routes**
- `POST /api/email/campaigns` — create campaign
- `PATCH /api/email/campaigns/[id]` — update draft
- `POST /api/email/campaigns/[id]/send` — trigger immediate send
- `POST /api/email/campaigns/[id]/schedule` — schedule send
- `GET /api/email/campaigns/[id]/stats` — live stats
- `POST /api/email/lists/[id]/subscribers` — bulk import subscribers
- `POST /api/email/unsubscribe` — public unsubscribe endpoint (no auth)

**External Dependencies**
- SendGrid API or Resend (transactional/bulk email)
- Env vars: `SENDGRID_API_KEY` or `RESEND_API_KEY`, `EMAIL_FROM_DOMAIN`
- CAN-SPAM / GDPR: unsubscribe link mandatory in every campaign

**Risk Flags**
- Email deliverability requires domain authentication (SPF, DKIM, DMARC) — document setup steps
- Suppression list must be enforced even if user manually re-adds unsubscribed email
- Bulk sends should use Cloud Tasks queue — not a single API call

---

### F12 — Lead Generation & CRM-lite

**Purpose**  
Capture inbound leads from embeddable forms, social traffic, and content attribution. Provide a lightweight CRM to track lead status, assign to team members, and trigger nurture sequences — turning content performance into pipeline visibility.

**User Stories**
- As a marketer, I want to embed a lead capture form on my content and see who filled it out
- As a sales BD lead, I want to see all leads in one view with their source (which content piece drove them)
- As an agency, I want to assign leads to team members and track follow-up status

**Acceptance Criteria**
- [ ] AC1: Embeddable form builder (name, email, custom fields) with copy-paste embed code
- [ ] AC2: Leads auto-captured to Firestore with source attribution (UTM, referring content ID)
- [ ] AC3: CRM board view: columns = lead stages (New → Contacted → Qualified → Won → Lost)
- [ ] AC4: Lead detail panel: contact info, source, timeline of interactions, notes
- [ ] AC5: Assign lead to workspace member
- [ ] AC6: Trigger email sequence from F11 on lead capture
- [ ] AC7: Lead enrichment — auto-populate company, job title from email domain (Clearbit/Apollo)
- [ ] AC8: CSV export of full lead list with filters

**Firestore Schema**
```typescript
// Collection: leads
interface Lead {
  id: string;
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  source: LeadSource;
  stage: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  assignedTo?: string;              // userId
  enriched: boolean;
  enrichmentData?: EnrichmentData;
  notes: LeadNote[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface LeadSource {
  type: 'form' | 'social' | 'direct' | 'referral';
  formId?: string;
  contentId?: string;               // links to F1 draft
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;
}

// Collection: crm_forms
interface CRMForm {
  id: string;
  workspaceId: string;
  name: string;
  fields: FormField[];
  embedCode: string;                // generated iframe/script
  redirectUrl?: string;
  webhookUrl?: string;
  submissionCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

**API Routes**
- `POST /api/crm/leads` — create lead (public endpoint for form submissions)
- `GET /api/crm/leads` — list leads with filters
- `PATCH /api/crm/leads/[id]` — update stage, assignee, notes
- `POST /api/crm/forms` — create embeddable form
- `GET /api/crm/forms/[id]/embed` — return embed code (public)
- `POST /api/crm/leads/[id]/enrich` — trigger enrichment

**External Dependencies**
- Clearbit API or Apollo.io API (lead enrichment)
- F11 email campaigns (nurture sequence trigger)
- Env vars: `CLEARBIT_API_KEY` or `APOLLO_API_KEY`

**Risk Flags**
- Form submission endpoint is public — rate limit heavily, add CAPTCHA
- Lead enrichment costs per-lookup — batch enrich or enrich on demand only
- GDPR: leads from EU require explicit consent checkbox on form

---

### F13 — AI Image Generation

**Purpose**  
Generate on-brand images, social media graphics, and blog header art directly within the content workflow using AI image models. Images are stored in Firebase Storage and linked to content drafts and published posts.

**User Stories**
- As a content creator, I want to generate a header image for my blog post without leaving the editor
- As a social media manager, I want to create platform-sized graphics (1080x1080, 1200x628) matched to my brand colors
- As a marketer, I want to save generated images to a brand asset library and reuse them

**Acceptance Criteria**
- [ ] AC1: Text prompt → image generated (DALL-E 3 or Stability AI), shown as preview
- [ ] AC2: Platform size presets: Instagram Square (1080x1080), LinkedIn Banner (1200x628), Twitter Card (1200x675), Blog Header (1600x840)
- [ ] AC3: Brand color palette injected automatically into prompt from F8 brand profile
- [ ] AC4: Generated images stored in Firebase Storage under `workspaces/{workspaceId}/images/`
- [ ] AC5: Asset library view — browse, search, and insert previously generated images
- [ ] AC6: Insert image into F1 content draft or F11 email campaign
- [ ] AC7: Download generated image in PNG/JPG
- [ ] AC8: Generation history with prompt stored alongside image

**Firestore Schema**
```typescript
// Collection: generated_images
interface GeneratedImage {
  id: string;
  workspaceId: string;
  prompt: string;
  revisedPrompt?: string;           // model's actual prompt used
  model: 'dall-e-3' | 'stable-diffusion' | 'flux';
  size: string;                     // e.g. "1080x1080"
  storageUrl: string;               // Firebase Storage URL
  storagePath: string;              // gs:// path for deletion
  linkedContentId?: string;         // F1 draft if linked
  tags: string[];
  usageCount: number;               // how many times inserted
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

**API Routes**
- `POST /api/images/generate` — generate image, upload to Storage, save to Firestore
- `GET /api/images` — list workspace image library
- `DELETE /api/images/[id]` — delete image (Firestore + Storage)
- `POST /api/images/[id]/link` — link image to a content draft

**External Dependencies**
- OpenAI DALL-E 3 API or Stability AI API
- Firebase Storage (image hosting)
- Env vars: `OPENAI_API_KEY`, `STABILITY_API_KEY`

**Risk Flags**
- Image generation is slow (3–15s) — use streaming/polling UX, not blocking request
- Storage costs: set lifecycle rules to archive images older than 90 days if unused
- Content policy: OpenAI/Stability reject certain prompts — handle gracefully with retry suggestion

---

### F14 — Client Management (Agency Mode)

**Purpose**  
Enable marketing agencies to manage multiple clients within one workspace — each client gets their own isolated sub-workspace, brand profile, content pipeline, and reporting. Includes white-label report delivery to clients.

**User Stories**
- As an agency admin, I want to create client accounts and assign team members to each
- As an account manager, I want to switch between clients without logging out
- As an agency owner, I want to send branded performance reports to clients monthly

**Acceptance Criteria**
- [ ] AC1: Create client sub-workspace under agency parent workspace
- [ ] AC2: Client switcher in sidebar — instant context switch (Clerk organization switch)
- [ ] AC3: Each client has isolated: brand profile (F8), content drafts (F1), social connections (F9), analytics (F5)
- [ ] AC4: Assign agency team members to specific clients with role scoping
- [ ] AC5: White-label report: agency logo + client branding on auto-generated PDF
- [ ] AC6: Client portal login — client can view their own reports (read-only)
- [ ] AC7: Billing remains at agency workspace level (client sub-workspaces don't have separate billing)
- [ ] AC8: Client activity log — what was published, when, by which team member

**Firestore Schema**
```typescript
// Collection: clients (subcollection under workspaces)
// Path: workspaces/{workspaceId}/clients/{clientId}
interface Client {
  id: string;
  agencyWorkspaceId: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  contactEmail: string;
  contactName: string;
  assignedTeamMembers: string[];    // userIds
  subWorkspaceId: string;           // Clerk org ID for client
  status: 'active' | 'paused' | 'archived';
  reportingSchedule: 'weekly' | 'monthly' | 'none';
  reportingEmail: string;
  brandProfileId?: string;          // links to F8
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Collection: client_reports
interface ClientReport {
  id: string;
  clientId: string;
  agencyWorkspaceId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  reportType: 'monthly' | 'weekly' | 'custom';
  pdfStorageUrl: string;
  metrics: ReportMetrics;
  sentAt?: Timestamp;
  sentTo: string[];
  status: 'draft' | 'sent';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

**API Routes**
- `POST /api/clients` — create client
- `GET /api/clients` — list agency's clients
- `PATCH /api/clients/[id]` — update client details
- `POST /api/clients/[id]/reports/generate` — trigger report PDF generation
- `POST /api/clients/[id]/reports/[reportId]/send` — email report to client
- `GET /api/clients/[id]/activity` — client activity log

**External Dependencies**
- Clerk Organizations API (sub-workspace creation, member assignment)
- PDFKit or React PDF (white-label report generation)
- SendGrid (report delivery)

**Risk Flags**
- Firestore security rules must strictly enforce client isolation — agency members can only see their assigned clients
- Clerk org switching must clear all cached state (Zustand stores) on switch
- Report generation can be slow — run as background Cloud Function, notify when ready

---

### F15 — Social Listening & Alerts

**Purpose**  
Monitor social media and the web for mentions of the user's brand, keywords, and competitors. Surface opportunities (leads mentioning pain points, conversations to join) and threats (negative sentiment, competitor moves) in a unified alert feed.

**User Stories**
- As a marketer, I want alerts when someone mentions my brand on X or LinkedIn
- As a competitor analyst, I want to see when my competitors publish new content or run campaigns
- As a community manager, I want to respond to brand mentions directly from the alert feed

**Acceptance Criteria**
- [ ] AC1: Configure monitored keywords: brand names, competitor names, topic keywords
- [ ] AC2: Alert feed showing new mentions with: platform, author, text snippet, sentiment score, timestamp
- [ ] AC3: Sentiment auto-classified: positive / neutral / negative (Claude API or ML model)
- [ ] AC4: Filter feed by: platform, sentiment, keyword group, date range
- [ ] AC5: Mark alert as: actioned / dismissed / saved
- [ ] AC6: Email digest — daily or weekly summary of top mentions
- [ ] AC7: Competitor tracking: new published posts detected and surfaced
- [ ] AC8: Alert volume chart in F5 analytics (mentions over time)

**Firestore Schema**
```typescript
// Collection: listening_configs
interface ListeningConfig {
  id: string;
  workspaceId: string;
  brandKeywords: string[];
  competitorKeywords: string[];
  topicKeywords: string[];
  platforms: ('twitter' | 'linkedin' | 'instagram' | 'facebook' | 'web')[];
  alertEmail: string;
  digestFrequency: 'realtime' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Collection: listening_feeds
interface ListeningFeedItem {
  id: string;
  workspaceId: string;
  configId: string;
  platform: string;
  mentionUrl: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  textSnippet: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;           // -1.0 to 1.0
  matchedKeyword: string;
  keywordType: 'brand' | 'competitor' | 'topic';
  status: 'new' | 'actioned' | 'dismissed' | 'saved';
  mentionedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**API Routes**
- `GET /api/listening/configs` — get workspace listening config
- `PUT /api/listening/configs` — upsert config (keywords, platforms)
- `GET /api/listening/feed` — paginated mention feed with filters
- `PATCH /api/listening/feed/[id]` — update mention status
- `POST /api/listening/digest` — trigger manual digest email (Cloud Function)

**External Dependencies**
- Brandwatch API, Mention.com API, or Brand24 API (social listening data)
- Claude API (sentiment classification if not using ML model)
- Google Alerts RSS as fallback for web mentions
- Cloud Scheduler for polling listening APIs on interval
- Env vars: `BRANDWATCH_API_KEY`, `MENTION_API_KEY`

**Risk Flags**
- Third-party listening APIs are expensive — tier usage by plan (starter = web only, pro = all platforms)
- Real-time listening via webhooks preferred over polling — check if provider supports
- Volume can be high for popular brands — implement feed pagination and archiving

---

## INTEGRATION DEPENDENCY MAP

```
F7 (Workspaces) ─────────────────────────────────────── ALL FEATURES
F8 (Brand Voice) ────┬──────────────────────────────── F1, F2, F13
F1 (Content Gen) ────┼──────────────────────────────── F2, F3, F10
F9 (Social Auth) ────┼──────────────────────────────── F3, F15
F5 (Analytics)  ────┬┴──────────────────────────────── F10, F15
F3 (Publishing) ─────┴──────────────────────────────── F4, F6, F9
F6 (Approvals)  ────────────────────────────────────── F3, F11, F14
F11 (Email)     ────────────────────────────────────── F12
F7 + Clerk Orgs ────────────────────────────────────── F14
```

**Critical boot order for new workspace onboarding:**
1. F7 — create workspace (Clerk Org)
2. F8 — set brand voice/profile
3. F9 — connect social accounts
4. F1 — first content draft
5. All others unlock progressively

---

## UPDATED GITHUB ACTIONS — MATRIX STRATEGY

```yaml
# .github/workflows/feature-ci.yml (updated)
jobs:
  test:
    strategy:
      matrix:
        feature: [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15]
      fail-fast: false      # run all features even if one fails
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests for ${{ matrix.feature }}
        run: npx playwright test tests/e2e/${{ matrix.feature }}-*/
        env:
          FEATURE_UNDER_TEST: ${{ matrix.feature }}
```

---

## FIRESTORE COLLECTIONS — COMPLETE INDEX

| Collection | Feature | Key Indexes Needed |
|-----------|---------|-------------------|
| `workspaces` | F7 | `ownerId ASC, createdAt DESC` |
| `workspace_members` | F7 | Composite: `workspaceId + userId` |
| `brand_profiles` | F8 | `workspaceId ASC` |
| `content_drafts` | F1 | `workspaceId + status + updatedAt DESC` |
| `repurposed_content` | F2 | `workspaceId + sourceId + platform` |
| `publish_jobs` | F3 | `workspaceId + status + scheduledAt ASC` |
| `calendar_events` | F4 | `workspaceId + startDate ASC, endDate ASC` |
| `analytics_snapshots` | F5 | `workspaceId + platform + period + snapshotDate` |
| `approvals` | F6 | `workspaceId + status + createdAt DESC` |
| `social_connections` | F9 | `workspaceId + platform + status` |
| `seo_reports` | F10 | `workspaceId + type + generatedAt DESC` |
| `email_campaigns` | F11 | `workspaceId + status + scheduledAt ASC` |
| `subscriber_lists` | F11 | `workspaceId ASC` |
| `leads` | F12 | `workspaceId + stage + createdAt DESC` |
| `crm_forms` | F12 | `workspaceId ASC` |
| `generated_images` | F13 | `workspaceId + createdAt DESC` |
| `clients` | F14 | `agencyWorkspaceId + status` |
| `client_reports` | F14 | `clientId + periodStart DESC` |
| `listening_configs` | F15 | `workspaceId ASC` |
| `listening_feeds` | F15 | `workspaceId + status + mentionedAt DESC` |

---

## PHASED BUILD ORDER FOR CLAUDE CODE

### Phase 1 — MVP Foundation (run first)
```
F7 → F8 → F1 → F2 → F3 → F4 → F6
```
*Reason: Workspace and brand voice must exist before any content can be created. Publishing and calendar depend on content. Approvals gate publishing.*

### Phase 2 — Analytics & Social (run second)
```
F9 → F5
```
*Reason: Social connections must exist before analytics can pull platform data.*

### Phase 3 — Growth Features (run third)
```
F10 → F11 → F13
```
*Reason: SEO and email are standalone but benefit from content drafts existing. Image generation integrates into the editor.*

### Phase 4 — CRM & Agency (run last)
```
F12 → F14 → F15
```
*Reason: CRM builds on email. Client Management requires all F1–F9 to be stable since it wraps them. Social listening is infrastructure-heavy and can be last.*

---

## CLAUDE.md ADDENDUM — Add to Existing CLAUDE.md

```markdown
## Additional Feature Pipeline Notes (F9–F15)

### OAuth Security (F9, F3)
All OAuth tokens MUST be encrypted using Firebase Secret Manager before writing
to Firestore. Never store raw access_token or refresh_token as plain Firestore string.
Use: lib/security/token-encryption.ts with AES-256-GCM.

### External API Rate Limits (F10, F15)
External API calls (SEMrush, Brandwatch, Mention) must go through a rate-limit
wrapper in lib/integrations/rate-limiter.ts. Never call these APIs directly
from route handlers. Use a queue pattern (Cloud Tasks) for batch operations.

### Client Isolation (F14)
When building F14, every Firestore query in client-scoped routes MUST include
both `agencyWorkspaceId` AND `clientId` filters. Single-filter queries are a
security bug — the code reviewer agent must fail any PR missing dual-scope filtering.

### Image Storage Lifecycle (F13)
After uploading to Firebase Storage, always write the `storagePath` (gs:// path)
to Firestore alongside the download URL. The download URL can expire; the
storagePath is needed for deletion and signed URL regeneration.

### Email Compliance (F11, F12)
Every email send MUST check suppression list before dispatch.
Unsubscribe endpoint (/api/email/unsubscribe) is always public (no Clerk auth).
Add to Firestore rules: allow unsubscribe writes without auth.
```
