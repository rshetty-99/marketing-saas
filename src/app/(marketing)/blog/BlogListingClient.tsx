'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Rss } from 'lucide-react';
import type { BlogCategory } from '@/types/features/blog';

interface BlogListingClientProps {
  posts: Record<string, unknown>[];
  categories: { value: BlogCategory; label: string }[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function BlogListingClient({ posts, categories }: BlogListingClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return posts;
    return posts.filter((p) => (p.category as string) === activeCategory);
  }, [posts, activeCategory]);

  const featuredPost = filteredPosts.find((p) => p.featured === true) ?? filteredPosts[0];
  const gridPosts = filteredPosts.filter((p) => p !== featuredPost);

  if (posts.length === 0) {
    return <BlogEmptyState />;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1
            className="font-display font-semibold text-foreground tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            The Aura Blog
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights on AI marketing, agency growth, and content strategy from our team.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          <Button
            variant={activeCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="rounded-full font-ui text-sm"
            data-testid="blog-category-all"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
              className="rounded-full font-ui text-sm"
              data-testid={`blog-category-${cat.value}`}
            >
              {cat.label}
            </Button>
          ))}
        </motion.div>

        {/* Featured post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <BlogCard post={featuredPost} featured />
          </motion.div>
        )}

        {/* Post grid */}
        {gridPosts.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {gridPosts.map((post) => (
              <motion.div key={post.id as string} variants={item}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredPosts.length === 0 && activeCategory !== 'all' && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No posts in this category yet. Check back soon!
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setActiveCategory('all')}
              data-testid="blog-show-all"
            >
              Show all posts
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function BlogEmptyState() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-indigo to-[#00E5FF]" />
          <div className="absolute inset-0 bg-brand-void/40" />

          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl p-[1px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-orange via-[#A855F7] to-[#00E5FF] opacity-50" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-20 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Rss className="size-12 text-white/80 mx-auto mb-6" />
              <h2
                className="font-display font-medium text-white tracking-tight"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
              >
                Our blog is launching soon
              </h2>
              <p className="mt-4 text-white/70 text-body-md max-w-xl mx-auto">
                We are preparing in-depth articles on AI marketing, agency growth strategies, and
                content automation. Subscribe to get notified when we publish.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full sm:flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/40 text-sm font-ui focus-visible:ring-white/50"
                  data-testid="blog-subscribe-email"
                />
                <Button
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-brand-void text-sm font-ui font-medium hover:bg-white/90 shadow-xl"
                  data-testid="blog-subscribe-btn"
                >
                  Subscribe
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
