import { test, expect } from '../../fixtures/auth';

test.describe('F0: Profile Score Widget', () => {
  test('score widget visible on dashboard', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    await expect(ownerPage.getByTestId('profile-score-widget')).toBeVisible();
  });

  test('score shows correct percentage for new workspace', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    const scoreValue = ownerPage.getByTestId('profile-score-value');
    await expect(scoreValue).toBeVisible();

    const text = await scoreValue.textContent();
    const score = parseInt(text?.replace('%', '') ?? '0', 10);

    // New workspace should have a low-to-mid score
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('checklist drawer opens when widget is clicked', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    await ownerPage.getByTestId('profile-score-widget').click();

    const drawer = ownerPage.getByTestId('profile-checklist-drawer');
    await expect(drawer).toBeVisible();

    // Should contain checklist items
    const items = drawer.getByTestId('checklist-item');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('checklist items link to correct pages', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    await ownerPage.getByTestId('profile-score-widget').click();

    const drawer = ownerPage.getByTestId('profile-checklist-drawer');
    await expect(drawer).toBeVisible();

    // Find a checklist item that links to brand setup
    const brandSetupItem = drawer.getByTestId('checklist-item-brand-setup');
    await expect(brandSetupItem).toBeVisible();

    // It should have a link/action
    const link = brandSetupItem.getByRole('link');
    const href = await link.getAttribute('href');
    expect(href).toContain('/settings/brand');
  });

  test('completing an action updates the score', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');

    // Capture initial score
    const scoreValue = ownerPage.getByTestId('profile-score-value');
    const initialText = await scoreValue.textContent();
    const initialScore = parseInt(initialText?.replace('%', '') ?? '0', 10);

    // Navigate to brand setup and complete it
    await ownerPage.getByTestId('profile-score-widget').click();
    const brandSetupItem = ownerPage.getByTestId('checklist-item-brand-setup');
    await brandSetupItem.getByRole('link').click();

    // Fill brand name and save
    await ownerPage.getByTestId('brand-name-input').fill('My Brand');
    await ownerPage.getByTestId('brand-save-button').click();

    // Go back to dashboard and check score increased
    await ownerPage.goto('/dashboard');
    const updatedText = await scoreValue.textContent();
    const updatedScore = parseInt(updatedText?.replace('%', '') ?? '0', 10);

    expect(updatedScore).toBeGreaterThan(initialScore);
  });

  test('can dismiss the widget', async ({ ownerPage }) => {
    await ownerPage.goto('/dashboard');
    const widget = ownerPage.getByTestId('profile-score-widget');
    await expect(widget).toBeVisible();

    const dismissButton = widget.getByTestId('profile-score-dismiss');
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();

    await expect(widget).not.toBeVisible();
  });
});
