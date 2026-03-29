# AI Marketing SaaS Platform — CLAUDE.md

> This file is the primary context document for Claude when working on this codebase.
> Read it fully before writing any code. It contains non-negotiable rules, patterns,
> and architectural decisions that must be respected in every change.

---

## Project Overview

An AI-powered marketing workspace for digital agencies. Agencies use it to run deep
marketing analysis and generate publication-ready content for multiple client brands
from a single workspace. The platform executes 36 specialised AI skills (routed to
Claude Sonnet or Gemini Flash), publishes content across 5 social platforms, generates
images and video, connects to 4 CRMs and 5 ad platforms, and delivers a white-label
client portal with approval workflows.

**Target user:** Agency account managers managing 5–20 client brands simultaneously.  
**Core value:** One workspace replaces 8–10 disconnected marketing tools.  
**Business model:** Per-client agency seat subscription — $199–$599/seat/month.

---

## Tech Stack

### Core Framework
- **Next.js 14** — App Router only. No Pages Router. Use server components by default.
- **TypeScript** — strict mode always. No `any`. No type assertions without a comment.
- **Tailwind CSS** — utility-first. No inline styles. No CSS modules.

### UI Components
- **shadcn/ui** (official — `ui.shadcn.com`) — base component library. Install via
  `npx shadcn@latest add [component]`. Never rewrite what shadcn already provides.
- **21st.dev** (`21st.dev`) — polished UI components and agent templates. Prefer
  21st.dev for: AI chat interfaces, streaming token displays, animated marketing
  components, and any component that benefits from motion and polish.
- **shadcn.io** (`shadcn.io/components`) — 59 extended production-ready components
  built on top of shadcn/ui. Use for: Kanban boards, Gantt charts, advanced tables,
  Dropzone uploads, Tags input, Animated Modal, Code Block, Status indicators,
  Calendar/date pickers, and all data visualisation. Install via:
  `npx shadcn@latest add https://shadcn.io/r/[component].json`
  
### Backend & Data
- **Firebase Authentication** — Firebase authentication
- **Firebase Firestore** — primary database. All reads via server components or
  server actions. Client-side Firestore only for real-time listeners (approval status,
  post publish status). See Firestore Rules in `/firestore.rules`.
- **Firebase Storage** — Digital Asset Management (DAM). Per-client bucket path:
  `dam/{clientId}/{assetId}`. Never expose Storage URLs directly — serve via signed
  URLs with 1-hour expiry.
- **Express.js API** — runs in Docker (`/api-server`). All skill execution, LLM calls,
  Ayrshare publishing, and third-party API calls happen here. Next.js never calls LLMs
  directly.

### Analytics & Tracking
- **Google Analytics 4** — frontend event tracking. Import `analytics` from
  `@/lib/analytics`. Never call `gtag` directly. Use the typed wrapper:
  ```ts
  import { track } from '@/lib/analytics'
  track('skill_run_started', { skill: '/audit', clientId })
  ```
- **GA4 Data API** — server-side ingestion for client dashboards. Lives in
  `/api-server/src/integrations/google/analytics.ts`.

### Additional Services
| Service | Purpose | Location |
|---|---|---|
| Anthropic Claude Sonnet 4 | 22 analysis skills | `/api-server/src/llm/claude.ts` |
| Google Gemini 2.5 Flash | 14 content skills | `/api-server/src/llm/gemini.ts` |
| Nano Banana 2 (Vertex AI) | Image generation | `/api-server/src/integrations/google/imagegen.ts` |
| Veo 3.1 Fast (fal.ai) | Video generation | `/api-server/src/integrations/fal/video.ts` |
| Ayrshare | Social publishing | `/api-server/src/integrations/ayrshare/` |
| DataForSEO | Rank tracking + backlinks | `/api-server/src/integrations/dataforseo/` |
| DeepL | Translation | `/api-server/src/integrations/deepl.ts` |
| Pinecone | RAG vector store | `/api-server/src/rag/` |
| Stripe | Billing | `/api-server/src/billing/` |
| PDFShift | PDF exports | `/api-server/src/integrations/pdfshift.ts` |

---

