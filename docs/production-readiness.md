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
- [DEV] Drip automation/sequences — shared automation engine built (src/lib/automation/)
  - **To go PROD:** Cloud Functions for delayed step execution + Cloud Tasks for scheduling
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
- [DEV] Image editing (inpaint/outpaint/style transfer/variations) — schema defined, no implementation
  - **To go PROD:** Vertex AI Imagen for AI operations (~$0.020/image)
- [DEV] Background removal — schema defined, no implementation
  - **To go PROD:** rembg (open-source, free, runs on Cloud Function CPU)
- [DEV] Upscaling — schema defined, no implementation
  - **To go PROD:** Real-ESRGAN (open-source, free, CPU ok for 2x)
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
- [DEV] Lead nurture automation — shared automation engine built (src/lib/automation/)
  - **To go PROD:** Cloud Functions for trigger evaluation + F11 email integration
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

## Phase 7: Previously Deferred — NOW BUILT

### Unified Inbox (src/lib/inbox/)
- [DEV] Inbox page with mock messages from 4 platforms
- [DEV] Assignment, reply, archive, snooze functionality
  - **To go PROD:** Wire to real webhook events from Meta/YouTube (free APIs)
  - **Blocked on:** Webhook registration on Meta Developer Dashboard + YouTube PubSub

### Webhook Ingestion (src/app/api/webhooks/social/)
- [DEV] Generic endpoint per platform with deduplication (SHA-256)
- [DEV] Meta webhook verification (GET challenge-response)
  - **To go PROD:** Register webhook URLs on Meta, YouTube developer dashboards
  - **Env vars:** `META_WEBHOOK_VERIFY_TOKEN`

### Automation Engine (src/lib/automation/)
- [DEV] Workflow CRUD with triggers, steps, exit conditions, A/B splits
- [DEV] Enrollment management + execution logging
  - **To go PROD:** Cloud Functions for delayed step execution + Cloud Tasks for scheduling
  - **Blocked on:** Cloud Tasks queue configuration

### Sentiment Analysis (src/lib/sentiment/)
- [DEV] Rule-based scorer (VADER-like) — works for free, no API needed
  - **To go PROD:** Optional Claude Haiku upgrade (~$4/mo for 50K analyses)
  - **Env vars:** `ANTHROPIC_API_KEY` (already tracked in F1)

### Content ROI Calculator (src/lib/roi/)
- [PROD] Pure internal calculation — no external API needed
  - Inputs: impressions, engagement, clicks, creation time, ad spend
  - Outputs: earned media value, ROI percentage

### UTM Attribution (src/lib/attribution/)
- [PROD] 4 models: first_touch, last_touch, linear, time_decay
  - Works immediately with existing F3 published UTM links
  - No agency setup required

### Social Listening / DIY (src/lib/listening/)
- [DEV] Keyword monitoring config + mock mention feed
  - **To go PROD (DIY):** Poll Meta Graph API + YouTube Data API search endpoints (free)
  - **To go PROD (Premium):** Optional Brand24 API upgrade ($239/mo)
  - **Env vars:** `BRAND24_API_KEY` (optional)

### Per-Connection Billing
- [DEV] Schema defined on billing types
  - **To go PROD:** Stripe metered billing API for per-profile charges

### Audience Demographics
- [DEV] Schema defined on analytics types
  - **To go PROD:** Pull from Instagram Insights API + YouTube Analytics API + LinkedIn Analytics API (all free)

## Remaining Future Items

- [ ] **Share of Voice** — Requires Brandwatch ($1,000+/mo) or DIY approximation
- [ ] **Image Editing UI** — Canvas-based inpainting/outpainting (Vertex AI API ready, needs UI)
- [ ] **PDF Report Rendering** — React-PDF library chosen, needs template components built
- [ ] **Website Tracking Pixel** — Phase 8 enhancement for full-funnel attribution
- [ ] **GA4 Integration** — Import conversion path data from Google Analytics
- [ ] **Drip Sequence Visual Builder** — Drag-and-drop workflow editor UI
- [ ] **Real-time Duplicate Detection** — Fuzzy matching on lead import

---

*Last updated: 2026-04-03 (Phase 9 complete — all addendum gaps closed)*
*Updated by: Claude Opus 4.6*

---

## Cloud Functions — Schedule Activation (MUST DO before launch)

Currently all 7 scheduled functions are deployed as HTTP-callable (`onRequest`).
For production, they must be converted to `onSchedule` with Cloud Scheduler.

### Step-by-step activation:

