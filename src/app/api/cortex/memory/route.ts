/**
 * Cortex Memory API — Phase 11C
 * GET: List memories for current workspace/user/client
 * POST: Save or delete memory
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { loadMemories, saveMemory, deleteMemory, listAllMemories } from '@/lib/cortex/memory-service';
import { z } from 'zod';

const saveSchema = z.object({
  content: z.string().min(1).max(500),
  category: z.enum(['preference', 'pattern', 'insight']),
  clientId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const listAll = req.nextUrl.searchParams.get('all') === 'true';
  if (listAll) {
    const memories = await listAllMemories(auth.workspaceId);
    return NextResponse.json({ memories });
  }

  const clientId = req.nextUrl.searchParams.get('clientId') ?? undefined;
  const memories = await loadMemories(auth.workspaceId, auth.userId, clientId);
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();

  if (body.action === 'delete' && body.memoryId) {
    await deleteMemory(auth.workspaceId, body.memoryId);
    return NextResponse.json({ success: true });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const id = await saveMemory(auth.workspaceId, {
    ...parsed.data,
    userId: auth.userId,
    source: 'explicit',
  });
  return NextResponse.json({ id }, { status: 201 });
}
