# Test Validation Report -- F0

## Summary
- Total spec files: 14
- Total test cases: ~57
- Selector matches: 21/68
- Selector mismatches: 47
- Route matches: 10/19
- Route mismatches: 9
- Coverage gaps: 5

---

## Selector Audit

### Onboarding Flow Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `account-type-selector` | onboarding-freelancer.spec.ts | AccountTypeSelector.tsx | MATCH |
| `account-type-freelancer` | onboarding-freelancer.spec.ts, onboarding-skip.spec.ts | AccountTypeSelector.tsx (via testId prop) | MATCH |
| `account-type-organization` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts | AccountTypeSelector.tsx (via testId prop) | MATCH |
| `account-type-agency` | onboarding-freelancer.spec.ts, onboarding-agency.spec.ts | AccountTypeSelector.tsx (via testId prop) | MATCH |
| `onboarding-next-button` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts, loading-states.spec.ts, error-states.spec.ts | **NOT FOUND** | MISMATCH |
| `workspace-name-input` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts, loading-states.spec.ts, error-states.spec.ts | WorkspaceForm.tsx | MATCH |
| `onboarding-step-brand-setup` | onboarding-freelancer.spec.ts, onboarding-skip.spec.ts | **NOT FOUND** | MISMATCH |
| `brand-name-input` | onboarding-freelancer.spec.ts, profile-score.spec.ts | **NOT FOUND** (QuickBrandForm uses `id="brand-name"` but no `data-testid="brand-name-input"`) | MISMATCH |
| `onboarding-skip-button` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts | **NOT FOUND** (QuickBrandForm has `brand-skip`, TeamInviteForm has `invite-skip`, ClientCreateForm has `client-skip`) | MISMATCH |
| `onboarding-step-team-invite` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-skip.spec.ts | **NOT FOUND** | MISMATCH |
| `onboarding-step-client-creation` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts | **NOT FOUND** | MISMATCH |
| `onboarding-loading` | loading-states.spec.ts | **NOT FOUND** | MISMATCH |
| `onboarding-error` | error-states.spec.ts | **NOT FOUND** (error is shown as plain `<p>` without data-testid) | MISMATCH |
| `workspace-name-error` | error-states.spec.ts | **NOT FOUND** (WorkspaceForm uses `errors.name.message` but no data-testid on the error element) | MISMATCH |
| `workspace-form` | NOT used in tests | WorkspaceForm.tsx | N/A |
| `workspace-submit` | NOT used in tests | WorkspaceForm.tsx | N/A |

### Team Invite Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `team-invite-email-input` | onboarding-organization.spec.ts, onboarding-agency.spec.ts, error-states.spec.ts | **NOT FOUND** (TeamInviteForm uses `id="invite-email-{index}"` but no data-testid) | MISMATCH |
| `team-invite-role-select` | onboarding-organization.spec.ts, onboarding-agency.spec.ts | **NOT FOUND** (TeamInviteForm uses RolePicker with `data-testid="role-picker"`) | MISMATCH |
| `team-invite-add-button` | onboarding-organization.spec.ts, onboarding-agency.spec.ts | **NOT FOUND** (TeamInviteForm has `data-testid="add-invite-row"`) | MISMATCH |
| `team-invite-list` | onboarding-organization.spec.ts | **NOT FOUND** | MISMATCH |
| `team-invite-email-error` | error-states.spec.ts | **NOT FOUND** | MISMATCH |
| `team-invite-form` | NOT used in tests | TeamInviteForm.tsx | N/A |
| `add-invite-row` | NOT used in tests | TeamInviteForm.tsx | N/A |
| `invite-skip` | NOT used in tests | TeamInviteForm.tsx | N/A |
| `invite-submit` | NOT used in tests | TeamInviteForm.tsx | N/A |

