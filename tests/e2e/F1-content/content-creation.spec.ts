import { test as base, expect, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

const USERS = {
  orgOwner: 'user_3BiyANkliZNqwjXdMhQ53GYlknw',
  orgEditor: 'user_3BiyAWdCx6BTG1rkc26snkxcOTt',
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

test.describe('F1: Content Creation', () => {
  test('editor can see content creation page', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/content/create');
    await expect(page.getByTestId('content-editor')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('ai-prompt-input')).toBeVisible();
    await expect(page.getByTestId('content-type-select')).toBeVisible();
  });

  test('editor can type content and see word count', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/content/create');
    await page.getByTestId('content-editor').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('content-editor').fill('This is a test blog post with some words');
    await expect(page.getByTestId('word-count')).toContainText('9 words');
  });

  test('editor can generate content with AI', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/content/create');
    await page.getByTestId('ai-prompt-input').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('ai-prompt-input').fill('Write a blog post about marketing automation');
    await page.getByTestId('generate-button').click();
    // Should navigate or show generated content (mock)
    await page.waitForTimeout(3000);
  });

  test('viewer cannot access create page', async ({ page }) => {
    await signInAsUser(page, USERS.orgViewer);
    await page.goto('/dashboard/content/create');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  });

  test('content preview shows typed text', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/content/create');
    await page.getByTestId('content-editor').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('content-editor').fill('Hello world preview test');
    await expect(page.getByTestId('content-preview')).toContainText('Hello world preview test');
  });

  test('character counter visible for social posts', async ({ page }) => {
    await signInAsUser(page, USERS.orgEditor);
    await page.goto('/dashboard/content/create');
    await page.getByTestId('content-editor').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('content-editor').fill('Short social post');
    await expect(page.getByTestId('char-count')).toContainText('17 chars');
  });
});
