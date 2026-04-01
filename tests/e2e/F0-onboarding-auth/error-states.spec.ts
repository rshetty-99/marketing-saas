import { test, expect } from '../../fixtures/auth';

test.describe('F0: Error States', () => {
  test('onboarding shows error when workspace creation fails', async ({ newUserPage }) => {
    // Mock API to return an error
    await newUserPage.route('**/api/onboarding/workspace', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      }),
    );

    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Error Test');
    await newUserPage.getByTestId('onboarding-next-button').click();

    // Should show an error message
    const errorMessage = newUserPage.getByTestId('onboarding-error');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText(/error|failed|try again/i);
  });

  test('onboarding validates required workspace name', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();
    await newUserPage.getByTestId('onboarding-next-button').click();

    // Try to submit without filling workspace name
    await newUserPage.getByTestId('onboarding-next-button').click();

    // Should show validation error
    const validationError = newUserPage.getByTestId('workspace-name-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText(/required|enter.*name/i);
  });

  test('team invite shows error for invalid email', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Validation Org');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand

    // Enter invalid email
    await newUserPage.getByTestId('team-invite-email-input').fill('not-an-email');
    await newUserPage.getByTestId('team-invite-add-button').click();

    const emailError = newUserPage.getByTestId('team-invite-email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText(/valid.*email|invalid/i);
  });

  test('dashboard shows error state when data fetch fails', async ({ ownerPage }) => {
    await ownerPage.route('**/api/dashboard/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' }),
      }),
    );

    await ownerPage.goto('/dashboard');

    const errorState = ownerPage.getByTestId('dashboard-error');
    await expect(errorState).toBeVisible({ timeout: 5000 });
    await expect(errorState).toContainText(/error|something went wrong|try again/i);
  });

  test('dashboard error state has retry button', async ({ ownerPage }) => {
    let requestCount = 0;
    await ownerPage.route('**/api/dashboard/**', (route) => {
      requestCount++;
      if (requestCount <= 1) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service unavailable' }),
        });
      }
      return route.continue();
    });

    await ownerPage.goto('/dashboard');

    const errorState = ownerPage.getByTestId('dashboard-error');
    await expect(errorState).toBeVisible({ timeout: 5000 });

    const retryButton = ownerPage.getByTestId('dashboard-retry-button');
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    // After retry, dashboard should load successfully
    await expect(ownerPage.getByTestId('dashboard-main')).toBeVisible({ timeout: 10000 });
  });

  test('admin panel shows error when metrics fail to load', async ({ adminPage }) => {
    await adminPage.route('**/api/admin/metrics**', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service temporarily unavailable' }),
      }),
    );

    await adminPage.goto('/admin');

    const errorState = adminPage.getByTestId('admin-metrics-error');
    await expect(errorState).toBeVisible({ timeout: 5000 });
  });
});
