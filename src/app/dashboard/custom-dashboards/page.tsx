import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listDashboards } from '@/lib/platform/custom-dashboard-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutDashboard, Puzzle } from 'lucide-react';

export default async function CustomDashboardsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const dashboards = await listDashboards(result.workspaceId) as Record<string, unknown>[];
  const totalWidgets = dashboards.reduce((s, d) => s + (((d.widgets as unknown[]) ?? []).length), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Custom Dashboards</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="custom-dashboards-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Custom Dashboards</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Build personalized dashboards with drag-and-drop widgets.</p>
          </div>
          <Button size="sm" data-testid="new-dashboard-button"><Plus className="size-4 mr-1.5" />New Dashboard</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><LayoutDashboard className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{dashboards.length}</p><p className="text-xs text-muted-foreground">Dashboards</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Puzzle className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{totalWidgets}</p><p className="text-xs text-muted-foreground">Total Widgets</p></div></CardContent></Card>
        </div>
        {dashboards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{dashboards.map((d) => (
            <Card key={d.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{d.name as string}</CardTitle>{d.isDefault ? <Badge variant="default">Default</Badge> : null}</div></CardHeader>
              <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{((d.widgets as unknown[]) ?? []).length} widgets</span>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><LayoutDashboard className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No custom dashboards yet. Create one to visualize your metrics your way.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
