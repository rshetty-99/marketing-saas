/**
 * GDPR/CCPA Compliance Service
 * Data subject requests, consent management, data retention.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function createDataRequest(workspaceId: string, type: string, requestedBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('data_requests').doc();
  await ref.set({
    id: ref.id, workspaceId, requestType: type, requestedBy,
    requestedAt: FieldValue.serverTimestamp(), status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listDataRequests(workspaceId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId).collection('data_requests')
    .orderBy('requestedAt', 'desc').limit(50).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function recordConsent(workspaceId: string, email: string, consentType: string, granted: boolean, source: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('consent_records').doc();
  await ref.set({
    id: ref.id, workspaceId, email, consentType, granted, source,
    grantedAt: granted ? FieldValue.serverTimestamp() : null,
    revokedAt: !granted ? FieldValue.serverTimestamp() : null,
  });
  return ref.id;
}

export async function getRetentionPolicy(workspaceId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId).collection('settings').doc('data_retention').get();
  return doc.exists ? doc.data() : {
    analyticsRetentionDays: 365, contentRetentionDays: -1,
    auditLogRetentionDays: 730, inboxRetentionDays: 90, autoDeleteEnabled: false,
  };
}
