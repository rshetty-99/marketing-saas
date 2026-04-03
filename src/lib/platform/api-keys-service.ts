/**
 * Public REST API / Developer API Key Service
 * API key management, validation, usage logging.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('api_keys');

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function listApiKeys(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createApiKey(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const rawKey = `aura_${crypto.randomBytes(32).toString('hex')}`;
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, isActive: true,
    keyHash: hashKey(rawKey), keyPrefix: rawKey.slice(0, 12),
    rateLimit: 60, scopes: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });
  return { id: ref.id, key: rawKey, prefix: rawKey.slice(0, 12) };
}

export async function revokeApiKey(workspaceId: string, keyId: string) {
  await col(workspaceId).doc(keyId).update({ isActive: false });
}

export async function validateApiKey(key: string): Promise<{ workspaceId: string; scopes: string[] } | null> {
  const hash = hashKey(key);
  const snap = await adminDb.collectionGroup('api_keys')
    .where('keyHash', '==', hash).where('isActive', '==', true).limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return { workspaceId: data.workspaceId, scopes: data.scopes ?? [] };
}
