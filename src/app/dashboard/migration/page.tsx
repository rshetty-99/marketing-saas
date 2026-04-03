import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listMigrationJobs } from '@/lib/platform/migration-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowDownToLine, FolderSync } from 'lucide-react';

export default async function MigrationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canManage = await hasPermission('workspace', result.member.role, 'workspace.update_settings');
  if (!canManage) redirect('/dashboard');

  const jobs = await listMigrationJobs(result.workspaceId) as Record<string, unknown>[];
  const totalMigrated = jobs.reduce((s, j) => s + ((j.migratedItems as number) ?? 0), 0);
  const totalErrors = jobs.reduce((s, j) => s + ((j.errors as number) ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Content Migration</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="migration-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Content Migration</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Import content from Hootsuite, Buffer, Later, and more.</p>
          </div>
          <Button size="sm" data-testid="start-migration-button"><Plus className="size-4 mr-1.5" />Start Migration</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3"><FolderSync className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{jobs.length}</p><p className="text-xs text-muted-foreground">Migration Jobs</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><ArrowDownToLine className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{totalMigrated.toLocaleString()}</p><p className="text-xs text-muted-foreground">Items Migrated</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><ArrowDownToLine className="size-8 text-red-600" /><div><p className="text-2xl font-display font-bold">{totalErrors}</p><p className="text-xs text-muted-foreground">Errors</p></div></CardContent></Card>
        </div>
        {jobs.length > 0 ? (
          <div className="space-y-2">{jobs.map((j) => {
            const statusColor = (j.status as string) === 'completed' ? 'default' : (j.status as string) === 'in_progress' ? 'secondary' : (j.status as string) === 'failed' ? 'destructive' : 'outline';
            return (
              <Card key={j.id as string} className="hover:border-brand-orange/50 transition-colors">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium truncate">{j.source as string}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground">{(j.migratedItems as number) ?? 0}/{(j.totalItems as number) ?? 0} items</span>
                        {((j.errors as number) ?? 0) > 0 && <Badge variant="destructive" className="text-[10px]">{j.errors as number} errors</Badge>}
                      </div>
                    </div>
                    <Badge variant={statusColor}>{j.status as string}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><FolderSync className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No migrations yet. Import your content from another platform to get started.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
