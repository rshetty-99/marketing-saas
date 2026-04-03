/**
 * Comment Auto-Moderation API
 * GET: List moderation rules
 * POST: Create rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listModerationRules, createModerationRule } from '@/lib/platform/moderation-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  conditions: z.array(z.object({
    type: z.enum(['contains_word', 'regex', 'sentiment', 'spam_score', 'competitor_mention']),
    value: z.string(),
    caseSensitive: z.boolean().optional(),
  })).min(1),
  action: z.enum(['hide', 'flag', 'delete', 'auto_reply']),
  autoReplyTemplate: z.string().optional(),
  platform: z.string().optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('inbox.view');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ rules: await listModerationRules(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('inbox.respond');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createModerationRule(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