1. **Enable Cloud Scheduler API** in GCP Console:
   ```
   gcloud services enable cloudscheduler.googleapis.com --project=YOUR_PROJECT_ID
   ```

2. **Update `functions/src/index.ts`** — change each function from `onRequest` to `onSchedule`:
   ```typescript
   // BEFORE (dev — manual trigger):
   export const trialEnforcement = onRequest({ region: 'us-central1' }, async (req, res) => { ... });

   // AFTER (prod — auto-scheduled):
   export const trialEnforcement = onSchedule('0 2 * * *', async (event) => { ... });
   ```

3. **Schedule reference for each function:**

   | Function | Schedule | Frequency | Purpose |
   |----------|----------|-----------|---------|
   | `trialEnforcement` | `0 2 * * *` | Daily 2am UTC | Lock expired trials, send warnings |
   | `tokenRefresh` | `0 * * * *` | Hourly | Refresh expiring OAuth tokens |
   | `metricsPoller` | `0 */6 * * *` | Every 6 hours | Pull social analytics from platform APIs |
   | `approvalEscalation` | `30 * * * *` | Every 30 min | Escalate stalled approvals |
   | `calendarNotifications` | `*/15 * * * *` | Every 15 min | Send upcoming deadline reminders |
   | `rankingTracker` | `0 3 * * 1` | Weekly Mon 3am | Track SEO ranking changes |
   | `contentDecayMonitor` | `0 3 * * 3` | Weekly Wed 3am | Flag stale content |

4. **Redeploy:**
   ```
   cd functions && npm run build && firebase deploy --only functions
   ```

5. **Verify in GCP Console** → Cloud Scheduler → confirm all 7 jobs appear with correct cron expressions.

---

## Cloud Tasks — Queue Configuration (MUST DO before launch)

Cloud Tasks handles retry-safe batch operations. Without it, bulk email sends,
CRM webhook delivery, and scheduled publishing will not have proper retry logic.

### Step-by-step setup:

1. **Enable Cloud Tasks API:**
   ```
   gcloud services enable cloudtasks.googleapis.com --project=YOUR_PROJECT_ID
   ```

2. **Create 4 queues:**
   ```bash
   # Publishing queue — content publish jobs with retry
   gcloud tasks queues create publishing-queue \
     --location=us-central1 \
     --max-dispatches-per-second=10 \
     --max-attempts=5 \
     --min-backoff=10s \
     --max-backoff=600s

   # Email queue — throttled email sends
   gcloud tasks queues create email-queue \
     --location=us-central1 \
     --max-dispatches-per-second=5 \
     --max-attempts=3 \
     --min-backoff=60s \
     --max-backoff=3600s

   # CRM queue — webhook delivery to external CRMs
   gcloud tasks queues create crm-queue \
     --location=us-central1 \
     --max-dispatches-per-second=20 \
     --max-attempts=5 \
     --min-backoff=10s \
     --max-backoff=600s

   # General batch queue — enrichment, reports, imports
   gcloud tasks queues create batch-queue \
     --location=us-central1 \
     --max-dispatches-per-second=50 \
     --max-attempts=3 \
     --min-backoff=30s \
     --max-backoff=1800s
   ```

3. **Wire tasks in code** — example pattern:
   ```typescript
   import { CloudTasksClient } from '@google-cloud/tasks';
   const client = new CloudTasksClient();
   const queue = client.queuePath(PROJECT_ID, 'us-central1', 'email-queue');

   await client.createTask({
     parent: queue,
     task: {
       httpRequest: {
         httpMethod: 'POST',
         url: `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/sendEmailBatch`,
         body: Buffer.from(JSON.stringify({ campaignId, batch: subscriberIds })).toString('base64'),
         headers: { 'Content-Type': 'application/json' },
       },
       scheduleTime: { seconds: Date.now() / 1000 + delaySeconds },
     },
   });
   ```

4. **Add `@google-cloud/tasks` dependency:**
   ```
   cd functions && npm install @google-cloud/tasks
   ```

5. **Env vars needed:**
   - `GCP_PROJECT_ID` — your Firebase project ID
   - `GCP_LOCATION` — `us-central1` (or your region)

### Which features use Cloud Tasks:

| Queue | Feature | Operation |
|-------|---------|-----------|
| `publishing-queue` | F3 | Scheduled content publishing with retry |
| `email-queue` | F11 | Bulk campaign sends, drip sequences |
| `crm-queue` | F15 | CRM webhook delivery (HubSpot, Pipedrive, etc.) |
| `batch-queue` | F15 | Lead enrichment batches |
| `batch-queue` | F14 | Client report PDF generation |
| `batch-queue` | F16 | DAM auto-tagging on upload |
| `batch-queue` | Phase 9 | Bulk schedule CSV processing |

