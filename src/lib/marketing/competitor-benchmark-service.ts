/**
 * Competitor Social Benchmarking Service
 * Track competitor profiles, follower growth, engagement comparison.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const profCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('competitor_profiles');
const snapCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('benchmark_snapshots');

export async function listCompetitors(workspaceId: string) {
  const snap = await profCol(workspaceId).orderBy('name', 'asc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCompetitor(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = profCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, socialAccounts: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateCompetitor(workspaceId: string, competitorId: string, data: Record<string, unknown>) {
  await profCol(workspaceId).doc(competitorId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteCompetitor(workspaceId: string, competitorId: string) {
  await profCol(workspaceId).doc(competitorId).delete();
}

export async function listBenchmarkSnapshots(workspaceId: string, competitorId: string) {
  const snap = await snapCol(workspaceId)
    .where('competitorId', '==', competitorId)
    .orderBy('snapshotDate', 'desc').limit(30).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBenchmarkSnapshot(workspaceId: string, competitorId: string, platform: string, metrics: Record<string, unknown>) {
  const ref = snapCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, competitorId, platform, period: 'daily',
    metrics, snapshotDate: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
