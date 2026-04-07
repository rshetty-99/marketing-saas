import { listPublishedPosts } from '@/lib/blog/blog-service';
import { BLOG_CATEGORIES } from '@/types/features/blog';
import { BlogListingClient } from './BlogListingClient';

const BLOG_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_BLOG_WORKSPACE_ID ?? 'org_3BrAQY4IeIQF7yjqSP74lqSF2jT';

export const metadata = {
  title: 'Blog | Aura.ai',
  description:
    'Insights on AI marketing, agency growth, social media strategy, and content creation from the Aura.ai team.',
};

export default async function BlogPage() {
  let posts: Record<string, unknown>[] = [];

  try {
    posts = (await listPublishedPosts(BLOG_WORKSPACE_ID, { limit: 50 })) as Record<
      string,
      unknown
    >[];
  } catch {
    // Firestore may not be initialized — show empty state
    posts = [];
  }

  const categories = BLOG_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

  return <BlogListingClient posts={posts} categories={categories} />;
}
