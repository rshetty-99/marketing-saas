/**
 * GET /api/crm/forms/[id]/embed — Return embed code (public)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Search across all workspaces for the form (public endpoint)
  const snap = await adminDb.collectionGroup('crm_forms').where('id', '==', id).limit(1).get();
  if (snap.empty) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  const form = snap.docs[0].data();
  return NextResponse.json({
    formId: id,
    fields: form.fields,
    embedCode: form.embedCode,
    requireGdprConsent: form.requireGdprConsent ?? false,
  });
}
