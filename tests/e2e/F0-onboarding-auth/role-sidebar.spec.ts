import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * E2E tests for role-based sidebar visibility.
 * Signs in as seeded users with different roles and verifies
 * which nav items are visible vs hidden.
 *
 * Uses Clerk sign-in tokens (Backend API) to sign in as specific seeded users.
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

// Seeded user IDs (from seed-all-data.ts output)
const USERS = {
  freelancerOwner: 'user_3Biy9rNASt4HVeLTSj0AIBLi8UF',   // Alex Freelance — owner, freelancer
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',           // Jordan TeamLead — owner, org
  orgAdmin: 'user_3BiyAO5kledyCd58zDsfpv7T5xR',            // Sam OpsAdmin — admin, org
  orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt',           // Taylor Writer — editor, org
  orgViewer: 'user_3BiyAjiFm4y62cMD6fi4Tn71FlZ',           // Avery Analyst — viewer, org
  agencyOwner: 'user_3BiyB6eojjh1ycGt4Qc2Yca8dZ8',        // Riley AgencyFounder — owner, agency
};

async function signInAsUser(page: Page, userId: string): Promise<void> {
  await setupClerkTestingToken({ page });

  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create sign-in token: ${response.status}`);
  }

  const data = (await response.json()) as { token: string };
  await page.goto(`/sign-in?__clerk_ticket=${data.token}`);

  // Handle Clerk's "choose-organization" task if it appears
  await page.waitForURL(
    (url) => !url.pathname.includes('/sign-in') || url.pathname.includes('/tasks/'),
    { timeout: 15000 },
  );

  if (page.url().includes('/tasks/choose-organization')) {
    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
    await continueBtn.click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
  }

  // Navigate to dashboard
  await page.goto('/dashboard');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

const test = base.extend({});

test.describe.configure({ mode: 'serial' });

test.describe('Role-Based Sidebar Visibility', () => {

  test('owner (freelancer) sees full content + marketing, no Clients', async ({ page }) => {
    await signInAsUser(page, USERS.freelancerOwner);

    // Should see all content items
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-create')).toBeVisible();
    await expect(page.getByTestId('nav-repurpose')).toBeVisible();
    await expect(page.getByTestId('nav-approvals')).toBeVisible();
    await expect(page.getByTestId('nav-publish')).toBeVisible();
    await expect(page.getByTestId('nav-calendar')).toBeVisible();
    await expect(page.getByTestId('nav-assets')).toBeVisible();
    await expect(page.getByTestId('nav-images')).toBeVisible();

    // Should see all marketing items
    await expect(page.getByTestId('nav-analytics')).toBeVisible();
    await expect(page.getByTestId('nav-seo')).toBeVisible();
    await expect(page.getByTestId('nav-email')).toBeVisible();
    await expect(page.getByTestId('nav-leads')).toBeVisible();

    // Should see workspace items (owner has all permissions)
    await expect(page.getByTestId('nav-brand-voice')).toBeVisible();
    await expect(page.getByTestId('nav-integrations')).toBeVisible();
    await expect(page.getByTestId('nav-team')).toBeVisible();
    await expect(page.getByTestId('nav-billing')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeVisible();

    // Freelancer should NOT see Clients (agency only)
    await expect(page.getByTestId('nav-clients')).not.toBeVisible();
  });

  test('owner (agency) sees Clients nav item', async ({ page }) => {
    await signInAsUser(page, USERS.agencyOwner);

    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-clients')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeVisible();
  });

  test('editor sees content items but not admin items', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);

    // Editor CAN see content creation + view items
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-create')).toBeVisible();
    await expect(page.getByTestId('nav-repurpose')).toBeVisible();
    await expect(page.getByTestId('nav-approvals')).toBeVisible();
    await expect(page.getByTestId('nav-calendar')).toBeVisible();
    await expect(page.getByTestId('nav-assets')).toBeVisible();
    await expect(page.getByTestId('nav-images')).toBeVisible();

    // Editor CAN see analytics/marketing view items
    await expect(page.getByTestId('nav-analytics')).toBeVisible();
    await expect(page.getByTestId('nav-seo')).toBeVisible();
    await expect(page.getByTestId('nav-brand-voice')).toBeVisible();

    // Editor CANNOT see admin-only items
    await expect(page.getByTestId('nav-publish')).not.toBeVisible();
    await expect(page.getByTestId('nav-integrations')).not.toBeVisible();
    await expect(page.getByTestId('nav-team')).not.toBeVisible();
    await expect(page.getByTestId('nav-billing')).not.toBeVisible();
    await expect(page.getByTestId('nav-settings')).not.toBeVisible();
  });

  test('viewer sees only view items, no create or admin items', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);

    // Viewer CAN see view-only items
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-calendar')).toBeVisible();
    await expect(page.getByTestId('nav-assets')).toBeVisible();
    await expect(page.getByTestId('nav-analytics')).toBeVisible();
    await expect(page.getByTestId('nav-seo')).toBeVisible();
    await expect(page.getByTestId('nav-brand-voice')).toBeVisible();

    // Viewer CAN see email analytics (view permission)
    await expect(page.getByTestId('nav-email')).toBeVisible();

    // Viewer CANNOT see create/edit items
    await expect(page.getByTestId('nav-create')).not.toBeVisible();
    await expect(page.getByTestId('nav-repurpose')).not.toBeVisible();
    await expect(page.getByTestId('nav-approvals')).not.toBeVisible();
    await expect(page.getByTestId('nav-publish')).not.toBeVisible();
    await expect(page.getByTestId('nav-images')).not.toBeVisible();
    await expect(page.getByTestId('nav-leads')).not.toBeVisible();

    // Viewer CANNOT see admin items
    await expect(page.getByTestId('nav-integrations')).not.toBeVisible();
    await expect(page.getByTestId('nav-team')).not.toBeVisible();
    await expect(page.getByTestId('nav-billing')).not.toBeVisible();
    await expect(page.getByTestId('nav-settings')).not.toBeVisible();
  });

  test('admin sees everything owner sees except billing.change_plan', async ({ page }) => {
    await signInAsUser(page, USERS.orgAdmin);

    // Admin sees all nav items (same visibility as owner for nav purposes)
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-create')).toBeVisible();
    await expect(page.getByTestId('nav-publish')).toBeVisible();
    await expect(page.getByTestId('nav-integrations')).toBeVisible();
    await expect(page.getByTestId('nav-team')).toBeVisible();
    await expect(page.getByTestId('nav-billing')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeVisible();

    // Admin in org should NOT see Clients (org, not agency)
    await expect(page.getByTestId('nav-clients')).not.toBeVisible();
  });
});