## Folder Structure

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes — login, signup
│   ├── (dashboard)/              # Protected agency dashboard
│   │   ├── layout.tsx            # Sidebar + client switcher shell
│   │   ├── [clientId]/           # Per-client workspace
│   │   │   ├── skills/           # Skill selector + run history
│   │   │   ├── editor/           # Edit & Refine results page
│   │   │   ├── calendar/         # Content calendar
│   │   │   ├── assets/           # DAM — file library
│   │   │   ├── knowledge-base/   # RAG document store
│   │   │   ├── reports/          # Analytics + report views
│   │   │   └── settings/         # Client settings + Brand Kit
│   │   └── settings/             # Workspace/billing settings
│   ├── portal/                   # Client portal — no auth required
│   │   └── [token]/              # Token-authenticated portal
│   ├── approve/                  # Approval flow — no auth required
│   │   └── [token]/
│   └── api/                      # Next.js API routes (thin proxies only)
│       └── webhooks/             # Stripe + Ayrshare webhooks
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── extended/                 # shadcn.io + 21st.dev components
│   ├── skills/                   # Skill selector, run cards, output blocks
│   ├── editor/                   # Edit & Refine editor components
│   ├── calendar/                 # Content calendar views
│   ├── dam/                      # Digital Asset Management UI
│   ├── approval/                 # Approval workflow components
│   ├── portal/                   # Client portal components
│   ├── reporting/                # Charts, metrics, report views
│   └── shared/                   # ClientSwitcher, GlobalNav, etc.
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts             # Firebase client SDK (browser)
│   │   ├── admin.ts              # Firebase Admin SDK (server only)
│   │   ├── firestore.ts          # Typed Firestore helpers
│   │   └── storage.ts            # Firebase Storage helpers + signed URLs
│   ├── analytics.ts              # GA4 typed event wrapper
│   ├── auth.ts                   # Firebase Auth helpers + session
│   └── utils.ts                  # cn(), formatDate(), etc.
│
├── types/
│   ├── client.ts                 # Client, BrandKit, Persona types
│   ├── skill.ts                  # SkillRun, SkillResult, Provider types
│   ├── post.ts                   # Post, ApprovalStatus types
│   ├── dam.ts                    # DamAsset, AssetType types
│   ├── report.ts                 # Report, Metric, Forecast types
│   └── billing.ts                # Plan, Seat, Subscription types
│
├── hooks/
│   ├── useClient.ts              # Current client context
│   ├── useApprovalStatus.ts      # Real-time Firestore listener
│   ├── usePostStatus.ts          # Real-time publish status listener
│   └── useSkillRun.ts            # Skill run state + streaming
│
├── api-server/                   # Express.js Docker service
│   ├── src/
│   │   ├── skills/               # All 36 SKILL.md files + loaders
│   │   ├── llm/                  # Claude + Gemini provider abstraction
│   │   ├── integrations/         # All third-party API clients
│   │   ├── rag/                  # Pinecone + embedding pipeline
│   │   ├── dam/                  # Firebase Storage operations
│   │   └── billing/              # Stripe helpers
│   ├── Dockerfile
│   └── package.json
│
├── firestore.rules               # Security rules — edit with extreme care
├── storage.rules                 # Firebase Storage rules
├── next.config.ts
├── tailwind.config.ts
└── CLAUDE.md                     # This file
```

---

## Coding Conventions

### TypeScript
- **Strict mode always.** `tsconfig.json` has `"strict": true`. Never disable it.
- **No `any`.** Use `unknown` and narrow with type guards. If you think you need
  `any`, you need to redesign the type.
- **Explicit return types on all exported functions.**
- **Named exports only.** No `export default`. Reason: refactoring, tree-shaking,
  and IDE navigation all work better with named exports.
  ```ts
  // ✅ Correct
  export function SkillSelector({ clientId }: Props) { ... }
  export const useClient = () => { ... }

  // ❌ Wrong
  export default function SkillSelector() { ... }
  ```

### React
- **Functional components only.** No class components.
- **Server components by default.** Only add `'use client'` when you need:
  - browser APIs (window, localStorage)
  - event handlers
  - React state or effects
  - real-time Firestore listeners
- **Props interfaces above the component, not inline.**
  ```ts
  interface SkillCardProps {
    skill: Skill
    onRun: (skillId: string) => void
    isRunning: boolean
  }

  export function SkillCard({ skill, onRun, isRunning }: SkillCardProps) { ... }
  ```
- **Prefer composition over prop drilling.** If a component needs more than 5 props,
  consider splitting it or using context.

### Styling
- **Tailwind only.** No inline styles. No CSS modules. No styled-components.
- **Use `cn()` for conditional classes:**
  ```ts
  import { cn } from '@/lib/utils'
  className={cn('base-class', isActive && 'active-class', className)}
  ```
- **Responsive: mobile-first.** `sm:` `md:` `lg:` — never override with smaller
  breakpoints going right to left.
- **Dark mode via `dark:` variant** — every component must work in both themes.
  The platform targets agency users who often work late — dark mode is default.

### Firestore
- **All writes go through typed helpers in `/lib/firebase/firestore.ts`.**
  Never write raw Firestore calls in components or pages.
- **Server-side reads in server components or server actions.** Use Firebase Admin
  SDK (`/lib/firebase/admin.ts`) — not the client SDK.
- **Client-side only for real-time listeners** (approval status, post publish status,
  skill run progress). Use `onSnapshot` sparingly — it holds an open connection.
- **Never expose sensitive fields client-side.** Fields like `googleTokens`,
  `metaTokens`, `stripeCustomerId` must never be returned to the client. Filter
  in server actions before passing to components.

### Firebase Storage (DAM)
- **Never expose raw Storage URLs.** Always generate signed URLs server-side
  with 1-hour expiry. Use `lib/firebase/storage.ts#getSignedUrl()`.
