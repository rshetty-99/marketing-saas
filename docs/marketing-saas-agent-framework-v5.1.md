# Marketing SaaS — Claude Code Subagent Framework
**Stack:** Next.js 16 (App Router) · Firebase App Hosting · Firestore · Firebase Cloud Storage · Firebase Cloud Functions + Cloud Tasks · BigQuery · Clerk Auth · TailwindCSS · shadcn/ui · Framer Motion  
**Orchestration:** Claude Code Subagents (native)  
**CI/CD:** GitHub Actions → Firebase App Hosting  
**Testing:** Playwright (E2E)  
**Human Gates:** Code Review · Git Commit  

> **Architecture locked (v5.1):** Next.js 16 on Firebase App Hosting replaces the Express/Docker + Railway/Fly.io approach. Clerk replaces Firebase Auth for multi-tenant agency workspaces. Firebase Cloud Functions + Cloud Tasks handle all background jobs. BigQuery receives analytics snapshots via Cloud Functions. Image generation uses Nano Banana 2 via Vertex AI throughout.

---

## 1. Feature Modules (Launch Scope)

| # | Feature | Firestore Root Collection | Integration Points |
|---|---------|--------------------------|-------------------|
| F1 | **AI Content Generation** | `content_drafts` | Claude API, Firebase Storage |
| F2 | **Content Repurposing** | `repurposed_content` | Claude API, F1 drafts |
| F3 | **Multi-Platform Publishing** | `publish_jobs` | OAuth (LinkedIn, X, Instagram, FB, WP) |
| F4 | **Content Calendar & Scheduling** | `calendar_events` | F3, background Cloud Functions |
| F5 | **Analytics & Insights** | `analytics_snapshots` | Platform APIs, BigQuery |
| F6 | **Approval Workflows** | `approvals` | F3, F6 Notifications |
| F7 | **Team Workspaces** | `workspaces` | Clerk multi-tenant, all features |
| F8 | **Brand Voice & Templates** | `brand_profiles` | F1, F2 context injection |

---

## 2. Repository Structure

```
marketing-saas/
├── CLAUDE.md                        # ← Master orchestration contract
├── .claude/
│   ├── agents/
│   │   ├── planner.md               # Planning agent prompt
│   │   ├── test-writer.md           # Test script agent prompt
│   │   ├── frontend-designer.md     # UI/UX agent prompt
│   │   ├── backend-designer.md      # API/Firestore agent prompt
│   │   ├── test-validator.md        # Test validation agent prompt
│   │   └── code-reviewer.md        # Review agent prompt
│   └── feature-contracts/
│       ├── F1-content-generation.md
│       ├── F2-repurposing.md
│       ├── F3-publishing.md
│       ├── F4-calendar.md
│       ├── F5-analytics.md
│       ├── F6-approvals.md
│       ├── F7-workspaces.md
│       └── F8-brand-voice.md
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── content/             # F1, F2
│   │   │   ├── calendar/            # F4
│   │   │   ├── publish/             # F3
│   │   │   ├── analytics/           # F5
│   │   │   ├── approvals/           # F6
│   │   │   ├── workspace/           # F7
│   │   │   └── brand/               # F8
│   │   └── api/
│   │       ├── content/
│   │       ├── publish/
│   │       ├── analytics/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui base
│   │   ├── features/                # Feature-scoped components
│   │   └── shared/
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts
│   │   │   ├── admin.ts
│   │   │   └── converters/          # Typed Firestore converters per collection
│   │   ├── agents/                  # Claude API agent wrappers
│   │   ├── integrations/            # OAuth platform connectors
│   │   └── utils/
│   ├── hooks/
│   ├── stores/                      # Zustand stores per feature
│   └── types/
│       └── features/                # Per-feature TypeScript types
│
├── tests/
│   ├── e2e/                         # Playwright tests
│   │   ├── F1-content-generation/
│   │   ├── F2-repurposing/
│   │   ├── F3-publishing/
│   │   ├── F4-calendar/
│   │   ├── F5-analytics/
│   │   ├── F6-approvals/
│   │   ├── F7-workspaces/
│   │   └── F8-brand-voice/
│   ├── fixtures/
│   └── helpers/
│
├── .github/
│   └── workflows/
│       ├── feature-ci.yml           # Per-feature branch CI
│       └── deploy-preview.yml       # Firebase preview channels
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── playwright.config.ts
```

---

## 3. CLAUDE.md — Master Orchestration Contract

