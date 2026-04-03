/**
 * GET /api/clients/[id]/activity — Client activity log
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('clients.switch_context');
  if (isAuthError(auth)) return auth;

  const { id: clientId } = await params;

  // Fetch audit logs filtered by client context
  const snap = await adminDb.collection('workspaces').doc(auth.workspaceId)
    .collection('audit_logs')
    .where('details.clientId', '==', clientId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();

  const activities = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ activities });
}
