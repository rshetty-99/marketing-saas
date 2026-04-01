import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { getProfileScore } from '@/lib/f0/profile-score';
import { requireMinRole } from '@/lib/auth/require-role';
import { AuthError, SoftLockError, NotFoundError } from '@/lib/auth/errors';

function handleError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  if (error instanceof SoftLockError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(_request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Determine workspace ID
    let workspaceId = orgId;

    if (!workspaceId) {
      const workspacesSnap = await adminDb
        .collection('workspaces')
        .where('ownerId', '==', userId)
        .limit(1)
        .get();

      if (workspacesSnap.empty) {
        return NextResponse.json(
          { error: 'No workspace found' },
          { status: 404 },
        );
      }

      workspaceId = workspacesSnap.docs[0].id;
    }

    // Verify the user is at least a viewer in this workspace
    await requireMinRole(workspaceId, 'viewer');

    const score = await getProfileScore(workspaceId);

    return NextResponse.json({ score });
  } catch (error: unknown) {
    return handleError(error);
  }
}
