# F0 — Auth, Onboarding & Role Assignment

> **Priority:** Phase 0 — must complete before ALL other features
> **Dependencies:** None (this is the foundation)
> **Depends on this:** F1–F16 (everything)
> **Branch:** `feature/F0-auth-onboarding`

---

## 1. Feature Summary

F0 implements the complete authentication, onboarding, and role assignment system for Aura.ai. It covers:

- Clerk-based authentication (sign-up, sign-in, OAuth)
- Account type selection (Freelancer / Organization / Agency)
- Workspace creation via Clerk Organizations
- Role assignment during onboarding (team invitations)
- Profile completeness score & checklist
- Invited member onboarding flow
- Client portal user onboarding (agency)
- 15-day free trial initiation
- Next.js middleware for route protection
- Platform user seeding (super_admin)
- Platform admin login at `/admin`

**RBAC specification:** `docs/rbac-specification.md` (v2.0) is the authoritative source for all role definitions, permission matrices, and data models referenced in this contract.

---

## 2. User Stories

### 2.1 New User — Freelancer

```
As a freelance marketer,
I want to sign up and quickly set up my workspace,
so I can start creating content within minutes.
```

**Acceptance Criteria:**
- AC1: Can sign up via email/password, Google, or GitHub through Clerk
- AC2: Sees account type selection screen immediately after sign-up
- AC3: Selects "Freelancer" → enters workspace name → workspace created
- AC4: Quick brand setup (name, color, voice) with "Skip for now" option
- AC5: Lands on dashboard with profile completeness widget at ~20%
- AC6: 15-day free trial starts automatically
- AC7: Trial countdown badge visible in sidebar
- AC8: No team invitation step shown for Freelancer

### 2.2 New User — Organization

```
As a marketing team lead,
I want to onboard my team with proper roles,
so we can collaborate on content with clear permissions.
```

**Acceptance Criteria:**
- AC1: Same sign-up flow as Freelancer (AC1-AC7)
- AC2: After brand setup, sees "Invite Your Team" step
- AC3: Can enter multiple email addresses with role picker (admin | manager | editor | viewer)
- AC4: Can bulk-paste comma-separated emails (all get same default role: editor)
- AC5: "Skip — I'll do this later" option available
- AC6: Invitations sent via Clerk Organizations
- AC7: Firestore member docs created with `status: 'invited'` and assigned role
- AC8: Lands on dashboard with profile completeness reflecting team invites

### 2.3 New User — Agency

```
As an agency owner,
I want to set up my agency workspace and create my first client,
so my team can start managing client content immediately.
```

**Acceptance Criteria:**
- AC1: Same flow as Organization (AC1-AC8 from 2.2)
- AC2: After team invite, sees "Create Your First Client" step
- AC3: Enter client name + contact email + optional industry
- AC4: Clerk child organization created for client
- AC5: Can assign team members (from Step 4) to this client
- AC6: "Skip — I'll do this later" option available
- AC7: Lands on dashboard with client switcher visible in sidebar

### 2.4 Invited Member

```
As someone invited to a workspace,
I want a smooth onboarding that shows me my role,
so I know what I can and cannot do.
```

**Acceptance Criteria:**
- AC1: Receives invitation email via Clerk
- AC2: Clicks link → sign-up/sign-in screen
- AC3: After auth, sees welcome screen: "You've been invited to [Workspace] as [Role]"
- AC4: Role description shown (what they can/cannot do)
- AC5: Lands in workspace dashboard with appropriate feature access
- AC6: Firestore member doc updated: `status: 'active'`, `joinedAt` set
- AC7: Workspace owner/admins notified of new member joining

### 2.5 Client Portal User

```
As an agency client,
I want to log in to see my reports and approved content,
without seeing any of the agency's internal workspace.
```

**Acceptance Criteria:**
- AC1: Agency provisions portal access via F14 (email invitation)
- AC2: Client receives invitation email
- AC3: Signs up via Clerk (scoped to client child org)
- AC4: Lands in read-only client portal: reports, approved content, analytics
- AC5: Cannot see agency workspace, other clients, or creation tools
- AC6: Cannot navigate to main app routes (redirected to portal)

