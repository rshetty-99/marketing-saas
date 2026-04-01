# F0 Implementation Plan — Auth, Onboarding & Role Assignment

## Context

F0 is the foundation feature for Aura.ai. Nothing else (F1–F16) can be built without it. It establishes authentication, the onboarding wizard, role assignment, trial initiation, and the platform admin panel. The CLAUDE.md pipeline requires 7 stages per feature — but the agent definition files (`.claude/agents/*.md`) don't exist yet. F0 bootstraps both the feature AND the pipeline.

## Approach

**We execute the 7 stages sequentially, creating the agent template files along the way so F1–F16 can reuse them.**

Since this is the first feature through the pipeline, Stage 1 (PLAN) is this document. For Stages 2–5, I'll act as the agent directly. Stages 6–7 are human gates per CLAUDE.md.

## Pre-Implementation: Install Missing shadcn/ui Components

Before building, install components we'll need:
```bash
npx shadcn@latest add input label card select dialog badge progress separator tooltip sheet form
```

Also install `svix` for Clerk webhook verification:
```bash
npm install svix
```

## Stage 1 — PLAN (this document)

Output: `docs/plans/F0-plan.md` (copy of this plan)

## Stage 2 — TEST WRITE

Create test fixtures + 12 E2E spec files:

| File | Tests |
|------|-------|
| `tests/fixtures/auth.ts` | Shared Playwright auth fixtures (mock signed-in, signed-out, admin, portal) |
| `tests/helpers/firestore.ts` | Test data seed/cleanup via Firebase Admin |
| `tests/e2e/F0/onboarding-freelancer.spec.ts` | Full freelancer wizard flow |
| `tests/e2e/F0/onboarding-organization.spec.ts` | Org flow with team invites |
| `tests/e2e/F0/onboarding-agency.spec.ts` | Agency flow with client creation |
| `tests/e2e/F0/onboarding-skip.spec.ts` | Skipping optional steps |
| `tests/e2e/F0/invited-member.spec.ts` | Accept invite + welcome screen |
| `tests/e2e/F0/role-enforcement.spec.ts` | Route protection per role |
| `tests/e2e/F0/profile-score.spec.ts` | Score widget + checklist |
| `tests/e2e/F0/trial-soft-lock.spec.ts` | Trial expiry + soft lock |
| `tests/e2e/F0/admin-access.spec.ts` | Platform user admin access |
| `tests/e2e/F0/admin-blocked.spec.ts` | Non-platform user blocked |
| `tests/e2e/F0/client-portal.spec.ts` | Portal user restrictions |
| `tests/e2e/F0/auth-guard.spec.ts` | Unauthenticated redirects |

## Stage 3 — FRONTEND DESIGN + Stage 4 — BACKEND DESIGN

These run together because they share foundation files. Build order:

### Phase A: Foundation Types & Validation (5 files)

| # | File | Source |
|---|------|--------|
| 1 | `src/types/roles.ts` | RBAC spec §21 — all role/account/tier/status enums + hierarchy maps |
| 2 | `src/types/features/f0.ts` | RBAC spec §15.3 — Workspace, WorkspaceMember, PlatformUser, OnboardingState, ProfileScore interfaces |
| 3 | `src/lib/validations/onboarding.ts` | F0 contract §4.3 — 5 Zod v4 schemas |
| 4 | `src/lib/firebase/converters/workspace.ts` | Typed Firestore converters for Workspace, WorkspaceMember, PlatformUser |
| 5 | `src/lib/auth/errors.ts` | AuthError, SoftLockError, SuspendedError, NotFoundError classes |

### Phase B: Middleware & Auth Utilities (4 files)

| # | File | Description |
|---|------|-------------|
| 6 | `src/middleware.ts` | Clerk middleware with route matchers (replaces `src/proxy.ts`) |
| 7 | `src/lib/auth/require-role.ts` | `requireMinRole(workspaceId, minRole)` |
| 8 | `src/lib/auth/require-platform-role.ts` | `requireMinPlatformRole(minRole)` |
| 9 | `src/lib/auth/check-workspace-status.ts` | `requireActiveWorkspace(workspaceId)` |

