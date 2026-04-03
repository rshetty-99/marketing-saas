import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listHashtagGroups } from '@/lib/marketing/hashtag-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Hash, TrendingUp } from 'lucide-react';

export default async function HashtagsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  const groups = await listHashtagGroups(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Hashtag Research</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="hashtags-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Hashtag Research</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Manage hashtag groups and research trending tags.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Group</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Hash className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{groups.length}</p><p className="text-xs text-muted-foreground">Hashtag Groups</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><TrendingUp className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{groups.reduce((s, g) => s + ((g.hashtags as unknown[] | undefined)?.length ?? (g.hashtagCount as number ?? 0)), 0)}</p><p className="text-xs text-muted-foreground">Total Hashtags</p></div></CardContent></Card>
        </div>
        {groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map((g) => (
            <Card key={g.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{g.name as string}</CardTitle><Badge variant="outline">{(g.hashtags as unknown[] | undefined)?.length ?? (g.hashtagCount as number ?? 0)} tags</Badge></div></CardHeader>
              <CardContent><div className="flex gap-2">{(g.platform as string) && <Badge variant="secondary">{g.platform as string}</Badge>}</div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Hash className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No hashtag groups yet. Create a group to organize your hashtags.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
