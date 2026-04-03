/**
 * White-Label Branding Service
 * Custom domain, branding, email/report/portal customization.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION = 'whitelabel_configs';

function configRef(workspaceId: string) {
  return adminDb.collection('workspaces').doc(workspaceId).collection(COLLECTION).doc('default');
}

export async function getWhiteLabelConfig(workspaceId: string): Promise<Record<string, unknown> | null> {
  const doc = await configRef(workspaceId).get();
  if (!doc.exists) return null;
  return { workspaceId, ...doc.data() };
}

export async function upsertWhiteLabelConfig(
  workspaceId: string,
  data: Record<string, unknown>,
) {
  const ref = configRef(workspaceId);
  const existing = await ref.get();

  if (existing.exists) {
    await ref.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await ref.set({
      workspaceId,
      enabled: false,
      domainVerified: false,
      hideAuraBranding: false,
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return (await ref.get()).data();
}

export async function verifyCustomDomain(workspaceId: string, domain: string) {
  // In production, verify DNS CNAME/TXT records and provision SSL
  // For now, mock verification
  const ref = configRef(workspaceId);
  await ref.update({
    customDomain: domain,
    domainVerified: false,
    sslCertificateStatus: 'pending',
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { domain, verified: false, sslStatus: 'pending' };
}
