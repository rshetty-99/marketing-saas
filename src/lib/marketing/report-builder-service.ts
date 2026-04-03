/**
 * Client Report Builder Service
 * Report templates, scheduled generation, PDF export.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const tplCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('report_templates');
const repCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('generated_reports');

export async function listReportTemplates(workspaceId: string) {
  const snap = await tplCol(workspaceId).orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createReportTemplate(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = tplCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, sections: [], format: 'pdf',
    branding: { coverPageEnabled: true },
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateReportTemplate(workspaceId: string, templateId: string, data: Record<string, unknown>) {
  await tplCol(workspaceId).doc(templateId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function generateReport(workspaceId: string, templateId: string, periodStart: Date, periodEnd: Date) {
  // In production: gather analytics data, render PDF via React PDF, upload to Storage
  // For dev: create mock generated report
  const ref = repCol(workspaceId).doc();
  await ref.set({
    id: ref.id, templateId, workspaceId,
    periodStart, periodEnd, format: 'pdf',
    fileUrl: `https://storage.example.com/reports/${ref.id}.pdf`,
    fileSizeBytes: 256000,
    sentTo: [], createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listGeneratedReports(workspaceId: string, templateId?: string) {
  let query = repCol(workspaceId).orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query;
  if (templateId) query = query.where('templateId', '==', templateId);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
