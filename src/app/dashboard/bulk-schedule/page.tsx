import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listBulkJobs } from '@/lib/marketing/bulk-schedule-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Table } from 'lucide-react';

export default async function BulkSchedulePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canView) redirect('/dashboard');

  const jobs = await listBulkJobs(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Bulk Schedule</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="bulk-schedule-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Bulk Schedule</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Import CSV files to schedule content in bulk.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Upload CSV</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Upload className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{jobs.length}</p><p className="text-xs text-muted-foreground">Bulk Jobs</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Table className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{jobs.reduce((s, j) => s + ((j.successCount as number) ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Posts Scheduled</p></div></CardContent></Card>
        </div>
        {jobs.length > 0 ? (
          <div className="space-y-2">{jobs.map((j) => (
            <Card key={j.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardContent className="py-3"><div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-medium">{j.fileName as string}</p>
                  <p className="text-xs text-muted-foreground">{(j.successCount as number) ?? 0} succeeded &middot; {(j.errorCount as number) ?? 0} errors</p>
                </div>
                <Badge variant={(j.status as string) === 'completed' ? 'default' : (j.status as string) === 'failed' ? 'destructive' : 'outline'}>{j.status as string}</Badge>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Upload className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No bulk jobs yet. Upload a CSV to schedule content in bulk.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
