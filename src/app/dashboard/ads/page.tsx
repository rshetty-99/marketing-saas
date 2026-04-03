import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listAdCampaigns } from '@/lib/marketing/ad-campaign-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Megaphone, DollarSign, MousePointerClick } from 'lucide-react';

export default async function AdsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const campaigns = await listAdCampaigns(result.workspaceId) as Record<string, unknown>[];
  const totalSpent = campaigns.reduce((sum, c) => sum + ((c.spent as number) ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Ad Campaigns</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="ads-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Ad Campaigns</h1>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Campaign</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3"><Megaphone className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{campaigns.length}</p><p className="text-xs text-muted-foreground">Campaigns</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><DollarSign className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">${totalSpent.toFixed(0)}</p><p className="text-xs text-muted-foreground">Total Spend</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><MousePointerClick className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{campaigns.reduce((s, c) => s + ((c.clicks as number) ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Total Clicks</p></div></CardContent></Card>
        </div>
        {campaigns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{campaigns.map((c) => (
            <Card key={c.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{c.name as string}</CardTitle><Badge variant={c.status === 'active' ? 'default' : 'outline'}>{c.status as string}</Badge></div></CardHeader>
              <CardContent><div className="flex gap-3 text-sm text-muted-foreground"><span>{c.platform as string}</span><span>&middot;</span><span>${(c.spent as number ?? 0).toFixed(0)} spent</span><span>&middot;</span><span>{c.conversions as number ?? 0} conversions</span></div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Megaphone className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No ad campaigns yet. Create one to manage paid social and search ads.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
