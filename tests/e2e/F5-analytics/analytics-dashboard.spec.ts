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

test.describe('F5: Analytics Dashboard', () => {
  test('owner sees analytics dashboard with KPI cards', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/analytics');
    await expect(page.getByTestId('analytics-heading')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('kpi-cards')).toBeVisible();
    await expect(page.getByTestId('engagement-chart')).toBeVisible();
    await expect(page.getByTestId('pipeline-health')).toBeVisible();
  });

  test('viewer sees analytics (read-only, no export)', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/analytics');
    await expect(page.getByTestId('analytics-heading')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('kpi-cards')).toBeVisible();
    // Export button should NOT be visible for viewers
    await expect(page.getByTestId('export-button')).not.toBeVisible();
  });

  test('date range selector changes period', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/analytics');
    await page.getByTestId('date-range-selector').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('date-range-selector').click();
    await page.getByRole('option', { name: 'Last 7 days' }).click();
    await page.waitForTimeout(1000);
    // KPIs should still be visible after range change
    await expect(page.getByTestId('kpi-cards')).toBeVisible();
  });

  test('owner can see export button', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/analytics');
    await expect(page.getByTestId('export-button')).toBeVisible({ timeout: 15000 });
  });

  test('pipeline health shows content funnel', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/analytics');
    await expect(page.getByTestId('pipeline-health')).toBeVisible({ timeout: 15000 });
    // Should show status labels
    await expect(page.getByTestId('pipeline-health')).toContainText('draft');
    await expect(page.getByTestId('pipeline-health')).toContainText('published');
  });
});