```markdown
# CLAUDE.md — Marketing SaaS Orchestration Contract

## Project Identity
Marketing SaaS platform. Stack: Next.js 16 (App Router), Firebase App Hosting,
Firestore, Firebase Cloud Storage, Firebase Cloud Functions + Cloud Tasks, BigQuery,
Clerk Auth (multi-tenant), TailwindCSS, shadcn/ui, Framer Motion.

## Image Generation
All image generation uses Nano Banana 2 via Vertex AI ($0.067–$0.151/image).
Do NOT use DALL-E, Stability AI, or any other image provider. Nano Banana 2 receives
real brand assets from the DAM via base64 injection. Env var: `VERTEX_AI_PROJECT_ID`,
`VERTEX_AI_LOCATION`, `VERTEX_AI_MODEL` (set to Nano Banana 2 model ID).

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
Input: Test scripts from Stage 2 + code from Stage 3 & 4
Output: Validation report `docs/test-reports/<FN>-validation.md`
Gate: None — auto-proceed

### Stage 6 — CODE REVIEW (HUMAN GATE)
Subagent: `.claude/agents/code-reviewer.md`
Output: Review report `docs/reviews/<FN>-review.md`
⚠️  STOP — Present review to human. Await explicit approval before Stage 7.

### Stage 7 — GIT COMMIT (HUMAN GATE)
⚠️  STOP — Do not commit. Present proposed commit message + file list.
Await explicit "commit approved" from human before running:
  git add -A
  git commit -m "<message>"
  git push origin feature/<FN>

## Naming Conventions
- Feature branches: `feature/F1-content-generation` etc.
- Commit prefix: `feat(F1):`, `fix(F1):`, `test(F1):`, `chore:`
- Firestore collections: snake_case
- TypeScript types: PascalCase, file: `types/features/<fn>.ts`
- API routes: `/api/<resource>/route.ts`

## Firestore Schema Rules
- Every document MUST have: `createdAt`, `updatedAt`, `workspaceId`, `createdBy`
- Use server timestamps: `serverTimestamp()`
- All queries MUST use typed converters from `lib/firebase/converters/`
- Security rules: workspace-scoped — users can only read/write their own workspace

## Testing Rules
- Every feature needs: happy path, error state, loading state, empty state tests
- Auth state must be mocked via Playwright fixture — never use real credentials
- Each test file is self-contained — no shared state between spec files

## Code Style
- All components: functional, typed props interface, no default exports from pages
- Use shadcn/ui primitives before building custom
- Framer Motion: layout animations only — no gratuitous motion
- No `any` types — strict TypeScript
- Tailwind only — no inline styles, no CSS modules
```

---

## 4. Subagent Prompt Contracts

### 4.1 Planner Agent
```markdown
# Planner Agent

You are a senior product engineer. Your job is to produce a granular
implementation plan for a single feature.

INPUT: Feature contract (from `.claude/feature-contracts/<FN>.md`)

OUTPUT FORMAT (save to `docs/plans/<FN>-plan.md`):
1. Feature Summary (2 sentences)
2. Acceptance Criteria (numbered list — testable, specific)
3. Firestore Schema (collection name, fields, types, indexes needed)
4. API Routes (method, path, request shape, response shape)
5. Component Tree (page → layout → sections → atoms)
6. State Management (Zustand store shape)
7. External Dependencies (OAuth scopes, env vars needed)
8. Risk Flags (any ambiguity or known complexity)
9. Estimated task breakdown (with file paths)

Be specific. Include TypeScript interfaces in schema section.
Do not write implementation code — planning artifacts only.
```

### 4.2 Test Writer Agent
```markdown
# Test Writer Agent

You are a QA engineer specializing in Playwright E2E tests.

INPUT: Implementation plan from `docs/plans/<FN>-plan.md`

OUTPUT: Playwright spec files in `tests/e2e/<FN>/`

RULES:
- Write tests BEFORE implementation exists (TDD)
- One spec file per acceptance criterion
- Required test scenarios per feature:
    * happy-path.spec.ts — full success flow
    * error-states.spec.ts — API failures, validation errors
    * loading-states.spec.ts — skeleton, spinner behavior
    * empty-states.spec.ts — zero-data first-run experience
    * auth-guard.spec.ts — unauthenticated redirect behavior
- Use Page Object Model — create `tests/helpers/<FN>Page.ts`
- Mock all external API calls (no real network in tests)
- Mock Firestore via `tests/fixtures/<FN>-fixtures.ts`
- Include accessibility assertions (ARIA roles, keyboard nav)
- All tests must pass `--headed` and `--headless`
```

