import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listInfluencers } from '@/lib/marketing/influencer-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Users } from 'lucide-react';

export default async function InfluencersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  const influencers = await listInfluencers(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Influencers</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="influencers-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Influencers</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Discover, manage, and track influencer partnerships.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Add Influencer</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Star className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{influencers.length}</p><p className="text-xs text-muted-foreground">Influencers</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Users className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{influencers.reduce((s, i) => s + ((i.followerCount as number) ?? 0), 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Combined Followers</p></div></CardContent></Card>
        </div>
        {influencers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{influencers.map((inf) => (
            <Card key={inf.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{inf.name as string}</CardTitle><Badge variant="secondary">{(inf.tier as string) || 'micro'}</Badge></div></CardHeader>
              <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{(inf.handle as string) || (inf.username as string)}</span>
                <span>&middot;</span>
                <Badge variant="outline">{inf.platform as string}</Badge>
                <span>&middot;</span>
                <span>{((inf.followerCount as number) ?? 0).toLocaleString()} followers</span>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Star className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No influencers yet. Add an influencer to start managing partnerships.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
