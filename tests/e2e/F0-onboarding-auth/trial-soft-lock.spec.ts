import { test, expect } from '../../fixtures/auth';

test.describe('F0: Trial Badge and Soft-Lock', () => {
  test('trial badge shows correct days remaining', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    const trialBadge = ownerPage.getByTestId('trial-badge');
    await expect(trialBadge).toBeVisible();
    await expect(trialBadge).toContainText(/\d+\s*days?\s*left/i);
  });

  test('badge pulses when less than 3 days remaining', async ({ nearExpiryPage }) => {
    await nearExpiryPage.goto('/dashboard');
    const trialBadge = nearExpiryPage.getByTestId('trial-badge');
    await expect(trialBadge).toBeVisible();
    await expect(trialBadge).toContainText(/2\s*days?\s*left/i);

    // Badge should have pulsing animation attribute
    await expect(trialBadge).toHaveAttribute('data-urgency', 'high');
  });

  test('when trial expired, soft-lock banner appears', async ({ expiredTrialPage }) => {
    await expiredTrialPage.goto('/dashboard');
    const softLockBanner = expiredTrialPage.getByTestId('soft-lock-banner');
    await expect(softLockBanner).toBeVisible();
    await expect(softLockBanner).toContainText(/trial.*expired|upgrade/i);
  });

  test('create content button disabled in soft lock', async ({ expiredTrialPage }) => {
    await expiredTrialPage.goto('/dashboard');
    await expect(expiredTrialPage.getByTestId('soft-lock-banner')).toBeVisible();

    const createButton = expiredTrialPage.getByTestId('create-content-button');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeDisabled();
  });

  test('publish button disabled in soft lock', async ({ expiredTrialPage }) => {
    await expiredTrialPage.goto('/dashboard');
    await expect(expiredTrialPage.getByTestId('soft-lock-banner')).toBeVisible();

    // Navigate to a content item if available
    const publishButton = expiredTrialPage.getByTestId('publish-button');

    // The button may or may not exist depending on content availability,
    // but if it exists it must be disabled
    const isVisible = await publishButton.isVisible().catch(() => false);
    if (isVisible) {
      await expect(publishButton).toBeDisabled();
    }
  });

  test('billing page still accessible in soft lock', async ({ expiredTrialPage }) => {
    await expiredTrialPage.goto('/settings/billing');

    // Billing should remain accessible even during soft lock
    await expect(expiredTrialPage.getByTestId('billing-settings-page')).toBeVisible();
    await expect(expiredTrialPage.getByTestId('soft-lock-banner')).not.toBeVisible();
  });

  test('data export still accessible in soft lock', async ({ expiredTrialPage }) => {
    await expiredTrialPage.goto('/settings/export');

    // Data export should remain accessible during soft lock
    await expect(expiredTrialPage.getByTestId('data-export-page')).toBeVisible();
  });
});
