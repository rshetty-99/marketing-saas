import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { updateLead } from '@/lib/f12/lead-service';
import { updateLeadSchema } from '@/lib/validations/leads';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireWorkspaceAuth('leads.edit_any');
  if (isAuthError(authResult)) return authResult;
  const { id } = await params;
  const body = await request.json();
  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  await updateLead(authResult.workspaceId, id, parsed.data, authResult.userId);
  return NextResponse.json({ success: true });
}
