import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { listClients, getMockHealthScore } from '@/lib/f14/client-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Heart } from 'lucide-react';

const HEALTH_COLORS: Record<string, string> = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' };
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/15 text-green-400', paused: 'bg-yellow-500/15 text-yellow-400',
  onboarding: 'bg-blue-500/15 text-blue-400', churned: 'bg-red-500/15 text-red-400',
};

export default async function ClientsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const wsDoc = await adminDb.collection('workspaces').doc(result.workspaceId).get();
  if (wsDoc.data()?.accountType !== 'agency') redirect('/dashboard');

  const canView = await hasPermission('workspace', result.member.role, 'clients.switch_context');
  if (!canView) redirect('/dashboard');

  const rawClients = await listClients(result.workspaceId);

  // Compute health for each client
  const clientsWithHealth = await Promise.all(
    rawClients.map(async (c: Record<string, unknown>) => ({
      id: c.id as string,
      name: (c.name as string) ?? 'Unnamed',
      industry: (c.industry as string) ?? null,
      status: (c.status as string) ?? 'active',
      health: await getMockHealthScore(c.id as string),
    })),
  );

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Clients</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="clients-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Clients</h1>
          <Button size="sm" data-testid="add-client-button"><Plus className="size-4 mr-1.5" />Add Client</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="client-list">
          {clientsWithHealth.map((client) => (
            <Card key={client.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer" data-testid={`client-${client.id}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-ui text-sm font-medium">{client.name as string}</p>
                    <p className="text-[11px] text-muted-foreground">{client.industry as string ?? 'No industry'}</p>
                  </div>
                  <div className={`size-3 rounded-full ${HEALTH_COLORS[client.health.healthStatus] ?? 'bg-muted'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[client.status as string] ?? ''} variant="outline">
                    {client.status as string}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Heart className="size-2.5 mr-1" />
                    {client.health.overallScore}/100
                  </Badge>
                  {client.health.churnRisk === 'high' && (
                    <Badge className="bg-red-500/15 text-red-400 text-[10px]">At Risk</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {clientsWithHealth.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <Building2 className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-body-sm text-muted-foreground">No clients yet. Add your first client to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
