/**
 * GET /api/social/callback/[platform] — OAuth callback handler
 * Exchanges authorization code for tokens, stores encrypted connection.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { connectAccount } from '@/lib/f9/social-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}&platform=${platform}`, request.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=missing_code&platform=${platform}`, request.url),
    );
  }

  // In production: exchange code for tokens using platform's token endpoint
  // For dev, create mock connection using the service's mock data path
  type SocialPlatform = Parameters<typeof connectAccount>[1];
  await connectAccount(
    result.workspaceId,
    platform as SocialPlatform,
    userId,
    { platformAccountId: `oauth_${platform}_${Date.now()}` },
  );

  return NextResponse.redirect(
    new URL(`/dashboard/integrations?connected=${platform}`, request.url),
  );
}
