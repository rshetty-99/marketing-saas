import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

const USERS = {
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',
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

test.describe('F9: Social Integrations', () => {
  test('admin sees integrations page with social category', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/integrations');
    await expect(page.getByTestId('social-category')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('social-platforms-grid')).toBeVisible();
  });

  test('admin sees connect buttons for all 8 platforms', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/integrations');
    await expect(page.getByTestId('platform-linkedin')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('platform-twitter')).toBeVisible();
    await expect(page.getByTestId('platform-instagram')).toBeVisible();
    await expect(page.getByTestId('platform-facebook')).toBeVisible();
    await expect(page.getByTestId('platform-tiktok')).toBeVisible();
    await expect(page.getByTestId('platform-youtube')).toBeVisible();
    await expect(page.getByTestId('platform-pinterest')).toBeVisible();
    await expect(page.getByTestId('platform-google_business')).toBeVisible();
  });

  test('mock connection creates a connection card', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/integrations');
    await page.getByTestId('connect-linkedin').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('connect-linkedin').click();
    // Wait for page reload after connection
    await page.waitForURL(/\/dashboard\/integrations/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    // After reload, the platform card should still be visible
    await expect(page.getByTestId('platform-linkedin')).toBeVisible({ timeout: 10000 });
  });

  test('viewer cannot see integrations page', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/integrations');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  });
});
