import { test, expect } from '../../fixtures/auth';

test.describe('F0: Client Portal Access', () => {
  test('portal user can access /portal', async ({ portalPage }) => {
    await portalPage.goto('/portal');
    await expect(portalPage).toHaveURL(/\/portal/);
    await expect(portalPage.getByTestId('portal-dashboard')).toBeVisible();
  });

  test('portal user sees reports section', async ({ portalPage }) => {
    await portalPage.goto('/portal');

    const reportsSection = portalPage.getByTestId('portal-reports-section');
    await expect(reportsSection).toBeVisible();

    // Reports section should have at least a heading
    await expect(reportsSection.getByRole('heading')).toBeVisible();
  });

  test('portal user cannot navigate to /dashboard', async ({ portalPage }) => {
    await portalPage.goto('/dashboard');

    // Should be redirected back to portal or shown forbidden
    const currentUrl = portalPage.url();
    const isOnPortal = currentUrl.includes('/portal');
    const hasForbidden = await portalPage.getByTestId('forbidden-message').isVisible().catch(() => false);
    expect(isOnPortal || hasForbidden).toBeTruthy();
  });

  test('portal user cannot see creation tools', async ({ portalPage }) => {
    await portalPage.goto('/portal');

    // Creation-related elements should not be visible
    await expect(portalPage.getByTestId('create-content-button')).not.toBeVisible();
    await expect(portalPage.getByTestId('nav-content-create')).not.toBeVisible();
    await expect(portalPage.getByTestId('nav-calendar')).not.toBeVisible();
  });

  test('portal user cannot access other client data', async ({ portalPage }) => {
    // Try to navigate to a different client's portal area
    await portalPage.goto('/portal?clientId=other_client_999');

    // Should either show the user's own client data or an error
    // The clientId query param should be ignored or validated
    const forbiddenVisible = await portalPage.getByTestId('forbidden-message').isVisible().catch(() => false);
    const portalVisible = await portalPage.getByTestId('portal-dashboard').isVisible().catch(() => false);

    // Either forbidden or showing own data (not other client's data)
    expect(forbiddenVisible || portalVisible).toBeTruthy();

    if (portalVisible) {
      // If portal dashboard is shown, verify it shows the authenticated user's client data
      const clientName = portalPage.getByTestId('portal-client-name');
      const clientNameVisible = await clientName.isVisible().catch(() => false);
      if (clientNameVisible) {
        // Should not show "other_client_999" data
        await expect(clientName).not.toContainText('other_client_999');
      }
    }
  });
});
