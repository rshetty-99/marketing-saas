/**
 * Chatbot API
 * GET: List chatbot configs
 * POST: Create new chatbot
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listChatbots, createChatbot } from '@/lib/chatbot/chatbot-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  clientId: z.string().optional(),
  welcomeMessage: z.string().max(500).optional(),
  aiSystemPrompt: z.string().max(2000).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  position: z.enum(['bottom-right', 'bottom-left']).optional(),
});

export async function GET() {
  const authResult = await requireWorkspaceAuth('content.view');
  if (isAuthError(authResult)) return authResult;

  const chatbots = await listChatbots(authResult.workspaceId);
  return NextResponse.json({ chatbots });
}

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await createChatbot(authResult.workspaceId, parsed.data, authResult.userId);
  return NextResponse.json({ id }, { status: 201 });
}