### Client Creation Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `client-name-input` | onboarding-agency.spec.ts | **NOT FOUND** (ClientCreateForm uses `id="client-name"` but no data-testid) | MISMATCH |
| `client-email-input` | onboarding-agency.spec.ts | **NOT FOUND** (ClientCreateForm uses `id="client-email"` but no data-testid) | MISMATCH |
| `client-industry-select` | onboarding-agency.spec.ts | **NOT FOUND** (ClientCreateForm uses shadcn Select with `id="client-industry"` but no data-testid) | MISMATCH |
| `assign-member-designer@agency.com` | onboarding-agency.spec.ts | **NOT FOUND** (ClientCreateForm renders member buttons without dynamic data-testid) | MISMATCH |
| `client-form` | NOT used in tests | ClientCreateForm.tsx | N/A |
| `client-skip` | NOT used in tests | ClientCreateForm.tsx | N/A |
| `client-submit` | NOT used in tests | ClientCreateForm.tsx | N/A |

### Brand Form Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `brand-save-button` | profile-score.spec.ts | **NOT FOUND** | MISMATCH |
| `brand-form` | NOT used in tests | QuickBrandForm.tsx | N/A |
| `brand-skip` | NOT used in tests | QuickBrandForm.tsx | N/A |

### Dashboard Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `dashboard-main` | onboarding-organization.spec.ts, onboarding-skip.spec.ts, invited-member.spec.ts, role-enforcement.spec.ts, loading-states.spec.ts, error-states.spec.ts | **NOT FOUND** (dashboard page uses `data-testid="dashboard"`) | MISMATCH |
| `dashboard-loading-skeleton` | loading-states.spec.ts | **NOT FOUND** | MISMATCH |
| `dashboard-error` | error-states.spec.ts | **NOT FOUND** | MISMATCH |
| `dashboard-retry-button` | error-states.spec.ts | **NOT FOUND** | MISMATCH |

### Profile Score Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `profile-score-widget` | onboarding-freelancer.spec.ts, onboarding-skip.spec.ts, profile-score.spec.ts, loading-states.spec.ts | ProfileScoreWidget.tsx | MATCH |
| `profile-score-value` | onboarding-skip.spec.ts, profile-score.spec.ts | **NOT FOUND** (ProfileScoreWidget renders percentage as `<span>` without data-testid) | MISMATCH |
| `profile-checklist-drawer` | profile-score.spec.ts | **NOT FOUND** (ProfileScoreChecklist uses `data-testid="profile-checklist"`) | MISMATCH |
| `checklist-item` | profile-score.spec.ts | **NOT FOUND** (ProfileScoreChecklist renders items as `<Link>` without data-testid) | MISMATCH |
| `checklist-item-brand-setup` | profile-score.spec.ts | **NOT FOUND** | MISMATCH |
| `profile-score-dismiss` | profile-score.spec.ts | **NOT FOUND** (ProfileScoreWidget uses `aria-label="Dismiss profile score"` but no data-testid) | MISMATCH |
| `profile-score-loading` | loading-states.spec.ts | **NOT FOUND** | MISMATCH |
| `profile-checklist` | NOT used in tests | ProfileScoreChecklist.tsx | N/A |

### Trial and Soft-Lock Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `trial-badge` | onboarding-freelancer.spec.ts, trial-soft-lock.spec.ts | TrialBadge.tsx | MATCH |
| `soft-lock-banner` | trial-soft-lock.spec.ts | SoftLockBanner.tsx | MATCH |
| `create-content-button` | role-enforcement.spec.ts, trial-soft-lock.spec.ts, client-portal.spec.ts | **NOT FOUND** | MISMATCH |
| `publish-button` | trial-soft-lock.spec.ts | **NOT FOUND** | MISMATCH |

