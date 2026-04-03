/**
 * Landing Page / Funnel Builder Service
 * CRUD for landing pages, page blocks, funnels, and analytics.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ── Landing Pages ──────────────────────────────────────────

export async function listLandingPages(workspaceId: string, status?: string) {
  let query = adminDb.collection('workspaces').doc(workspaceId)
    .collection('landing_pages').orderBy('updatedAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getLandingPage(workspaceId: string, pageId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('landing_pages').doc(pageId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createLandingPage(
  workspaceId: string,
  data: Record<string, unknown>,
  createdBy: string,
) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('landing_pages').doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'draft', blocks: [],
    views: 0, uniqueVisitors: 0, conversions: 0, conversionRate: 0,
    isVariant: false, ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateLandingPage(workspaceId: string, pageId: string, data: Record<string, unknown>) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('landing_pages').doc(pageId);
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function publishLandingPage(workspaceId: string, pageId: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('landing_pages').doc(pageId);
  await ref.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ── Funnels ────────────────────────────────────────────────

export async function listFunnels(workspaceId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('funnels').orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createFunnel(
  workspaceId: string,
  data: Record<string, unknown>,
  createdBy: string,
) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('funnels').doc();
  await ref.set({
    id: ref.id, workspaceId, steps: [], totalConversions: 0, overallConversionRate: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}
