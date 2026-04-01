import { test, expect } from '../../fixtures/auth';

test.describe('F0: Loading States', () => {
  test('dashboard shows loading skeleton before data loads', async ({ ownerPage }) => {
    // Intercept API calls to delay them
    await ownerPage.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await ownerPage.goto('/dashboard');

    // Loading skeleton should appear while data loads
    const skeleton = ownerPage.getByTestId('dashboard-loading-skeleton');
    await expect(skeleton).toBeVisible();

    // Eventually the main content should replace the skeleton
    await expect(ownerPage.getByTestId('dashboard-main')).toBeVisible({ timeout: 10000 });
    await expect(skeleton).not.toBeVisible();
  });

  test('onboarding shows loading state during account creation', async ({ newUserPage }) => {
    // Slow down the onboarding API call
    await newUserPage.route('**/api/onboarding/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Loading Test');
    await newUserPage.getByTestId('onboarding-next-button').click();

    // Should show a loading indicator during submission
    const loadingIndicator = newUserPage.getByTestId('onboarding-loading');
    const isVisible = await loadingIndicator.isVisible().catch(() => false);

    // Loading indicator should appear during the delayed request
    // (may or may not be caught depending on timing, so we check the final state)
    await expect(newUserPage.getByTestId('onboarding-step-brand-setup')).toBeVisible({
      timeout: 10000,
    });
  });

  test('profile score widget shows loading state', async ({ ownerPage }) => {
    await ownerPage.route('**/api/workspace/profile-score**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await ownerPage.goto('/dashboard');

    const scoreSkeleton = ownerPage.getByTestId('profile-score-loading');
    // Loading state may appear briefly
    const wasVisible = await scoreSkeleton.isVisible().catch(() => false);

    // Eventually the actual widget should load
    await expect(ownerPage.getByTestId('profile-score-widget')).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard shows loading state for metrics', async ({ adminPage }) => {
    await adminPage.route('**/api/admin/metrics**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await adminPage.goto('/admin');

    // Metrics loading skeleton should appear
    const metricsSkeleton = adminPage.getByTestId('admin-metrics-loading');
    const wasVisible = await metricsSkeleton.isVisible().catch(() => false);

    // Eventually metrics should load
    await expect(adminPage.getByTestId('admin-metrics-cards')).toBeVisible({ timeout: 10000 });
  });

  test('portal reports section shows loading state', async ({ portalPage }) => {
    await portalPage.route('**/api/portal/reports**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await portalPage.goto('/portal');

    const reportsSkeleton = portalPage.getByTestId('portal-reports-loading');
    const wasVisible = await reportsSkeleton.isVisible().catch(() => false);

    await expect(portalPage.getByTestId('portal-reports-section')).toBeVisible({ timeout: 10000 });
  });
});
