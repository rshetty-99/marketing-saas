import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { completeOnboarding } from '@/lib/f0/onboarding';
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

export async function PATCH(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Find the user's onboarding workspace where they are the owner
    const workspacesSnap = await adminDb
      .collection('workspaces')
      .where('ownerId', '==', userId)
      .where('onboardingCompleted', '==', false)
      .limit(1)
      .get();

    if (workspacesSnap.empty) {
      return NextResponse.json(
        { error: 'No onboarding workspace found' },
        { status: 404 },
      );
    }

    const workspaceDoc = workspacesSnap.docs[0];
    const workspaceId = workspaceDoc.id;

    await completeOnboarding(workspaceId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
