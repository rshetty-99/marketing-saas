/**
 * PATCH /api/listening/feed/[id] — Update mention status (actioned/dismissed/saved)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['new', 'actioned', 'dismissed', 'saved']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ref = adminDb.collection('workspaces').doc(auth.workspaceId).collection('listening_feed').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Mention not found' }, { status: 404 });

  await ref.update({ status: parsed.data.status, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ success: true });
}