### Phase C: Firestore Rules (1 file)

| # | File | Description |
|---|------|-------------|
| 10 | `firestore.rules` | Complete v2.0 rewrite — subcollection model, role hierarchy functions, platform collections. Replaces current flat v1 skeleton. |

### Phase D: Services (8 files)

| # | File | Key Functions |
|---|------|--------------|
| 11 | `src/lib/f0/role-check.ts` | `getCurrentWorkspaceMember()`, `hasMinRole()`, `getAssignableRoles()` |
| 12 | `src/lib/f0/workspace-creation.ts` | `createWorkspace()` — Clerk org + Firestore doc + trial init |
| 13 | `src/lib/f0/onboarding.ts` | `getOnboardingState()`, `updateOnboardingStep()`, `completeOnboarding()` |
| 14 | `src/lib/f0/team-invitation.ts` | `inviteTeamMembers()` — batch Clerk + Firestore |
| 15 | `src/lib/f0/client-creation.ts` | `createClientWorkspace()` — child org + sub-workspace |
| 16 | `src/lib/f0/profile-score.ts` | `calculateProfileScore()` — points per action, 5-min cache |
| 17 | `src/lib/f0/trial.ts` | `initiateTrial()`, `checkTrialStatus()`, `softLockWorkspace()` |
| 18 | `src/lib/f0/platform-seed.ts` | CLI: `npx tsx scripts/seed-platform-admin.ts <userId> <email>` |

### Phase E: API Routes (9 files)

| # | Route | Method | Auth |
|---|-------|--------|------|
| 19 | `src/app/api/webhooks/clerk/route.ts` | POST | Svix signature |
| 20 | `src/app/api/onboarding/account-type/route.ts` | POST | Auth (no workspace) |
| 21 | `src/app/api/onboarding/workspace/route.ts` | POST | Auth + owner |
| 22 | `src/app/api/onboarding/brand/route.ts` | POST | Auth + owner |
| 23 | `src/app/api/onboarding/team/invite/route.ts` | POST | Auth + owner |
| 24 | `src/app/api/onboarding/client/route.ts` | POST | Auth + agency owner |
| 25 | `src/app/api/onboarding/complete/route.ts` | PATCH | Auth + owner |
| 26 | `src/app/api/workspaces/current/route.ts` | GET | Auth + member |
| 27 | `src/app/api/profile-score/route.ts` | GET | Auth + member |

### Phase F: Onboarding Components (13 files)

| # | Component | Purpose |
|---|-----------|---------|
| 28 | `src/components/features/F0/RolePicker.tsx` | Reusable role dropdown with descriptions |
| 29 | `src/components/features/F0/TrialBadge.tsx` | Sidebar countdown badge |
| 30 | `src/components/features/F0/SoftLockBanner.tsx` | "Trial ended — upgrade" banner |
| 31 | `src/components/features/F0/OnboardingLayout.tsx` | Wizard shell + step progress |
| 32 | `src/components/features/F0/AccountTypeSelector.tsx` | 3-card type picker |
| 33 | `src/components/features/F0/WorkspaceForm.tsx` | Name + industry form |
| 34 | `src/components/features/F0/QuickBrandForm.tsx` | Brand name, color, voice |
| 35 | `src/components/features/F0/TeamInviteForm.tsx` | Email + role, bulk paste |
| 36 | `src/components/features/F0/ClientCreateForm.tsx` | Client name + team assign |
| 37 | `src/components/features/F0/OnboardingComplete.tsx` | Success + confetti + redirect |
| 38 | `src/components/features/F0/InvitedMemberWelcome.tsx` | "Invited as [Role]" screen |
| 39 | `src/components/features/F0/ProfileScoreWidget.tsx` | Dashboard progress ring card |
| 40 | `src/components/features/F0/ProfileScoreChecklist.tsx` | Expandable checklist drawer |

### Phase G: Admin Components (5 files)

