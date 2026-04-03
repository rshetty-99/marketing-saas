/**
 * CRM Forms API
 * POST: Create embeddable form
 * GET: List forms
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  fields: z.array(z.object({
    name: z.string(), type: z.string(), required: z.boolean().optional(), label: z.string().optional(),
  })).min(1),
  redirectUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
  requireGdprConsent: z.boolean().optional(),
  clientId: z.string().optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('leads.create');
  if (isAuthError(auth)) return auth;
  const snap = await adminDb.collection('workspaces').doc(auth.workspaceId)
    .collection('crm_forms').orderBy('createdAt', 'desc').limit(50).get();
  return NextResponse.json({ forms: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('leads.create');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ref = adminDb.collection('workspaces').doc(auth.workspaceId).collection('crm_forms').doc();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const embedCode = `<iframe src="${baseUrl}/embed/form/${ref.id}" width="100%" height="500" frameborder="0"></iframe>`;

  await ref.set({
    id: ref.id, workspaceId: auth.workspaceId, submissionCount: 0,
    requireGdprConsent: false, embedCode,
    ...parsed.data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: auth.userId,
  });
  return NextResponse.json({ id: ref.id, embedCode }, { status: 201 });
}
