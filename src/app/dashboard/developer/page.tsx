import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listApiKeys } from '@/lib/platform/api-keys-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Key, Code } from 'lucide-react';

export default async function DeveloperPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canManage = await hasPermission('workspace', result.member.role, 'workspace.update_settings');
  if (!canManage) redirect('/dashboard');

  const apiKeys = await listApiKeys(result.workspaceId) as Record<string, unknown>[];
  const activeCount = apiKeys.filter((k) => (k.status as string) === 'active').length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Developer API</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="developer-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Developer API</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Manage API keys for third-party integrations.</p>
          </div>
          <Button size="sm" data-testid="generate-key-button"><Plus className="size-4 mr-1.5" />Generate Key</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Key className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{apiKeys.length}</p><p className="text-xs text-muted-foreground">Total Keys</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Code className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        </div>
        {apiKeys.length > 0 ? (
          <div className="space-y-2">{apiKeys.map((k) => (
            <Card key={k.id as string} className="hover:border-brand-orange/50 transition-colors">
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key className="size-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium truncate">{k.name as string}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] font-mono">{k.keyPrefix as string}...</Badge>
                        <span className="text-[11px] text-muted-foreground">{((k.scopes as string[]) ?? []).length} scopes</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={(k.status as string) === 'active' ? 'default' : 'destructive'}>
                    {k.status as string}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Key className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No API keys yet. Generate one to integrate with external services.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
