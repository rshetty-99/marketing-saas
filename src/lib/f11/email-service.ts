/**
 * F11: Email Campaign Service
 * Campaign CRUD, subscriber management, template-based sending (mock for dev).
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { CampaignStatus, TemplateCategory } from '@/types/features/email';

// ─── Campaign CRUD ──────────────────────────────────────────

export async function createCampaign(
  workspaceId: string,
  data: Record<string, unknown>,
  createdBy: string,
): Promise<string> {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('email_campaigns').doc();
  await ref.set({
    id: ref.id,
    workspaceId,
    status: 'draft' as CampaignStatus,
    clickTrackingEnabled: true,
    openTrackingEnabled: true,
    compliance: {
      physicalAddress: '',
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/unsubscribe`,
      unsubscribeLinkPresent: true,
      listUnsubscribeHeader: true,
      gdprCompliant: true,
      doubleOptIn: false,
    },
    dataSource: 'mock',
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy,
  });
  return ref.id;
}

export async function listCampaigns(
  workspaceId: string,
  filters: { status?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('email_campaigns')
    .orderBy('createdAt', 'desc')
    .limit(filters.limit ?? 50) as FirebaseFirestore.Query;
  if (filters.status) query = query.where('status', '==', filters.status);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Mock Send ──────────────────────────────────────────────

export async function sendCampaign(
  workspaceId: string,
  campaignId: string,
  sentBy: string,
): Promise<void> {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('email_campaigns').doc(campaignId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Campaign not found');
  if (snap.data()?.status !== 'draft' && snap.data()?.status !== 'scheduled') {
    throw new Error('Campaign must be in draft or scheduled status to send');
  }

  // Mock send — update status + mock analytics
  await ref.update({
    status: 'sent' as CampaignStatus,
    sentAt: FieldValue.serverTimestamp(),
    analytics: {
      sent: 150,
      delivered: 145,
      deliveryRate: 0.967,
      uniqueOpens: 42,
      totalOpens: 68,
      openRate: 0.29,
      uniqueClicks: 18,
      totalClicks: 24,
      clickRate: 0.124,
      clickToOpenRate: 0.429,
      hardBounces: 2,
      softBounces: 3,
      bounceRate: 0.033,
      spamComplaints: 0,
      complaintRate: 0,
      unsubscribes: 1,
      unsubscribeRate: 0.007,
      forwardCount: 3,
      topClickedLinks: [{ url: 'https://example.com/cta', clicks: 12 }],
      deviceBreakdown: { desktop: 60, mobile: 35, tablet: 5 },
      lastUpdatedAt: new Date().toISOString(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'content.published',
    resourceType: 'content',
    resourceId: campaignId,
    actorId: sentBy,
    details: { type: 'email_campaign', mode: 'mock' },
  });
}

// ─── Subscriber Management ──────────────────────────────────

export async function importSubscribers(
  workspaceId: string,
  subscribers: { email: string; firstName?: string; lastName?: string; tags?: string[] }[],
  source: string,
  importedBy: string,
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;
  const batch = adminDb.batch();

  for (const sub of subscribers) {
    const existing = await adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .collection('email_subscribers')
      .where('email', '==', sub.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      skipped++;
      continue;
    }

    const ref = adminDb.collection('workspaces').doc(workspaceId).collection('email_subscribers').doc();
    batch.set(ref, {
      id: ref.id,
      workspaceId,
      email: sub.email,
      firstName: sub.firstName ?? null,
      lastName: sub.lastName ?? null,
      status: 'subscribed',
      tags: sub.tags ?? [],
      segments: [],
      source,
      engagementScore: 50,
      engagementRating: 'warm',
      totalOpens: 0,
      totalClicks: 0,
      subscribedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    imported++;
  }

  if (imported > 0) await batch.commit();
  return { imported, skipped };
}

export async function listSubscribers(
  workspaceId: string,
  limit: number = 100,
): Promise<Record<string, unknown>[]> {
  const snap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('email_subscribers')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Built-in Templates ─────────────────────────────────────

export const BUILT_IN_TEMPLATES: {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  variables: string[];
}[] = [
  { id: 'tpl_welcome', name: 'Welcome', category: 'welcome', description: 'New subscriber welcome with brand intro', variables: ['{{brandName}}', '{{logoUrl}}', '{{ctaUrl}}'] },
  { id: 'tpl_newsletter', name: 'Newsletter', category: 'newsletter', description: 'Weekly/monthly digest with multiple sections', variables: ['{{brandName}}', '{{logoUrl}}', '{{sections}}'] },
  { id: 'tpl_promotion', name: 'Promotion', category: 'promotion', description: 'Sale/discount announcement with hero image', variables: ['{{brandName}}', '{{heroImage}}', '{{ctaText}}', '{{ctaUrl}}'] },
  { id: 'tpl_product_update', name: 'Product Update', category: 'product_update', description: 'Feature announcement with screenshot', variables: ['{{brandName}}', '{{featureName}}', '{{screenshotUrl}}'] },
  { id: 'tpl_event', name: 'Event Invitation', category: 'event', description: 'Webinar/event with RSVP button', variables: ['{{brandName}}', '{{eventName}}', '{{eventDate}}', '{{rsvpUrl}}'] },
  { id: 'tpl_follow_up', name: 'Follow-Up', category: 'follow_up', description: 'Post-meeting or post-purchase check-in', variables: ['{{brandName}}', '{{recipientName}}'] },
  { id: 'tpl_case_study', name: 'Case Study', category: 'case_study', description: 'Client success story with metrics', variables: ['{{brandName}}', '{{clientName}}', '{{metric}}', '{{ctaUrl}}'] },
  { id: 'tpl_plain', name: 'Plain Text', category: 'plain_text', description: 'Minimal styling, personal 1:1 feel', variables: ['{{senderName}}', '{{recipientName}}'] },
];
