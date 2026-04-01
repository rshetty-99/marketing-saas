import { test as base, type Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { cleanupUserOnboardingData } from '../helpers/cleanup-onboarding';

/**
 * Clerk-integrated auth fixtures for E2E testing.
 *
 * Uses Clerk sign-in tokens (Backend API) to bypass email verification
 * and establish a real server-side session.
 *
 * Required env vars:
 *   E2E_CLERK_USER_USERNAME  — email of a test user in Clerk
 *   E2E_CLERK_USER_PASSWORD  — password for that test user
 *   CLERK_SECRET_KEY         — Clerk secret key for Backend API
 */

const E2E_USER_ID = 'user_3BiyCzkPCCpnFRWioTJYOzz8Ind';

/**
 * Create a sign-in token via Clerk Backend API and use it to sign in.
 * This bypasses email verification / 2FA required for new devices.
 */
async function signInWithToken(page: Page): Promise<void> {
  await setupClerkTestingToken({ page });

  // Create a one-time sign-in token via Backend API
  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: E2E_USER_ID }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create sign-in token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as { token: string };
  const ticket = data.token;

  // Navigate to sign-in with the ticket — this signs in immediately
  await page.goto(`/sign-in?__clerk_ticket=${ticket}`);

  // Wait for Clerk to process the ticket and redirect
  // Clerk may show "choose-organization" task — handle it if it appears
  await page.waitForURL(
    (url) => !url.pathname.includes('/sign-in') || url.pathname.includes('/tasks/'),
    { timeout: 15000 },
  );

  // If Clerk shows the "Setup your organization" task, complete it
  if (page.url().includes('/tasks/choose-organization')) {
    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
    await continueBtn.click();

    // Wait for redirect to app after org creation
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), {
      timeout: 15000,
    });
  }
}

type AuthFixtures = {
  /** Page with Clerk testing token injected (no sign-in — for public pages) */
  publicPage: Page;
  /** Page signed in as the test user */
  authenticatedPage: Page;
  /** Page signed in as a fresh user with no workspace (onboarding data cleaned) */
  newUserPage: Page;
};

export const test = base.extend<AuthFixtures>({
  publicPage: async ({ page }, use) => {
    await setupClerkTestingToken({ page });
    await use(page);
  },

  authenticatedPage: async ({ page }, use) => {
    await signInWithToken(page);
    await use(page);
  },

  newUserPage: async ({ page }, use) => {
    // Clean up onboarding data BEFORE sign-in so the user appears fresh
    await cleanupUserOnboardingData(E2E_USER_ID);

    await signInWithToken(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
export { E2E_USER_ID };
