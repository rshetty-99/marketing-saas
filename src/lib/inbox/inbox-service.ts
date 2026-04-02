/**
 * Unified Inbox Service
 * Manages inbox items, replies, assignment, SLA tracking.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function listInboxItems(
  workspaceId: string,
  filters: { status?: string; platform?: string; assignedTo?: string; limit?: number } = {},
) {
  let query = adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items')
    .orderBy('receivedAt', 'desc').limit(filters.limit ?? 50) as FirebaseFirestore.Query;
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.platform) query = query.where('platform', '==', filters.platform);
  if (filters.assignedTo) query = query.where('assignedTo', '==', filters.assignedTo);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function assignInboxItem(workspaceId: string, itemId: string, assignedTo: string) {
  await adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items').doc(itemId).update({
    assignedTo, status: 'assigned', updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function replyToInboxItem(
  workspaceId: string, itemId: string, content: string, responderId: string,
) {
  const replyRef = adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items').doc(itemId).collection('replies').doc();
  await replyRef.set({
    id: replyRef.id, inboxItemId: itemId, responderId, content,
    sentVia: 'unified_inbox', deliveryStatus: 'sent', sentAt: FieldValue.serverTimestamp(),
  });
  await adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items').doc(itemId).update({
    status: 'replied', firstResponseAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function archiveInboxItem(workspaceId: string, itemId: string) {
  await adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items').doc(itemId).update({
    status: 'archived', updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function snoozeInboxItem(workspaceId: string, itemId: string, until: Date, snoozedBy: string) {
  await adminDb.collection('workspaces').doc(workspaceId).collection('inbox_items').doc(itemId).update({
    status: 'snoozed', snoozedUntil: until, snoozedBy, updatedAt: FieldValue.serverTimestamp(),
  });
}

// Mock inbox items for dev
export function generateMockInboxItems(): Record<string, unknown>[] {
  return [
    { id: 'inbox_1', platform: 'instagram', type: 'comment', content: 'Love this post! 🔥', authorHandle: '@sarah_design', status: 'new', priority: 'normal', sentiment: 'positive', receivedAt: new Date().toISOString(), slaBreach: false },
    { id: 'inbox_2', platform: 'linkedin', type: 'comment', content: 'Great insights on marketing automation. Would love to connect.', authorHandle: 'John Marketing', status: 'new', priority: 'high', sentiment: 'positive', receivedAt: new Date().toISOString(), slaBreach: false },
    { id: 'inbox_3', platform: 'facebook', type: 'dm', content: 'Hi, I have a question about your services.', authorHandle: 'Emily Chen', status: 'assigned', priority: 'high', sentiment: 'neutral', receivedAt: new Date(Date.now() - 3600000).toISOString(), slaBreach: false },
    { id: 'inbox_4', platform: 'twitter', type: 'mention', content: '@aura_mktg Your latest campaign was impressive!', authorHandle: '@techstartup', status: 'new', priority: 'normal', sentiment: 'positive', receivedAt: new Date(Date.now() - 7200000).toISOString(), slaBreach: false },
  ];
}
