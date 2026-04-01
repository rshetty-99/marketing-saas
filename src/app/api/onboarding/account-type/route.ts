import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { selectAccountTypeSchema } from '@/lib/validations/onboarding';
import { createWorkspace } from '@/lib/f0/workspace-creation';
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

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unable to retrieve user profile' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = selectAccountTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { accountType } = parsed.data;
    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') || email.split('@')[0];

    const workspaceId = await createWorkspace({
      userId,
      email,
      displayName,
      accountType,
      workspaceName: `${displayName}'s Workspace`,
    });

    return NextResponse.json({ workspaceId }, { status: 201 });
  } catch (error: unknown) {
    return handleError(error);
  }
}
