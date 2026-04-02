import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listLeads, getPipelineConfig } from '@/lib/f12/lead-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, DollarSign } from 'lucide-react';

export default async function LeadsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'leads.create');
  if (!canCreate) redirect('/dashboard');

  const [rawLeads, pipelineConfig] = await Promise.all([
    listLeads(result.workspaceId, { limit: 100 }),
    getPipelineConfig(result.workspaceId),
  ]);
  const leads = rawLeads as { id: string; firstName?: string; lastName?: string; companyName?: string; stage?: string; dealValue?: number; probability?: number; [key: string]: unknown }[];
  const stages = (pipelineConfig?.stages ?? []) as { id: string; label: string; color: string; isWon?: boolean; isLost?: boolean }[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Leads</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="leads-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Lead Pipeline</h1>
          <Button size="sm" data-testid="create-lead-button"><Plus className="size-4 mr-1.5" />New Lead</Button>
        </div>

        {/* Pipeline columns */}
        <div className="flex gap-4 overflow-x-auto pb-4" data-testid="pipeline-view">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => (l.stage as string) === stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + ((l.dealValue as number) ?? 0), 0);
            return (
              <div key={stage.id} className="min-w-[280px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="font-ui text-sm font-medium">{stage.label}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{stageLeads.length}</Badge>
                </div>
                {stageValue > 0 && (
                  <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                    <DollarSign className="size-3" />{(stageValue / 100).toLocaleString()}
                  </p>
                )}
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                      <CardContent className="py-3">
                        <p className="font-ui text-sm font-medium truncate">{lead.firstName as string} {lead.lastName as string}</p>
                        {lead.companyName && <p className="text-[11px] text-muted-foreground">{lead.companyName as string}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {lead.dealValue && (
                            <Badge variant="outline" className="text-[10px]">
                              ${((lead.dealValue as number) / 100).toLocaleString()}
                            </Badge>
                          )}
                          {lead.probability && (
                            <Badge variant="outline" className="text-[10px]">{lead.probability as number}%</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
