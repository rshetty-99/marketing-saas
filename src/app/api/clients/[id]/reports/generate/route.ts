/**
 * POST /api/clients/[id]/reports/generate — Trigger report PDF generation
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('clients.switch_context');
  if (isAuthError(auth)) return auth;

  const { id: clientId } = await params;
  const body = await req.json();

  // In production: gather analytics, render PDF via React PDF, upload to Storage
  const ref = adminDb.collection('client_reports').doc();
  await ref.set({
    id: ref.id, clientId, agencyWorkspaceId: auth.workspaceId,
    periodStart: body.periodStart ? new Date(body.periodStart) : new Date(Date.now() - 30 * 86400000),
    periodEnd: body.periodEnd ? new Date(body.periodEnd) : new Date(),
    reportType: body.reportType ?? 'monthly',
    pdfStorageUrl: `https://storage.example.com/reports/${ref.id}.pdf`,
    metrics: { contentPublished: 12, totalEngagement: 3450, followerGrowth: 234, topPlatform: 'instagram' },
    sentTo: [], status: 'draft',
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: auth.userId,
  });

  return NextResponse.json({ reportId: ref.id }, { status: 201 });
}
