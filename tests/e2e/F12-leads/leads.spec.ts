import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
const USERS = { orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw', orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt', orgViewer: 'user_3BiyAjiFm4y62cMD6fi4Tn71FlZ' };
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
test.describe('F12: Lead Management', () => {
  test('owner sees leads page with pipeline', async ({ page }) => { await signIn(page, USERS.orgOwner); await page.goto('/dashboard/leads'); await expect(page.getByTestId('leads-page')).toBeVisible({ timeout: 15000 }); await expect(page.getByTestId('pipeline-view')).toBeVisible(); });
  test('editor can see create lead button', async ({ page }) => { await signIn(page, USERS.orgEditor); await page.goto('/dashboard/leads'); await expect(page.getByTestId('create-lead-button')).toBeVisible({ timeout: 15000 }); });
  test('pipeline view shows stage columns', async ({ page }) => { await signIn(page, USERS.orgOwner); await page.goto('/dashboard/leads'); await expect(page.getByTestId('pipeline-view')).toBeVisible({ timeout: 15000 }); });
  test('viewer cannot access leads page', async ({ page }) => { await signIn(page, USERS.orgViewer); await page.goto('/dashboard/leads'); await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 }); });
});