### 4.3 Frontend Designer Agent
```markdown
# Frontend Designer Agent

You are a senior Next.js UI engineer with design sensibility.

INPUT: Plan from `docs/plans/<FN>-plan.md`

OUTPUT: Components in `src/components/features/<FN>/`

RULES:
- Use shadcn/ui as the base component library
- TailwindCSS only — no inline styles
- Framer Motion for: page transitions, list item reveals, modal enter/exit
- Every component needs: loading state, error state, empty state
- Responsive: mobile-first, breakpoints sm/md/lg/xl
- Types: define Props interface in same file
- No API calls in components — receive data via props or hooks
- Export a barrel file: `src/components/features/<FN>/index.ts`
- Follow existing design tokens in `tailwind.config.ts`
- Dark mode support via Tailwind `dark:` variants
```

### 4.4 Backend Designer Agent
```markdown
# Backend Designer Agent

You are a senior Firebase/Next.js backend engineer.

INPUT: Plan from `docs/plans/<FN>-plan.md`

OUTPUT:
- API routes in `src/app/api/<resource>/route.ts`
- Service modules in `src/lib/<FN>/`
- Firestore typed converter in `src/lib/firebase/converters/<FN>.ts`
- Firestore rules delta (append to firestore.rules)
- Index additions (append to firestore.indexes.json)

RULES:
- All Firestore writes go through service modules — never directly from API routes
- Validate all inputs with Zod before touching Firestore
- Every API route: authenticate with Clerk, verify workspace membership
- Use Firebase Admin SDK for server-side operations
- Return typed responses — define ResponseType in `src/types/features/<FN>.ts`
- Error handling: always return { success, data?, error? } shape
- Rate limiting: add to all content-generation endpoints
- Never expose internal Firestore document IDs in API responses without mapping
```

### 4.5 Test Validator Agent
```markdown
# Test Validator Agent

You are a QA lead doing pre-commit validation.

INPUT:
- Test scripts from `tests/e2e/<FN>/`
- Implementation code from Stages 3 & 4

TASKS:
1. Cross-check: every acceptance criterion has ≥1 test
2. Selector audit: no brittle `[class=]` selectors — must use data-testid or ARIA
3. Coverage check: all API routes have at least one test covering them
4. Mock completeness: all external calls are mocked
5. Type safety: test fixtures match TypeScript types
6. Dead test detection: flag any test that can never fail

OUTPUT: `docs/test-reports/<FN>-validation.md`
Format: PASS/FAIL verdict per criterion + specific fixes required for any FAIL.
Do NOT auto-fix — report only. Human + code reviewer will act on findings.
```

### 4.6 Code Reviewer Agent
```markdown
# Code Reviewer Agent

You are a principal engineer doing a pre-merge code review.

INPUT: All staged files for feature <FN>

REVIEW CHECKLIST:
Security:
  □ No secrets/API keys in code
  □ All Firestore operations are workspace-scoped
  □ Input validation present on all API routes
  □ Auth check on every protected route

Performance:
  □ No N+1 Firestore queries
  □ Firestore indexes exist for all compound queries
  □ Images use next/image
  □ No blocking operations in render path

Code Quality:
  □ No `any` TypeScript
  □ No unused imports/variables
  □ No console.log left in code
  □ All async operations have error handling
  □ No hardcoded strings (use constants)

Testing:
  □ Test validator report shows all PASS
  □ No skipped tests without documented reason

Architecture:
  □ No business logic in components
  □ No direct Firestore access outside service modules
  □ Feature code is self-contained — no cross-feature imports at component level

OUTPUT: `docs/reviews/<FN>-review.md`
Format: APPROVED / CHANGES REQUIRED + specific line-level findings.
⚠️  This output is shown to human for final approval gate.
```

---

## 5. Feature Contract Template

```markdown
# Feature Contract: <FN> — <Feature Name>

## Purpose
One paragraph describing what this feature does and why it matters to the user.

## User Stories
- As a [role], I want to [action] so that [outcome]
- ...

## Acceptance Criteria
- [ ] AC1: ...
- [ ] AC2: ...

## Data Model
Primary collection: `<collection_name>`
Key fields: ...

## UI Entry Points
- Route: `/dashboard/<path>`
- Navigation: sidebar > [section]

## External Dependencies
- APIs: ...
- OAuth scopes: ...
- Env vars: ...

## Out of Scope (for this sprint)
- ...

## Design Reference
Figma link or description of target UI pattern.
```

---

