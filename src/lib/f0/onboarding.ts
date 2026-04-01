import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { workspaceConverter } from '@/lib/firebase/converters/workspace';
import type { AccountType } from '@/types/roles';

interface OnboardingState {
  step: number;
  completed: boolean;
  accountType: AccountType;
}

/**
 * Reads the workspace document and returns the current onboarding state.
 */
export async function getOnboardingState(workspaceId: string): Promise<OnboardingState> {
  try {
    const workspaceSnap = await adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .withConverter(workspaceConverter)
      .get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const workspace = workspaceSnap.data();
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} data is empty`);
    }

    return {
      step: workspace.onboardingStep,
      completed: workspace.onboardingCompleted,
      accountType: workspace.accountType,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get onboarding state: ${message}`);
  }
}

/**
 * Updates the onboarding step for the workspace.
 * Validates that step is a positive integer.
 */
export async function updateOnboardingStep(workspaceId: string, step: number): Promise<void> {
  if (!Number.isInteger(step) || step < 1) {
    throw new Error(`Invalid onboarding step: ${step}`);
  }

  try {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceSnap = await workspaceRef.get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    await workspaceRef.update({
      onboardingStep: step,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update onboarding step: ${message}`);
  }
}

/**
 * Marks onboarding as completed for the workspace.
 * Sets onboardingCompleted to true and records the completion timestamp.
 */
export async function completeOnboarding(workspaceId: string): Promise<void> {
  try {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceSnap = await workspaceRef.get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    await workspaceRef.update({
      onboardingCompleted: true,
      onboardingCompletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to complete onboarding: ${message}`);
  }
}