### Invited Member Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `welcome-screen` | invited-member.spec.ts | **NOT FOUND** (InvitedMemberWelcome has `data-testid="invited-welcome"`) | MISMATCH |
| `welcome-workspace-name` | invited-member.spec.ts | **NOT FOUND** | MISMATCH |
| `welcome-assigned-role` | invited-member.spec.ts | **NOT FOUND** | MISMATCH |
| `welcome-role-description` | invited-member.spec.ts | **NOT FOUND** | MISMATCH |

### Role/Navigation Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `nav-content-create` | invited-member.spec.ts, client-portal.spec.ts | **NOT FOUND** | MISMATCH |
| `nav-settings-members` | invited-member.spec.ts | **NOT FOUND** | MISMATCH |
| `nav-calendar` | client-portal.spec.ts | **NOT FOUND** | MISMATCH |
| `nav-approvals` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `forbidden-message` | role-enforcement.spec.ts, admin-blocked.spec.ts, client-portal.spec.ts | **NOT FOUND** | MISMATCH |
| `settings-page` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `members-settings-page` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `integrations-settings-page` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `billing-settings-page` | role-enforcement.spec.ts, trial-soft-lock.spec.ts | **NOT FOUND** | MISMATCH |
| `content-editor` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `approval-queue-page` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `client-switcher` | onboarding-agency.spec.ts | **NOT FOUND** | MISMATCH |
| `data-export-page` | trial-soft-lock.spec.ts | **NOT FOUND** | MISMATCH |
| `not-found-page` | admin-blocked.spec.ts | **NOT FOUND** | MISMATCH |

### Admin Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `admin-dashboard` | admin-access.spec.ts, loading-states.spec.ts | PlatformDashboard.tsx | MATCH |
| `admin-metrics-cards` | admin-access.spec.ts, loading-states.spec.ts | **NOT FOUND** (PlatformDashboard renders a grid div without data-testid) | MISMATCH |
| `metric-card-total-workspaces` | admin-access.spec.ts | **NOT FOUND** (actual: `metric-total-workspaces`) | MISMATCH |
| `metric-card-active-users` | admin-access.spec.ts | **NOT FOUND** (actual: `metric-total-users`) | MISMATCH |
| `metric-card-revenue` | admin-access.spec.ts | **NOT FOUND** (actual: `metric-mrr`) | MISMATCH |
| `admin-nav-team` | admin-access.spec.ts | **NOT FOUND** (AdminLayout nav links have no data-testid) | MISMATCH |
| `platform-team-table` | admin-access.spec.ts | PlatformTeamTable.tsx | MATCH |
| `add-platform-user-button` | admin-access.spec.ts | **NOT FOUND** | MISMATCH |
| `add-platform-user-form` | admin-access.spec.ts | **NOT FOUND** (actual: `create-platform-user-form`) | MISMATCH |
| `platform-user-email-input` | admin-access.spec.ts | **NOT FOUND** (uses `id="platform-user-email"` but no data-testid) | MISMATCH |
| `platform-user-role-select` | admin-access.spec.ts | **NOT FOUND** (uses shadcn Select with `id="platform-user-role"` but no data-testid) | MISMATCH |
| `platform-user-submit-button` | admin-access.spec.ts | **NOT FOUND** | MISMATCH |
| `platform-user-success` | admin-access.spec.ts | **NOT FOUND** (success message rendered as plain `<p>` without data-testid) | MISMATCH |
| `admin-metrics-loading` | loading-states.spec.ts | **NOT FOUND** | MISMATCH |
| `admin-metrics-error` | error-states.spec.ts | **NOT FOUND** | MISMATCH |
| `admin-layout` | NOT used in tests | AdminLayout.tsx | N/A |

### Portal Selectors

| Selector | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `portal-dashboard` | client-portal.spec.ts | portal/page.tsx | MATCH |
| `portal-reports-section` | client-portal.spec.ts, loading-states.spec.ts | **NOT FOUND** | MISMATCH |
| `portal-client-name` | client-portal.spec.ts | **NOT FOUND** | MISMATCH |
| `portal-reports-loading` | loading-states.spec.ts | **NOT FOUND** | MISMATCH |

