/**
 * Hashtag Research & Management Service
 * Hashtag groups, analytics, trending detection.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const groupCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('hashtag_groups');

export async function listHashtagGroups(workspaceId: string) {
  const snap = await groupCol(workspaceId).orderBy('usageCount', 'desc').limit(100).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createHashtagGroup(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = groupCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, usageCount: 0, platform: 'all', category: 'custom',
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateHashtagGroup(workspaceId: string, groupId: string, data: Record<string, unknown>) {
  await groupCol(workspaceId).doc(groupId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteHashtagGroup(workspaceId: string, groupId: string) {
  await groupCol(workspaceId).doc(groupId).delete();
}

export function mockHashtagAnalytics(hashtags: string[]): Record<string, unknown>[] {
  return hashtags.map((tag) => ({
    hashtag: tag.startsWith('#') ? tag : `#${tag}`,
    postCount: Math.floor(Math.random() * 100000) + 1000,
    avgEngagement: Math.random() * 5 + 0.5,
    reachEstimate: Math.floor(Math.random() * 500000) + 10000,
    difficulty: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    trending: Math.random() > 0.7,
    relatedHashtags: [`#${tag.replace('#', '')}life`, `#${tag.replace('#', '')}tips`, `#best${tag.replace('#', '')}`],
  }));
}
