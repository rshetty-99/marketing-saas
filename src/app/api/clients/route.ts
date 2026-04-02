import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listClients } from '@/lib/f14/client-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth('clients.switch_context');
  if (isAuthError(authResult)) return authResult;
  const clients = await listClients(authResult.workspaceId);
  return NextResponse.json({ clients });
}
