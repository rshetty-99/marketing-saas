# Production Readiness Tracker

Items that are architecturally complete but use mock/dev implementations.
Each item needs real credentials, API integrations, or infrastructure to go live.

## Status Key
- `[ ]` Not started
- `[DEV]` Mock/dev implementation in place — works for testing
- `[PROD]` Production-ready

---

## F1: AI Content Generation
- [DEV] Claude API integration — mock generator returns placeholder content
  - **To go PROD:** Set `ANTHROPIC_API_KEY` in env, swap `generateMockContent()` for real Claude API call in `src/lib/f1/content-service.ts`
  - **Blocked on:** Anthropic API key + billing

## F3: Publishing
- [DEV] Platform publishing — mock publish returns simulated success
  - **To go PROD:** Replace `simulateMockPublish()` in `src/lib/f3/publishing-service.ts` with real platform API calls via F9 tokens
  - **Blocked on:** F9 real OAuth tokens per platform

## F5: Analytics
- [DEV] Metrics polling — mock snapshots with sample data
  - **To go PROD:** Build Cloud Function that polls real platform APIs via F9 tokens, stores real metrics in `analytics_snapshots`
  - **Blocked on:** F9 real OAuth tokens + Cloud Functions deployment
- [DEV] BigQuery streaming — not connected
  - **To go PROD:** Create BigQuery dataset `aura_analytics`, configure streaming inserts from Cloud Function
  - **Blocked on:** BigQuery project setup + `BIGQUERY_PROJECT_ID`, `BIGQUERY_DATASET_ID` env vars
- [DEV] Report export (PDF/CSV) — basic CSV only
  - **To go PROD:** Add PDF generation (e.g., Puppeteer or jsPDF) with branded templates from entity_profiles
  - **Blocked on:** PDF generation library choice

## F9: Social Connections — OAuth Per Platform

### LinkedIn
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register LinkedIn developer app, set redirect URI, add credentials
  - **Env vars:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
  - **Scopes:** `w_member_social`, `r_basicprofile`, `r_emailaddress`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/linkedin`

### Twitter / X
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Twitter developer app (Essential or Elevated access), add credentials
  - **Env vars:** `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
  - **Scopes:** `tweet.read`, `tweet.write`, `users.read`, `offline.access`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/twitter`

### Instagram
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Facebook developer app, configure Instagram Basic Display API or Instagram Graph API
  - **Env vars:** `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`
  - **Scopes:** `instagram_basic`, `instagram_content_publish`, `pages_show_list`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/instagram`
  - **Note:** Requires Facebook Business account + connected Instagram Business/Creator account

### Facebook
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Facebook developer app, configure Facebook Login
  - **Env vars:** `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
  - **Scopes:** `pages_manage_posts`, `pages_read_engagement`, `pages_read_user_content`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/facebook`

### Google Business Profile
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Google Cloud project, enable Business Profile API, configure OAuth consent screen
  - **Env vars:** `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`
  - **Scopes:** `https://www.googleapis.com/auth/business.manage`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/google_business`

### TikTok
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register TikTok developer app, apply for Content Posting API access
  - **Env vars:** `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
  - **Scopes:** `user.info.basic`, `video.publish`, `video.list`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/tiktok`
  - **Note:** TikTok requires app review before publishing access is granted

### YouTube
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Google Cloud project, enable YouTube Data API v3
  - **Env vars:** `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`
  - **Scopes:** `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/youtube`

### Pinterest
- [DEV] OAuth flow — mock connection with sample data
  - **To go PROD:** Register Pinterest developer app, apply for API access
  - **Env vars:** `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`
  - **Scopes:** `boards:read`, `pins:read`, `pins:write`
  - **Redirect URI:** `{OAUTH_REDIRECT_BASE}/api/social/callback/pinterest`

## F9: Token Encryption
- [DEV] AES encryption with hardcoded dev key
  - **To go PROD:** Create workspace-level encryption key in Firebase Secret Manager, cache in-memory
  - **Blocked on:** Firebase Secret Manager setup + `ENCRYPTION_KEY_SECRET_NAME` env var

## F9: Token Refresh
- [DEV] No auto-refresh — tokens don't expire in mock mode
  - **To go PROD:** Cloud Function on schedule checks token expiry, refreshes via platform refresh_token endpoint
  - **Blocked on:** Cloud Functions deployment + real OAuth tokens

## F6: Approval Workflows
- [DEV] External client approval links — flow exists but email sending is mocked
  - **To go PROD:** Integrate with email service (SendGrid/Resend) for approval notification emails
  - **Blocked on:** Email service credentials

## Infrastructure
- [ ] Firebase Secret Manager — not configured
  - **To go PROD:** Enable Secret Manager API, create secrets for OAuth credentials + encryption keys
- [DEV] Cloud Functions — deployed as HTTP-callable (no auto-schedule)
  - **8 functions deployed** to us-central1 (Node.js 20, 2nd gen)
  - **1 Firestore trigger active:** `publishScheduled` (fires on publish_jobs doc creation)
  - **7 HTTP-callable** (manually triggered via URL until go-live):
    - `trialEnforcement` → enable schedule: `0 2 * * *` (daily 2am UTC)
    - `tokenRefresh` → enable schedule: `0 * * * *` (hourly)
    - `metricsPoller` → enable schedule: `0 */6 * * *` (every 6 hours)
    - `approvalEscalation` → enable schedule: `30 * * * *` (hourly at :30)
    - `calendarNotifications` → enable schedule: `*/15 * * * *` (every 15 min)
    - `rankingTracker` → enable schedule: `0 3 * * 1` (weekly Monday)
    - `contentDecayMonitor` → enable schedule: `0 3 * * 3` (weekly Wednesday)
  - **To go PROD:** Change `onRequest` to `onSchedule` in `functions/src/index.ts`, rebuild + redeploy
- [ ] Cloud Tasks — not configured
  - **To go PROD:** Enable Cloud Tasks API, configure queues for scheduled publishing, notification delivery
- [ ] BigQuery — not configured
  - **To go PROD:** Create dataset, configure streaming inserts from Cloud Functions
- [ ] Custom domain — not configured
  - **To go PROD:** Configure Firebase Hosting custom domain, update OAuth redirect URIs
- [ ] `OAUTH_REDIRECT_BASE` env var — not set
  - **Dev:** `http://localhost:3000`
  - **Prod:** `https://app.aura.ai` (or custom domain)

