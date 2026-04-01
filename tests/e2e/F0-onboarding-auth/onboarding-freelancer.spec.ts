import { test, expect } from '../../fixtures/auth';

test.describe.configure({ mode: 'serial' });

test.describe('F0: Freelancer Onboarding Flow', () => {
  test('can navigate to sign-up page', async ({ publicPage }) => {
    await publicPage.goto('/sign-up');
    await expect(publicPage).toHaveURL(/\/sign-up/);
    await expect(publicPage.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });

  test('sees account type selector after sign-up', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await expect(newUserPage.getByTestId('account-type-selector')).toBeVisible();
    await expect(newUserPage.getByTestId('account-type-freelancer')).toBeVisible();
    await expect(newUserPage.getByTestId('account-type-organization')).toBeVisible();
    await expect(newUserPage.getByTestId('account-type-agency')).toBeVisible();
  });

  test('can select Freelancer type and proceed to workspace step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    // Clicking the card triggers the API call and redirects to workspace step
    await expect(newUserPage.getByTestId('workspace-name-input')).toBeVisible({ timeout: 15000 });
  });

  test('can enter workspace name and submit', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    // Wait for workspace step
    const workspaceInput = newUserPage.getByTestId('workspace-name-input');
    await expect(workspaceInput).toBeVisible({ timeout: 15000 });
    await workspaceInput.fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    // Should advance to brand setup step
    await expect(newUserPage.getByTestId('onboarding-brand')).toBeVisible({ timeout: 15000 });
  });

  test('can fill brand setup or skip it', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    // Brand setup step should be visible
    await expect(newUserPage.getByTestId('onboarding-brand')).toBeVisible({ timeout: 15000 });

    // Can fill brand name
    const brandNameInput = newUserPage.getByTestId('brand-name-input');
    await expect(brandNameInput).toBeVisible();
    await brandNameInput.fill('My Brand');
  });

  test('does NOT see team invite step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    // Skip brand setup
    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Should NOT show team invite step for freelancers — should go to complete/dashboard
    await expect(newUserPage.getByTestId('onboarding-team')).not.toBeVisible({ timeout: 5000 });
  });

  test('does NOT see client creation step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Should NOT show client creation step for freelancers
    await expect(newUserPage.getByTestId('onboarding-client')).not.toBeVisible({ timeout: 5000 });
  });

  test('lands on dashboard with profile score widget', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    // Should land on dashboard or complete page
    await expect(newUserPage).toHaveURL(/\/(dashboard|onboarding\/complete)/, { timeout: 15000 });

    // If on complete page, it should redirect to dashboard
    if (newUserPage.url().includes('/onboarding/complete')) {
      await expect(newUserPage).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }

    // Profile score widget should be visible
    await expect(newUserPage.getByTestId('profile-score-widget')).toBeVisible({ timeout: 10000 });
  });

  test('trial badge shows "15 days left"', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();

    await newUserPage.getByTestId('workspace-name-input').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('workspace-name-input').fill('My Freelance Studio');
    await newUserPage.getByTestId('workspace-submit').click();

    await newUserPage.getByTestId('brand-skip').waitFor({ state: 'visible', timeout: 15000 });
    await newUserPage.getByTestId('brand-skip').click();

    await expect(newUserPage).toHaveURL(/\/(dashboard|onboarding\/complete)/, { timeout: 15000 });
    if (newUserPage.url().includes('/onboarding/complete')) {
      await expect(newUserPage).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }

    const trialBadge = newUserPage.getByTestId('trial-badge');
    await expect(trialBadge).toBeVisible({ timeout: 10000 });
    await expect(trialBadge).toContainText(/15\s*days?\s*left/i);
  });
});
