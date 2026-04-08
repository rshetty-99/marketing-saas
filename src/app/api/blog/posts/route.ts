/**
 * Blog Posts API
 * GET: List posts (public for published, auth for drafts)
 * POST: Create new post (auth + blog.create)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createPost, listPosts, listPublishedPosts } from '@/lib/blog/blog-service';
import { createBlogPostSchema, blogListQuerySchema } from '@/lib/validations/blog';
import { checkRateLimit, getClientIp, BLOG_RATE_LIMITS } from '@/lib/blog/blog-rate-limiter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get('public') === 'true';

  if (isPublic) {
    // Public read — rate limited, only published posts
    const ip = getClientIp(req.headers);
    if (!checkRateLimit(`blog:read:${ip}`, BLOG_RATE_LIMITS.publicRead.max, BLOG_RATE_LIMITS.publicRead.windowMs)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const params = blogListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!params.success) return NextResponse.json({ error: params.error.flatten() }, { status: 400 });

    // For public access, use env var or default workspace ID
    const workspaceId = searchParams.get('workspaceId')
      ?? process.env.NEXT_PUBLIC_BLOG_WORKSPACE_ID
      ?? 'org_3BrAQY4IeIQF7yjqSP74lqSF2jT';

    const posts = await listPublishedPosts(workspaceId, {
      category: params.data.category,
      limit: params.data.limit,
    });
    return NextResponse.json({ posts });
  }

  // Authenticated — list all posts for workspace
  const auth = await requireWorkspaceAuth('blog.create');
  if (isAuthError(auth)) return auth;

  const params = blogListQuerySchema.safeParse(Object.fromEntries(searchParams));
  const filters = params.success ? params.data : {};
  const posts = await listPosts(auth.workspaceId, filters);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('blog.create');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = createBlogPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Get author info from member record
  const memberDoc = await (await import('@/lib/firebase/admin')).adminDb
    .collection('workspaces').doc(auth.workspaceId)
    .collection('members').doc(auth.userId).get();
  const member = memberDoc.data() ?? {};

  const result = await createPost(auth.workspaceId, parsed.data, {
    userId: auth.userId,
    name: (member.displayName as string) ?? 'Unknown',
    avatar: member.avatarUrl as string | undefined,
    role: (member.role as string) ?? 'editor',
    bio: member.bio as string | undefined,
  });

  return NextResponse.json(result, { status: 201 });
}
