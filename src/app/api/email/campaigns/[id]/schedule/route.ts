/**
 * POST /api/email/campaigns/[id]/schedule — Schedule campaign for future send
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z.object({ scheduledAt: z.string().datetime() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ref = adminDb.collection('workspaces').doc(auth.workspaceId).collection('email_campaigns').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  await ref.update({
    status: 'scheduled',
    scheduledAt: new Date(parsed.data.scheduledAt),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, status: 'scheduled', scheduledAt: parsed.data.scheduledAt });
}