### 2.6 Platform Admin (Super Admin)

```
As the platform founder,
I want my super_admin account seeded at deployment,
so I can access the admin panel and create other platform team members.
```

**Acceptance Criteria:**
- AC1: Database seed script creates `super_admin` platform user linked to a designated Clerk account
- AC2: Navigating to `/admin` shows platform login
- AC3: Only platform users can access `/admin` routes
- AC4: Super admin can create other platform users with any role via `/admin/team`
- AC5: Platform users cannot access customer workspace routes (redirected to `/admin`)
- AC6: Customer users cannot access `/admin` routes (404 or redirect)

---

## 3. Screens & Routes

### 3.1 Onboarding Routes

| Route | Screen | Gate |
|-------|--------|------|
| `/sign-up` | Clerk sign-up (email, Google, GitHub) | Public |
| `/sign-in` | Clerk sign-in | Public |
| `/onboarding` | Redirect — checks if onboarding complete | Auth required |
| `/onboarding/account-type` | Step 1: Select account type | Auth + no workspace |
| `/onboarding/workspace` | Step 2: Create workspace | Auth + no workspace |
| `/onboarding/brand` | Step 3: Quick brand setup | Auth + workspace exists |
| `/onboarding/team` | Step 4: Invite team (Org/Agency) | Auth + workspace exists |
| `/onboarding/client` | Step 5: Create first client (Agency) | Auth + agency workspace |
| `/onboarding/complete` | Step 6: Redirect to dashboard | Auth + workspace exists |

### 3.2 App Routes (Protected)

| Route | Gate |
|-------|------|
| `/dashboard` | Auth + workspace member + not soft-locked (for writes) |
| `/settings/members` | Auth + admin+ role |
| `/settings/notifications` | Auth + any workspace role |
| `/settings/billing` | Auth + owner role (view: admin+) |
| `/settings/export` | Auth + owner role |

### 3.3 Client Portal Routes

| Route | Gate |
|-------|------|
| `/portal` | Auth + client_portal role |
| `/portal/reports` | Auth + client_portal role |
| `/portal/content` | Auth + client_portal role |
| `/portal/analytics` | Auth + client_portal role |

### 3.4 Admin Panel Routes

| Route | Gate |
|-------|------|
| `/admin` | Auth + platform user |
| `/admin/*` | Auth + platform user (specific role per page) |

---

## 4. Data Models

All Firestore document schemas are defined in `docs/rbac-specification.md` Sections 15 and 21. Key collections for F0:

### 4.1 Core Collections

```typescript
// workspaces/{workspaceId} — Workspace document
// workspaces/{workspaceId}/members/{userId} — Member document
// workspaces/{workspaceId}/profile_score/current — Profile score
// platform_users/{userId} — Platform team members
// notifications/{userId}/items/{notificationId} — User notifications
// upgrade_requests/{requestId} — Account type upgrades
```

### 4.2 Onboarding State

```typescript
// Stored on workspace document
interface OnboardingState {
  onboardingCompleted: boolean;
  onboardingStep: number;             // 1-6, tracks progress
  onboardingCompletedAt?: Timestamp;
}
```

### 4.3 Zod Validation Schemas

```typescript
// src/lib/validations/onboarding.ts
import { z } from 'zod';

export const selectAccountTypeSchema = z.object({
  accountType: z.enum(['freelancer', 'organization', 'agency']),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().optional(),
});

export const quickBrandSchema = z.object({
  brandName: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  voiceTone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful']),
});

export const inviteTeamSchema = z.object({
  invitations: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'manager', 'editor', 'viewer']),
  })).min(1).max(50),
});

export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  industry: z.string().optional(),
  assignedTeamMemberIds: z.array(z.string()).optional(),
});
```

---

## 5. API Routes