- **Client bucket paths are always** `dam/{clientId}/{assetId}` — no exceptions.
- **Validate file type and size before upload** — allowed types and 20MB limit
  enforced in the Dropzone component and Storage rules.
- **Auto-tag on upload** — after Storage upload completes, call the api-server
  `/dam/tag` endpoint to trigger Nano Banana 2 vision tagging.

### API Layer
- **Next.js API routes are thin proxies only.** All business logic lives in
  the Express api-server. Next.js routes handle: auth token validation, request
  forwarding to api-server, and Stripe/Ayrshare webhook verification.
- **Never call LLMs from Next.js.** All Claude and Gemini calls happen in
  the api-server. This keeps token costs auditable and prevents client exposure
  of API keys.
- **Skill runs are async.** POST to api-server returns a `runId`. Poll
  `/runs/:runId/status` or use the Firestore `skill_runs` listener for progress.

### Google Analytics 4
- **Use the typed wrapper, never `gtag` directly:**
  ```ts
  import { track } from '@/lib/analytics'

  // Key events to track
  track('skill_run_started',   { skill, clientId })
  track('skill_run_completed', { skill, clientId, durationMs })
  track('post_approved',       { clientId, platform, postId })
  track('post_published',      { clientId, platform, postId })
  track('asset_uploaded',      { clientId, assetType })
  track('client_created',      { plan })
  ```
- **Never track PII.** No email addresses, names, or API keys in GA4 events.
- **Conversion events** (skill_run_completed, post_published, client_created)
  are imported into GA4 as conversions — don't remove or rename them.

---

## Key Domain Concepts

Understanding these is essential before touching any feature:

**Client** — a brand an agency manages. Top-level workspace unit. All data is
scoped to `clientId`. An agency user can switch between clients in the sidebar.

**Skill** — one of 36 AI workflows. Each has a SKILL.md in `/api-server/src/skills/`.
Skills are identified by slug (`/audit`, `/copy`, etc.). They run against a source
(URL, PDF, YouTube, or text) and produce a structured result stored in Firestore.

**Brand Kit** — persistent context for a client: voice adjectives, tone dos/don'ts,
competitor names, brand colours, and ICP personas. Injected into every skill run
system prompt. Lives in Firestore `brand_kits/{clientId}`.

**Provider Abstraction** — every skill routes to Claude or Gemini via
`/api-server/src/llm/provider.ts`. The `SKILL_PROVIDERS` config maps slug → provider.
Skills in A/B mode run both providers and save results to `ab_tests`.

**DAM** — Digital Asset Management. Binary brand files (logos, fonts, photography)
stored in Firebase Storage. Metadata in Firestore `dam_assets/{clientId}/{assetId}`.
DAM assets are passed as base64 to Nano Banana 2 during image generation.

**Approval Flow** — content never auto-publishes. Agency clicks "Send for approval" →
signed URL emailed to client → client approves/rejects per post → agency sees live
status. All without client creating an account.

**Client Portal** — white-label read-only subdomain (`portal/[token]`). Shows
calendar, performance metrics, reports, rankings, and approval centre.
Token-auth only — no login required.

**RAG** — per-client knowledge base. Documents are chunked → embedded →
stored in Pinecone. Top-5 chunks retrieved at skill run time and injected
into the skill system prompt before the LLM call.

---

## Component Usage Guide

### When to use which library

