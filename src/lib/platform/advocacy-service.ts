/**
 * Employee Advocacy Service
 * Push approved content to employee social accounts.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const progCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('advocacy_programs');
const postCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('advocacy_posts');

export async function listPrograms(workspaceId: string) {
  const snap = await progCol(workspaceId).orderBy('createdAt', 'desc').limit(10).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createProgram(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = progCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, isActive: true, memberIds: [], totalShares: 0, totalReach: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function listAdvocacyPosts(workspaceId: string, programId?: string) {
  let query = postCol(workspaceId).orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (programId) query = query.where('programId', '==', programId);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAdvocacyPost(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = postCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft', shareCount: 0, targetPlatforms: ['linkedin'],
    ...data,
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}
