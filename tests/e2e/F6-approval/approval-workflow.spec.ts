import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

const USERS = {
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',
  orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt',
  orgViewer: 'user_3BiyAjiFm4y62cMD6fi4Tn71FlZ',
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

test.describe('F6: Approval Workflow', () => {
  test('editor can see approvals page', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/approvals');
    await expect(page.getByTestId('approvals-page')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('my-submissions-heading')).toBeVisible();
  });

  test('owner can see approvals page with pending section', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/approvals');
    await expect(page.getByTestId('approvals-page')).toBeVisible({ timeout: 15000 });
  });

  test('viewer cannot access approvals page', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/approvals');
    // Viewer doesn't have approvals.submit_for_approval permission
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  });
});
