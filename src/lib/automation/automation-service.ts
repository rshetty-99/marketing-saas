/**
 * Automation Engine Service
 * Shared by lead nurture (F12) and drip email sequences (F11).
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function listWorkflows(workspaceId: string, status?: string) {
  let query = adminDb.collection('workspaces').doc(workspaceId).collection('automations')
    .orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createWorkflow(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('automations').doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    enrollmentCount: 0, completionCount: 0, goalMetCount: 0,
    conflictStrategy: 'skip', priority: 0, exitOnGoalMet: false,
    ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function enrollEntity(workspaceId: string, workflowId: string, entityId: string, entityType: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('workflow_enrollments').doc();
  await ref.set({
    id: ref.id, workflowId, workspaceId, entityId, entityType,
    currentStepIndex: 0, status: 'active',
    enrolledAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listEnrollments(workspaceId: string, workflowId?: string) {
  let query = adminDb.collection('workspaces').doc(workspaceId).collection('workflow_enrollments')
    .orderBy('enrolledAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (workflowId) query = query.where('workflowId', '==', workflowId);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
