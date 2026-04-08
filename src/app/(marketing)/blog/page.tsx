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

/** Deep-serialize Firestore data to plain objects safe for Client Components */
function serializePosts(posts: Record<string, unknown>[]): Record<string, unknown>[] {
  // JSON round-trip strips Firestore Timestamp classes → converts to {_seconds, _nanoseconds}
  // Then we walk the result and convert those to ISO strings
  const raw = JSON.parse(JSON.stringify(posts)) as Record<string, unknown>[];
  return raw.map((post) => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(post)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && '_seconds' in (value as Record<string, unknown>)) {
        const ts = value as { _seconds: number };
        out[key] = new Date(ts._seconds * 1000).toISOString();
      } else {
        out[key] = value;
      }
    }
    return out;
  });
}

export default async function BlogPage() {
  let posts: Record<string, unknown>[] = [];

  try {
    const raw = (await listPublishedPosts(BLOG_WORKSPACE_ID, { limit: 50 })) as Record<
      string,
      unknown
    >[];
    posts = serializePosts(raw);
  } catch {
    // Firestore may not be initialized — show empty state
    posts = [];
  }

  const categories = BLOG_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

  return <BlogListingClient posts={posts} categories={categories} />;
}
