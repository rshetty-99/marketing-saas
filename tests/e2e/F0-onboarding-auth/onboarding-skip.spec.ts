import { test, expect } from '../../fixtures/auth';

test.describe('F0: Skip Steps in Onboarding', () => {
  test('can skip brand setup step', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-freelancer').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Skip Test Studio');
    await newUserPage.getByTestId('onboarding-next-button').click();

    // On brand setup step
    await expect(newUserPage.getByTestId('onboarding-step-brand-setup')).toBeVisible();

    // Skip it
    await newUserPage.getByTestId('onboarding-skip-button').click();

    // Brand setup step should no longer be visible
    await expect(newUserPage.getByTestId('onboarding-step-brand-setup')).not.toBeVisible();
  });

  test('can skip team invite step for organization', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-organization').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Skip Org');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand

    // On team invite step
    await expect(newUserPage.getByTestId('onboarding-step-team-invite')).toBeVisible();
    await newUserPage.getByTestId('onboarding-skip-button').click();

    // Should proceed to dashboard (org has no client step)
    await expect(newUserPage).toHaveURL(/\/dashboard/);
  });

  test('can skip team invite step for agency', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Skip Agency');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand

    await expect(newUserPage.getByTestId('onboarding-step-team-invite')).toBeVisible();
    await newUserPage.getByTestId('onboarding-skip-button').click();

    // Agency should advance to client creation (not dashboard yet)
    await expect(newUserPage.getByTestId('onboarding-step-client-creation')).toBeVisible();
  });

  test('can skip client creation step for agency', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Skip Agency');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip team

    await expect(newUserPage.getByTestId('onboarding-step-client-creation')).toBeVisible();
    await newUserPage.getByTestId('onboarding-skip-button').click();

    await expect(newUserPage).toHaveURL(/\/dashboard/);
  });

  test('onboarding still completes when all optional steps are skipped', async ({
    newUserPage,
  }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('All Skipped Agency');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip team
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip client

    // Should still land on dashboard successfully
    await expect(newUserPage).toHaveURL(/\/dashboard/);
    await expect(newUserPage.getByTestId('dashboard-main')).toBeVisible();
  });

  test('profile score reflects skipped steps with lower percentage', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await newUserPage.getByTestId('account-type-agency').click();
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('workspace-name-input').fill('Score Test Agency');
    await newUserPage.getByTestId('onboarding-next-button').click();
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip brand
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip team
    await newUserPage.getByTestId('onboarding-skip-button').click(); // skip client

    await expect(newUserPage).toHaveURL(/\/dashboard/);

    const scoreWidget = newUserPage.getByTestId('profile-score-widget');
    await expect(scoreWidget).toBeVisible();

    // Score should be low since all optional steps were skipped
    const scoreValue = newUserPage.getByTestId('profile-score-value');
    await expect(scoreValue).toBeVisible();
    const scoreText = await scoreValue.textContent();
    const scoreNumber = parseInt(scoreText?.replace('%', '') ?? '0', 10);

    // Skipping all steps should result in a score well below 100
    expect(scoreNumber).toBeLessThanOrEqual(50);
    expect(scoreNumber).toBeGreaterThan(0);
  });
});
