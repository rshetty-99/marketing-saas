/**
 * Content Library / Reusable Snippets Service
 * Shared text blocks, CTAs, disclaimers, hashtag sets.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('content_snippets');

export async function listSnippets(workspaceId: string, snippetType?: string) {
  let query = col(workspaceId).orderBy('usageCount', 'desc').limit(100) as FirebaseFirestore.Query;
  if (snippetType) query = query.where('snippetType', '==', snippetType);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSnippet(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, usageCount: 0, isFavorite: false, tags: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateSnippet(workspaceId: string, snippetId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(snippetId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteSnippet(workspaceId: string, snippetId: string) {
  await col(workspaceId).doc(snippetId).delete();
}

export async function incrementSnippetUsage(workspaceId: string, snippetId: string) {
  await col(workspaceId).doc(snippetId).update({
    usageCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
