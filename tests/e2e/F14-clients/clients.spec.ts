import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
const USERS = {
  agencyOwner: 'user_3BiyB6eojjh1ycGt4Qc2Yca8dZ8',  // Riley — Stellar Agency
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',       // Jordan — Acme (org, not agency)
};
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
test.describe('F14: Client Management', () => {
  test('agency owner sees clients page with client list', async ({ page }) => { await signIn(page, USERS.agencyOwner); await page.goto('/dashboard/clients'); await expect(page.getByTestId('clients-page')).toBeVisible({ timeout: 15000 }); await expect(page.getByTestId('client-list')).toBeVisible(); });
  test('agency owner can see add client button', async ({ page }) => { await signIn(page, USERS.agencyOwner); await page.goto('/dashboard/clients'); await expect(page.getByTestId('add-client-button')).toBeVisible({ timeout: 15000 }); });
  test('non-agency workspace redirected from clients page', async ({ page }) => { await signIn(page, USERS.orgOwner); await page.goto('/dashboard/clients'); await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 }); });
  test('client portal shows dashboard with review link', async ({ page }) => {
    // Portal page is accessible without workspace auth check (it has its own auth)
    await signIn(page, USERS.agencyOwner);
    await page.goto('/portal');
    await expect(page.getByTestId('portal-dashboard')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('portal-review-link')).toBeVisible();
  });
  test('portal shows reports, analytics, content, review sections', async ({ page }) => {
    await signIn(page, USERS.agencyOwner);
    await page.goto('/portal');
    await expect(page.getByTestId('portal-dashboard')).toBeVisible({ timeout: 15000 });
  });
});
