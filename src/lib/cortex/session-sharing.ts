/**
 * Cortex Session Sharing — Phase 11B
 * Decision 18: Explicit share + continuable sessions.
 * - Creator: always has access
 * - Shared recipients: can view AND continue
 * - Owner/Admin: can view ANY session (audit)
 * - Transfer ownership available
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const sessionsCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('cortex_sessions');

export async function shareSession(
  workspaceId: string,
  sessionId: string,
  sharerUserId: string,
  recipientUserIds: string[],
) {
  const ref = sessionsCol(workspaceId).doc(sessionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Session not found');

  const data = doc.data()!;
  if (data.userId !== sharerUserId) throw new Error('Only the session creator can share');

  const currentShared = (data.sharedWith as string[]) ?? [];
  const newShared = [...new Set([...currentShared, ...recipientUserIds])];

  await ref.update({ sharedWith: newShared, updatedAt: FieldValue.serverTimestamp() });
  return newShared;
}

export async function unshareSession(
  workspaceId: string,
  sessionId: string,
  ownerUserId: string,
  recipientUserId: string,
) {
  const ref = sessionsCol(workspaceId).doc(sessionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Session not found');

  const data = doc.data()!;
  if (data.userId !== ownerUserId) throw new Error('Only the session creator can unshare');

  const currentShared = (data.sharedWith as string[]) ?? [];
  await ref.update({
    sharedWith: currentShared.filter((id: string) => id !== recipientUserId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function transferSession(
  workspaceId: string,
  sessionId: string,
  fromUserId: string,
  toUserId: string,
) {
  const ref = sessionsCol(workspaceId).doc(sessionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Session not found');

  const data = doc.data()!;
  if (data.userId !== fromUserId) throw new Error('Only the session owner can transfer');

  await ref.update({
    userId: toUserId,
    sharedWith: [...new Set([...((data.sharedWith as string[]) ?? []), fromUserId])],
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export function canAccessSession(
  session: Record<string, unknown>,
  userId: string,
  userRole: string,
): { canView: boolean; canContinue: boolean } {
  const isCreator = session.userId === userId;
  const isShared = ((session.sharedWith as string[]) ?? []).includes(userId);
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin';

  return {
    canView: isCreator || isShared || isAdminOrOwner,
    canContinue: isCreator || isShared, // Admin can view but NOT continue (Decision 18)
  };
}
