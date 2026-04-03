/**
 * RSS-to-Social Auto-Posting Service
 * Monitor RSS feeds, auto-create and publish social posts.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const feedCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('rss_feeds');
const itemCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('rss_items');

export async function listRSSFeeds(workspaceId: string) {
  const snap = await feedCol(workspaceId).orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createRSSFeed(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = feedCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, isActive: true, autoPost: false,
    pollIntervalMinutes: 60, maxPostsPerPoll: 3, includeImage: true,
    contentTemplate: '{{title}} - {{link}}',
    postTo: [], itemsProcessed: 0, itemsPosted: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateRSSFeed(workspaceId: string, feedId: string, data: Record<string, unknown>) {
  await feedCol(workspaceId).doc(feedId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteRSSFeed(workspaceId: string, feedId: string) {
  await feedCol(workspaceId).doc(feedId).delete();
}

export async function listRSSItems(workspaceId: string, feedId: string) {
  const snap = await itemCol(workspaceId)
    .where('feedId', '==', feedId)
    .orderBy('publishedAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function processRSSItem(workspaceId: string, feedId: string, item: Record<string, unknown>) {
  const ref = itemCol(workspaceId).doc();
  await ref.set({
    id: ref.id, feedId, workspaceId, autoPosted: false, postedContentIds: [],
    ...item,
    processedAt: FieldValue.serverTimestamp(),
  });

  // Increment feed counters
  await feedCol(workspaceId).doc(feedId).update({
    itemsProcessed: FieldValue.increment(1),
    lastPolledAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}
