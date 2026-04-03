import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listCrmConnections } from '@/lib/platform/crm-sync-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Database } from 'lucide-react';

export default async function CrmSyncPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canManage = await hasPermission('workspace', result.member.role, 'leads.create');
  if (!canManage) redirect('/dashboard');

  const connections = await listCrmConnections(result.workspaceId) as Record<string, unknown>[];
  const connectedCount = connections.filter((c) => (c.status as string) === 'connected').length;
  const totalSynced = connections.reduce((s, c) => s + ((c.totalSynced as number) ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">CRM Integrations</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="crm-sync-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">CRM Integrations</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Two-way sync with HubSpot, Salesforce, Pipedrive, and more.</p>
          </div>
          <Button size="sm" data-testid="connect-crm-button"><Plus className="size-4 mr-1.5" />Connect CRM</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3"><Database className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{connections.length}</p><p className="text-xs text-muted-foreground">Connections</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><RefreshCw className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{connectedCount}</p><p className="text-xs text-muted-foreground">Connected</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Database className="size-8 text-muted-foreground" /><div><p className="text-2xl font-display font-bold">{totalSynced.toLocaleString()}</p><p className="text-xs text-muted-foreground">Records Synced</p></div></CardContent></Card>
        </div>
        {connections.length > 0 ? (
          <div className="space-y-2">{connections.map((c) => {
            const statusColor = (c.status as string) === 'connected' ? 'default' : (c.status as string) === 'error' ? 'destructive' : 'outline';
            return (
              <Card key={c.id as string} className="hover:border-brand-orange/50 transition-colors">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Database className="size-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-ui text-sm font-medium truncate">{c.provider as string}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground">{c.direction as string}</span>
                          <span className="text-[11px] text-muted-foreground">&middot;</span>
                          <span className="text-[11px] text-muted-foreground">{(c.totalSynced as number) ?? 0} synced</span>
                          {c.lastSyncAt ? <><span className="text-[11px] text-muted-foreground">&middot;</span><span className="text-[11px] text-muted-foreground">Last: {c.lastSyncAt as string}</span></> : null}
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusColor}>{c.status as string}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Database className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No CRM connections yet. Connect your CRM to sync leads and contacts.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
