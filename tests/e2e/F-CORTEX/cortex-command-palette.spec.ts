import { test, expect } from '@playwright/test';

test.describe('Cortex: Cmd+K Command Palette (AC2)', () => {
  test('Cmd+K opens command palette on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.keyboard.press('Meta+k');
    await expect(page.locator('[data-testid="cortex-command-palette"]')).toBeVisible();
  });

  test('Ctrl+K opens command palette on desktop (Windows)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-testid="cortex-command-palette"]')).toBeVisible();
  });

  test('command palette has search input', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    const input = page.locator('[data-testid="cortex-command-input"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('Escape closes command palette', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-testid="cortex-command-palette"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="cortex-command-palette"]')).not.toBeVisible();
  });

  test('Cmd+K does not open on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.keyboard.press('Meta+k');
    await expect(page.locator('[data-testid="cortex-command-palette"]')).not.toBeVisible();
  });
});
