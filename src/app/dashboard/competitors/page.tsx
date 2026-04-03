import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listCompetitors } from '@/lib/marketing/competitor-benchmark-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp } from 'lucide-react';

export default async function CompetitorsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const competitors = await listCompetitors(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Competitor Benchmarking</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="competitors-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Competitor Benchmarking</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Track competitor social performance, follower growth, and engagement.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Add Competitor</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Target className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{competitors.length}</p><p className="text-xs text-muted-foreground">Competitors Tracked</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><TrendingUp className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{competitors.reduce((s, c) => s + ((c.socialAccounts as unknown[] | undefined)?.length ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Social Accounts</p></div></CardContent></Card>
        </div>
        {competitors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{competitors.map((c) => (
            <Card key={c.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{c.name as string}</CardTitle><Badge variant="outline">{((c.socialAccounts as unknown[] | undefined)?.length ?? 0)} accounts</Badge></div></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground truncate">{(c.website as string) || (c.domain as string) || 'No website'}</p></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Target className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No competitors tracked yet. Add a competitor to start benchmarking.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
