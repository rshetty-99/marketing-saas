'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Eye, FileText } from 'lucide-react';
import type { BlogPostStatus, BlogCategory } from '@/types/features/blog';

interface BlogDashboardClientProps {
  posts: Record<string, unknown>[];
  statusStyles: Record<BlogPostStatus, string>;
  categoryLabels: Record<BlogCategory, string>;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export function BlogDashboardClient({
  posts,
  statusStyles,
  categoryLabels,
}: BlogDashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter((p) => (p.status as string) === statusFilter);
  }, [posts, statusFilter]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
            className="rounded-full font-ui text-sm"
            data-testid={`blog-filter-${f.value}`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Posts table/grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((post) => {
              const title = post.title as string;
              const status = post.status as BlogPostStatus;
              const category = post.category as BlogCategory;
              const author = post.author as Record<string, unknown> | undefined;
              const authorName = author?.name as string | undefined;
              const views = (post.views as number) ?? 0;

              const publishedAt = post.publishedAt as Record<string, unknown> | undefined;
              const pubDate = publishedAt
                ? new Date((publishedAt._seconds as number) * 1000).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' },
                  )
                : '--';

              return (
                <motion.div
                  key={post.id as string}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:border-brand-orange/50 transition-colors">
                    <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-medium text-foreground truncate">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {authorName && <span>{authorName}</span>}
                            <span>{pubDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="font-ui text-xs">
                          {categoryLabels[category] ?? category}
                        </Badge>
                        <Badge className={`${statusStyles[status]} border-0 font-ui text-xs capitalize`}>
                          {status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-[60px]">
                          <Eye className="size-3.5" />
                          {views.toLocaleString()}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              data-testid={`blog-post-actions-${post.id as string}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem data-testid="blog-action-edit">
                              <Pencil className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              data-testid="blog-action-delete"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">
                {statusFilter === 'all'
                  ? 'No blog posts yet. Create your first post to get started.'
                  : `No ${statusFilter} posts found.`}
              </p>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
}
