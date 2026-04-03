/**
 * GET /api/social/auth/[platform] — Initiate OAuth PKCE flow
 * Redirects to the platform's authorization URL.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import crypto from 'crypto';

const PLATFORM_CONFIGS: Record<string, { authUrl: string; scopes: string; clientIdEnv: string }> = {
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: 'w_member_social r_basicprofile r_emailaddress',
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: 'tweet.read tweet.write users.read offline.access',
    clientIdEnv: 'TWITTER_CLIENT_ID',
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: 'instagram_basic instagram_content_publish',
    clientIdEnv: 'INSTAGRAM_CLIENT_ID',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scopes: 'pages_manage_posts pages_read_engagement',
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
  },
  google_business: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: 'https://www.googleapis.com/auth/business.manage',
    clientIdEnv: 'GOOGLE_BUSINESS_CLIENT_ID',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    scopes: 'user.info.basic video.upload video.publish',
    clientIdEnv: 'TIKTOK_CLIENT_ID',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: 'https://www.googleapis.com/auth/youtube.upload',
    clientIdEnv: 'YOUTUBE_CLIENT_ID',
  },
  pinterest: {
    authUrl: 'https://api.pinterest.com/oauth/',
    scopes: 'boards:read pins:read pins:write',
    clientIdEnv: 'PINTEREST_CLIENT_ID',
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const authResult = await requireWorkspaceAuth('social.connect');
  if (isAuthError(authResult)) return authResult;

  const { platform } = await params;
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.json({
      error: `OAuth not configured for ${platform}. Set ${config.clientIdEnv} in environment.`,
    }, { status: 503 });
  }

  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // In production, store state + codeVerifier in a short-lived Firestore doc or encrypted cookie
  const redirectBase = process.env.OAUTH_REDIRECT_BASE ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectUri = `${redirectBase}/api/social/callback/${platform}`;

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.json({
    authUrl: authUrl.toString(),
    state,
    codeVerifier,
  });
}
