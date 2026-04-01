import { test, expect } from '../../fixtures/auth';

test.describe('F0: Platform Admin Access', () => {
  test('platform user can access /admin', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage).toHaveURL(/\/admin/);
    await expect(adminPage.getByTestId('admin-dashboard')).toBeVisible();
  });

  test('admin dashboard shows metrics cards', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.getByTestId('admin-dashboard')).toBeVisible();

    // Should display platform-level metrics
    const metricsSection = adminPage.getByTestId('admin-metrics-cards');
    await expect(metricsSection).toBeVisible();

    // Expect at least total workspaces, active users, revenue metrics
    await expect(adminPage.getByTestId('metric-card-total-workspaces')).toBeVisible();
    await expect(adminPage.getByTestId('metric-card-active-users')).toBeVisible();
    await expect(adminPage.getByTestId('metric-card-revenue')).toBeVisible();
  });

  test('can navigate to /admin/team', async ({ adminPage }) => {
    await adminPage.goto('/admin');

    const teamNavLink = adminPage.getByTestId('admin-nav-team');
    await expect(teamNavLink).toBeVisible();
    await teamNavLink.click();

    await expect(adminPage).toHaveURL(/\/admin\/team/);
  });

  test('can see platform team members table', async ({ adminPage }) => {
    await adminPage.goto('/admin/team');

    const teamTable = adminPage.getByTestId('platform-team-table');
    await expect(teamTable).toBeVisible();

    // Table should have column headers
    await expect(adminPage.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(adminPage.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(adminPage.getByRole('columnheader', { name: /role/i })).toBeVisible();
  });

  test('can create a new platform user', async ({ adminPage }) => {
    await adminPage.goto('/admin/team');

    const addButton = adminPage.getByTestId('add-platform-user-button');
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Modal or form should appear
    const addUserForm = adminPage.getByTestId('add-platform-user-form');
    await expect(addUserForm).toBeVisible();

    // Fill in the form
    await adminPage.getByTestId('platform-user-email-input').fill('newadmin@platform.com');
    await adminPage.getByTestId('platform-user-role-select').selectOption('platform_support');
    await adminPage.getByTestId('platform-user-submit-button').click();

    // Should show success or the new user in the table
    const successMessage = adminPage.getByTestId('platform-user-success');
    await expect(successMessage).toBeVisible();
  });
});
