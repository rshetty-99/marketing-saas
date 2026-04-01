import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createWorkspaceSchema } from '@/lib/validations/onboarding';
import { updateOnboardingStep } from '@/lib/f0/onboarding';
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, industry } = parsed.data;

    // Find the user's onboarding workspace
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

    // Update workspace name and industry
    await adminDb.collection('workspaces').doc(workspaceId).update({
      name,
      industry: industry ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await updateOnboardingStep(workspaceId, 3);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
