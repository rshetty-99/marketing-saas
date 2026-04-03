/**
 * Ad Campaign Management Service
 * Cross-platform ad campaigns (Meta, Google, LinkedIn, Twitter, TikTok, Pinterest).
 * Production: platform API integration. Dev: mock campaign data.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('ad_campaigns');

export async function listAdCampaigns(workspaceId: string, platform?: string) {
  let query = col(workspaceId).orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (platform) query = query.where('platform', '==', platform);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAdCampaign(workspaceId: string, campaignId: string) {
  const doc = await col(workspaceId).doc(campaignId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createAdCampaign(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    spent: 0, impressions: 0, clicks: 0, conversions: 0,
    ctr: 0, cpc: 0, cpa: 0, roas: 0, adSets: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateAdCampaign(workspaceId: string, campaignId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(campaignId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export function mockAdPerformance() {
  return {
    impressions: Math.floor(Math.random() * 50000) + 5000,
    clicks: Math.floor(Math.random() * 2000) + 200,
    conversions: Math.floor(Math.random() * 100) + 10,
    spent: Number((Math.random() * 500 + 50).toFixed(2)),
    ctr: Number((Math.random() * 5 + 0.5).toFixed(2)),
    cpc: Number((Math.random() * 2 + 0.1).toFixed(2)),
    cpa: Number((Math.random() * 20 + 2).toFixed(2)),
    roas: Number((Math.random() * 5 + 1).toFixed(2)),
  };
}
