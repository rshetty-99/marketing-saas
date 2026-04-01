/**
 * GET /api/settings/audit-log — Get workspace audit log (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getAuditLog } from '@/lib/f7/team-management';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const action = searchParams.get('action') ?? undefined;
  const resourceType = searchParams.get('resourceType') ?? undefined;
  const actorId = searchParams.get('actorId') ?? undefined;

  const entries = await getAuditLog(workspaceId, { limit, action, resourceType, actorId });

  return NextResponse.json({ entries });
}
