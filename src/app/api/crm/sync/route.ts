/**
 * CRM Sync API
 * GET: List CRM connections
 * POST: Create connection or trigger sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listCrmConnections, createCrmConnection, triggerSync } from '@/lib/platform/crm-sync-service';
import { z } from 'zod';

const createSchema = z.object({
  provider: z.enum(['hubspot', 'salesforce', 'pipedrive', 'gohighlevel', 'zoho']),
  direction: z.enum(['push', 'pull', 'bidirectional']).optional(),
  instanceUrl: z.string().optional(),
  portalId: z.string().optional(),
  clientId: z.string().optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('leads.create');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ connections: await listCrmConnections(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('leads.create');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'sync' && body.connectionId) {
    const logId = await triggerSync(auth.workspaceId, body.connectionId);
    return NextResponse.json({ syncLogId: logId });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createCrmConnection(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
