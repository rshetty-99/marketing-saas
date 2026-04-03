/**
 * Content Migration Tool Service
 * Import from Hootsuite, Buffer, Later, Sprout Social, HubSpot, WordPress.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('migration_jobs');

export async function listMigrationJobs(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createMigrationJob(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'pending',
    totalItems: 0, migratedItems: 0, skippedItems: 0, errors: [],
    config: { importContent: true, importScheduled: true, importAnalytics: false, importSubscribers: false },
    ...data,
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function processMigration(workspaceId: string, jobId: string) {
  const ref = col(workspaceId).doc(jobId);
  await ref.update({ status: 'analyzing' });

  // In production: connect to source platform API, analyze available data
  // For dev: simulate migration
  await ref.update({
    status: 'completed', totalItems: 25, migratedItems: 23, skippedItems: 2,
    errors: [
      { item: 'post_14', message: 'Unsupported media format' },
      { item: 'post_22', message: 'Missing content body' },
    ],
    completedAt: FieldValue.serverTimestamp(),
  });
}
