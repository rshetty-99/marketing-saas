import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { workspaceConverter } from '@/lib/firebase/converters/workspace';

const TRIAL_DAYS = 15;

interface TrialStatus {
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
}

/**
 * Initiate a trial for a workspace.
 * Sets trialEndsAt to 15 days from now and status to 'trial'.
 */
export async function initiateTrial(workspaceId: string): Promise<void> {
  try {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceSnap = await workspaceRef.get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    await workspaceRef.update({
      status: 'trial',
      trialEndsAt: Timestamp.fromDate(trialEndsAt),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initiate trial: ${message}`);
  }
}

/**
 * Check the trial status of a workspace.
 * Returns status ('active', 'expiring', 'expired') and days remaining.
 * 'expiring' means 3 or fewer days remaining.
 */
export async function checkTrialStatus(workspaceId: string): Promise<TrialStatus> {
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

    if (!workspace.trialEndsAt) {
      return { status: 'expired', daysRemaining: 0 };
    }

    const trialEnd = workspace.trialEndsAt instanceof Timestamp
      ? workspace.trialEndsAt.toDate()
      : new Date(workspace.trialEndsAt as unknown as string);

    const now = new Date();
    const diffMs = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (daysRemaining <= 0) {
      return { status: 'expired', daysRemaining: 0 };
    }

    if (daysRemaining <= 3) {
      return { status: 'expiring', daysRemaining };
    }

    return { status: 'active', daysRemaining };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to check trial status: ${message}`);
  }
}

/**
 * Soft-lock a workspace by updating its status to 'soft_locked'.
 * This restricts functionality but preserves data.
 */
export async function softLockWorkspace(workspaceId: string): Promise<void> {
  try {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceSnap = await workspaceRef.get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    await workspaceRef.update({
      status: 'soft_locked',
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to soft-lock workspace: ${message}`);
  }
}

/**
 * Check and enforce trial expiration.
 * If the trial has expired and the workspace status is still 'trial',
 * automatically soft-lock the workspace.
 * Returns true if the workspace was soft-locked, false otherwise.
 */
export async function checkAndEnforceTrial(workspaceId: string): Promise<boolean> {
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

    // Only enforce on workspaces that are still in trial status
    if (workspace.status !== 'trial') {
      return false;
    }

    const trialStatus = await checkTrialStatus(workspaceId);

    if (trialStatus.status === 'expired') {
      await softLockWorkspace(workspaceId);
      return true;
    }

    return false;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to enforce trial: ${message}`);
  }
}
