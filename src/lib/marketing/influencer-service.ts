/**
 * Influencer Discovery & Management Service
 * Track influencers, campaigns, deliverables, ROI.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const infCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('influencers');
const campCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('influencer_campaigns');

export async function listInfluencers(workspaceId: string, status?: string) {
  let query = infCol(workspaceId).orderBy('followerCount', 'desc').limit(100) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createInfluencer(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const followers = (data.followerCount as number) ?? 0;
  const tier = followers >= 1000000 ? 'mega' : followers >= 100000 ? 'macro' : followers >= 10000 ? 'mid' : followers >= 1000 ? 'micro' : 'nano';
  const ref = infCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'discovered', tier,
    totalSpend: 0, totalImpressions: 0, totalEngagement: 0, campaignIds: [], tags: [], notes: '',
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateInfluencer(workspaceId: string, influencerId: string, data: Record<string, unknown>) {
  await infCol(workspaceId).doc(influencerId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function listInfluencerCampaigns(workspaceId: string) {
  const snap = await campCol(workspaceId).orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createInfluencerCampaign(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = campCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'planning', spent: 0,
    totalReach: 0, totalEngagement: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}
