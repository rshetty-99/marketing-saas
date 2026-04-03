import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { getListeningConfig, listMentions } from '@/lib/listening/listening-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ear, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

export default async function ListeningPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const [config, mentions] = await Promise.all([
    getListeningConfig(result.workspaceId),
    listMentions(result.workspaceId, 30),
  ]);

  const items = mentions as Record<string, unknown>[];
  const sentimentLabel = (item: Record<string, unknown>) => {
    if (typeof item.sentiment === 'string') return item.sentiment;
    if (typeof item.sentiment === 'object' && item.sentiment) return (item.sentiment as Record<string, unknown>).label as string;
    return 'neutral';
  };

  const positive = items.filter((i) => sentimentLabel(i) === 'positive').length;
  const negative = items.filter((i) => sentimentLabel(i) === 'negative').length;
  const neutral = items.length - positive - negative;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Social Listening</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="listening-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Social Listening</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Monitor brand mentions, competitor activity, and sentiment across the web.</p>
          </div>
          <Badge variant={config?.isActive ? 'default' : 'outline'}>
            {config?.isActive ? 'Monitoring Active' : 'Not Configured'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card><CardContent className="py-4 flex items-center gap-3">
            <Ear className="size-8 text-brand-orange" />
            <div><p className="text-2xl font-display font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Mentions</p></div>
          </CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3">
            <TrendingUp className="size-8 text-green-600" />
            <div><p className="text-2xl font-display font-bold">{positive}</p><p className="text-xs text-muted-foreground">Positive</p></div>
          </CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3">
            <Minus className="size-8 text-muted-foreground" />
            <div><p className="text-2xl font-display font-bold">{neutral}</p><p className="text-xs text-muted-foreground">Neutral</p></div>
          </CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3">
            <TrendingDown className="size-8 text-red-600" />
            <div><p className="text-2xl font-display font-bold">{negative}</p><p className="text-xs text-muted-foreground">Negative</p></div>
          </CardContent></Card>
        </div>

        {/* Feed */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Recent Mentions</h2>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => {
                const sent = sentimentLabel(item);
                const sentColor = sent === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : sent === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-muted text-muted-foreground';
                return (
                  <Card key={item.id as string}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-ui text-sm font-medium">{(item.author as string) || (item.authorName as string) || 'Unknown'}</span>
                            <Badge variant="outline" className="text-[10px]">{item.platform as string}</Badge>
                            <Badge className={`text-[10px] ${sentColor}`}>{sent}</Badge>
                          </div>
                          <p className="text-body-sm text-muted-foreground truncate">{(item.content as string) || (item.textSnippet as string)}</p>
                        </div>
                        <Badge variant={item.status === 'new' ? 'default' : 'outline'} className="text-[10px] shrink-0">
                          {item.status as string}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center">
              <Ear className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No mentions found. Configure your keywords to start monitoring.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