### TrialBadge Attribute Check

| Attribute | Used in Test | Found in Component | Status |
|----------|-------------|-------------------|--------|
| `data-urgency="high"` | trial-soft-lock.spec.ts | **NOT FOUND** (TrialBadge uses CSS `animate-pulse` but no `data-urgency` attribute) | MISMATCH |

---

## Route Audit

| URL | Used in Test | Route File Exists | Status |
|-----|-------------|-------------------|--------|
| `/sign-up` | onboarding-freelancer.spec.ts, auth-guard.spec.ts | `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | MATCH |
| `/sign-in` | auth-guard.spec.ts | `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | MATCH |
| `/onboarding` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts, loading-states.spec.ts, error-states.spec.ts, auth-guard.spec.ts | `src/app/onboarding/page.tsx` | MATCH |
| `/dashboard` | onboarding-freelancer.spec.ts, onboarding-organization.spec.ts, onboarding-agency.spec.ts, onboarding-skip.spec.ts, invited-member.spec.ts, role-enforcement.spec.ts, profile-score.spec.ts, trial-soft-lock.spec.ts, admin-blocked.spec.ts, auth-guard.spec.ts, loading-states.spec.ts, error-states.spec.ts | `src/app/dashboard/page.tsx` | MATCH |
| `/admin` | admin-access.spec.ts, admin-blocked.spec.ts, auth-guard.spec.ts | `src/app/admin/page.tsx` | MATCH |
| `/admin/team` | admin-access.spec.ts, admin-blocked.spec.ts | `src/app/admin/team/page.tsx` | MATCH |
| `/portal` | client-portal.spec.ts, auth-guard.spec.ts | `src/app/portal/page.tsx` | MATCH |
| `/welcome` | invited-member.spec.ts | **NOT FOUND** | MISMATCH |
| `/settings` | auth-guard.spec.ts, role-enforcement.spec.ts | **NOT FOUND** (no `src/app/settings/` directory) | MISMATCH |
| `/settings/members` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `/settings/integrations` | role-enforcement.spec.ts | **NOT FOUND** | MISMATCH |
| `/settings/billing` | role-enforcement.spec.ts, trial-soft-lock.spec.ts | **NOT FOUND** | MISMATCH |
| `/settings/export` | trial-soft-lock.spec.ts | **NOT FOUND** | MISMATCH |
| `/settings/brand` | profile-score.spec.ts (checklist link) | **NOT FOUND** | MISMATCH |
| `/` | auth-guard.spec.ts | `src/app/page.tsx` | MATCH |
| `**/api/onboarding/**` | loading-states.spec.ts, error-states.spec.ts (route interception) | `src/app/api/onboarding/` (multiple routes) | MATCH |
| `**/api/dashboard/**` | error-states.spec.ts (route interception) | **NOT FOUND** (`src/app/api/dashboard/` does not exist) | MISMATCH |
| `**/api/admin/metrics**` | loading-states.spec.ts, error-states.spec.ts (route interception) | **NOT FOUND** (`src/app/api/admin/` does not exist) | MISMATCH |
| `**/api/portal/reports**` | loading-states.spec.ts (route interception) | **NOT FOUND** (`src/app/api/portal/` does not exist) | MISMATCH |
| `**/api/workspace/profile-score**` | loading-states.spec.ts (route interception) | **NOT FOUND** (`src/app/api/workspace/` does not exist) | MISMATCH |

---

## Zod Schema Compatibility

Tests send data matching the following schemas. Compatibility analysis:

