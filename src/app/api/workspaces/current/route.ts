import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { workspaceConverter, workspaceMemberConverter } from '@/lib/firebase/converters/workspace';
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

    // If Clerk provides an active organization, use that
    let workspaceId = orgId;

    if (!workspaceId) {
      // Fall back to finding the user's owned workspace
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

    // Fetch workspace and member doc in parallel
    const [workspaceSnap, memberSnap] = await Promise.all([
      adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .withConverter(workspaceConverter)
        .get(),
      adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .collection('members')
        .doc(userId)
        .withConverter(workspaceMemberConverter)
        .get(),
    ]);

    if (!workspaceSnap.exists) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 },
      );
    }

    const workspace = workspaceSnap.data();
    const member = memberSnap.exists ? memberSnap.data() : null;

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this workspace' },
        { status: 403 },
      );
    }

    return NextResponse.json({ workspace, member });
  } catch (error: unknown) {
    return handleError(error);
  }
}
