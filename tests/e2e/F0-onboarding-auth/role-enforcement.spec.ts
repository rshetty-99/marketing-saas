import { test, expect } from '../../fixtures/auth';

test.describe('F0: Role-Based Access Enforcement', () => {
  test('editor cannot access /settings/members', async ({ authenticatedPage }) => {
    // authenticatedPage fixture is an editor
    await authenticatedPage.goto('/settings/members');

    // Should be redirected or shown forbidden
    const forbidden = authenticatedPage.getByTestId('forbidden-message');
    const redirected = authenticatedPage.url().includes('/dashboard');
    const hasForbidden = await forbidden.isVisible().catch(() => false);

    expect(redirected || hasForbidden).toBeTruthy();
  });

  test('viewer cannot see create content button', async ({ viewerPage }) => {
    await viewerPage.goto('/dashboard');
    await expect(viewerPage.getByTestId('dashboard-main')).toBeVisible();
    await expect(viewerPage.getByTestId('create-content-button')).not.toBeVisible();
  });

  test('admin can access all settings', async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await expect(adminPage.getByTestId('settings-page')).toBeVisible();

    await adminPage.goto('/settings/members');
    await expect(adminPage.getByTestId('members-settings-page')).toBeVisible();

    await adminPage.goto('/settings/integrations');
    await expect(adminPage.getByTestId('integrations-settings-page')).toBeVisible();
  });

  test('owner can access billing', async ({ ownerPage }) => {
    await ownerPage.goto('/settings/billing');
    await expect(ownerPage.getByTestId('billing-settings-page')).toBeVisible();
  });

  test('editor can access content creation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage.getByTestId('create-content-button')).toBeVisible();
    await authenticatedPage.getByTestId('create-content-button').click();

    await expect(authenticatedPage.getByTestId('content-editor')).toBeVisible();
  });

  test('manager can approve content', async ({ managerPage }) => {
    await managerPage.goto('/dashboard');
    await expect(managerPage.getByTestId('dashboard-main')).toBeVisible();

    // Manager should see approval queue
    await expect(managerPage.getByTestId('nav-approvals')).toBeVisible();
    await managerPage.getByTestId('nav-approvals').click();

    await expect(managerPage.getByTestId('approval-queue-page')).toBeVisible();
  });
});