| Schema | Test Data Shape | Zod Schema Shape | Status |
|--------|----------------|-----------------|--------|
| `selectAccountTypeSchema` | `{ accountType: "freelancer" }` | `{ accountType: enum }` | MATCH |
| `createWorkspaceSchema` | `{ name: "My Freelance Studio" }` (via form input) | `{ name: string.min(2).max(100), industry?: string }` | MATCH |
| `quickBrandSchema` | `{ brandName: "My Brand" }` (via form input) | `{ brandName: string.min(1).max(100), primaryColor: hex, voiceTone: enum }` | NOTE: Tests only fill brandName; primaryColor and voiceTone have defaults in the form, so this is compatible. |
| `inviteTeamSchema` | `{ email: "teammate@acme.com", role: "editor" }` (via individual inputs) | `{ invitations: [{email, role}].min(1).max(50) }` | NOTE: Tests interact with individual inputs, not the full schema. The form wraps inputs into the `invitations` array. Compatible at the component level. |
| `createClientSchema` | `{ name: "Big Corp", contactEmail: "contact@bigcorp.com" }` | `{ name: string.min(2).max(100), contactEmail: email, industry?: string, assignedTeamMemberIds?: string[] }` | MATCH |

---

## Coverage Gaps

Components/elements with data-testid attributes that have NO corresponding test coverage:

1. **`workspace-form`** (WorkspaceForm.tsx) -- The form wrapper itself is not tested by testid.
2. **`workspace-submit`** (WorkspaceForm.tsx) -- The submit button has a testid but tests use `onboarding-next-button` instead (which does not exist).
3. **`brand-form`** (QuickBrandForm.tsx) -- The form wrapper is not tested.
4. **`onboarding-layout`** (OnboardingLayout.tsx) -- Layout wrapper is not tested by testid.
5. **`onboarding-complete`** (OnboardingComplete.tsx) -- The completion screen is not tested by testid.
6. **`role-picker`** (RolePicker.tsx) -- The role picker select trigger is not tested (tests use `team-invite-role-select` which does not exist).
7. **`admin-layout`** (AdminLayout.tsx) -- The admin layout wrapper is not tested.
8. **`onboarding-account-type`** (account-type/page.tsx) -- The page wrapper is not tested.
9. **`onboarding-workspace`** (workspace/page.tsx) -- The page wrapper is not tested.
10. **`onboarding-brand`** (brand/page.tsx) -- The page wrapper is not tested.
11. **`onboarding-team`** (team/page.tsx) -- The page wrapper is not tested.
12. **`onboarding-client`** (client/page.tsx) -- The page wrapper is not tested.
13. **`invited-welcome`** (InvitedMemberWelcome.tsx) -- Tests use `welcome-screen` instead.
14. **`create-platform-user-form`** (CreatePlatformUserForm.tsx) -- Tests use `add-platform-user-form` instead.
15. **`profile-checklist`** (ProfileScoreChecklist.tsx) -- Tests use `profile-checklist-drawer` instead.

---

## Mismatches & Fixes Needed

### Critical: Architecture Mismatch -- Multi-Page vs. Single-Page Onboarding

The tests assume a **single-page wizard** pattern where the user stays on `/onboarding` and steps are shown/hidden within the same page (e.g., `getByTestId('onboarding-step-brand-setup')`). The actual implementation uses a **multi-page routing** pattern where each step is a separate Next.js route (`/onboarding/account-type`, `/onboarding/workspace`, `/onboarding/brand`, `/onboarding/team`, `/onboarding/client`, `/onboarding/complete`).

**Impact:** Every onboarding flow test (freelancer, organization, agency, skip) is structurally incompatible. The tests click "next" buttons to transition between steps on the same page, but the actual app navigates to different URLs.

**Fix options:**
- (A) Rewrite tests to use `page.goto()` for each step and use the actual data-testid values from each page.
- (B) Refactor the onboarding to a single-page wizard pattern matching test expectations.
- **Recommendation:** Option A. Rewrite the tests.

### Fix 1: Add Missing data-testid Attributes to Components

The following attributes need to be added to components:

