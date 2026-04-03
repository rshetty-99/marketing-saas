/**
 * Two-Way SMS / WhatsApp Messaging Service
 * Config management, conversations, message CRUD.
 * Production: Twilio integration. Dev: mock data.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ── Messaging Config ───────────────────────────────────────

export async function getMessagingConfig(workspaceId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('messaging').get();
  return doc.exists ? doc.data() : null;
}

export async function upsertMessagingConfig(workspaceId: string, data: Record<string, unknown>) {
  const ref = adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('messaging');
  const existing = await ref.get();
  if (existing.exists) {
    await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  } else {
    await ref.set({
      workspaceId, smsEnabled: false, whatsappEnabled: false,
      ...data,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

// ── Conversations ──────────────────────────────────────────

export async function listConversations(workspaceId: string, channel?: string) {
  let query = adminDb.collection('workspaces').doc(workspaceId)
    .collection('sms_conversations').orderBy('lastMessageAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (channel) query = query.where('channel', '==', channel);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getConversation(workspaceId: string, conversationId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('sms_conversations').doc(conversationId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createConversation(
  workspaceId: string,
  data: Record<string, unknown>,
) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('sms_conversations').doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'active', messageCount: 0,
    ...data,
    lastMessageAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// ── Messages ───────────────────────────────────────────────

export async function listMessages(workspaceId: string, conversationId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('sms_conversations').doc(conversationId).collection('messages')
    .orderBy('sentAt', 'asc').limit(200).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function sendMessage(
  workspaceId: string,
  conversationId: string,
  content: string,
  mediaUrl?: string,
) {
  const convRef = adminDb.collection('workspaces').doc(workspaceId)
    .collection('sms_conversations').doc(conversationId);
  const msgRef = convRef.collection('messages').doc();

  // In production, send via Twilio API here
  // For now, create the message doc with 'sent' status (mock)
  await msgRef.set({
    id: msgRef.id, conversationId, direction: 'outbound', content,
    mediaUrl: mediaUrl ?? null, status: 'sent',
    sentAt: FieldValue.serverTimestamp(),
  });

  await convRef.update({
    messageCount: FieldValue.increment(1),
    lastMessageAt: FieldValue.serverTimestamp(),
  });

  return msgRef.id;
}