---

## Summary: What's Needed to Go Live

### Critical Path (must-have for launch)
1. `ANTHROPIC_API_KEY` — real AI content generation
2. `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` — real billing
3. `SENDGRID_API_KEY` or `RESEND_API_KEY` — real email sending
4. At least 2 social platform OAuth apps (LinkedIn + Instagram recommended)
5. Enable Cloud Function schedules (see section above)
6. Create Cloud Tasks queues (see section above)
7. Custom domain + update OAuth redirect URIs

### Nice-to-have for launch
8. `DATAFORSEO_LOGIN` — real SEO keyword data
9. `VERTEX_AI_PROJECT_ID` — real image generation
10. Firebase Secret Manager for token encryption keys
11. BigQuery dataset for long-term analytics
12. `BRAND24_API_KEY` — premium social listening ($79/mo)
13. `CLEARBIT_API_KEY` or `APOLLO_API_KEY` — lead enrichment
14. `SHORT_LINK_DOMAIN` — custom short-link domain for branded links

### Total env vars needed: ~25 keys across 12 services

---

## Phase 9: Marketing Tools (all [DEV] — mock implementations)

### A/B Testing Engine
- [DEV] Variant tracking, auto-winner selection — mock impression/click counting
  - **To go PROD:** Wire variant serving into content delivery, add real statistical significance calculation

### Client Report Builder
- [DEV] PDF report generation — mock file URL
  - **To go PROD:** Integrate React PDF renderer, upload to Firebase Storage, wire Cloud Function for scheduled sends
  - **Blocked on:** `@react-pdf/renderer` setup

### Link Shortener + UTM Builder
- [DEV] Short link creation — mock domain `aura.link`
  - **To go PROD:** Set `SHORT_LINK_DOMAIN`, configure redirect endpoint on custom domain, add click tracking analytics
  - **Blocked on:** Custom short-link domain setup

### Hashtag Research
- [DEV] Hashtag analytics — mock data (postCount, difficulty, trending)
  - **To go PROD:** Integrate RapidAPI Instagram/TikTok hashtag endpoints or Later API
  - **Blocked on:** `RAPIDAPI_KEY` or equivalent

### Bulk Scheduling / CSV Import
- [DEV] CSV parsing and batch content creation — functional with Firestore batch writes
  - **To go PROD:** Add file upload to Firebase Storage, background processing via Cloud Tasks

### Content Library / Snippets
- [DEV] Full CRUD operational — no production deps needed
  - **To go PROD:** Ready (pure Firestore feature)

### Saved Replies
- [DEV] Full CRUD operational — no production deps needed
  - **To go PROD:** Ready (pure Firestore feature)

### AI Content Scoring
- [DEV] Rule-based scoring (readability, hooks, CTAs)
  - **To go PROD:** Replace with Claude API analysis for brand alignment, engagement prediction, emotional tone
  - **Blocked on:** `ANTHROPIC_API_KEY`

### Influencer Management
- [DEV] Manual influencer CRM — full CRUD, campaign tracking
  - **To go PROD:** Integrate influencer discovery API (e.g., Upfluence, Modash, or HypeAuditor)
  - **Blocked on:** `INFLUENCER_API_KEY`

### Video Editor
- [DEV] Project management — mock render output
  - **To go PROD:** Deploy FFmpeg Cloud Function for server-side rendering, or integrate Creatomate API
  - **Blocked on:** Cloud Function + FFmpeg binary or `CREATOMATE_API_KEY`

### Ad Campaign Management
- [DEV] Campaign CRUD with mock performance data
  - **To go PROD:** Integrate Meta Marketing API, Google Ads API, LinkedIn Campaign Manager API
  - **Blocked on:** `META_MARKETING_TOKEN`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `LINKEDIN_ADS_TOKEN`

### Visual Workflow Builder
- [DEV] Node/edge storage — no execution engine
  - **To go PROD:** Wire workflow execution into existing automation engine (Phase 7)
  - **Blocked on:** Workflow executor integration

### Competitor Benchmarking
- [DEV] Manual competitor profiles + snapshot storage
  - **To go PROD:** Integrate social data APIs for automated polling (Sprout Social API or custom scrapers)
  - **Blocked on:** Platform API access

### RSS Auto-Posting
- [DEV] Feed configuration + item storage
  - **To go PROD:** Deploy Cloud Function to poll RSS feeds on interval, auto-create content drafts
  - **Blocked on:** Cloud Function scheduler activation
