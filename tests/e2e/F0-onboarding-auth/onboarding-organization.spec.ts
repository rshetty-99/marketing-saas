import { test, expect } from '../../fixtures/auth';

test.describe.configure({ mode: 'serial' });

test.describe('F0: Organization Onboarding Flow', () => {
  test('can select Organization type', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    // Should proceed to workspace step
    await expect(newUserPage.getByTestId('workspace-name-input')).toBeVisible({ timeout: 15000 });
  });

  test('sees team invite step after brand setup', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    // Fill workspace name
    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    // Skip brand setup
    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Team invite step should appear for organization
    await expect(newUserPage.getByTestId('onboarding-team')).toBeVisible({ timeout: 15000 });
  });

  test('can add team member emails with role selection', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Team invite step — first row is pre-created
    const emailInput = newUserPage.getByTestId('team-invite-email-input');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill('teammate@acme.com');

    // Role selector should be present
    const roleSelect = newUserPage.getByTestId('team-invite-role-select');
    await expect(roleSelect).toBeVisible();

    // Verify the email is in the input
    await expect(emailInput).toHaveValue('teammate@acme.com');
  });

  test('can add multiple team members', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Wait for team invite step
    await newUserPage.getByTestId('team-invite-email-input').waitFor({ state: 'visible', timeout: 15000 });

    // Fill first row
    await newUserPage.getByTestId('team-invite-email-input').fill('alice@acme.com');

    // Click "Add another" to create a second row
    await newUserPage.getByTestId('team-invite-add-button').click();

    // Fill second row (new row gets indexed test ID)
    const secondEmailInput = newUserPage.getByTestId('team-invite-email-input-1');
    await expect(secondEmailInput).toBeVisible();
    await secondEmailInput.fill('bob@acme.com');

    // Both email values should be in their inputs
    await expect(newUserPage.getByTestId('team-invite-email-input')).toHaveValue('alice@acme.com');
    await expect(secondEmailInput).toHaveValue('bob@acme.com');
  });

  test('can skip team invite step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // On team invite step, click skip
    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    // Should advance past team invite
    await expect(newUserPage.getByTestId('onboarding-team')).not.toBeVisible({ timeout: 5000 });
  });

  test('lands on dashboard after completing onboarding', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    await expect(newUserPage).toHaveURL(/\/(dashboard|onboarding\/complete)/, { timeout: 15000 });
    if (newUserPage.url().includes('/onboarding/complete')) {
      await expect(newUserPage).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }
    await expect(newUserPage.getByTestId('profile-score-widget')).toBeVisible({ timeout: 10000 });
  });

  test('does NOT see client creation step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Acme Corp');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    // Client creation should never appear for organization type
    await expect(newUserPage.getByTestId('onboarding-client')).not.toBeVisible({ timeout: 5000 });
  });
});
