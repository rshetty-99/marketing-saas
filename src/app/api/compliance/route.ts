import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createDataRequest, listDataRequests, getRetentionPolicy } from '@/lib/gdpr/compliance-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;
  const [requests, retention] = await Promise.all([
    listDataRequests(authResult.workspaceId),
    getRetentionPolicy(authResult.workspaceId),
  ]);
  return NextResponse.json({ requests, retention });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;
  const body = await request.json();
  const requestId = await createDataRequest(authResult.workspaceId, body.type, authResult.userId);
  return NextResponse.json({ requestId });
}
