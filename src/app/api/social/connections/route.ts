/**
 * GET /api/social/connections — List social connections
 * POST /api/social/connections — Connect a new social account (mock for dev)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listConnections, connectAccount } from '@/lib/f9/social-service';
import { connectAccountSchema } from '@/lib/validations/social';

export async function GET() {
  const authResult = await requireWorkspaceAuth('social.view_connected');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const connections = await listConnections(workspaceId);

  return NextResponse.json({ connections });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('social.connect');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = connectAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const connectionId = await connectAccount(
    workspaceId,
    parsed.data.platform,
    userId,
    parsed.data.mockData,
  );

  return NextResponse.json({ connectionId });
}
