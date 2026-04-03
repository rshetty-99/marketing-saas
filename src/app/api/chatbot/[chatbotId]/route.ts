/**
 * Chatbot Detail API
 * GET: Fetch chatbot config + sessions
 * PATCH: Update chatbot config
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getChatbot, updateChatbot, listChatSessions } from '@/lib/chatbot/chatbot-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ chatbotId: string }> }) {
  const authResult = await requireWorkspaceAuth('content.view');
  if (isAuthError(authResult)) return authResult;

  const { chatbotId } = await params;
  const [chatbot, sessions] = await Promise.all([
    getChatbot(authResult.workspaceId, chatbotId),
    listChatSessions(authResult.workspaceId, chatbotId),
  ]);
  if (!chatbot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ chatbot, sessions });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ chatbotId: string }> }) {
  const authResult = await requireWorkspaceAuth('content.create');
  if (isAuthError(authResult)) return authResult;

  const { chatbotId } = await params;
  const body = await req.json();
  await updateChatbot(authResult.workspaceId, chatbotId, body);
  return NextResponse.json({ success: true });
}
