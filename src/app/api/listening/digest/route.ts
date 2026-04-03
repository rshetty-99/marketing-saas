/**
 * POST /api/listening/digest — Trigger manual digest email
 */

import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listMentions } from '@/lib/listening/listening-service';

export async function POST() {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  // In production: gather recent mentions, generate summary, send email via SendGrid
  const mentions = await listMentions(auth.workspaceId, 20);
  const items = mentions as Record<string, unknown>[];

  const digest = {
    totalMentions: items.length,
    positive: items.filter((i) => i.sentiment === 'positive' || (i.sentiment as Record<string, unknown>)?.label === 'positive').length,
    negative: items.filter((i) => i.sentiment === 'negative' || (i.sentiment as Record<string, unknown>)?.label === 'negative').length,
    sent: false,
    message: 'Digest email would be sent in production (requires SendGrid/Resend).',
  };

  return NextResponse.json({ digest });
}
