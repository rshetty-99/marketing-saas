/**
 * Messaging API
 * GET: List conversations
 * POST: Create conversation or send message
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listConversations, createConversation, sendMessage } from '@/lib/messaging/messaging-service';
import { z } from 'zod';

const createConvoSchema = z.object({
  contactPhone: z.string().min(5),
  contactName: z.string().optional(),
  channel: z.enum(['sms', 'whatsapp', 'mms']),
  clientId: z.string().optional(),
});

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(1600),
  mediaUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('inbox.view');
  if (isAuthError(authResult)) return authResult;

  const channel = req.nextUrl.searchParams.get('channel') ?? undefined;
  const conversations = await listConversations(authResult.workspaceId, channel);
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('inbox.respond');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();

  // Send message to existing conversation
  if (body.conversationId) {
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const msgId = await sendMessage(
      authResult.workspaceId,
      parsed.data.conversationId,
      parsed.data.content,
      parsed.data.mediaUrl,
    );
    return NextResponse.json({ messageId: msgId }, { status: 201 });
  }

  // Create new conversation
  const parsed = createConvoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const id = await createConversation(authResult.workspaceId, parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
