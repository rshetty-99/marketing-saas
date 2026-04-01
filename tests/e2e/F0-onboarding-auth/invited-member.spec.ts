import { test, expect } from '../../fixtures/auth';

test.describe('F0: Invited Member Experience', () => {
  test('invited user lands on welcome screen', async ({ invitedMemberPage }) => {
    await invitedMemberPage.goto('/welcome');
    await expect(invitedMemberPage.getByTestId('welcome-screen')).toBeVisible();
  });

  test('welcome screen shows workspace name', async ({ invitedMemberPage }) => {
    await invitedMemberPage.goto('/welcome');
    const workspaceName = invitedMemberPage.getByTestId('welcome-workspace-name');
    await expect(workspaceName).toBeVisible();
    await expect(workspaceName).not.toBeEmpty();
  });

  test('welcome screen shows assigned role and description', async ({ invitedMemberPage }) => {
    await invitedMemberPage.goto('/welcome');

    const roleLabel = invitedMemberPage.getByTestId('welcome-assigned-role');
    await expect(roleLabel).toBeVisible();
    await expect(roleLabel).toContainText(/editor|viewer|admin|manager|owner/i);

    const roleDescription = invitedMemberPage.getByTestId('welcome-role-description');
    await expect(roleDescription).toBeVisible();
    await expect(roleDescription).not.toBeEmpty();
  });

  test('can click "Get Started" to enter dashboard', async ({ invitedMemberPage }) => {
    await invitedMemberPage.goto('/welcome');

    const getStartedButton = invitedMemberPage.getByRole('button', { name: /get started/i });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    await expect(invitedMemberPage).toHaveURL(/\/dashboard/);
    await expect(invitedMemberPage.getByTestId('dashboard-main')).toBeVisible();
  });

  test('feature access matches assigned role', async ({ invitedMemberPage }) => {
    await invitedMemberPage.goto('/welcome');
    await invitedMemberPage.getByRole('button', { name: /get started/i }).click();
    await expect(invitedMemberPage).toHaveURL(/\/dashboard/);

    // Invited member is an editor, should see content creation
    await expect(invitedMemberPage.getByTestId('nav-content-create')).toBeVisible();

    // Editor should NOT see settings/members management
    await expect(invitedMemberPage.getByTestId('nav-settings-members')).not.toBeVisible();
  });
});
