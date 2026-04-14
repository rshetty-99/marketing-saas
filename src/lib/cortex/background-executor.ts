/**
 * Cortex Background Executor — Phase 11B
 * Handles long-running campaigns (30s+ / 5+ steps) by:
 * 1. Executing first 3 steps synchronously (user watches)
 * 2. Handing off remaining steps to background
 * 3. Sending notification when complete
 *
 * Decision 5: Sync <30s / <5 steps, background handoff for longer.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface CampaignStep {
  id: string;
  name: string;
  toolName: string;
  args: Record<string, unknown>;
  dependsOn: string[];                // Step IDs this depends on
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  result?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

export interface CampaignExecution {
  id: string;
  workspaceId: string;
  sessionId: string;
  userId: string;
  name: string;
  steps: CampaignStep[];
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  status: 'planning' | 'executing' | 'background' | 'completed' | 'failed' | 'partial';
  startedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  completedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

const executionsCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('campaign_executions');

/**
 * Create a campaign execution plan.
 */
export async function createExecution(
  workspaceId: string,
  sessionId: string,
  userId: string,
  name: string,
  steps: Omit<CampaignStep, 'status' | 'result' | 'error' | 'durationMs'>[],
): Promise<string> {
  const ref = executionsCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, sessionId, userId, name,
    steps: steps.map((s) => ({ ...s, status: 'pending' })),
    totalSteps: steps.length, completedSteps: 0, failedSteps: 0,
    status: 'planning',
    startedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update a step's status in a campaign execution.
 */
export async function updateStepStatus(
  workspaceId: string,
  executionId: string,
  stepId: string,
  update: { status: string; result?: Record<string, unknown>; error?: string; durationMs?: number },
) {
  const ref = executionsCol(workspaceId).doc(executionId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data()!;
  const steps = (data.steps as CampaignStep[]).map((s) =>
    s.id === stepId ? { ...s, ...update } : s,
  );

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const failedSteps = steps.filter((s) => s.status === 'failed').length;
  const allDone = steps.every((s) => s.status === 'completed' || s.status === 'failed' || s.status === 'skipped');

  await ref.update({
    steps,
    completedSteps,
    failedSteps,
    status: allDone
      ? (failedSteps > 0 ? 'partial' : 'completed')
      : data.status,
    ...(allDone ? { completedAt: FieldValue.serverTimestamp() } : {}),
  });
}

/**
 * Mark execution as moved to background processing.
 */
export async function markAsBackground(workspaceId: string, executionId: string) {
  await executionsCol(workspaceId).doc(executionId).update({ status: 'background' });
}

/**
 * Get execution status.
 */
export async function getExecution(workspaceId: string, executionId: string) {
  const doc = await executionsCol(workspaceId).doc(executionId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * List executions for a workspace.
 */
export async function listExecutions(workspaceId: string, limit: number = 20) {
  const snap = await executionsCol(workspaceId).limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Check if a step's dependencies are all completed.
 * Decision 6: Dependency-aware — only skip if downstream doesn't depend on failed.
 */
export function canExecuteStep(step: CampaignStep, allSteps: CampaignStep[]): boolean {
  if (step.dependsOn.length === 0) return true;
  return step.dependsOn.every((depId) => {
    const dep = allSteps.find((s) => s.id === depId);
    return dep?.status === 'completed';
  });
}

/**
 * Check if a step can be skipped (its dependees don't depend on it).
 */
export function canSkipStep(stepId: string, allSteps: CampaignStep[]): boolean {
  const dependents = allSteps.filter((s) => s.dependsOn.includes(stepId));
  return dependents.length === 0;
}

/**
 * Determine if campaign should handoff to background.
 * Decision 5: >30s estimated OR >5 steps.
 */
export function shouldHandoffToBackground(
  steps: CampaignStep[],
  currentStepIndex: number,
  elapsedMs: number,
): boolean {
  const remainingSteps = steps.length - currentStepIndex;
  return remainingSteps > 5 || elapsedMs > 30000;
}
