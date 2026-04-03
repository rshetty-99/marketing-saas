/**
 * Custom Dashboard Widgets Service
 * Drag-and-drop KPI cards, charts, and tables.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('custom_dashboards');

export async function listDashboards(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDashboard(workspaceId: string, dashboardId: string) {
  const doc = await col(workspaceId).doc(dashboardId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createDashboard(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, isDefault: false, widgets: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateDashboard(workspaceId: string, dashboardId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(dashboardId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteDashboard(workspaceId: string, dashboardId: string) {
  await col(workspaceId).doc(dashboardId).delete();
}
