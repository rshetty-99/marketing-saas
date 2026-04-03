# CLAUDE.md — Marketing SaaS Orchestration Contract
 
## Project Identity
Marketing SaaS platform for agencies managing client content workflows.
Stack: Next.js 14 (App Router), Firebase Hosting, Firestore, Firebase Storage,
TailwindCSS, shadcn/ui, Framer Motion, Clerk Auth.
 
## Agent Pipeline — Execute in Order for Every Feature
 
When asked to implement a feature, ALWAYS run subagents in this exact sequence:
 
### Stage 1 — PLAN (auto)
Subagent: `.claude/agents/planner.md`
Input: Feature contract from `.claude/feature-contracts/<FN>.md`
Output: `docs/plans/<FN>-plan.md`
Gate: None — auto-proceed
 
### Stage 2 — TEST WRITE (auto)
Subagent: `.claude/agents/test-writer.md`
Input: Plan from Stage 1
Output: `tests/e2e/<FN>/*.spec.ts` (Playwright)
Gate: None — auto-proceed
 
### Stage 3 — FRONTEND DESIGN (auto)
Subagent: `.claude/agents/frontend-designer.md`
Input: Plan + existing design tokens
Output: Components in `src/components/features/<FN>/`
Gate: None — auto-proceed
 
### Stage 4 — BACKEND DESIGN (auto)
Subagent: `.claude/agents/backend-designer.md`
Input: Plan + Firestore schema conventions
Output: API routes, Firestore rules delta, service modules
Gate: None — auto-proceed
 
### Stage 5 — TEST VALIDATE (auto)
Subagent: `.claude/agents/test-validator.md`
Input: Test scripts from Stage 2 + code from Stages 3 & 4
Output: Validation report `docs/test-reports/<FN>-validation.md`
Gate: None — auto-proceed
 
### Stage 6 — CODE REVIEW (HUMAN GATE ⚠️)
Subagent: `.claude/agents/code-reviewer.md`
Output: Review report `docs/reviews/<FN>-review.md`
STOP — Present review to human. Await explicit approval before Stage 7.
 
### Stage 7 — GIT COMMIT (HUMAN GATE ⚠️)
STOP — Do not commit. Present proposed commit message + changed file list.
Await explicit "commit approved" before running:
  git add -A
  git commit -m "<message>"
  git push origin feature/<FN>
 
## Naming Conventions
- Feature branches: feature/F1-content-generation, feature/F2-repurposing, etc.
- Commit prefix: feat(F1):, fix(F1):, test(F1):, chore:
- Firestore collections: snake_case
- TypeScript types: PascalCase, location: src/types/features/<fn>.ts
- API routes: src/app/api/<resource>/route.ts
- Components: src/components/features/<FN>/
- Services: src/lib/<fn>/
 
## Firestore Rules — Non-Negotiable
- Every document MUST have: createdAt, updatedAt, workspaceId, createdBy
- Use serverTimestamp() — never new Date()
- All queries MUST use typed converters from src/lib/firebase/converters/
- Security rules: workspace-scoped — no cross-workspace data access ever
- All OAuth tokens encrypted via Firebase Secret Manager before Firestore write
 
## Testing Rules
- Every feature needs: happy-path, error-states, loading-states, empty-states, auth-guard
- Auth state mocked via Playwright fixture — never use real credentials in tests
- Each spec file is self-contained — no shared mutable state between specs
- Use data-testid or ARIA selectors — never [class=] selectors
 
## Code Style
- All components: functional, typed Props interface, named exports (no default from pages)
- Use shadcn/ui primitives before building custom components
- Framer Motion: layout animations and page transitions only — no gratuitous motion
- No `any` TypeScript types — strict mode enforced
- Tailwind only — no inline styles, no CSS modules
- No console.log in committed code
- All async operations must have error handling
 
## External API Rules
- Rate-limited APIs (SEMrush, Brandwatch) go through src/lib/integrations/rate-limiter.ts
- Never call external APIs directly from route handlers — use service modules
- Use Cloud Tasks queue pattern for batch operations
 
## Security Rules
- No secrets or API keys in code — use .env.local or Firebase Secret Manager
- All Firestore queries must be dual-scoped where client isolation applies (F14)
- Input validation with Zod on every API route before any Firestore operation
- Clerk auth check on every protected route
 
