import { test, expect } from '@playwright/test';

test.describe('Cortex: Session Storage (AC6)', () => {
  test('sending a message creates a session', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('List my clients');
    await input.press('Enter');

    // Wait for response
    await page.locator('[data-testid="cortex-message-assistant"]').first().waitFor({ timeout: 15000 });

    // Session title should appear in the panel header
    await expect(page.locator('[data-testid="cortex-session-title"]')).toBeVisible();
  });

  test('new chat button creates a new session', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');

    // Send first message
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('List my clients');
    await input.press('Enter');
    await page.locator('[data-testid="cortex-message-assistant"]').first().waitFor({ timeout: 15000 });

    // Click new chat
    await page.click('[data-testid="cortex-new-chat"]');

    // Message thread should be empty
    await expect(page.locator('[data-testid="cortex-message-assistant"]')).toHaveCount(0);
  });
});

test.describe('Cortex: Dashboard Page + Sidebar (AC12)', () => {
  test('/dashboard/cortex page shows session history', async ({ page }) => {
    await page.goto('/dashboard/cortex');
    await expect(page.locator('[data-testid="cortex-history-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Cortex');
  });

  test('Cortex nav item visible in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const navItem = page.locator('[data-testid="nav-cortex"]');
    await expect(navItem).toBeVisible();
  });

  test('Cortex nav item links to /dashboard/cortex', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="nav-cortex"]');
    await expect(page).toHaveURL(/\/dashboard\/cortex/);
  });
});

test.describe('Cortex: Auth Guard', () => {
  test('unauthenticated user cannot access /api/cortex/chat', async ({ request }) => {
    const response = await request.post('/api/cortex/chat', {
      data: { message: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('unauthenticated user cannot access /api/cortex/sessions', async ({ request }) => {
    const response = await request.get('/api/cortex/sessions');
    expect(response.status()).toBe(401);
  });
});

test.describe('Cortex: Concurrency Control (AC11)', () => {
  test('second request while streaming shows queued message', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');

    // Send first message
    await input.fill('Show my analytics');
    await input.press('Enter');

    // Immediately send second message
    await input.fill('List my clients');
    await input.press('Enter');

    // Should see a queued indicator
    await expect(page.locator('[data-testid="cortex-queued-indicator"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Cortex: Degradation (AC10)', () => {
  test('degradation banner not shown when AI is available', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    await expect(page.locator('[data-testid="cortex-degradation-banner"]')).not.toBeVisible();
  });
});
