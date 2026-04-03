/**
 * F16: Digital Asset Management Service
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function listAssets(workspaceId: string, filters: { folderId?: string; assetType?: string; limit?: number } = {}) {
  let query = adminDb.collection('workspaces').doc(workspaceId).collection('dam_assets')
    .where('status', '==', 'active').orderBy('createdAt', 'desc').limit(filters.limit ?? 50) as FirebaseFirestore.Query;
  if (filters.folderId) query = query.where('folderId', '==', filters.folderId);
  if (filters.assetType) query = query.where('assetType', '==', filters.assetType);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createAsset(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('dam_assets').doc();
  await ref.set({
    id: ref.id, workspaceId, ...data, status: 'active', usageCount: 0, linkedContentIds: [],
    linkedCampaignIds: [], currentVersionNumber: 1, versions: [], tags: [],
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function listFolders(workspaceId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId).collection('dam_folders')
    .orderBy('name', 'asc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createFolder(workspaceId: string, name: string, parentId: string | null, createdBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('dam_folders').doc();
  await ref.set({
    id: ref.id, workspaceId, name, parentFolderId: parentId, assetCount: 0,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}
