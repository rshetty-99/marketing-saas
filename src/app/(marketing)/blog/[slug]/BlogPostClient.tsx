'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogShareBar } from '@/components/blog/BlogShareBar';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { BlogAnalyticsTracker } from '@/components/blog/BlogAnalyticsTracker';
import {
  Heart,
  Eye,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Send,
} from 'lucide-react';
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

interface BlogPostClientProps {
  post: Record<string, unknown>;
  comments: Record<string, unknown>[];
  relatedPosts: Record<string, unknown>[];
  workspaceId: string;
}

/**
 * Blog post page client component.
 * Note: contentHtml is pre-sanitized by the blog-service (sanitizeHtml)
 * on every create/update, so rendering it is safe.
 */
export function BlogPostClient({
  post,
  comments: initialComments,
  relatedPosts,
  workspaceId,
}: BlogPostClientProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState((post.likes as number) ?? 0);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const title = post.title as string;
  const excerpt = post.excerpt as string;
  const contentHtml = post.contentHtml as string;
  const coverImageUrl = post.coverImageUrl as string | undefined;
  const coverImageAlt = post.coverImageAlt as string | undefined;
  const category = post.category as BlogCategory;
  const tags = (post.tags as string[]) ?? [];
  const author = post.author as Record<string, unknown>;
  const readTimeMinutes = post.readTimeMinutes as number;
  const wordCount = post.wordCount as number;
  const views = post.views as number;
  const postId = post.id as string;

  const authorName = author?.name as string;
  const authorRole = author?.role as string;
  const authorBio = author?.bio as string | undefined;
  const authorAvatar = author?.avatar as string | undefined;

  const publishedAt = post.publishedAt as Record<string, unknown> | undefined;
  const publishDate = publishedAt
    ? new Date((publishedAt._seconds as number) * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const initials = authorName
    ? authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AU';

  const handleLike = useCallback(async () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await fetch(`/api/blog/posts/${postId}/like`, {
        method: 'POST',
      });
    } catch {
      // Revert on failure
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  }, [liked, postId]);

  const handleComment = useCallback(async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/blog/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        setComments((prev) => [
          ...prev,
          {
            id: data.id as string,
            content: commentText,
            authorName: 'You',
            createdAt: { _seconds: Date.now() / 1000 },
          },
        ]);
        setCommentText('');
      }
    } catch {
      // Silently fail
    } finally {
      setSubmittingComment(false);
    }
  }, [commentText, submittingComment, postId]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = useCallback(
    async (platform: string) => {
      try {
        await fetch('/api/blog/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            workspaceId,
            eventType: 'share',
            platform,
          }),
        });
      } catch {
        // Silently fail
      }
    },
    [postId, workspaceId],
  );

  return (
    <>
      <ReadingProgress />
      <BlogAnalyticsTracker postId={postId} workspaceId={workspaceId} />

      <article className="pb-20">
        {/* Cover image */}
        {coverImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-h-[500px] overflow-hidden rounded-b-3xl"
          >
            <img
              src={coverImageUrl}
              alt={coverImageAlt ?? title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
        )}

        {/* Post header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 mt-10"
        >
          {/* Category */}
          <Badge
            className={`${CATEGORY_COLORS[category] ?? 'bg-gray-500/90 text-white'} border-0 text-xs font-ui mb-4`}
          >
            {CATEGORY_LABELS[category] ?? category}
          </Badge>

          {/* Title */}
          <h1
            className="font-display font-bold text-foreground leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {title}
          </h1>

          {/* Excerpt */}
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{excerpt}</p>

          {/* Author bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo text-sm font-bold text-white">
                {initials}
              </div>
            )}
            <div>
              <span className="font-ui font-medium text-foreground">{authorName}</span>
              {authorRole && (
                <span className="text-muted-foreground"> · {authorRole}</span>
              )}
            </div>
            <span className="text-muted-foreground/40">|</span>
            {publishDate && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {publishDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {readTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <FileText className="size-3.5" />
              {wordCount.toLocaleString()} words
            </span>
          </div>

          {/* Share bar */}
          <div className="mt-4">
            <BlogShareBar url={shareUrl} title={title} onShare={handleShare} />
          </div>
        </motion.div>

        {/* Scroll markers for analytics */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div data-scroll-marker="25" className="absolute top-1/4" />
          <div data-scroll-marker="50" className="absolute top-1/2" />
          <div data-scroll-marker="75" className="absolute top-3/4" />
          <div data-scroll-marker="100" className="absolute bottom-0" />
        </div>

        {/* Article body — contentHtml is pre-sanitized by blog-service sanitizeHtml() */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 mt-10"
        >
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-brand-orange"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full font-ui text-xs cursor-pointer hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
                  data-testid={`blog-tag-${tag}`}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author bio card */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex items-start gap-5">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="size-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo text-xl font-bold text-white shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-display font-semibold text-lg text-foreground">
                  {authorName}
                </p>
                {authorRole && (
                  <p className="text-sm text-muted-foreground">{authorRole}</p>
                )}
                {authorBio && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {authorBio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Like + View count */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 flex items-center gap-6">
          <Button
            variant={liked ? 'default' : 'outline'}
            size="sm"
            onClick={handleLike}
            className={`gap-1.5 ${liked ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
            data-testid="blog-like-btn"
          >
            <Heart className={`size-4 ${liked ? 'fill-white' : ''}`} />
            {likeCount}
          </Button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="size-4" />
            {views?.toLocaleString() ?? 0} views
          </span>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
            <h2 className="font-display font-semibold text-2xl text-foreground mb-6">
              Related Articles
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.id as string} post={rp} />
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16" data-testid="blog-comments-section">
          <h2 className="font-display font-semibold text-xl text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="size-5" />
            Comments ({comments.length})
          </h2>

          {/* Comment list */}
          <div className="space-y-4 mb-8">
            {comments.map((comment) => {
              const cAuthor = comment.authorName as string;
              const cContent = comment.content as string;
              const cCreated = comment.createdAt as Record<string, unknown> | undefined;
              const cDate = cCreated
                ? new Date((cCreated._seconds as number) * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '';
              const cAvatar = comment.authorAvatar as string | undefined;
              const cInitials = cAuthor
                ? cAuthor
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : '??';

              return (
                <Card key={comment.id as string}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      {cAvatar ? (
                        <img
                          src={cAvatar}
                          alt={cAuthor}
                          className="size-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/70 to-brand-indigo/70 text-[10px] font-bold text-white">
                          {cInitials}
                        </div>
                      )}
                      <span className="font-ui text-sm font-medium text-foreground">
                        {cAuthor}
                      </span>
                      {cDate && (
                        <span className="text-xs text-muted-foreground">{cDate}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed pl-9">
                      {cContent}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>

          {/* Add comment */}
          <div className="flex gap-3">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 font-ui text-sm"
              data-testid="blog-comment-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleComment}
              disabled={!commentText.trim() || submittingComment}
              data-testid="blog-comment-submit"
            >
              <Send className="size-4 mr-1.5" />
              Post
            </Button>
          </div>
        </div>
      </article>
    </>
  );
}
