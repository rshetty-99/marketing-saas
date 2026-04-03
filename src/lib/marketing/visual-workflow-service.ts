/**
 * Visual Workflow Builder Service
 * Drag-and-drop automation with nodes and edges.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('visual_workflows');

export async function listVisualWorkflows(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getVisualWorkflow(workspaceId: string, workflowId: string) {
  const doc = await col(workspaceId).doc(workflowId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createVisualWorkflow(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    nodes: [], edges: [],
    enrollmentCount: 0, completionCount: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateVisualWorkflow(workspaceId: string, workflowId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(workflowId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}