1. **AccountTypeSelector.tsx**: Add `aria-selected` attribute to the `<button>` element based on `isSelected` state. Tests check `aria-selected="true"`.

2. **QuickBrandForm.tsx**: Add `data-testid="brand-name-input"` to the brand name Input.

3. **TeamInviteForm.tsx**:
   - Add `data-testid="team-invite-email-input"` to the email Input (per-row).
   - Add `data-testid="team-invite-role-select"` to the RolePicker.
   - Rename `add-invite-row` to `team-invite-add-button` or update tests.
   - Add `data-testid="team-invite-list"` wrapper for the invite list.
   - Add `data-testid="team-invite-email-error"` to the email validation error.

4. **ClientCreateForm.tsx**:
   - Add `data-testid="client-name-input"` to the client name Input.
   - Add `data-testid="client-email-input"` to the contact email Input.
   - Add `data-testid="client-industry-select"` to the industry Select.
   - Add `data-testid="assign-member-{email}"` to each member toggle button.

5. **ProfileScoreWidget.tsx**:
   - Add `data-testid="profile-score-value"` to the percentage `<span>`.
   - Add `data-testid="profile-score-dismiss"` to the dismiss button.

6. **ProfileScoreChecklist.tsx**:
   - Rename `data-testid="profile-checklist"` to `profile-checklist-drawer` (or update tests).
   - Add `data-testid="checklist-item"` to each checklist link.
   - Add `data-testid="checklist-item-{id}"` (e.g., `checklist-item-brand-setup` for the `brand_configured` item).

7. **TrialBadge.tsx**: Add `data-urgency="high"` attribute when `isUrgent` is true.

8. **InvitedMemberWelcome.tsx**:
   - Rename `invited-welcome` to `welcome-screen` or update tests.
   - Add `data-testid="welcome-workspace-name"` to the workspace name element.
   - Add `data-testid="welcome-assigned-role"` to the role label.
   - Add `data-testid="welcome-role-description"` to the role description.

9. **PlatformDashboard.tsx**:
   - Add `data-testid="admin-metrics-cards"` to the grid container.
   - Rename metric testIds to match tests: `metric-card-total-workspaces`, `metric-card-active-users`, `metric-card-revenue`.

10. **AdminLayout.tsx**: Add `data-testid="admin-nav-team"` (and other nav testids) to nav links.

11. **CreatePlatformUserForm.tsx**:
    - Add `data-testid="add-platform-user-button"` (tests expect a separate trigger button, but the form is always visible).
    - Rename `create-platform-user-form` to `add-platform-user-form` or update tests.
    - Add `data-testid="platform-user-email-input"` to the email Input.
    - Add `data-testid="platform-user-role-select"` to the role Select.
    - Add `data-testid="platform-user-submit-button"` to the submit Button.
    - Add `data-testid="platform-user-success"` to the success message.

### Fix 2: Create Missing Routes/Pages

The following routes referenced by tests do not exist:

1. **`/welcome`** -- Needed by invited-member.spec.ts. Create `src/app/welcome/page.tsx` using the `InvitedMemberWelcome` component.
2. **`/settings`** -- Needed by auth-guard.spec.ts, role-enforcement.spec.ts. Create `src/app/settings/page.tsx`.
3. **`/settings/members`** -- Needed by role-enforcement.spec.ts. Create `src/app/settings/members/page.tsx`.
4. **`/settings/integrations`** -- Needed by role-enforcement.spec.ts. Create `src/app/settings/integrations/page.tsx`.
5. **`/settings/billing`** -- Needed by role-enforcement.spec.ts, trial-soft-lock.spec.ts. Create `src/app/settings/billing/page.tsx`.
6. **`/settings/export`** -- Needed by trial-soft-lock.spec.ts. Create `src/app/settings/export/page.tsx`.
7. **`/settings/brand`** -- Needed by profile-score.spec.ts. Create `src/app/settings/brand/page.tsx`.

