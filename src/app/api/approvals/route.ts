/**
 * GET /api/approvals — List approval requests
 * POST /api/approvals — Submit content for approval
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { submitForApproval, listApprovals } from '@/lib/f6/approval-service';
import { submitForApprovalSchema } from '@/lib/validations/content';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('approvals.submit_for_approval');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const { searchParams } = new URL(request.url);

  const approvals = await listApprovals(workspaceId, {
    status: searchParams.get('status') ?? undefined,
    submittedBy: searchParams.get('mine') === 'true' ? userId : undefined,
    limit: parseInt(searchParams.get('limit') ?? '50', 10),
  });

  return NextResponse.json({ approvals });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('approvals.submit_for_approval');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = submitForApprovalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const approvalId = await submitForApproval(
    workspaceId,
    parsed.data.contentDraftId,
    userId,
    parsed.data.approverUserId,
    parsed.data.workflowTemplateId,
  );

  return NextResponse.json({ approvalId });
}