---

## F10: SEO & Keywords
- [DEV] On-page SEO scorer — real logic (keyword density, meta tags, headings, readability)
- [DEV] Keyword research — mock data (search volume, difficulty, rankings)
  - **To go PROD:** Set `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` or `SEMRUSH_API_KEY`
  - **Blocked on:** DataForSEO or SEMrush API credentials
- [DEV] Content briefs — mock generated briefs
  - **To go PROD:** Real Claude API for brief generation + keyword data from DataForSEO
- [DEV] Ranking tracker — mock ranking snapshots
  - **To go PROD:** Cloud Function polling DataForSEO rank tracker API weekly
- [DEV] Technical SEO (Core Web Vitals, page speed) — schema defined, no implementation
  - **To go PROD:** Google PageSpeed Insights API integration
- [DEV] Cannibalization detection — schema defined, no scanner
  - **To go PROD:** Cross-reference content_drafts focusKeywords in batch job
- [DEV] Content decay tracking — schema defined, no monitoring
  - **To go PROD:** Cloud Function comparing weekly ranking snapshots

## F11: Email Campaigns
- [DEV] Campaign creation — template-based + custom HTML, all fields stored
- [DEV] Email sending — mock (no actual emails sent)
  - **To go PROD:** Set `SENDGRID_API_KEY` or `RESEND_API_KEY`
  - **Blocked on:** SendGrid/Resend credentials + domain verification
- [DEV] Subscriber management — Firestore lists, import, tags, consent tracking
- [DEV] Campaign analytics — mock metrics
  - **To go PROD:** SendGrid/Resend webhook callbacks for opens, clicks, bounces
- [DEV] Domain health — schema defined, no checker
  - **To go PROD:** DNS lookup for SPF/DKIM/DMARC verification
- [DEV] Deliverability scoring — schema defined, no scoring
  - **To go PROD:** SpamAssassin or mail-tester API integration
- [DEV] A/B testing — schema defined, no split logic
  - **To go PROD:** Variant selection + winner determination Cloud Function
- [DEV] Drip automation/sequences — schema defined, no automation engine
  - **To go PROD:** Cloud Functions with trigger-based step execution
- [DEV] Send throttling — schema defined, Cloud Tasks not configured
  - **To go PROD:** Cloud Tasks queue for batch sending with rate control

## F13: Image Generation
- [DEV] Image generation — mock (placeholder gradient with prompt text)
  - **To go PROD:** Set `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_LOCATION`, `VERTEX_AI_NB2_MODEL_ID`
  - **Blocked on:** Google Cloud Vertex AI credentials + billing
- [DEV] Image library — works for viewing/organizing mock images
- [DEV] Batch generation — schema defined, mock returns multiple placeholders
- [DEV] Image-to-image — schema defined, no implementation
  - **To go PROD:** Vertex AI image-to-image API
- [DEV] Image editing (inpaint/outpaint/upscale/bg removal) — schema defined, no implementation
  - **To go PROD:** Vertex AI or Stability AI editing endpoints
- [DEV] Template overlays (text/logo on images) — schema defined, no renderer
  - **To go PROD:** Sharp or Canvas-based server-side image composition
- [DEV] Platform auto-sizing — schema defined, no auto-crop
  - **To go PROD:** Sharp-based auto-crop with face detection