| Need | Use |
|---|---|
| Button, Input, Select, Dialog, Dropdown | `shadcn/ui` — `@/components/ui/` |
| Data table with sort/filter | `shadcn.io` Kanban or Table |
| Drag-and-drop file upload | `shadcn.io` Dropzone |
| Content calendar Kanban view | `shadcn.io` Kanban |
| Project timeline (skill run schedule) | `shadcn.io` Gantt |
| Tags input (Brand Kit competitors) | `shadcn.io` Tags |
| Date picker (scheduling posts) | `shadcn.io` Calendar |
| Status indicators (post publish status) | `shadcn.io` Status + Pill |
| Code display (API docs, webhook payloads) | `shadcn.io` Code Block |
| Animated skill run loading | `shadcn.io` Spinner + Motion Effect |
| AI streaming output display | `21st.dev` Chat interface components |
| Marketing landing sections | `21st.dev` polished components |
| Skill result cards with animation | `21st.dev` animated cards |
| Metric number animation (reports) | `shadcn.io` Counter |
| Post approval swipe UI (mobile) | Custom — `shadcn/ui` Card base |

### Installing components

```bash
# shadcn/ui (official)
npx shadcn@latest add button
npx shadcn@latest add dialog

# shadcn.io extended components
npx shadcn@latest add https://shadcn.io/r/kanban.json
npx shadcn@latest add https://shadcn.io/r/dropzone.json
npx shadcn@latest add https://shadcn.io/r/code-block.json
npx shadcn@latest add https://shadcn.io/r/status.json
```

---

## Commands

```bash
# Development
npm run dev               # Next.js dev server — http://localhost:3000
npm run dev:api           # Express API server — http://localhost:3001
npm run dev:all           # Both in parallel (uses concurrently)

# Building
npm run build             # Next.js production build
npm run build:api         # Build api-server TypeScript

# Type checking
npm run typecheck         # tsc --noEmit on both packages
npm run typecheck:watch   # Watch mode

# Linting
npm run lint              # ESLint
npm run lint:fix          # ESLint with --fix

# Testing
npm run test              # Vitest unit tests
npm run test:e2e          # Playwright e2e tests
npm run test:watch        # Vitest watch mode

# Database
npm run firestore:rules   # Deploy Firestore rules
npm run firestore:export  # Export local emulator data
npm run emulator          # Start Firebase emulator suite
```

---

## Important Rules

### Performance Requirements

**Skill run feedback must be immediate.** Users cannot stare at a blank screen.
The moment a skill run starts, show a streaming skeleton of the output structure
with a progress indicator. Use `useSkillRun` hook which polls `/runs/:runId/status`.

```ts
// ✅ Correct — show structure immediately, fill content as it arrives
const { status, partialResults, isComplete } = useSkillRun(runId)

// ❌ Wrong — wait for full result before rendering anything
const { data } = useSWR(`/api/runs/${runId}`)
```

Concrete targets:
- First meaningful paint: < 1 second (static shell renders instantly from server)
- Skill run status update: < 2 seconds (polling interval)
- Image generation preview: < 8 seconds (Nano Banana 2 p95)
- Social post publish: < 5 seconds (Ayrshare API)
- Page navigation between clients: < 500ms (client data prefetched in layout)

**No blocking data fetches in page components.** Use `Suspense` + async server
components. Each data section should independently stream in:
```tsx
// ✅ Correct — each section streams independently
<Suspense fallback={<MetricsSkeleton />}>
  <MetricsSection clientId={clientId} />
</Suspense>
<Suspense fallback={<CalendarSkeleton />}>
  <CalendarSection clientId={clientId} />
</Suspense>
```

**Images must use `next/image`** with explicit `width` and `height`. No `<img>` tags.
DAM assets use `fill` mode inside a positioned container.

### Accessibility Requirements

**Every interactive element must be keyboard navigable.** The approval workflow
is the most critical — agency clients must be able to approve posts without a mouse.

- All custom interactive components need `role`, `aria-label`, and keyboard handlers
- Skill cards: `role="button"`, `tabIndex={0}`, `onKeyDown` handles Enter/Space
- Approval cards: full keyboard nav — Tab to select, Enter to approve, Escape to cancel
- Color alone must never convey status — always pair with an icon or text label
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text and UI elements

**Use shadcn/ui's built-in accessibility** — it wraps Radix UI primitives which handle
ARIA, keyboard nav, and focus management correctly. Don't re-implement what Radix
already provides.

**Focus management on modals and drawers:**
```tsx
// shadcn Dialog handles this — just use it correctly
<DialogTrigger asChild>
  <Button>Open</Button>  // Focus returns here on close — automatic
</DialogTrigger>
```

**Form validation must be accessible:**
- Error messages tied to inputs via `aria-describedby`
- Use `react-hook-form` + `zod` — never hand-roll form validation
- Error state shown inline below input, not in a toast

### Testing Strategy

**Unit tests (Vitest)** — all utility functions, Firestore helpers, type guards,
and analytics event builders. Target: 100% coverage on `/lib/`.