| Method | Route | Min Role | Description |
|--------|-------|----------|-------------|
| POST | `/api/onboarding/account-type` | Auth (no workspace) | Set account type, create workspace skeleton |
| POST | `/api/onboarding/workspace` | Auth (workspace owner) | Finalize workspace + Clerk org creation |
| POST | `/api/onboarding/brand` | Auth (workspace owner) | Save quick brand profile |
| POST | `/api/onboarding/team/invite` | Auth (workspace owner) | Send batch invitations |
| POST | `/api/onboarding/client` | Auth (agency owner) | Create first client workspace |
| PATCH | `/api/onboarding/complete` | Auth (workspace owner) | Mark onboarding complete |
| GET | `/api/workspaces/current` | Auth (any member) | Get current workspace + role |
| GET | `/api/profile-score` | Auth (any member) | Get profile completeness score |
| POST | `/api/webhooks/clerk` | Clerk webhook secret | Handle Clerk events (user.created, org.membership.created, etc.) |

---

## 6. Components

### 6.1 Onboarding Components

```
src/components/features/F0/
├── OnboardingLayout.tsx           — Wizard shell with progress bar
├── AccountTypeSelector.tsx        — Three cards: Freelancer, Org, Agency
├── WorkspaceForm.tsx              — Workspace name + industry
├── QuickBrandForm.tsx             — Brand name, color picker, voice dropdown
├── TeamInviteForm.tsx             — Email + role picker, bulk paste
├── ClientCreateForm.tsx           — Client name + email + team assignment
├── OnboardingComplete.tsx         — Redirect + confetti
├── InvitedMemberWelcome.tsx       — "You've been invited as [Role]" screen
├── ProfileScoreWidget.tsx         — Dashboard card with progress ring
├── ProfileScoreChecklist.tsx      — Expandable checklist drawer
├── TrialBadge.tsx                 — Sidebar trial countdown badge
├── SoftLockBanner.tsx             — "Trial ended — upgrade" banner
└── RolePicker.tsx                 — Reusable role dropdown with descriptions
```

### 6.2 Admin Components

```
src/components/features/F0/admin/
├── AdminLayout.tsx                — Admin panel shell with sidebar nav
├── PlatformLoginGate.tsx          — Redirect non-platform users
├── PlatformDashboard.tsx          — Metrics overview
├── PlatformTeamTable.tsx          — Platform user management
├── CreatePlatformUserForm.tsx     — Email + platform role picker
└── ImpersonationBanner.tsx        — Read-only impersonation indicator
```

---

## 7. Services

```
src/lib/f0/
├── onboarding.ts                  — Onboarding step orchestration
├── workspace-creation.ts          — Create workspace + Clerk org
├── team-invitation.ts             — Batch invite via Clerk + Firestore
├── client-creation.ts             — Create agency client sub-workspace
├── profile-score.ts               — Calculate + cache profile score
├── trial.ts                       — Trial initiation, countdown, soft-lock check
├── role-check.ts                  — Role hierarchy utilities
└── platform-seed.ts               — Super admin seed script
```

---

## 8. Clerk Configuration

