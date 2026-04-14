/**
 * Cortex Memory Service — Phase 11C
 * Three-level memory hierarchy (Decision 10):
 * 1. Workspace-wide (clientId: null, userId: null) — shared by all
 * 2. Client-scoped (clientId: X, userId: null) — shared per-client
 * 3. User+Client (clientId: X, userId: Y) — personal per-client
 *
 * Auto-learning from feedback patterns (Decision 22):
 * 3 thumbs-down on same pattern → auto-creates low-confidence memory.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const memoryCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('cortex_memory');

export interface CortexMemory {
  id: string;
  workspaceId: string;
  clientId: string | null;
  userId: string | null;
  category: 'preference' | 'pattern' | 'insight';
  content: string;
  confidence: number;
  source: 'explicit' | 'inferred' | 'feedback';
  lastReferencedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

// ── Memory CRUD ────────────────────────────────────────────

export async function saveMemory(
  workspaceId: string,
  memory: { content: string; category: string; clientId?: string; userId?: string; confidence?: number; source?: string },
) {
  // Check for duplicates
  const existing = await memoryCol(workspaceId)
    .where('content', '==', memory.content)
    .limit(1)
    .get();

  if (!existing.empty) {
    // Update confidence instead of creating duplicate
    await existing.docs[0].ref.update({
      confidence: Math.min(1, ((existing.docs[0].data().confidence as number) ?? 0.5) + 0.1),
      lastReferencedAt: FieldValue.serverTimestamp(),
    });
    return existing.docs[0].id;
  }

  const ref = memoryCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId,
    clientId: memory.clientId ?? null,
    userId: memory.userId ?? null,
    category: memory.category,
    content: memory.content,
    confidence: memory.confidence ?? 0.5,
    source: memory.source ?? 'explicit',
    lastReferencedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function loadMemories(
  workspaceId: string,
  userId: string,
  clientId?: string,
): Promise<CortexMemory[]> {
  const memories: CortexMemory[] = [];

  // Level 1: Workspace-wide
  const wsSnap = await memoryCol(workspaceId)
    .where('clientId', '==', null)
    .where('userId', '==', null)
    .limit(100)
    .get();
  memories.push(...wsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CortexMemory)));

  // Level 2: Client-scoped (if client active)
  if (clientId) {
    const clientSnap = await memoryCol(workspaceId)
      .where('clientId', '==', clientId)
      .where('userId', '==', null)
      .limit(50)
      .get();
    memories.push(...clientSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CortexMemory)));
  }

  // Level 3: User+Client scoped
  if (clientId) {
    const userClientSnap = await memoryCol(workspaceId)
      .where('clientId', '==', clientId)
      .where('userId', '==', userId)
      .limit(30)
      .get();
    memories.push(...userClientSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CortexMemory)));
  }

  // Also load user workspace-wide memories
  const userSnap = await memoryCol(workspaceId)
    .where('clientId', '==', null)
    .where('userId', '==', userId)
    .limit(30)
    .get();
  memories.push(...userSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CortexMemory)));

  // Sort by confidence (highest first), deduplicate
  const seen = new Set<string>();
  return memories
    .filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}

export async function deleteMemory(workspaceId: string, memoryId: string) {
  await memoryCol(workspaceId).doc(memoryId).delete();
}

export async function listAllMemories(workspaceId: string, limit: number = 50) {
  const snap = await memoryCol(workspaceId).limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Auto-Learning from Feedback ────────────────────────────

/**
 * Process feedback to auto-learn patterns.
 * Decision 22: 3 thumbs-down on same pattern → auto-create memory.
 */
export async function processFeedbackForLearning(
  workspaceId: string,
  userId: string,
  clientId: string | undefined,
  feedback: { rating: string; reason?: string; toolName?: string; context?: string },
) {
  if (feedback.rating !== 'negative' || !feedback.reason) return;

  // Count similar negative feedback
  const feedbackKey = `${feedback.reason}:${feedback.toolName ?? 'general'}`;
  const recentFeedback = await adminDb
    .collection('workspaces').doc(workspaceId)
    .collection('cortex_feedback_patterns')
    .where('key', '==', feedbackKey)
    .limit(1)
    .get();

  if (recentFeedback.empty) {
    // First occurrence — start tracking
    await adminDb.collection('workspaces').doc(workspaceId)
      .collection('cortex_feedback_patterns').doc()
      .set({ key: feedbackKey, count: 1, userId, clientId: clientId ?? null, lastSeen: FieldValue.serverTimestamp() });
  } else {
    const doc = recentFeedback.docs[0];
    const count = ((doc.data().count as number) ?? 0) + 1;
    await doc.ref.update({ count, lastSeen: FieldValue.serverTimestamp() });

    // 3 or more → auto-create memory
    if (count >= 3) {
      const memoryContent = generateMemoryFromFeedback(feedback);
      if (memoryContent) {
        await saveMemory(workspaceId, {
          content: memoryContent,
          category: 'preference',
          clientId,
          userId,
          confidence: 0.5,
          source: 'feedback',
        });
        // Reset counter
        await doc.ref.update({ count: 0 });
      }
    }
  }
}

function generateMemoryFromFeedback(feedback: { reason?: string; toolName?: string; context?: string }): string | null {
  const reason = feedback.reason;
  const tool = feedback.toolName ?? 'content generation';

  switch (reason) {
    case 'wrong_tool': return `User prefers a different approach for ${tool} — avoid using this tool for similar requests.`;
    case 'bad_quality': return `${tool} output quality was too low — increase detail and specificity in responses.`;
    case 'missed_context': return `${tool} missed important context — ensure all relevant workspace data is loaded before responding.`;
    case 'too_slow': return `User wants faster responses for ${tool} — prefer Sonnet over Opus for this type of request.`;
    default: return null;
  }
}

// ── Format memories for system prompt ──────────────────────

export function formatMemoriesForPrompt(memories: CortexMemory[]): string {
  if (memories.length === 0) return '';

  const lines = memories
    .filter((m) => m.confidence >= 0.3)
    .slice(0, 20)
    .map((m) => {
      const scope = m.clientId ? `[Client: ${m.clientId}]` : '[Workspace]';
      const personal = m.userId ? ' (personal)' : '';
      return `- ${scope}${personal} ${m.content} (confidence: ${(m.confidence * 100).toFixed(0)}%)`;
    });

  return `\n[CORTEX MEMORY — Learned preferences and patterns]\n${lines.join('\n')}`;
}
