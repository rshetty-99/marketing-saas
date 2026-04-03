/**
 * Link Shortener + UTM Builder Service
 * Short links, UTM templates, click tracking, QR codes.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const linkCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('short_links');
const utmCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('utm_templates');

function generateShortCode(): string {
  return crypto.randomBytes(4).toString('base64url').slice(0, 7);
}

export async function listShortLinks(workspaceId: string) {
  const snap = await linkCol(workspaceId).orderBy('createdAt', 'desc').limit(100).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createShortLink(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = linkCol(workspaceId).doc();
  const shortCode = (data.customAlias as string) || generateShortCode();
  const baseUrl = process.env.SHORT_LINK_DOMAIN ?? 'https://aura.link';

  // Build URL with UTM params
  const originalUrl = new URL(data.originalUrl as string);
  if (data.utmSource) originalUrl.searchParams.set('utm_source', data.utmSource as string);
  if (data.utmMedium) originalUrl.searchParams.set('utm_medium', data.utmMedium as string);
  if (data.utmCampaign) originalUrl.searchParams.set('utm_campaign', data.utmCampaign as string);
  if (data.utmTerm) originalUrl.searchParams.set('utm_term', data.utmTerm as string);
  if (data.utmContent) originalUrl.searchParams.set('utm_content', data.utmContent as string);

  await ref.set({
    id: ref.id, workspaceId, originalUrl: originalUrl.toString(),
    shortCode, shortUrl: `${baseUrl}/${shortCode}`,
    clicks: 0, uniqueClicks: 0, isActive: true, tags: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return { id: ref.id, shortUrl: `${baseUrl}/${shortCode}` };
}

export async function trackClick(workspaceId: string, linkId: string) {
  const ref = linkCol(workspaceId).doc(linkId);
  await ref.update({
    clicks: FieldValue.increment(1),
    lastClickedAt: FieldValue.serverTimestamp(),
  });
}

// UTM Templates
export async function listUTMTemplates(workspaceId: string) {
  const snap = await utmCol(workspaceId).orderBy('name', 'asc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createUTMTemplate(workspaceId: string, data: Record<string, unknown>) {
  const ref = utmCol(workspaceId).doc();
  await ref.set({ id: ref.id, workspaceId, ...data, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}
