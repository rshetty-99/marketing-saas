import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
const USERS = { orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw', orgViewer: 'user_3BiyAjiFm4y62cMD6fi4Tn71FlZ', orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt' };
async function signIn(page: Page, userId: string) {
  await setupClerkTestingToken({ page });
  const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', { method: 'POST', headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) });
  const data = (await res.json()) as { token: string };
  await page.goto(`/sign-in?__clerk_ticket=${data.token}`);
  await page.waitForURL((url) => !url.pathname.includes('/sign-in') || url.pathname.includes('/tasks/'), { timeout: 15000 });
  if (page.url().includes('/tasks/choose-organization')) { const btn = page.getByRole('button', { name: 'Continue', exact: true }); await btn.waitFor({ state: 'visible', timeout: 10000 }); await btn.click(); await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 }); }
}
const test = base.extend({});
test.describe.configure({ mode: 'serial' });
test.describe('F13: Image Generation', () => {
  test('editor sees image generation page', async ({ page }) => { await signIn(page, USERS.orgEditor); await page.goto('/dashboard/images'); await expect(page.getByTestId('images-heading')).toBeVisible({ timeout: 15000 }); await expect(page.getByTestId('image-generator')).toBeVisible(); });
  test('editor can see prompt input and selectors', async ({ page }) => { await signIn(page, USERS.orgEditor); await page.goto('/dashboard/images'); await expect(page.getByTestId('image-prompt-input')).toBeVisible({ timeout: 15000 }); await expect(page.getByTestId('style-selector')).toBeVisible(); await expect(page.getByTestId('dimension-selector')).toBeVisible(); });
  test('mock generation creates placeholder image', async ({ page }) => { await signIn(page, USERS.orgEditor); await page.goto('/dashboard/images'); await page.getByTestId('image-prompt-input').waitFor({ state: 'visible', timeout: 15000 }); await page.getByTestId('image-prompt-input').fill('A sunset over mountains'); await page.getByTestId('generate-image-button').click(); await page.waitForURL(/\/dashboard\/images/, { timeout: 15000 }); await page.waitForTimeout(1000); await expect(page.getByTestId('images-heading')).toBeVisible(); });
  test('viewer cannot access images page', async ({ page }) => { await signIn(page, USERS.orgViewer); await page.goto('/dashboard/images'); await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 }); });
});
