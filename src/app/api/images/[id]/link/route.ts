/**
 * POST /api/images/[id]/link — Link image to a content draft
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z.object({ contentDraftId: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('images.generate');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ref = adminDb.collection('workspaces').doc(auth.workspaceId).collection('generated_images').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  await ref.update({
    linkedContentId: parsed.data.contentDraftId,
    usageCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