- [DEV] Image optimization (WebP/AVIF) — schema defined, no converter
  - **To go PROD:** Sharp-based format conversion on upload

## F12: Lead Management / CRM
- [DEV] Lead pipeline — full UI with customizable stages, mock data
- [DEV] Lead scoring — manual + rule-based scoring model
  - **To go PROD:** Integrate with website tracking (page visits, form submissions) for auto-scoring
- [DEV] Lead nurture automation — schema defined, no automation engine
  - **To go PROD:** Cloud Functions with trigger-based step execution + F11 email integration
- [DEV] Multi-touch attribution — schema defined, no tracking pixel
  - **To go PROD:** UTM tracking integration + website analytics correlation
- [DEV] Real-time duplicate detection — manual flagging only
  - **To go PROD:** Fuzzy matching service (Levenshtein on email+company+phone)
- [DEV] Lead recycling — schema defined, no automation
  - **To go PROD:** Scheduled Cloud Function for stale lead re-engagement
- [DEV] CSV import — schema defined, basic parsing
  - **To go PROD:** Background job for large imports (Cloud Tasks)

## F14: Client Management
- [DEV] Client portal — reports + dashboard + content feedback UI
- [DEV] White-label reports — mock PDF generation with brand config
  - **To go PROD:** PDFKit/React PDF real rendering + SendGrid delivery
  - **Blocked on:** PDF generation library + email service credentials
- [DEV] Client onboarding checklist — template system with default steps
- [DEV] SOW/deliverables tracking — schema defined, basic UI
  - **To go PROD:** Automated delivery verification + approval flow
- [DEV] Client-specific approval chains — schema defined
  - **To go PROD:** Per-client workflow template assignment
- [DEV] Health score — full 5-category weighted model with mock signals
  - **To go PROD:** Real engagement/activity data from F3/F5/F6
- [DEV] Client offboarding — checklist + data export stub
  - **To go PROD:** Automated data export to ZIP + Clerk org cleanup

## F15: Billing / Stripe
- [DEV] Subscription management — mock when no Stripe keys, test mode when present
  - **To go PROD:** Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - **Blocked on:** Stripe account + product/price creation
- [DEV] Usage tracking — real counting from Firestore collections
- [DEV] Trial enforcement — fully working (soft lock at 15 days)
- [DEV] Invoice history — mock invoices
  - **To go PROD:** Stripe Invoice API + PDF download
- [DEV] Dunning management — schema defined, no retry logic
  - **To go PROD:** Stripe Smart Retries + webhook handling for payment_failed events
- [DEV] Coupons/promotions — schema defined
  - **To go PROD:** Stripe Coupon API integration
- [DEV] Tax compliance — schema defined
  - **To go PROD:** Stripe Tax API for automatic VAT/GST calculation
- [DEV] Credit system — schema defined
  - **To go PROD:** Stripe Customer Balance API or custom ledger
- [DEV] Revenue metrics (MRR/ARR/churn) — schema defined
  - **To go PROD:** Cloud Function computing daily revenue snapshots from Stripe data
- [DEV] Billing portal — self-service stub
  - **To go PROD:** Stripe Customer Portal session creation

## Social Listening (Deferred — tracked separately from F12)
- [ ] Brand mention monitoring — Brandwatch/Brand24 API integration
  - **Env vars:** `BRANDWATCH_API_KEY` or `BRAND24_API_KEY`
  - **Blocked on:** Enterprise API credentials ($$$)
- [ ] Competitor tracking — mention volume comparison
- [ ] Sentiment analysis — Claude API for comment/mention classification
- [ ] Alert digests — email notifications for spike/drop in mentions

## Deferred Features (Future Phases)

### Phase 3+
- [ ] **Unified Inbox** — Comments, DMs, mentions across platforms. New collections: `inbox_items`, `inbox_replies`. Needs webhook ingestion from Meta, Twitter, YouTube.
- [ ] **Comment Sentiment Analysis** — NLP pipeline scoring comments as positive/neutral/negative. Per-post sentiment aggregates.
- [ ] **Share of Voice / Competitor Tracking** — Brandwatch-style monitoring. Track competitor mentions, SOV percentage.
- [ ] **Webhook Ingestion** — Real-time events from platform webhooks (Meta Webhooks API, YouTube PubSub). Per-platform webhook registration.

### Phase 4+
- [ ] **Content ROI Calculation** — Creation time tracking + ad spend data → cost per engagement, earned media value.
- [ ] **Per-Connection Billing Slots** — Charge per connected social profile. Ties to F15 Stripe billing.
- [ ] **Advanced Attribution Models** — First-touch, last-touch, linear attribution across cross-posted content.
- [ ] **Audience Demographics** — Age, location, industry breakdowns from premium platform API tiers.

---

*Last updated: 2026-04-02*
*Updated by: Claude Opus 4.6*
