import { test, expect } from '../../fixtures/auth';

test.describe.configure({ mode: 'serial' });

test.describe('F0: Agency Onboarding Flow', () => {
  test('can select Agency type', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    // Should proceed to workspace step
    await expect(newUserPage.getByTestId('workspace-name-input')).toBeVisible({ timeout: 15000 });
  });

  test('sees team invite step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Creative Agency');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await expect(newUserPage.getByTestId('onboarding-team')).toBeVisible({ timeout: 15000 });
  });

  test('sees client creation step after team invite', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Creative Agency');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    // Client creation step should appear for agency type
    await expect(newUserPage.getByTestId('onboarding-client')).toBeVisible({ timeout: 15000 });
  });

  test('can enter client details', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Creative Agency');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    // On client creation step
    const clientNameInput = newUserPage.getByTestId('client-name-input');
    await expect(clientNameInput).toBeVisible({ timeout: 15000 });
    await clientNameInput.fill('Big Corp Client');

    const clientEmailInput = newUserPage.getByTestId('client-email-input');
    await expect(clientEmailInput).toBeVisible();
    await clientEmailInput.fill('contact@bigcorp.com');

    const clientIndustrySelect = newUserPage.getByTestId('client-industry-select');
    await expect(clientIndustrySelect).toBeVisible();
  });

  test('can skip client creation', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Creative Agency');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    // On client creation step, skip it
    await newUserPage.getByTestId('client-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('client-skip').click();

    // Should proceed to complete/dashboard
    await expect(newUserPage).toHaveURL(/\/(dashboard|onboarding\/complete)/, { timeout: 15000 });
  });

  test('lands on dashboard after completing onboarding', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('Creative Agency');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await newUserPage.getByTestId('invite-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('invite-skip').click();

    await newUserPage.getByTestId('client-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('client-skip').click();

    await expect(newUserPage).toHaveURL(/\/(dashboard|onboarding\/complete)/, { timeout: 15000 });
    if (newUserPage.url().includes('/onboarding/complete')) {
      await expect(newUserPage).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }

    await expect(newUserPage.getByTestId('profile-score-widget')).toBeVisible({ timeout: 10000 });
  });
});
