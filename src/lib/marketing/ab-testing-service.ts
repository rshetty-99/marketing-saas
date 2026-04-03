/**
 * A/B Testing Engine Service
 * Create tests, track variants, auto-select winners.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('ab_tests');

export async function listABTests(workspaceId: string, status?: string) {
  let query = col(workspaceId).orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getABTest(workspaceId: string, testId: string) {
  const doc = await col(workspaceId).doc(testId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createABTest(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    confidenceThreshold: 0.95, minimumSampleSize: 100, autoSelectWinner: true,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateABTest(workspaceId: string, testId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(testId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function recordVariantImpression(workspaceId: string, testId: string, variantId: string) {
  const ref = col(workspaceId).doc(testId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const variants = (doc.data()!.variants ?? []) as Record<string, unknown>[];
  const idx = variants.findIndex((v) => v.id === variantId);
  if (idx === -1) return;
  (variants[idx].impressions as number) = ((variants[idx].impressions as number) ?? 0) + 1;
  await ref.update({ variants, updatedAt: FieldValue.serverTimestamp() });
}
