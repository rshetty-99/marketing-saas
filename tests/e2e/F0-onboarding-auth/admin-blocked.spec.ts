import { test, expect } from '../../fixtures/auth';

test.describe('F0: Platform Admin Route Blocking', () => {
  test('non-platform user redirected from /admin', async ({ authenticatedPage }) => {
    // authenticatedPage is a regular editor, not a platform user
    await authenticatedPage.goto('/admin');

    // Should be redirected away from /admin
    const currentUrl = authenticatedPage.url();
    expect(currentUrl).not.toContain('/admin');

    // Should land on dashboard or a 404 page
    const isOnDashboard = currentUrl.includes('/dashboard');
    const isOnNotFound = await authenticatedPage.getByTestId('not-found-page').isVisible().catch(() => false);
    expect(isOnDashboard || isOnNotFound).toBeTruthy();
  });

  test('non-platform user gets 404 or redirect on /admin/team', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/admin/team');

    const currentUrl = authenticatedPage.url();
    expect(currentUrl).not.toContain('/admin/team');

    const isOnDashboard = currentUrl.includes('/dashboard');
    const isOnNotFound = await authenticatedPage.getByTestId('not-found-page').isVisible().catch(() => false);
    expect(isOnDashboard || isOnNotFound).toBeTruthy();
  });

  test('owner cannot access /admin without platform role', async ({ ownerPage }) => {
    // Workspace owner is NOT automatically a platform admin
    await ownerPage.goto('/admin');

    const currentUrl = ownerPage.url();
    expect(currentUrl).not.toContain('/admin');
  });

  test('portal user cannot access /admin', async ({ portalPage }) => {
    await portalPage.goto('/admin');

    const currentUrl = portalPage.url();
    expect(currentUrl).not.toContain('/admin');
  });

  test('platform user cannot access /dashboard (customer route)', async ({ adminPage }) => {
    // Platform admin should be scoped to /admin routes
    await adminPage.goto('/dashboard');

    // Platform-only users should be redirected back to /admin
    const currentUrl = adminPage.url();
    const isOnAdmin = currentUrl.includes('/admin');
    const hasForbidden = await adminPage.getByTestId('forbidden-message').isVisible().catch(() => false);
    expect(isOnAdmin || hasForbidden).toBeTruthy();
  });
});