```ts
// Example: test the analytics wrapper, not GA4 itself
describe('track()', () => {
  it('sends skill_run_started event with correct shape', () => {
    const spy = vi.spyOn(window, 'gtag')
    track('skill_run_started', { skill: '/audit', clientId: 'abc' })
    expect(spy).toHaveBeenCalledWith('event', 'skill_run_started', {
      skill: '/audit',
      clientId: 'abc',
    })
  })
})
```

**Integration tests (Vitest + Firebase emulator)** — all Firestore read/write
operations. Use `@firebase/rules-unit-testing` to verify security rules.
Run against emulator: `npm run emulator` before `npm run test`.

**E2E tests (Playwright)** — critical user journeys only:
1. Agency creates a client and runs `/audit`
2. Approval flow — send, receive, approve, verify post scheduled
3. Client portal loads and displays correct data for token
4. Stripe checkout completes and seat is provisioned
5. DAM upload → asset appears in image generation picker

**Do not test:**
- Third-party API responses (mock at the boundary)
- shadcn/ui internal behaviour
- Firebase SDK internals

**Mocking strategy:**
```ts
// Mock at the api-server integration boundary, never inside business logic
vi.mock('@/lib/firebase/firestore', () => ({
  getClient: vi.fn().mockResolvedValue(mockClient),
}))
```

---

## Security Rules — Never Break These

1. **Firestore rules enforce `request.auth.uid == resource.data.ownerId`** on
   all client reads. Never bypass this by using Admin SDK in a client-accessible
   route.

2. **API keys are environment variables only.** Never in Firestore, never in
   client-side code, never in logs. Check for accidental exposure before every commit.

3. **Approval and portal tokens are signed JWTs** with 48-hour expiry.
   Never return raw Firestore document IDs as portal access tokens.

4. **Storage rules restrict DAM access** to authenticated agency owners only.
   Client portal previews use signed URLs — Storage is never publicly readable.

5. **Stripe webhook signature verified** in `/app/api/webhooks/stripe/route.ts`
   before any billing state is updated. Never process an unverified webhook.

---

## Common Patterns

### Running a skill from the frontend

```ts
// 1. POST to api-server via Next.js server action
'use server'
export async function runSkill(clientId: string, skills: string[], source: Source) {
  const { runId } = await apiServer.post('/skills/run', { clientId, skills, source })
  return runId
}

// 2. Track progress in the component
const runId = await runSkill(clientId, ['/audit'], { type: 'url', content: url })
// → redirect to /editor/[runId] which uses useSkillRun(runId)
```

### Uploading a DAM asset

```ts
// 1. User drops file into shadcn.io Dropzone
// 2. Client uploads directly to Firebase Storage (avoids routing through Next.js)
// 3. After upload, call api-server to trigger auto-tagging
const storageRef = ref(storage, `dam/${clientId}/${assetId}`)
await uploadBytes(storageRef, file)
await apiServer.post('/dam/tag', { clientId, assetId })
// 4. Firestore listener updates UI when tagging completes
```

### Adding a new skill

1. Create `/api-server/src/skills/[slug]/SKILL.md` — the system prompt
2. Add slug to `SKILL_REGISTRY` in `/api-server/src/skills/registry.ts`
3. Set provider in `SKILL_PROVIDERS` — `claude` or `gemini`
4. Add display config (label, description, icon, clientType) to `/types/skill.ts`
5. The skill appears automatically in the selector UI — no other changes needed

### Adding a Firestore collection

1. Add the type to `/types/` with full TypeScript interface
2. Add typed CRUD helpers to `/lib/firebase/firestore.ts`
3. Add security rules to `firestore.rules`
4. Add to the emulator seed data in `/scripts/seed-emulator.ts`
5. Never use raw `doc()`, `collection()`, `getDocs()` outside of `/lib/firebase/`

---

## What Claude Should Not Do

- **Do not call LLMs from Next.js.** All AI calls go through the api-server.
- **Do not write raw Firestore calls in components or pages.** Use the typed helpers.
- **Do not use `export default`.** Named exports only — see conventions above.
- **Do not add `'use client'` to a component just because it's easier.** Justify it.
- **Do not expose Firebase Admin credentials to the client.** Admin SDK is server-only.
- **Do not write CSS modules or inline styles.** Tailwind only.
- **Do not create a new UI component if shadcn/ui, shadcn.io, or 21st.dev has one.**
  Check all three before building custom.
- **Do not skip error boundaries.** Every async server component that fetches data
  must have an adjacent `error.tsx`.
- **Do not hard-code client IDs, plan names, or feature flags.** Use constants from
  `/lib/constants.ts`.
- **Do not modify `firestore.rules` without running the full rules test suite.**
  A broken rule can expose all client data.
