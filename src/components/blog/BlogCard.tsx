'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { BlogCategory } from '@/types/features/blog';

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  ai_marketing: 'bg-violet-500/90 text-white',
  agency_tips: 'bg-brand-orange/90 text-white',
  product_updates: 'bg-blue-500/90 text-white',
  case_studies: 'bg-emerald-500/90 text-white',
  social_media: 'bg-pink-500/90 text-white',
  seo_content: 'bg-amber-500/90 text-white',
  email_marketing: 'bg-cyan-500/90 text-white',
  industry_news: 'bg-brand-indigo/90 text-white',
};

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  ai_marketing: 'AI Marketing',
  agency_tips: 'Agency Tips',
  product_updates: 'Product Updates',
  case_studies: 'Case Studies',
  social_media: 'Social Media',
  seo_content: 'SEO & Content',
  email_marketing: 'Email Marketing',
  industry_news: 'Industry News',
};

interface BlogCardProps {
  post: Record<string, unknown>;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const title = post.title as string;
  const slug = post.slug as string;
  const excerpt = post.excerpt as string;
  const coverImageUrl = post.coverImageUrl as string | undefined;
  const category = post.category as BlogCategory;
  const author = post.author as Record<string, unknown> | undefined;
  const readTimeMinutes = post.readTimeMinutes as number;
  const wordCount = post.wordCount as number;

  const authorName = author?.name as string | undefined;
  const authorAvatar = author?.avatar as string | undefined;

  // Format published date — handles both ISO string and Firestore Timestamp
  const rawDate = post.publishedAt;
  let publishDate = '';
  if (typeof rawDate === 'string') {
    publishDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else if (rawDate && typeof rawDate === 'object' && '_seconds' in (rawDate as Record<string, unknown>)) {
    publishDate = new Date(((rawDate as Record<string, unknown>)._seconds as number) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const initials = authorName
    ? authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AU';

  return (
    <motion.article
      data-testid="blog-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-2xl border border-border bg-card/50 overflow-hidden hover:border-brand-orange/40 transition-colors ${featured ? 'col-span-full' : ''}`}
    >
      <Link href={`/blog/${slug}`} className="group block">
        <div
          className={`relative overflow-hidden ${
            featured ? 'aspect-[21/9]' : 'aspect-video'
          }`}
        >
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-brand-orange/20 via-brand-indigo/20 to-brand-void/30 transition-transform duration-300 group-hover:scale-[1.02]" />
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${CATEGORY_COLORS[category] ?? 'bg-gray-500/90 text-white'} border-0 text-xs font-ui`}>
              {CATEGORY_LABELS[category] ?? category}
            </Badge>
          </div>

          {/* Gradient overlay for featured */}
          {featured && (
            <div className="absolute inset-0 bg-gradient-to-t from-brand-void/70 via-transparent to-transparent" />
          )}
        </div>

        <div className={`p-4 ${featured ? 'max-w-2xl' : ''}`}>
          <h3
            className={`font-display font-semibold text-foreground line-clamp-2 group-hover:text-brand-orange transition-colors ${
              featured ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}
          >
            {title}
          </h3>

          <p className="mt-2 text-muted-foreground text-sm line-clamp-2">{excerpt}</p>

          {/* Author row */}
          <div className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName ?? 'Author'}
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo text-[10px] font-bold text-white">
                {initials}
              </div>
            )}
            <span className="font-ui font-medium text-foreground">{authorName ?? 'Aura Team'}</span>
            <span className="text-muted-foreground/50">|</span>
            {publishDate && <span>{publishDate}</span>}
            {readTimeMinutes > 0 && <span>{readTimeMinutes} min read</span>}
            {wordCount > 0 && <span>{wordCount.toLocaleString()} words</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