## Build Order — Respect Dependencies
Phase 0: F0           ✅ COMPLETE (auth, onboarding, RBAC, dashboard, entity data model)
Phase 1: F7 + F8      ✅ COMPLETE (workspace management + brand voice)
Phase 1: F1-F4, F6    ✅ COMPLETE (content pipeline)
Phase 2: F9 + F5      ✅ COMPLETE (social connections + analytics)
Phase 3: F10, F11, F13 ✅ COMPLETE (SEO, email campaigns, image generation)
Phase 4: F12, F14, F15 ✅ COMPLETE (lead management, client management, billing)
Phase 5: Admin Panel   ✅ COMPLETE (10 pages, 8 platform roles, tier gating)
Phase 6: Polish        ✅ COMPLETE (tier gating, approval config, admin actions, portal pages, reports)
Phase 7: Deferred      ✅ COMPLETE (inbox, webhooks, automation, sentiment, ROI, attribution, listening)
Phase 8: Compliance    ✅ COMPLETE (DAM, white-label, GDPR, landing pages, chatbot, SMS/WhatsApp, tours)
Phase 9: Marketing+    ✅ COMPLETE (A/B testing, reports, links, hashtags, bulk schedule, snippets, replies, scoring, influencers, video, ads, workflows, benchmarks, RSS)

## Execution Permissions
- Agent has pre-approval to execute: build, test, seed, cleanup, git operations
- Use /grill-me before each feature to resolve design decisions upfront
- Commit after each feature is complete + tests pass
- Push to origin/develop after commit

## Feature Planning Protocol — MANDATORY
When planning any new feature or phase, follow this sequence:

### 1. Explore existing codebase
- Read relevant RBAC spec sections, existing types, sidebar nav, Firestore rules
- Identify what EXISTS vs what NEEDS TO BE BUILT

### 2. Grill session (/grill-me)
- Resolve all design decisions one at a time
- Lock decisions before implementation

### 3. Research gaps — MINIMUM 2 PASSES
After the grill session and BEFORE implementation, run at least 2 rounds
of competitive research to find missing fields and features:
  - **Pass 1**: Research 5-10 competitor platforms for the feature area.
    Identify missing fields, data types, and patterns.
  - **Pass 2**: Take the combined fields from the grill + Pass 1 and
    do a SECOND gap check specifically looking for what's STILL missing.
    Check for: accessibility, compliance, analytics, automation,
    integration points, and edge cases.
  - Present findings to user with "Add Now" vs "Defer" recommendation.
  - Only proceed to implementation after user confirms the field list.

### 4. Update production-readiness.md
- Track all mock/dev implementations that need real credentials for production
- Include: env vars needed, API scopes, redirect URIs, blockers

### 5. Implement
- Types first (foundation)
- Zod schemas (validation)
- Services (business logic)
- API routes
- UI pages
- E2E tests
- Build + run all tests + commit + push

## Dev vs Production Pattern
- Build real architecture, use mock data for dev
- All mock implementations tracked in docs/production-readiness.md
- Code is production-ready — swap mock for real when credentials are set
- Pattern applies to: AI generation (F1), publishing (F3), analytics (F5),
  social OAuth (F9), SEO APIs (F10), email sending (F11), image generation (F13)

## Locked Architecture Decisions
### From F0 grill session:
- `entity_profiles/{workspaceId}` = business identity + marketing defaults (absorbs brand_profiles)
- `clients/{clientId}` = flat top-level, scoped by agencyWorkspaceId field
- `workspaces/{id}` = lean tenant shell (system data only)
- `FirestoreTimestamp` portable type in shared types (no firebase-admin in client bundles)
- Entity profile created at onboarding Step 1 (always exists, never null)
- Roles + permissions in Firestore (workspace_roles/, platform_roles/, *_permissions/)
- RBAC service with 5-min cache reads from Firestore
- Sidebar nav items gated by Firestore permission keys
- Platform users → /admin, client_portal → /portal, workspace users → /dashboard
- Single seed command: `npm run seed` (runs all scripts in order)

