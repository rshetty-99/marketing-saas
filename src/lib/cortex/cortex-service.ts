/**
 * Cortex Session CRUD Service
 * Manages sessions and messages in Firestore.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

function sessionsCol(workspaceId: string) {
  return adminDb.collection('workspaces').doc(workspaceId).collection('cortex_sessions');
}

function messagesCol(workspaceId: string, sessionId: string) {
  return sessionsCol(workspaceId).doc(sessionId).collection('messages');
}

export async function createSession(workspaceId: string, userId: string, clientId?: string): Promise<string> {
  const ref = sessionsCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, userId, clientId: clientId ?? null,
    title: 'New conversation', messageCount: 0, status: 'active',
    creditsConsumed: 0, tokensConsumed: 0,
    lastMessageAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    createdBy: userId,
  });
  return ref.id;
}

export async function getSession(workspaceId: string, sessionId: string) {
  const doc = await sessionsCol(workspaceId).doc(sessionId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function listSessions(workspaceId: string, userId: string, limit: number = 20) {
  const snap = await sessionsCol(workspaceId)
    .where('userId', '==', userId)
    .orderBy('lastMessageAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateSessionTitle(workspaceId: string, sessionId: string, title: string) {
  await sessionsCol(workspaceId).doc(sessionId).update({
    title, updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function addMessage(
  workspaceId: string,
  sessionId: string,
  message: {
    role: string;
    content: string;
    inputMethod?: string;
    toolCalls?: Record<string, unknown>[];
    tokenUsage?: { input: number; output: number };
  },
  createdBy: string,
) {
  const ref = messagesCol(workspaceId, sessionId).doc();
  await ref.set({
    id: ref.id, workspaceId, ...message,
    inputMethod: message.inputMethod ?? 'text',
    timestamp: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    createdBy,
  });

  // Update session counters
  const sessionRef = sessionsCol(workspaceId).doc(sessionId);
  const updateData: Record<string, unknown> = {
    messageCount: FieldValue.increment(1),
    lastMessageAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (message.tokenUsage) {
    updateData.tokensConsumed = FieldValue.increment(
      message.tokenUsage.input + message.tokenUsage.output,
    );
  }
  await sessionRef.update(updateData);

  return ref.id;
}

export async function getSessionMessages(workspaceId: string, sessionId: string, limit: number = 50) {
  const snap = await messagesCol(workspaceId, sessionId)
    .orderBy('timestamp', 'asc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateMessageFeedback(
  workspaceId: string,
  sessionId: string,
  messageId: string,
  feedback: Record<string, unknown>,
) {
  await messagesCol(workspaceId, sessionId).doc(messageId).update({
    feedback, updatedAt: FieldValue.serverTimestamp(),
  });
}
