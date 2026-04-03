import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listRSSFeeds } from '@/lib/marketing/rss-auto-post-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Rss, Radio } from 'lucide-react';

export default async function RSSFeedsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canView) redirect('/dashboard');

  const feeds = await listRSSFeeds(result.workspaceId) as Record<string, unknown>[];
  const activeFeeds = feeds.filter((f) => (f.active as boolean) === true || (f.status as string) === 'active').length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">RSS Feeds</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="rss-feeds-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">RSS Feeds</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Auto-post content from RSS feeds to your social accounts.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Add Feed</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Rss className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{feeds.length}</p><p className="text-xs text-muted-foreground">RSS Feeds</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Radio className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{activeFeeds}</p><p className="text-xs text-muted-foreground">Active Feeds</p></div></CardContent></Card>
        </div>
        {feeds.length > 0 ? (
          <div className="space-y-2">{feeds.map((f) => {
            const isActive = (f.active as boolean) === true || (f.status as string) === 'active';
            return (
              <Card key={f.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardContent className="py-3"><div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm font-medium">{f.name as string}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.feedUrl as string}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isActive ? 'default' : 'outline'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                    <Badge variant="outline">{(f.itemsPosted as number) ?? 0} posted</Badge>
                  </div>
                </div></CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Rss className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No RSS feeds yet. Add a feed to auto-post content.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
