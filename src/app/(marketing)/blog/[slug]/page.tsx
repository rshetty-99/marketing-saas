import { notFound } from 'next/navigation';
import { getPostBySlug, listPublishedPosts, listComments } from '@/lib/blog/blog-service';
import { BlogPostClient } from './BlogPostClient';

const BLOG_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_BLOG_WORKSPACE_ID ?? 'org_3BrAQY4IeIQF7yjqSP74lqSF2jT';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post: Record<string, unknown> | null = null;
  try {
    post = (await getPostBySlug(BLOG_WORKSPACE_ID, slug)) as Record<string, unknown> | null;
  } catch {
    return { title: 'Blog | Aura.ai' };
  }

  if (!post) return { title: 'Post Not Found | Aura.ai' };

  const seoTitle = (post.seoTitle as string) || (post.title as string);
  const seoDescription = (post.seoDescription as string) || (post.excerpt as string);
  const ogImage = (post.ogImageUrl as string) || (post.coverImageUrl as string) || undefined;

  return {
    title: `${seoTitle} | Aura.ai Blog`,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post: Record<string, unknown> | null = null;
  let comments: Record<string, unknown>[] = [];
  let relatedPosts: Record<string, unknown>[] = [];

  try {
    post = (await getPostBySlug(BLOG_WORKSPACE_ID, slug)) as Record<string, unknown> | null;
  } catch {
    notFound();
  }

  if (!post) notFound();

  try {
    comments = (await listComments(BLOG_WORKSPACE_ID, post.id as string)) as Record<
      string,
      unknown
    >[];
  } catch {
    comments = [];
  }

  // Load related posts
  try {
    const relatedIds = (post.relatedPostIds as string[]) ?? [];
    if (relatedIds.length > 0) {
      const allPublished = (await listPublishedPosts(BLOG_WORKSPACE_ID, { limit: 50 })) as Record<
        string,
        unknown
      >[];
      relatedPosts = allPublished
        .filter((p) => relatedIds.includes(p.id as string))
        .slice(0, 3);
    }

    // Fallback: get posts from same category
    if (relatedPosts.length < 3) {
      const sameCat = (await listPublishedPosts(BLOG_WORKSPACE_ID, {
        category: post.category as string,
        limit: 4,
      })) as Record<string, unknown>[];
      const existing = new Set(relatedPosts.map((p) => p.id as string));
      existing.add(post.id as string);
      for (const p of sameCat) {
        if (!existing.has(p.id as string) && relatedPosts.length < 3) {
          relatedPosts.push(p);
        }
      }
    }
  } catch {
    relatedPosts = [];
  }

  return (
    <BlogPostClient
      post={post}
      comments={comments}
      relatedPosts={relatedPosts}
      workspaceId={BLOG_WORKSPACE_ID}
    />
  );
}