### 8.1 Middleware

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPortalRoute = createRouteMatcher(['/portal(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth.protect();

  // Route-specific logic handled in page-level server components
  // Middleware only ensures authentication
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 8.2 Webhooks

The following Clerk webhook events must be handled at `/api/webhooks/clerk`:

| Event | Action |
|-------|--------|
| `user.created` | Log to analytics |
| `user.deleted` | Soft-delete all member records for this user |
| `organization.created` | Sync to Firestore workspace if not already exists |
| `organizationMembership.created` | Update Firestore member `status: 'active'`, set `joinedAt` |
| `organizationMembership.deleted` | Soft-delete Firestore member record |
| `organizationInvitation.accepted` | Update Firestore member `status: 'active'` |
| `organizationInvitation.revoked` | Delete Firestore member doc (hard delete — was never active) |

---

## 9. Next.js Route Protection Pattern

### 9.1 Server Component Protection

```typescript
// Example: protected page
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const member = await getCurrentWorkspaceMember(userId);
  if (!member) redirect('/onboarding');
  if (member.workspace.status === 'soft_locked') {
    // Render read-only dashboard with upgrade banner
  }

  // Render dashboard with member.role-based feature access
}
```

### 9.2 Admin Route Protection

```typescript
// Example: admin page
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPlatformUser } from '@/lib/firebase/platform';

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const platformUser = await getPlatformUser(userId);
  if (!platformUser || platformUser.status !== 'active') redirect('/');

  // Render admin dashboard
}
```

---

## 10. Testing Requirements

### 10.1 E2E Tests (Playwright)

```
tests/e2e/F0/
├── onboarding-freelancer.spec.ts    — Full freelancer onboarding flow
├── onboarding-organization.spec.ts  — Org onboarding with team invites
├── onboarding-agency.spec.ts        — Agency onboarding with client creation
├── invited-member.spec.ts           — Invited member acceptance flow
├── role-enforcement.spec.ts         — Route protection per role
├── profile-score.spec.ts            — Score calculation and widget
├── trial-soft-lock.spec.ts          — Trial expiry and soft lock behavior
├── admin-access.spec.ts             — Platform user admin panel access
├── admin-blocked.spec.ts            — Non-platform user cannot access /admin
├── client-portal.spec.ts            — Client portal user restrictions
├── auth-guard.spec.ts               — Unauthenticated redirects
└── onboarding-skip.spec.ts          — Skip steps and complete later
```

### 10.2 Test Scenarios per CLAUDE.md Rules

- **Happy path:** Complete onboarding for each account type
- **Error states:** Invalid workspace name, duplicate email invites, Clerk API failure handling
- **Loading states:** Skeleton screens during workspace creation, invitation sending
- **Empty states:** Dashboard with no content, empty member list
- **Auth guard:** Every protected route redirects unauthenticated users to `/sign-in`
- **Role guard:** Editor cannot access `/settings/members`, viewer cannot create content
- **Soft lock:** All creation buttons disabled, upgrade banner visible
- **Platform isolation:** Customer user gets 404 on `/admin`, platform user redirected from `/dashboard`

---

## 11. Dependencies & Build Order

### 11.1 F0 Internal Build Sequence

```
1. TypeScript types (src/types/roles.ts)
2. Clerk middleware (src/middleware.ts)
3. Firestore security rules (firestore.rules)
4. Clerk webhook handler (/api/webhooks/clerk)
5. Onboarding API routes
6. Onboarding UI components (wizard)
7. Profile score service + widget
8. Trial service + badge + soft-lock banner
9. Platform seed script
10. Admin panel layout + login gate
11. E2E tests
```

### 11.2 What F0 Provides to Other Features

| Downstream Feature | What F0 Provides |
|-------------------|------------------|
| F1-F16 (all) | Auth middleware, role check utilities, workspace context |
| F6 (Approvals) | `hasMinRole()` for approver eligibility |
| F7 (Workspaces) | Workspace creation, member management foundations |
| F8 (Brand Voice) | Quick brand profile created at onboarding |
| F14 (Client Mgmt) | Client sub-workspace creation, portal user flow |
| F15 (Billing) | Trial state, Stripe customer ID on workspace |

---

## 12. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Onboarding completion | < 3 minutes for Freelancer, < 5 minutes for Agency |
| Time to first dashboard | < 2 seconds after final onboarding step |
| Clerk webhook processing | < 500ms per event |
| Profile score calculation | < 200ms (cached) |
| Route protection check | < 100ms (Clerk session + Firestore member lookup) |
| Trial soft-lock toggle | Immediate on dashboard reload |

---

## 13. Risk Flags

| Risk | Mitigation |
|------|------------|
| Clerk webhook delivery failure | Implement webhook retry queue + manual sync endpoint |
| Clerk org creation rate limits | Queue org creation, retry with exponential backoff |
| Firestore cold start on member lookup | Pre-warm with composite index on `workspaceId + userId` |
| Platform/customer role confusion | Separate Clerk orgs, separate Firestore collections, middleware enforces isolation |
| Trial clock manipulation | `trialEndsAt` set server-side only via `serverTimestamp()` + offset. Cannot be modified by client. |
| Onboarding abandonment | Track `onboardingStep` — incomplete users get reminder email after 24h (via Cloud Function) |
