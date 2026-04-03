/**
 * Comment Auto-Moderation Service
 * Rule-based moderation with auto-hide, flag, delete, auto-reply.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('moderation_rules');

export async function listModerationRules(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createModerationRule(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, isActive: true, matchCount: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateModerationRule(workspaceId: string, ruleId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(ruleId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteModerationRule(workspaceId: string, ruleId: string) {
  await col(workspaceId).doc(ruleId).delete();
}

export function evaluateComment(content: string, rules: Record<string, unknown>[]): { matched: boolean; ruleId?: string; action?: string } {
  for (const rule of rules) {
    if (!(rule.isActive as boolean)) continue;
    const conditions = (rule.conditions as { type: string; value: string; caseSensitive?: boolean }[]) ?? [];
    for (const cond of conditions) {
      const text = cond.caseSensitive ? content : content.toLowerCase();
      const val = cond.caseSensitive ? cond.value : cond.value.toLowerCase();
      if (cond.type === 'contains_word' && text.includes(val)) return { matched: true, ruleId: rule.id as string, action: rule.action as string };
      if (cond.type === 'regex' && new RegExp(cond.value, cond.caseSensitive ? '' : 'i').test(content)) return { matched: true, ruleId: rule.id as string, action: rule.action as string };
    }
  }
  return { matched: false };
}
