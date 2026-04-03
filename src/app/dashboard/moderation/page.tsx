import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listModerationRules } from '@/lib/platform/moderation-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShieldCheck, Filter } from 'lucide-react';

export default async function ModerationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'inbox.view');
  if (!canView) redirect('/dashboard');

  const rules = await listModerationRules(result.workspaceId) as Record<string, unknown>[];
  const activeCount = rules.filter((r) => r.active === true).length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Auto-Moderation</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="moderation-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Auto-Moderation</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Set rules to auto-hide, flag, or respond to comments.</p>
          </div>
          <Button size="sm" data-testid="new-rule-button"><Plus className="size-4 mr-1.5" />New Rule</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><ShieldCheck className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{rules.length}</p><p className="text-xs text-muted-foreground">Total Rules</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Filter className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        </div>
        {rules.length > 0 ? (
          <div className="space-y-2">{rules.map((r) => {
            const actionColor = (r.action as string) === 'delete' ? 'destructive' : (r.action as string) === 'flag' ? 'secondary' : 'outline';
            return (
              <Card key={r.id as string} className="hover:border-brand-orange/50 transition-colors">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium truncate">{r.name as string}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={actionColor} className="text-[10px]">{r.action as string}</Badge>
                        <span className="text-[11px] text-muted-foreground">{(r.matchCount as number) ?? 0} matches</span>
                      </div>
                    </div>
                    <Badge variant={r.active ? 'default' : 'outline'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><ShieldCheck className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No moderation rules yet. Create one to automatically manage comments.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
