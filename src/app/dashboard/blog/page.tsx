import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listPosts } from '@/lib/blog/blog-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, PenLine, Archive, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { BlogCategory, BlogPostStatus } from '@/types/features/blog';
import { BlogDashboardClient } from './BlogDashboardClient';

const STATUS_STYLES: Record<BlogPostStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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

export default async function BlogDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'blog.create');
  if (!canCreate) redirect('/dashboard');

  let posts: Record<string, unknown>[] = [];
  try {
    posts = (await listPosts(result.workspaceId, { limit: 100 })) as Record<string, unknown>[];
  } catch {
    posts = [];
  }

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => (p.status as string) === 'published').length;
  const draftCount = posts.filter((p) => (p.status as string) === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + ((p.views as number) ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Blog</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="blog-dashboard-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Blog</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Create and manage blog posts for your audience.</p>
          </div>
          <Button size="sm" data-testid="blog-new-post-btn">
            <Plus className="size-4 mr-1.5" />New Post
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <FileText className="size-8 text-brand-orange" />
              <div>
                <p className="text-2xl font-display font-bold">{totalPosts}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <PenLine className="size-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-display font-bold">{publishedCount}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Archive className="size-8 text-amber-500" />
              <div>
                <p className="text-2xl font-display font-bold">{draftCount}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Eye className="size-8 text-brand-indigo" />
              <div>
                <p className="text-2xl font-display font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <BlogDashboardClient
          posts={posts}
          statusStyles={STATUS_STYLES}
          categoryLabels={CATEGORY_LABELS}
        />
      </div>
    </>
  );
}
