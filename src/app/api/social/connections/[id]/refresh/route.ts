/**
 * POST /api/social/connections/[id]/refresh — Manual token refresh
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('social.connect');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { id } = await params;

  const connRef = adminDb
    .collection('workspaces').doc(workspaceId)
    .collection('social_connections').doc(id);
  const connDoc = await connRef.get();

  if (!connDoc.exists) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const conn = connDoc.data()!;

  // In production: use refreshToken to get a new accessToken from the platform's token endpoint
  // For dev: simulate a refresh
  await connRef.update({
    status: 'active',
    tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    platform: conn.platform,
    status: 'active',
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  });
}
