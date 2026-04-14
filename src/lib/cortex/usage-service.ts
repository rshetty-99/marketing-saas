/**
 * Cortex Usage Tracking — Phase 11D
 * Decision 9: Dual-layer — action credits (UX) + token budgets (system).
 * Decision 20: Full breakdown + projections + per-user limits + CSV export.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const usageCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('cortex_usage');

export interface UsageRecord {
  userId: string;
  clientId?: string;
  sessionId: string;
  creditsConsumed: number;
  tokensConsumed: number;
  model: 'sonnet' | 'opus';
  toolsUsed: string[];
  date: string;                       // YYYY-MM-DD for daily aggregation
}

// ── Record Usage ───────────────────────────────────────────

export async function recordUsage(workspaceId: string, record: UsageRecord) {
  const ref = usageCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, ...record,
    timestamp: FieldValue.serverTimestamp(),
  });
}

// ── Query Usage ────────────────────────────────────────────

export async function getUsageSummary(workspaceId: string, periodDays: number = 30) {
  const snap = await usageCol(workspaceId).limit(1000).get();
  const records = snap.docs.map((d) => d.data());

  const totalCredits = records.reduce((s, r) => s + ((r.creditsConsumed as number) ?? 0), 0);
  const totalTokens = records.reduce((s, r) => s + ((r.tokensConsumed as number) ?? 0), 0);
  const totalSessions = new Set(records.map((r) => r.sessionId as string)).size;

  // By user
  const byUser = new Map<string, { credits: number; tokens: number; sessions: number }>();
  for (const r of records) {
    const uid = r.userId as string;
    const existing = byUser.get(uid) ?? { credits: 0, tokens: 0, sessions: 0 };
    existing.credits += (r.creditsConsumed as number) ?? 0;
    existing.tokens += (r.tokensConsumed as number) ?? 0;
    existing.sessions++;
    byUser.set(uid, existing);
  }

  // By client
  const byClient = new Map<string, { credits: number; tokens: number }>();
  for (const r of records) {
    const cid = (r.clientId as string) ?? 'none';
    const existing = byClient.get(cid) ?? { credits: 0, tokens: 0 };
    existing.credits += (r.creditsConsumed as number) ?? 0;
    existing.tokens += (r.tokensConsumed as number) ?? 0;
    byClient.set(cid, existing);
  }

  // Top tools
  const toolCounts = new Map<string, number>();
  for (const r of records) {
    for (const tool of (r.toolsUsed as string[]) ?? []) {
      toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);
    }
  }
  const topTools = Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tool, count]) => ({ tool, count }));

  // Daily usage (for charts)
  const byDay = new Map<string, { credits: number; tokens: number }>();
  for (const r of records) {
    const day = (r.date as string) ?? 'unknown';
    const existing = byDay.get(day) ?? { credits: 0, tokens: 0 };
    existing.credits += (r.creditsConsumed as number) ?? 0;
    existing.tokens += (r.tokensConsumed as number) ?? 0;
    byDay.set(day, existing);
  }

  // Projection
  const daysTracked = byDay.size || 1;
  const dailyAvgCredits = totalCredits / daysTracked;
  const projectedMonthlyCredits = Math.round(dailyAvgCredits * 30);

  return {
    totalCredits,
    totalTokens,
    totalSessions,
    periodDays,
    byUser: Object.fromEntries(byUser),
    byClient: Object.fromEntries(byClient),
    topTools,
    dailyUsage: Object.fromEntries(byDay),
    projection: {
      dailyAvgCredits: Math.round(dailyAvgCredits),
      projectedMonthlyCredits,
      projectedMonthlyTokens: Math.round((totalTokens / daysTracked) * 30),
    },
  };
}

// ── Per-User Limits (Decision 20) ──────────────────────────

export async function getUserDailyLimit(workspaceId: string, userId: string): Promise<number | null> {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('cortex_user_limits').doc(userId).get();
  return doc.exists ? (doc.data()?.dailyLimit as number) ?? null : null;
}

export async function setUserDailyLimit(workspaceId: string, userId: string, dailyLimit: number) {
  await adminDb.collection('workspaces').doc(workspaceId)
    .collection('cortex_user_limits').doc(userId)
    .set({ userId, dailyLimit, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function checkUserDailyUsage(workspaceId: string, userId: string): Promise<{ used: number; limit: number | null; exceeded: boolean }> {
  const today = new Date().toISOString().split('T')[0];
  const snap = await usageCol(workspaceId)
    .where('userId', '==', userId)
    .where('date', '==', today)
    .limit(100)
    .get();

  const used = snap.docs.reduce((s, d) => s + ((d.data().creditsConsumed as number) ?? 0), 0);
  const limit = await getUserDailyLimit(workspaceId, userId);

  return { used, limit, exceeded: limit !== null && used >= limit };
}

// ── CSV Export ─────────────────────────────────────────────

export async function exportUsageCSV(workspaceId: string): Promise<string> {
  const snap = await usageCol(workspaceId).limit(5000).get();
  const headers = 'date,userId,clientId,sessionId,creditsConsumed,tokensConsumed,model,toolsUsed';
  const rows = snap.docs.map((d) => {
    const r = d.data();
    return [
      r.date, r.userId, r.clientId ?? '', r.sessionId,
      r.creditsConsumed, r.tokensConsumed, r.model,
      ((r.toolsUsed as string[]) ?? []).join(';'),
    ].join(',');
  });
  return [headers, ...rows].join('\n');
}
