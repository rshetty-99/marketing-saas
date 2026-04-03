/**
 * AI Chatbot / Lead Capture Service
 * Chatbot configuration, sessions, messages, lead routing.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ── Chatbot Configs ────────────────────────────────────────

export async function listChatbots(workspaceId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('chatbot_configs').orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getChatbot(workspaceId: string, chatbotId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('chatbot_configs').doc(chatbotId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createChatbot(
  workspaceId: string,
  data: Record<string, unknown>,
  createdBy: string,
) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('chatbot_configs').doc();
  const embedCode = `<script src="https://cdn.aura.ai/chatbot.js" data-chatbot-id="${ref.id}" data-workspace="${workspaceId}" async></script>`;
  await ref.set({
    id: ref.id, workspaceId, isActive: false,
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?',
    fallbackMessage: 'Let me connect you with a team member.',
    aiEnabled: true, collectEmail: true, collectPhone: false, collectName: true,
    routeToCrm: true, routeToCalendar: false, notifyTeamOnLead: true,
    embedCode, ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateChatbot(workspaceId: string, chatbotId: string, data: Record<string, unknown>) {
  await adminDb.collection('workspaces').doc(workspaceId)
    .collection('chatbot_configs').doc(chatbotId)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

// ── Chat Sessions ──────────────────────────────────────────

export async function listChatSessions(workspaceId: string, chatbotId?: string) {
  let query = adminDb.collection('workspaces').doc(workspaceId)
    .collection('chat_sessions').orderBy('startedAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (chatbotId) query = query.where('chatbotId', '==', chatbotId);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getChatMessages(workspaceId: string, sessionId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('chat_sessions').doc(sessionId).collection('messages')
    .orderBy('timestamp', 'asc').limit(200).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
