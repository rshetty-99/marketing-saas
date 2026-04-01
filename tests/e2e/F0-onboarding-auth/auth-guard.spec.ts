import { test, expect } from '@playwright/test';

/**
 * Auth guard tests use the base Playwright test (NOT the auth fixture)
 * because they test unauthenticated access patterns.
 */

test.describe('F0: Auth Guard — Protected Route Redirects', () => {
  test('unauthenticated user redirected from /dashboard to /sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated user redirected from /onboarding to /sign-in', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated user redirected from /admin to /sign-in', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated user redirected from /portal to /sign-in', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated user redirected from /settings to /sign-in', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated user can access / (home)', async ({ page }) => {
    await page.goto('/');
    // Should NOT be redirected to sign-in
    const url = page.url();
    expect(url).not.toContain('/sign-in');

    // Should see a landing/home page element
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('unauthenticated user can access /sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('unauthenticated user can access /sign-up', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
  });
});
