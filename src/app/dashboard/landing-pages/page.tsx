import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listLandingPages, listFunnels } from '@/lib/landing-pages/landing-page-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, GitBranch, Eye, MousePointerClick } from 'lucide-react';

export default async function LandingPagesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'content.create');

  const [pages, funnels] = await Promise.all([
    listLandingPages(result.workspaceId),
    listFunnels(result.workspaceId),
  ]);

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Landing Pages</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="landing-pages-page">
        {/* Pages Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Landing Pages</h1>
          {canCreate && <Button size="sm" data-testid="create-page-button"><Plus className="size-4 mr-1.5" />New Page</Button>}
        </div>

        {(pages as Record<string, unknown>[]).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(pages as Record<string, unknown>[]).map((page) => (
              <Card key={page.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display truncate">{page.title as string}</CardTitle>
                    <Badge className={statusColors[page.status as string] ?? ''}>{page.status as string}</Badge>
                  </div>
                  {page.slug ? <p className="text-xs text-muted-foreground font-mono">/{page.slug as string}</p> : null}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3.5" />{page.views as number ?? 0} views</span>
                    <span className="flex items-center gap-1"><MousePointerClick className="size-3.5" />{page.conversions as number ?? 0} conversions</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <FileText className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">No landing pages yet. Create your first page to start capturing leads.</p>
          </CardContent></Card>
        )}

        {/* Funnels Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading-lg font-display text-foreground">Funnels</h2>
            {canCreate && <Button variant="outline" size="sm"><Plus className="size-4 mr-1.5" />New Funnel</Button>}
          </div>
          {(funnels as Record<string, unknown>[]).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(funnels as Record<string, unknown>[]).map((funnel) => (
                <Card key={funnel.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="size-4 text-brand-orange" />
                      <p className="font-ui text-sm font-medium">{funnel.name as string}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((funnel.steps as unknown[]) ?? []).length} steps &middot; {funnel.totalConversions as number ?? 0} conversions
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center">
              <GitBranch className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No funnels yet. Chain landing pages together to build conversion funnels.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
