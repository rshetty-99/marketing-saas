/**
 * GET /api/seo/rankings — Current ranking snapshots
 * Populated by Cloud Function weekly; this endpoint reads the data.
 */

import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;

  const snap = await adminDb.collection('workspaces').doc(auth.workspaceId)
    .collection('seo_reports')
    .where('type', '==', 'ranking_snapshot')
    .orderBy('generatedAt', 'desc')
    .limit(10)
    .get();

  const rankings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ rankings });
}
