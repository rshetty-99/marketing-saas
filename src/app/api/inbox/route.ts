import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listInboxItems } from '@/lib/inbox/inbox-service';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;
  const { searchParams } = new URL(request.url);
  const items = await listInboxItems(authResult.workspaceId, {
    status: searchParams.get('status') ?? undefined,
    platform: searchParams.get('platform') ?? undefined,
    assignedTo: searchParams.get('assignedTo') ?? undefined,
  });
  return NextResponse.json({ items });
}
