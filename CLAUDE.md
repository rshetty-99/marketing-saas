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
Phase 0: F0 ✅ COMPLETE (auth, onboarding, RBAC, dashboard, entity data model)
Phase 1: F7 + F8 ✅ COMPLETE (workspace management + brand voice)
Phase 1 parallel: F1, F2, F3, F4, F6 ← CURRENT (content features, run simultaneously)
Phase 2 parallel: F9, F5 (after F3 exists)
Phase 3 parallel: F10, F11, F13 (after Phase 2)
Phase 4 parallel: F12, F14, F15 (after Phase 3)

## Execution Permissions
- Agent has pre-approval to execute: build, test, seed, cleanup, git operations
- Use /grill-me before each feature to resolve design decisions upfront
- Commit after each feature is complete + tests pass
- Push to origin/develop after commit

## Locked Architecture Decisions (from F0 grill session)
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

## Key Specifications
- RBAC: docs/rbac-specification.md (v2.0) — authoritative source for all roles & permissions
- Feature contracts: .claude/feature-contracts/F0-auth-onboarding.md (and future F1-F16)
- Platform: Aura.ai — admin panel at /admin (path-based, subdomain later)
- Billing: Stripe — base tier + per-seat pricing
- Trial: 15-day, full features with usage caps, soft-lock on expiry
