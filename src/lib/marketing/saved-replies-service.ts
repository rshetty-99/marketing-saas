/**
 * Saved Replies / Response Templates Service
 * Quick responses for unified inbox, with variables and shortcuts.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('saved_replies');

export async function listSavedReplies(workspaceId: string, category?: string) {
  let query = col(workspaceId).orderBy('usageCount', 'desc').limit(100) as FirebaseFirestore.Query;
  if (category) query = query.where('category', '==', category);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSavedReply(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  // Extract variables from content ({{varName}} pattern)
  const content = (data.content as string) ?? '';
  const variables = [...content.matchAll(/\{\{(\w+)\}\}/g)].map((m) => `{{${m[1]}}}`);

  await ref.set({
    id: ref.id, workspaceId, usageCount: 0, category: 'general', variables,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateSavedReply(workspaceId: string, replyId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(replyId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteSavedReply(workspaceId: string, replyId: string) {
  await col(workspaceId).doc(replyId).delete();
}

export async function incrementReplyUsage(workspaceId: string, replyId: string) {
  await col(workspaceId).doc(replyId).update({
    usageCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