### Fix 3: Create Missing API Routes

1. **`/api/dashboard/**`** -- Referenced by error-states.spec.ts route interception.
2. **`/api/admin/metrics`** -- Referenced by loading-states.spec.ts, error-states.spec.ts route interception.
3. **`/api/portal/reports`** -- Referenced by loading-states.spec.ts route interception.
4. **`/api/workspace/profile-score`** -- Referenced by loading-states.spec.ts route interception.
5. **`/api/admin/platform-users`** -- Referenced by CreatePlatformUserForm.tsx fetch call.

### Fix 4: Add Missing Dashboard Elements

1. **`dashboard-main`** -- Tests use `dashboard-main` but the actual page uses `dashboard`. Either rename the page's testid or update tests.
2. **`dashboard-loading-skeleton`** -- Add a loading skeleton component to the dashboard.
3. **`dashboard-error`** -- Add an error state component to the dashboard.
4. **`dashboard-retry-button`** -- Add a retry button within the error state.
5. **`create-content-button`** -- Add a content creation button to the dashboard.
6. **`publish-button`** -- Add a publish button (visible on content items).
7. **`client-switcher`** -- Add a client switcher to the agency dashboard sidebar.

### Fix 5: Add Missing Navigation & Role-Based Elements

1. **`nav-content-create`** -- Navigation item for content creation.
2. **`nav-settings-members`** -- Navigation item for member settings.
3. **`nav-calendar`** -- Navigation item for calendar.
4. **`nav-approvals`** -- Navigation item for approval queue.
5. **`forbidden-message`** -- Forbidden access message component.
6. **`settings-page`** -- Settings page wrapper.
7. **`members-settings-page`** -- Members settings page wrapper.
8. **`integrations-settings-page`** -- Integrations settings page wrapper.
9. **`billing-settings-page`** -- Billing settings page wrapper.
10. **`content-editor`** -- Content editor page/component.
11. **`approval-queue-page`** -- Approval queue page.
12. **`data-export-page`** -- Data export page.
13. **`not-found-page`** -- Not found/404 page.

### Fix 6: Add Missing Portal Elements

1. **`portal-reports-section`** -- Add reports section to portal page.
2. **`portal-client-name`** -- Add client name display to portal.
3. **`portal-reports-loading`** -- Add loading state for portal reports.

### Fix 7: Add Missing Loading/Error State Elements

1. **`admin-metrics-loading`** -- Loading skeleton for admin metrics.
2. **`admin-metrics-error`** -- Error state for admin metrics.
3. **`onboarding-loading`** -- Loading indicator during onboarding submissions.
4. **`onboarding-error`** -- Error message with data-testid during onboarding.
5. **`workspace-name-error`** -- Validation error with data-testid for workspace name.

### Fix 8: Test Fixture -- Missing `portalPage` Role Mismatch

The portal layout (`src/app/portal/layout.tsx`) checks for `role === 'client_portal'`, but the auth fixture sets the portal user's role to `'viewer'`. This mismatch means the portal layout will redirect portal users away. Either:
- Update the fixture's portal user role to `'client_portal'`, or
- Update the portal layout to accept `'viewer'` role for portal users, using the `isPortalUser` flag instead.

---

## Priority Order

1. **P0 (Blocking):** Architecture mismatch -- decide on single-page wizard vs. multi-page routing and align tests.
2. **P0 (Blocking):** Portal role mismatch in test fixture vs. portal layout guard.
3. **P1 (High):** Add all missing data-testid attributes to components (47 mismatches).
4. **P1 (High):** Create missing page routes (`/welcome`, `/settings/*`).
5. **P2 (Medium):** Create missing API routes for loading/error state test interceptions.
6. **P2 (Medium):** Add loading skeleton, error state, and retry button components.
7. **P3 (Low):** Add navigation elements and role-gated UI (these may be part of a shared layout built later).
