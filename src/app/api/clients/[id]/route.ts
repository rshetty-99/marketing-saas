import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getClient, updateClient } from '@/lib/f14/client-service';
import { getMockHealthScore } from '@/lib/f14/client-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireWorkspaceAuth('clients.switch_context');
  if (isAuthError(authResult)) return authResult;
  const { id } = await params;
  const client = await getClient(id);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  const health = await getMockHealthScore(id);
  return NextResponse.json({ client, health });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireWorkspaceAuth('clients.assign_team');
  if (isAuthError(authResult)) return authResult;
  const { id } = await params;
  const body = await request.json();
  await updateClient(id, body);
  return NextResponse.json({ success: true });
}
