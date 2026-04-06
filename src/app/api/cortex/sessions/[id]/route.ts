/**
 * GET /api/cortex/sessions/[id] — Get session with messages
 * PATCH /api/cortex/sessions/[id] — Update feedback on a message
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getSession, getSessionMessages, updateMessageFeedback } from '@/lib/cortex/cortex-service';
import { cortexFeedbackSchema } from '@/lib/validations/cortex';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const session = await getSession(auth.workspaceId, id) as Record<string, unknown> | null;
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  // Verify session ownership (owner/admin can view any session for audit)
  const isOwnerOrAdmin = auth.member.role === 'owner' || auth.member.role === 'admin';
  if (session.userId !== auth.userId && !isOwnerOrAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await getSessionMessages(auth.workspaceId, id);
  return NextResponse.json({ session, messages });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = cortexFeedbackSchema.safeParse({ ...body, sessionId: id });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await updateMessageFeedback(auth.workspaceId, id, parsed.data.messageId, {
    rating: parsed.data.rating,
    reason: parsed.data.reason ?? null,
    freeText: parsed.data.freeText ?? null,
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
