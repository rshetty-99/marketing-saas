import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listWorkflows, createWorkflow } from '@/lib/automation/automation-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;
  const workflows = await listWorkflows(authResult.workspaceId);
  return NextResponse.json({ workflows });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(authResult)) return authResult;
  const body = await request.json();
  const id = await createWorkflow(authResult.workspaceId, body, authResult.userId);
  return NextResponse.json({ id });
}
