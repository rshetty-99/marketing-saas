/**
 * Bulk Scheduling / CSV Import Service
 * Parse CSV, validate rows, create content drafts in batch.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const jobCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('bulk_schedule_jobs');

export async function listBulkJobs(workspaceId: string) {
  const snap = await jobCol(workspaceId).orderBy('createdAt', 'desc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBulkJob(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = jobCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'pending',
    processedRows: 0, successCount: 0, errorCount: 0, errors: [], createdContentIds: [],
    ...data,
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function processBulkJob(workspaceId: string, jobId: string, rows: Record<string, string>[]) {
  const ref = jobCol(workspaceId).doc(jobId);
  await ref.update({ status: 'processing', totalRows: rows.length });

  const errors: { row: number; message: string }[] = [];
  const createdIds: string[] = [];
  const batch = adminDb.batch();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.title || !row.content) {
      errors.push({ row: i + 1, message: 'Missing required field: title or content' });
      continue;
    }

    const draftRef = adminDb.collection('workspaces').doc(workspaceId).collection('content_drafts').doc();
    batch.set(draftRef, {
      id: draftRef.id, workspaceId,
      title: row.title, content: row.content,
      platform: row.platform ?? 'blog',
      status: 'draft',
      scheduledAt: row.scheduledAt ? new Date(row.scheduledAt) : null,
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      creationMethod: 'bulk_import',
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'bulk_import',
    });
    createdIds.push(draftRef.id);
  }

  if (createdIds.length > 0) await batch.commit();

  await ref.update({
    status: errors.length > 0 && createdIds.length === 0 ? 'failed' : errors.length > 0 ? 'partial' : 'completed',
    processedRows: rows.length,
    successCount: createdIds.length,
    errorCount: errors.length,
    errors,
    createdContentIds: createdIds,
    completedAt: FieldValue.serverTimestamp(),
  });

  return { success: createdIds.length, errors: errors.length };
}
