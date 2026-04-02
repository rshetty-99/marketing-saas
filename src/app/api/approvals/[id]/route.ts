/**
 * GET /api/approvals/[id] — Get approval details
 * POST /api/approvals/[id] — Make decision (approve/reject/reassign)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { makeDecision } from '@/lib/f6/approval-service';
import { approvalDecisionSchema } from '@/lib/validations/content';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('approvals.submit_for_approval');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { id } = await params;

  const doc = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('approvals')
    .doc(id)
    .get();

  if (!doc.exists) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
  }

  return NextResponse.json({ approval: { id: doc.id, ...doc.data() } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('approvals.approve_reject');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const { id } = await params;

  const body = await request.json();
  const parsed = approvalDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await makeDecision(
    workspaceId,
    id,
    userId,
    parsed.data.action,
    parsed.data.feedback as Record<string, unknown>[] | undefined,
    parsed.data.reassignedToId,
  );

  return NextResponse.json({ success: true });
}
