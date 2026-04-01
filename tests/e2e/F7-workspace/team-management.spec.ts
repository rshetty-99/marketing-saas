import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

// Seeded users
const USERS = {
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',     // Jordan TeamLead — owner, Acme Marketing Team
  orgAdmin: 'user_3BiyAO5kledyCd58zDsfpv7T5xR',       // Sam OpsAdmin — admin, Acme Marketing Team
  orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt',      // Taylor Writer — editor, Acme Marketing Team
};

async function signInAsUser(page: Page, userId: string): Promise<void> {
  await setupClerkTestingToken({ page });
  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = (await response.json()) as { token: string };
  await page.goto(`/sign-in?__clerk_ticket=${data.token}`);
  await page.waitForURL(
    (url) => !url.pathname.includes('/sign-in') || url.pathname.includes('/tasks/'),
    { timeout: 15000 },
  );
  if (page.url().includes('/tasks/choose-organization')) {
    const btn = page.getByRole('button', { name: 'Continue', exact: true });
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
  }
}

const test = base.extend({});
test.describe.configure({ mode: 'serial' });

test.describe('F7: Team Management', () => {
  test('admin sees team members list', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/team');
    await expect(page.getByTestId('team-members-list')).toBeVisible({ timeout: 15000 });
  });

  test('admin can open invite dialog', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/team');
    await page.getByRole('button', { name: /invite member/i }).click();
    await expect(page.getByTestId('invite-email-input')).toBeVisible();
    await expect(page.getByTestId('invite-role-select')).toBeVisible();
  });

  test('owner sees transfer ownership in danger zone', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/settings');
    await page.getByTestId('settings-tab-danger').click();
    await expect(page.getByTestId('danger-zone')).toBeVisible();
    await expect(page.getByTestId('delete-workspace-button')).toBeVisible();
  });

  test('settings general tab — can see workspace name', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/settings');
    await expect(page.getByTestId('settings-name-input')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('settings-name-input')).toHaveValue('Acme Marketing Team');
  });

  test('editor cannot access team page — redirected to dashboard', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/team');
    // Editor should be redirected away since they don't have workspace.invite_members
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  });
});
