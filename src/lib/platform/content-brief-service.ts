/**
 * Content Brief / Assignment Workflow Service
 * Brief creation, writer assignment, deadline tracking.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('content_briefs');

export async function listBriefs(workspaceId: string, status?: string) {
  let query = col(workspaceId).orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBrief(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    keyMessages: [], keywords: [], referenceLinks: [], competitorExamples: [],
    doList: [], dontList: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateBrief(workspaceId: string, briefId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(briefId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function assignBrief(workspaceId: string, briefId: string, assignedTo: string) {
  await col(workspaceId).doc(briefId).update({
    assignedTo, status: 'assigned', assignedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
