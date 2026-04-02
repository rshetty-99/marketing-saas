/**
 * F12: Lead Management Service
 * Pipeline CRUD, lead scoring, activity logging, stage movements.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';

const DEFAULT_PIPELINE_STAGES = [
  { id: 'new', label: 'New', order: 0, color: '#6B7280' },
  { id: 'contacted', label: 'Contacted', order: 1, color: '#3B82F6' },
  { id: 'qualified', label: 'Qualified', order: 2, color: '#8B5CF6' },
  { id: 'proposal', label: 'Proposal Sent', order: 3, color: '#F59E0B' },
  { id: 'negotiation', label: 'Negotiation', order: 4, color: '#EC4899' },
  { id: 'won', label: 'Won', order: 5, color: '#10B981', isWon: true },
  { id: 'lost', label: 'Lost', order: 6, color: '#EF4444', isLost: true },
];

export async function getPipelineConfig(workspaceId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId).collection('settings').doc('pipeline_config').get();
  if (doc.exists) return doc.data();
  return { stages: DEFAULT_PIPELINE_STAGES };
}

export async function savePipelineConfig(workspaceId: string, stages: Record<string, unknown>[], userId: string) {
  await adminDb.collection('workspaces').doc(workspaceId).collection('settings').doc('pipeline_config').set({
    workspaceId, stages, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: userId,
  }, { merge: true });
}

export async function createLead(workspaceId: string, data: Record<string, unknown>, createdBy: string): Promise<string> {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc();
  await ref.set({
    id: ref.id, workspaceId, ...data,
    stage: data.stage ?? 'new',
    leadScore: 0, scoreBreakdown: [], scoringModel: 'manual',
    stageMovements: [], tags: data.tags ?? [], recycleCount: 0,
    duplicateStatus: 'unique',
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateLead(workspaceId: string, leadId: string, updates: Record<string, unknown>, updatedBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc(leadId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Lead not found');

  const current = snap.data();
  if (updates.stage && updates.stage !== current?.stage) {
    updates.stageMovements = FieldValue.arrayUnion({
      fromStage: current?.stage, toStage: updates.stage, movedAt: new Date().toISOString(), movedBy: updatedBy,
    });
    updates.previousStage = current?.stage;
  }

  await ref.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
}

export async function listLeads(workspaceId: string, filters: { stage?: string; assignedTo?: string; limit?: number } = {}) {
  let query = adminDb.collection('workspaces').doc(workspaceId).collection('leads')
    .orderBy('createdAt', 'desc').limit(filters.limit ?? 50) as FirebaseFirestore.Query;
  if (filters.stage) query = query.where('stage', '==', filters.stage);
  if (filters.assignedTo) query = query.where('assignedTo', '==', filters.assignedTo);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function logActivity(workspaceId: string, leadId: string, activity: Record<string, unknown>, performedBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc(leadId).collection('activities').doc();
  await ref.set({
    id: ref.id, leadId, ...activity, performedBy, isAutomated: false,
    occurredAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
  });
  await adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc(leadId).update({
    lastActivityAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function convertLeadToClient(workspaceId: string, leadId: string, clientId: string, convertedBy: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc(leadId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Lead not found');
  const lead = snap.data();
  await ref.update({
    convertedToClientId: clientId, convertedAt: FieldValue.serverTimestamp(), convertedBy,
    conversionSnapshot: { dealValue: lead?.dealValue, stage: lead?.stage, leadScore: lead?.leadScore, assignedTo: lead?.assignedTo },
    updatedAt: FieldValue.serverTimestamp(),
  });
}
