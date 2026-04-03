/**
 * Developer API — API Key Management
 * GET: List API keys
 * POST: Create new API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listApiKeys, createApiKey, revokeApiKey } from '@/lib/platform/api-keys-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).optional(),
  rateLimit: z.number().min(10).max(1000).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(auth)) return auth;
  const keys = await listApiKeys(auth.workspaceId);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'revoke') {
    await revokeApiKey(auth.workspaceId, body.keyId);
    return NextResponse.json({ success: true });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await createApiKey(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
