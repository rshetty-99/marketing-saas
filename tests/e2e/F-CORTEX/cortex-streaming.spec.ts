import { test, expect } from '@playwright/test';

test.describe('Cortex: Claude API Streaming (AC3)', () => {
  test('sending a message shows streaming response', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('Show my analytics');
    await input.press('Enter');

    // Should see a streaming assistant message appear
    const assistantMsg = page.locator('[data-testid="cortex-message-assistant"]').first();
    await expect(assistantMsg).toBeVisible({ timeout: 15000 });
  });

  test('POST to /api/cortex/chat returns SSE content-type', async ({ page }) => {
    await page.goto('/dashboard');

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/cortex/chat') && response.status() === 200,
    );

    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('Tell me about my workspace');
    await input.press('Enter');

    const response = await responsePromise;
    expect(response.headers()['content-type']).toContain('text/event-stream');
  });
});

test.describe('Cortex: Feedback (AC9)', () => {
  test('thumbs up/down buttons visible on assistant messages', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('Tell me about my workspace');
    await input.press('Enter');

    const assistantMsg = page.locator('[data-testid="cortex-message-assistant"]').first();
    await expect(assistantMsg).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-testid="cortex-feedback-positive"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="cortex-feedback-negative"]').first()).toBeVisible();
  });

  test('thumbs down shows reason dropdown', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="cortex-floating-button"]');
    const input = page.locator('[data-testid="cortex-input"]');
    await input.fill('Tell me about my workspace');
    await input.press('Enter');

    await page.locator('[data-testid="cortex-message-assistant"]').first().waitFor({ timeout: 15000 });
    await page.click('[data-testid="cortex-feedback-negative"]');
    await expect(page.locator('[data-testid="cortex-feedback-reason-dropdown"]')).toBeVisible();
  });
});
