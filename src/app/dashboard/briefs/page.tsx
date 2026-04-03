import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listBriefs } from '@/lib/platform/content-brief-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ClipboardList, UserCheck } from 'lucide-react';

export default async function BriefsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  const briefs = await listBriefs(result.workspaceId) as Record<string, unknown>[];
  const assignedCount = briefs.filter((b) => (b.status as string) !== 'draft').length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Content Briefs</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="briefs-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Content Briefs</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Create structured briefs and assign to writers with deadlines.</p>
          </div>
          <Button size="sm" data-testid="new-brief-button"><Plus className="size-4 mr-1.5" />New Brief</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><ClipboardList className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{briefs.length}</p><p className="text-xs text-muted-foreground">Total Briefs</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><UserCheck className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{assignedCount}</p><p className="text-xs text-muted-foreground">Assigned</p></div></CardContent></Card>
        </div>
        {briefs.length > 0 ? (
          <div className="space-y-2">{briefs.map((b) => {
            const statusColor = (b.status as string) === 'approved' ? 'default' : (b.status as string) === 'review' ? 'secondary' : 'outline';
            return (
              <Card key={b.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium truncate">{b.title as string}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {b.platform ? <Badge variant="outline" className="text-[10px]">{b.platform as string}</Badge> : null}
                        {b.assignedTo ? <span className="text-[11px] text-muted-foreground">Assigned to: {b.assignedTo as string}</span> : null}
                        {b.dueDate ? <><span className="text-[11px] text-muted-foreground">&middot;</span><span className="text-[11px] text-muted-foreground">Due: {b.dueDate as string}</span></> : null}
                      </div>
                    </div>
                    <Badge variant={statusColor}>{b.status as string}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><ClipboardList className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No briefs yet. Create one to assign content tasks to your writers.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
