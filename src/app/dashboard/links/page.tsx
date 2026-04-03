import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listShortLinks } from '@/lib/marketing/link-shortener-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Link2, MousePointerClick } from 'lucide-react';

export default async function LinksPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  const links = await listShortLinks(result.workspaceId) as Record<string, unknown>[];
  const totalClicks = links.reduce((s, l) => s + ((l.clicks as number) ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Links &amp; UTM</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="links-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Links &amp; UTM</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Create short links, manage UTM parameters, and track clicks.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Link</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Link2 className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{links.length}</p><p className="text-xs text-muted-foreground">Short Links</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><MousePointerClick className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{totalClicks}</p><p className="text-xs text-muted-foreground">Total Clicks</p></div></CardContent></Card>
        </div>
        {links.length > 0 ? (
          <div className="space-y-2">{links.map((l) => (
            <Card key={l.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardContent className="py-3"><div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-medium truncate">{l.shortUrl as string}</p>
                  <p className="text-xs text-muted-foreground truncate">{l.originalUrl as string}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{(l.clicks as number) ?? 0} clicks</Badge>
                </div>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Link2 className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No short links yet. Create one to start tracking clicks.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