## 6. GitHub Actions Workflow

```yaml
# .github/workflows/feature-ci.yml
name: Feature CI

on:
  push:
    branches: ['feature/**']
  pull_request:
    branches: ['main', 'develop']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npm run lint
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_TEST_PUB_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET_KEY }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_TEST_PROJECT_ID }}
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  preview:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Deploy Firebase Preview
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

---

## 7. Skill Map — What Claude Code Needs to Know

### 7.1 Core Claude Code Skills (always loaded)
| Skill Area | What the agent needs |
|-----------|---------------------|
| **Next.js App Router** | Server components, route handlers, middleware, layouts |
| **Firebase Admin SDK** | Firestore CRUD, batch writes, transactions, security rules |
| **Clerk Auth** | `auth()`, `currentUser()`, middleware config, multi-tenant orgs |
| **Zod Validation** | Schema definition, `safeParse`, error mapping |
| **Playwright** | Page Object Model, fixtures, network mocking, `waitFor` patterns |
| **Tailwind + shadcn** | Token system, component overrides, `cn()` utility |
| **Framer Motion** | `AnimatePresence`, `layoutId`, `variants`, `useAnimation` |

### 7.2 Feature-Specific Skills
| Feature | Specialist Knowledge |
|---------|---------------------|
| F1 Content Gen | Claude API streaming, prompt templates, token budgeting |
| F3 Publishing | OAuth2 PKCE flow, platform API rate limits, webhook validation |
| F4 Calendar | UTC normalization, timezone-aware scheduling, cron via Cloud Functions |
| F5 Analytics | Firestore aggregation queries, BigQuery streaming inserts |
| F7 Workspaces | Clerk Organizations API, role-based Firestore rules |

---

## 8. Git Branching Model

```
main                    ← production (protected)
 └── develop            ← integration (protected)
      └── feature/F1-content-generation
      └── feature/F2-repurposing
      └── feature/F3-publishing
      ...
```

**Per-feature flow:**
1. Agent creates branch `feature/FN-<name>` off `develop`
2. Agent runs full pipeline Stages 1–5 automatically
3. **HUMAN GATE**: Code review approval
4. **HUMAN GATE**: Commit approved → agent pushes to `feature/FN`
5. Human opens PR: `feature/FN` → `develop`
6. GitHub Actions runs CI + deploys Firebase Preview Channel
7. Human merges PR after preview sign-off

---

## 9. VS Code Setup for Claude Code

### `.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.md": "markdown"
  }
}
```

### Recommended Extensions
- Claude Code (Anthropic)
- ESLint
- Prettier
- Firebase Explorer
- GitLens
- Playwright Test for VSCode

### Claude Code Invocation Pattern
```
# To build a feature end-to-end:
"Run the full agent pipeline for F1-content-generation 
 using the contract at .claude/feature-contracts/F1-content-generation.md"

# To run a single stage:
"Run only the planner agent for F3-publishing"

# To re-run after human feedback:
"Address the code review findings in docs/reviews/F1-review.md 
 and re-run stages 3 and 4 only"
```

---

## 10. Firestore Security Rule Pattern

```javascript
// firestore.rules — workspace-scoped base pattern
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isWorkspaceMember(workspaceId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/workspace_members/$(request.auth.uid + '_' + workspaceId));
    }
    
    function hasRole(workspaceId, role) {
      return isWorkspaceMember(workspaceId) && 
        get(/databases/$(database)/documents/workspace_members/$(request.auth.uid + '_' + workspaceId)).data.role == role;
    }
    
    // All feature collections follow this pattern:
    match /content_drafts/{docId} {
      allow read: if isWorkspaceMember(resource.data.workspaceId);
      allow create: if isWorkspaceMember(request.resource.data.workspaceId);
      allow update, delete: if isWorkspaceMember(resource.data.workspaceId);
    }
    // Repeat per collection...
  }
}
```

---

## 11. Quick-Start Checklist

```
□ 1. Clone repo, run `npm install`
□ 2. Copy `.env.example` → `.env.local`, fill in Clerk + Firebase keys
□ 3. Run `firebase login` and `firebase use <project-id>`
□ 4. Open VS Code, install Claude Code extension
□ 5. Open CLAUDE.md — this is your source of truth
□ 6. To start a feature: tell Claude Code to run the pipeline
     for the feature contract you want to implement
□ 7. Review Stage 6 output before approving commit
□ 8. Open PR — GitHub Actions auto-deploys preview channel
□ 9. Sign off on preview → merge to develop
```
