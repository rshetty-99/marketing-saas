/**
 * F15: Billing Service
 * Subscription management, usage tracking, trial enforcement.
 * Mock when no Stripe keys, real Stripe test mode when keys present.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { TRIAL_USAGE_CAPS, TIER_CAPABILITIES } from '@/types/features/billing';
import type { UsageSnapshot, UsageCaps } from '@/types/features/billing';

export async function getSubscription(workspaceId: string): Promise<Record<string, unknown> | null> {
  const doc = await adminDb.collection('workspaces').doc(workspaceId).collection('billing').doc('subscription').get();
  if (doc.exists) return doc.data() ?? null;

  // Return mock subscription from workspace data
  const ws = await adminDb.collection('workspaces').doc(workspaceId).get();
  const wsData = ws.data();
  return {
    workspaceId,
    status: wsData?.status === 'trial' ? 'trialing' : wsData?.status === 'active' ? 'active' : 'trialing',
    tier: wsData?.tier ?? 'starter',
    billingInterval: 'monthly',
    seatCount: 1,
    seatsUsed: 1,
    baseAmount: 0,
    trialEnd: wsData?.trialEndsAt ?? null,
    selfServiceEnabled: true,
    dataSource: 'mock',
  };
}

export async function getUsageSnapshot(workspaceId: string): Promise<UsageSnapshot> {
  const today = new Date().toISOString().split('T')[0];
  const doc = await adminDb.collection('workspaces').doc(workspaceId).collection('billing').doc(`usage_${today}`).get();
  if (doc.exists) return doc.data() as UsageSnapshot;

  // Compute from actual Firestore counts
  const [drafts, publishJobs, images, emails, leads, members] = await Promise.all([
    adminDb.collection('workspaces').doc(workspaceId).collection('content_drafts').count().get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('publish_jobs').count().get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('generated_images').count().get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('email_campaigns').count().get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('leads').count().get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('members').where('status', '==', 'active').count().get(),
  ]);

  return {
    workspaceId,
    date: today,
    contentDrafts: drafts.data().count,
    publishJobs: publishJobs.data().count,
    imageGenerations: images.data().count,
    emailCampaigns: emails.data().count,
    leadRecords: leads.data().count,
    seoLookups: 0,
    teamMembers: members.data().count,
    clientWorkspaces: 0,
    storageMb: 0,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0, toDate: () => new Date() },
  } as UsageSnapshot;
}

export function getUsageCaps(tier: string): UsageCaps {
  const tierConfig = TIER_CAPABILITIES.find((t) => t.tier === tier);
  if (tierConfig) return tierConfig.usageCaps;
  return TRIAL_USAGE_CAPS;
}

export function checkUsageLimit(usage: number, cap: number): { allowed: boolean; remaining: number; percentUsed: number } {
  if (cap === -1) return { allowed: true, remaining: -1, percentUsed: 0 }; // Unlimited
  return {
    allowed: usage < cap,
    remaining: Math.max(0, cap - usage),
    percentUsed: cap > 0 ? Math.round((usage / cap) * 100) : 0,
  };
}

export async function listInvoices(workspaceId: string): Promise<Record<string, unknown>[]> {
  const snap = await adminDb.collection('workspaces').doc(workspaceId).collection('billing')
    .doc('invoices').collection('items').orderBy('createdAt', 'desc').limit(20).get();

  if (snap.empty) {
    // Return mock invoices
    return [
      { id: 'inv_mock_1', status: 'paid', amountDue: 7900, amountPaid: 7900, currency: 'usd', paidAt: new Date().toISOString(), periodStart: new Date(Date.now() - 30 * 86400000).toISOString(), periodEnd: new Date().toISOString() },
      { id: 'inv_mock_2', status: 'paid', amountDue: 7900, amountPaid: 7900, currency: 'usd', paidAt: new Date(Date.now() - 30 * 86400000).toISOString(), periodStart: new Date(Date.now() - 60 * 86400000).toISOString(), periodEnd: new Date(Date.now() - 30 * 86400000).toISOString() },
    ];
  }

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