### From F7+F8 grill session:
- Flat routing under /dashboard/ (no nested workspace/ prefix)
- Tabbed pages for settings, brand, client settings
- Inline dropdown with confirmation for role changes
- Team page admin-only (managers/editors/viewers don't see it)
- Single component with readOnly prop for view vs edit
- Brand data lives in entity_profiles only (brand_profiles deprecated)
- URL-only for file uploads (real uploads with F16/DAM)

### From F1-F6 grill session:
- Mock AI for content generation (real Claude when API key set)
- Mock + manual publish modes (real API calls with F9)
- Configurable multi-stage approval (freelancer=auto, org=2-stage, agency=3-stage)
- Markdown editor with live preview for content
- 12 content types, 10 channels — full taxonomy from day one
- 8-state content lifecycle: draft→submitted→approved→scheduled→published→retracted→archived (+rejected)
- F2 repurposing creates new drafts (no separate collection)
- Calendar auto-populated from publish jobs + approval deadlines + content due dates
- Single content_drafts collection (type-specific optional fields)
- Agency content in agency workspace, clientId field for scoping

### From F9+F5 grill session:
- AES-256-GCM token encryption with workspace key (cached in-memory)
- All 8 social platforms: LinkedIn, Twitter, Instagram, Facebook, TikTok, YouTube, Pinterest, Google Business
- Integrations hub with categories (Social active, others "Coming Soon")
- Client switcher filters analytics + dedicated /analytics/clients/[clientId] route
- Social connections as subcollection (workspaces/{id}/social_connections/)
- Daily analytics snapshots, Firestore only (BigQuery deferred)
- Recharts via shadcn/ui chart components

### From F10+F11+F13 grill session:
- Real on-page SEO scorer + mock keyword research (DataForSEO/SEMrush for prod)
- Debounced client-side SEO scoring + on-demand server-side analysis
- Template-based email editor (8 pre-built + custom HTML)
- Hybrid subscriber management (Firestore lists, SendGrid/Resend for sending)
- Mock image generation (Vertex AI for prod)
- All dimension presets + 8 style presets, brand colors auto-injected

## Additional Feature Pipeline Notes (F9–F16)

### Stack (locked v5.1)
Next.js 16 (App Router) on Firebase App Hosting. Clerk for auth.
Firebase Cloud Functions + Cloud Tasks for background jobs.
BigQuery for analytics. Never use DALL-E or Stability AI.

### Image Generation — Nano Banana 2 via Vertex AI ONLY
ALL image generation uses Nano Banana 2 via Vertex AI.
Env vars: `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_LOCATION`, `VERTEX_AI_NB2_MODEL_ID`
Never substitute with DALL-E, Stability AI, or Midjourney.

### DAM → Image Generation Build Order (F16 → F13)
F16 (DAM) must always be built before F13 (Image Generation).
DAM provides real brand assets (logos, photography) injected as base64
into Nano Banana 2 generation calls. Without F16, image gen produces
generic output instead of pixel-accurate branded creatives.

### OAuth Security (F9, F3)
All OAuth tokens MUST be encrypted using AES-256-GCM before Firestore write.
Implementation: `src/lib/security/token-encryption.ts` + `src/lib/f9/social-service.ts`
Dev: 32-byte key from env or fallback. Prod: Firebase Secret Manager.
Tokens are NEVER returned in API responses — `listConnections()` strips them.

### External API Rate Limits (F10, F12)
External API calls (DataForSEO, Brand24, Clearbit) must go through
`src/lib/integrations/rate-limiter.ts`. Never call directly from route handlers.
Per-platform, per-connection rate limits enforced in-memory.
Use Cloud Tasks queue pattern for batch operations.

### Lead Gen Public Endpoint (F15)
POST `/api/crm/leads` is a PUBLIC endpoint — no Clerk auth.
Rate limit: 10 req/min per form ID. CAPTCHA verification required.
Form submissions from external sites cannot authenticate with Clerk.

### Client Isolation (F14)
Every Firestore query in client-scoped routes MUST include BOTH
`agencyWorkspaceId` AND `clientId` filters. Single-filter queries are a
security bug. Firestore rules enforce dual-scope at the database level.

### Image Storage Lifecycle (F13, F16)
After uploading to Firebase Storage, always write the `storagePath` (gs:// path)
to Firestore alongside the download URL. The download URL can expire; the
storagePath is needed for deletion and signed URL regeneration.

### Email Compliance (F11, F15)
Every email send MUST check suppression list before dispatch.
Unsubscribe endpoint (`/api/email/unsubscribe`) is always public (no Clerk auth).
CAN-SPAM: physical address + unsubscribe link mandatory in every campaign.
GDPR: double opt-in supported, consent timestamps stored with records.

### Social Listening (F12) — Brand24 Integration
Brand24 is $79/month (Starter plan). Optional upgrade path.
DIY approach: free platform APIs + Claude sentiment analysis.
Config: `BRAND24_API_KEY` env var. When absent, mock data used.

### Cloud Functions Schedule (Production)
7 functions need Cloud Scheduler activation for production:
- trialEnforcement: `0 2 * * *` (daily 2am)
- tokenRefresh: `0 * * * *` (hourly)
- metricsPoller: `0 */6 * * *` (every 6 hours)
- approvalEscalation: `30 * * * *` (every 30 min)
- calendarNotifications: `*/15 * * * *` (every 15 min)
- rankingTracker: `0 3 * * 1` (weekly Monday 3am)
- contentDecayMonitor: `0 3 * * 3` (weekly Wednesday 3am)

## Key Specifications
- RBAC: docs/rbac-specification.md (v2.0) — authoritative source for all roles & permissions
- Production readiness: docs/production-readiness.md — tracks all mock→prod swap items
- Feature contracts: .claude/feature-contracts/F0-auth-onboarding.md (and future F1-F16)
- Platform: Aura.ai — admin panel at /admin (path-based, subdomain later)
- Billing: Stripe — base tier + per-seat pricing
- Trial: 15-day, full features with usage caps, soft-lock on expiry
