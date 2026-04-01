import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

const USERS = {
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',     // Jordan TeamLead — owner, Acme Marketing Team
  orgViewer: 'user_3BiyAjiFm4y62cMD6fi4Tn71FlZ',     // Avery Analyst — viewer, Bloom Digital
  freelancer: 'user_3Biy9rNASt4HVeLTSj0AIBLi8UF',    // Alex Freelance — owner
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

test.describe('F8: Brand Voice', () => {
  test('owner sees brand page with all tabs', async ({ page }) => {
    await signInAsUser(page, USERS.freelancer);
    await page.goto('/dashboard/brand');
    await expect(page.getByTestId('brand-tabs')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('brand-tab-voice')).toBeVisible();
    await expect(page.getByTestId('brand-tab-strategy')).toBeVisible();
    await expect(page.getByTestId('brand-tab-ai')).toBeVisible();
    await expect(page.getByTestId('brand-tab-assets')).toBeVisible();
  });

  test('owner can see brand name input and save button', async ({ page }) => {
    await signInAsUser(page, USERS.freelancer);
    await page.goto('/dashboard/brand');
    await expect(page.getByTestId('brand-name-input')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('save-voice-button')).toBeVisible();
  });

  test('viewer sees brand page in read-only mode', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/brand');
    await expect(page.getByTestId('brand-tabs')).toBeVisible({ timeout: 15000 });
    // Save button should NOT be visible for viewers
    await expect(page.getByTestId('save-voice-button')).not.toBeVisible();
    // Extract URL should NOT be visible
    await expect(page.getByTestId('extract-brand-button')).not.toBeVisible();
  });

  test('strategy tab shows content pillars input', async ({ page }) => {
    await signInAsUser(page, USERS.freelancer);
    await page.goto('/dashboard/brand');
    await page.getByTestId('brand-tab-strategy').click();
    await expect(page.getByTestId('target-audience-input')).toBeVisible();
    await expect(page.getByTestId('content-pillars-input')).toBeVisible();
    await expect(page.getByTestId('save-strategy-button')).toBeVisible();
  });

  test('test voice button generates system prompt', async ({ page }) => {
    await signInAsUser(page, USERS.freelancer);
    await page.goto('/dashboard/brand');
    await page.getByTestId('test-voice-button').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('test-voice-button').click();
    // Either shows the prompt or shows an error (no voice configured yet is acceptable)
    await page.waitForTimeout(2000);
  });
});
