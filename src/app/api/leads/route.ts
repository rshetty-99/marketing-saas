import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createLead, listLeads } from '@/lib/f12/lead-service';
import { createLeadSchema } from '@/lib/validations/leads';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('leads.create');
  if (isAuthError(authResult)) return authResult;
  const { searchParams } = new URL(request.url);
  const leads = await listLeads(authResult.workspaceId, {
    stage: searchParams.get('stage') ?? undefined,
    assignedTo: searchParams.get('assignedTo') ?? undefined,
  });
  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('leads.create');
  if (isAuthError(authResult)) return authResult;
  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const leadId = await createLead(authResult.workspaceId, parsed.data, authResult.userId);
  return NextResponse.json({ leadId });
}
