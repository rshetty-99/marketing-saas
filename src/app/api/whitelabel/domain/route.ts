/**
 * Custom Domain Verification API
 * POST: Initiate domain verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { verifyCustomDomain } from '@/lib/whitelabel/whitelabel-service';
import { z } from 'zod';

const domainSchema = z.object({
  domain: z.string().min(3).regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format'),
});

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('settings.manage');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = domainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await verifyCustomDomain(authResult.workspaceId, parsed.data.domain);
  return NextResponse.json(result);
}
