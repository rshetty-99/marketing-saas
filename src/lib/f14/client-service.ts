/**
 * F14: Client Management Service
 * Client CRUD, health scoring, portal management, reports.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { ClientHealthScore } from '@/types/features/client-management';

export async function listClients(agencyWorkspaceId: string, limit: number = 50) {
  const snap = await adminDb.collection('clients')
    .where('agencyWorkspaceId', '==', agencyWorkspaceId)
    .orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getClient(clientId: string) {
  const doc = await adminDb.collection('clients').doc(clientId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function updateClient(clientId: string, updates: Record<string, unknown>) {
  await adminDb.collection('clients').doc(clientId).update({
    ...updates, updatedAt: FieldValue.serverTimestamp(),
  });
}

export function computeHealthScore(
  contentPublishedLast30Days: number,
  monthlyContentQuota: number,
  portalLoginLast30Days: boolean,
  avgApprovalTurnaroundHours: number,
  engagementRateTrend: number, // -1 to 1
  contractEndDate: Date | null,
  hasOverdueInvoice: boolean,
  npsScore: number | null,
  csatScore: number | null,
): ClientHealthScore {
  // Content Activity (25%)
  const quotaMet = monthlyContentQuota > 0 ? contentPublishedLast30Days / monthlyContentQuota : 0.5;
  const contentScore = Math.min(100, Math.round(quotaMet * 100));

  // Engagement (25%)
  const engagementScore = Math.round(50 + engagementRateTrend * 50);

  // Responsiveness (20%)
  const approvalScore = avgApprovalTurnaroundHours <= 24 ? 100 : avgApprovalTurnaroundHours <= 48 ? 70 : 40;
  const portalScore = portalLoginLast30Days ? 100 : 30;
  const responsivenessScore = Math.round(approvalScore * 0.5 + portalScore * 0.5);

  // Financial (15%)
  const contractSafe = !contractEndDate || contractEndDate.getTime() > Date.now() + 30 * 86400000;
  const financialScore = (contractSafe ? 50 : 20) + (hasOverdueInvoice ? 0 : 50);

  // Satisfaction (15%)
  const npsNormalized = npsScore !== null ? (npsScore / 10) * 100 : 50;
  const csatNormalized = csatScore !== null ? (csatScore / 5) * 100 : 50;
  const satisfactionScore = Math.round(npsNormalized * 0.6 + csatNormalized * 0.4);

  const overallScore = Math.round(
    contentScore * 0.25 + engagementScore * 0.25 + responsivenessScore * 0.20 +
    financialScore * 0.15 + satisfactionScore * 0.15,
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    healthStatus: overallScore > 70 ? 'green' : overallScore > 40 ? 'yellow' : 'red',
    churnRisk: overallScore > 70 ? 'low' : overallScore > 40 ? 'medium' : 'high',
    signals: [],
    categories: {
      contentActivity: contentScore,
      engagement: engagementScore,
      responsiveness: responsivenessScore,
      financial: financialScore,
      satisfaction: satisfactionScore,
    },
    computedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0, toDate: () => new Date() },
  };
}

export async function getMockHealthScore(clientId: string): Promise<ClientHealthScore> {
  return computeHealthScore(
    Math.floor(Math.random() * 15), 10, Math.random() > 0.3,
    12 + Math.random() * 36, (Math.random() - 0.3) * 0.5,
    new Date(Date.now() + 60 * 86400000), Math.random() > 0.8,
    Math.floor(Math.random() * 4) + 6, Math.floor(Math.random() * 2) + 3,
  );
}
