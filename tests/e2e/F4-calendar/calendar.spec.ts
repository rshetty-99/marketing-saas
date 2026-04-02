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

test.describe('F4: Calendar', () => {
  test('calendar page renders with month view', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/calendar');
    await expect(page.getByTestId('calendar-grid')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('calendar-month-label')).toBeVisible();
  });

  test('viewer can see calendar (read-only)', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/calendar');
    await expect(page.getByTestId('calendar-grid')).toBeVisible({ timeout: 15000 });
    // Create button should NOT be visible for viewers
    await expect(page.getByTestId('create-event-button')).not.toBeVisible();
  });

  test('owner can see create event button', async ({ page }) => {
    await signInAsUser(page, USERS.orgOwner);
    await page.goto('/dashboard/calendar');
    await expect(page.getByTestId('create-event-button')).toBeVisible({ timeout: 15000 });
  });
});
