import { test, expect } from '@playwright/test';

test.describe('Cortex: Chat Panel UI (AC1)', () => {
  test('floating button visible on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    const button = page.locator('[data-testid="cortex-floating-button"]');
    await expect(button).toBeVisible();
  });

  test('clicking floating button opens slide-out panel', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const panel = page.locator('[data-testid="cortex-panel"]');
    await expect(panel).toBeVisible();
  });

  test('panel contains message thread, input, mic button, context bar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    await expect(page.locator('[data-testid="cortex-message-thread"]')).toBeVisible();
    await expect(page.locator('[data-testid="cortex-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="cortex-mic-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cortex-context-bar"]')).toBeVisible();
  });

  test('panel closes via X button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    await expect(page.locator('[data-testid="cortex-panel"]')).toBeVisible();
    await page.click('[data-testid="cortex-close-button"]');
    await expect(page.locator('[data-testid="cortex-panel"]')).not.toBeVisible();
  });

  test('panel closes via Escape key', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    await expect(page.locator('[data-testid="cortex-panel"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="cortex-panel"]')).not.toBeVisible();
  });

  test('panel is full-screen on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const panel = page.locator('[data-testid="cortex-panel"]');
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(370);
  });

  test('floating button visible on non-dashboard pages too', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.locator('[data-testid="cortex-floating-button"]')).toBeVisible();
    await page.goto('/dashboard/leads');
    await expect(page.locator('[data-testid="cortex-floating-button"]')).toBeVisible();
  });
});
