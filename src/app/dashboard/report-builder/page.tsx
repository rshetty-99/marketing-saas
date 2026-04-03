import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listReportTemplates } from '@/lib/marketing/report-builder-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileBarChart, Calendar } from 'lucide-react';

export default async function ReportBuilderPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const templates = await listReportTemplates(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Report Builder</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="report-builder-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Report Builder</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Create branded client reports with scheduled PDF delivery.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Template</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><FileBarChart className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{templates.length}</p><p className="text-xs text-muted-foreground">Report Templates</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Calendar className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{templates.filter((t) => (t.frequency as string) && (t.frequency as string) !== 'manual').length}</p><p className="text-xs text-muted-foreground">Scheduled Reports</p></div></CardContent></Card>
        </div>
        {templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((t) => (
            <Card key={t.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{t.name as string}</CardTitle><Badge variant="secondary">{(t.format as string) || 'PDF'}</Badge></div></CardHeader>
              <CardContent><div className="flex items-center gap-2">
                <Badge variant="outline">{(t.frequency as string) || 'manual'}</Badge>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><FileBarChart className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No report templates yet. Create one to generate branded client reports.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