| # | Component | Purpose |
|---|-----------|---------|
| 41 | `src/components/features/F0/admin/AdminLayout.tsx` | Admin panel shell + nav |
| 42 | `src/components/features/F0/admin/PlatformLoginGate.tsx` | Server component: redirect non-platform users |
| 43 | `src/components/features/F0/admin/PlatformDashboard.tsx` | Metrics overview cards |
| 44 | `src/components/features/F0/admin/PlatformTeamTable.tsx` | Platform user table |
| 45 | `src/components/features/F0/admin/CreatePlatformUserForm.tsx` | Create platform user form |

### Phase H: Pages/Routes (16 files)

**Auth pages** (use existing `(auth)` route group):
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` — Clerk `<SignIn />` with Aura appearance
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` — Clerk `<SignUp />` with Aura appearance

**Onboarding pages** (new route group):
- `src/app/onboarding/layout.tsx` — Wizard wrapper, auth check, redirect if complete
- `src/app/onboarding/page.tsx` — Redirect to correct step
- `src/app/onboarding/account-type/page.tsx`
- `src/app/onboarding/workspace/page.tsx`
- `src/app/onboarding/brand/page.tsx`
- `src/app/onboarding/team/page.tsx` — Org/Agency only
- `src/app/onboarding/client/page.tsx` — Agency only
- `src/app/onboarding/complete/page.tsx`

**Dashboard** (use existing `(dashboard)` route group):
- `src/app/(dashboard)/page.tsx` — Main dashboard with profile score + trial badge

**Admin panel** (new route group):
- `src/app/admin/layout.tsx` — PlatformLoginGate + AdminLayout
- `src/app/admin/page.tsx` — PlatformDashboard
- `src/app/admin/team/page.tsx` — Team management

**Client portal** (new route group):
- `src/app/portal/layout.tsx` — Auth + client_portal role check
- `src/app/portal/page.tsx` — Portal dashboard placeholder

### Phase I: Store + Seed (2 files)

- `src/stores/onboarding.ts` — Zustand store for wizard form state persistence
- `scripts/seed-platform-admin.ts` — CLI seed script

### Phase K: Agent Templates (6 files)

- `.claude/agents/planner.md`
- `.claude/agents/test-writer.md`
- `.claude/agents/frontend-designer.md`
- `.claude/agents/backend-designer.md`
- `.claude/agents/test-validator.md`
- `.claude/agents/code-reviewer.md`

## Stage 5 — TEST VALIDATE

Output: `docs/test-reports/F0-validation.md`
- Verify all `data-testid` selectors in specs match components
- Verify API route URLs in specs match actual routes
- Verify Zod schemas match test input shapes

## Stage 6 — CODE REVIEW (HUMAN GATE)

Output: `docs/reviews/F0-review.md`
- Present review to user. Await approval before Stage 7.

## Stage 7 — GIT COMMIT (HUMAN GATE)

Branch: `feature/F0-auth-onboarding`
- Present commit message + file list. Await approval before pushing.

## Key Design Decisions

1. **Middleware handles auth ONLY** — role checks happen in server components/API routes, not middleware (keeps it <100ms)
2. **Clerk `<SignIn />`/`<SignUp />`** with appearance customization — no custom auth forms
3. **URL-based onboarding steps** — each step is a route, server-side redirect logic
4. **`src/proxy.ts` deleted** — replaced by `src/middleware.ts`
5. **Firestore rules: full v2.0 rewrite** — subcollection model, no migration needed (no existing data)
6. **Dashboard page at `src/app/(dashboard)/page.tsx`** — uses existing route group
7. **Agent files created as reusable templates** — so F1-F16 can run the pipeline automatically

## Verification

After implementation:
1. `npx next build` — must pass with zero errors
2. `npx playwright test tests/e2e/F0/` — all specs should be runnable (some may need Clerk test tokens)
3. Navigate to `/sign-up` → complete onboarding → land on dashboard with profile score widget
4. Navigate to `/admin` as non-platform user → should redirect
5. Check Firestore for workspace + member docs after onboarding

## Total Files: ~86

~18 foundation + services, ~9 API routes, ~18 components, ~16 pages, ~14 tests, ~6 agent templates, ~5 docs/scripts
