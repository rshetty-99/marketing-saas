import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listProposals } from '@/lib/marketing-ai/proposal-generator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Briefcase, Plus } from 'lucide-react';

export default async function ProposalsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canCreate) redirect('/dashboard');

  const proposals = await listProposals(result.workspaceId) as Record<string, unknown>[];

  const statusColors: Record<string, string> = {
    draft: '',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Client Proposals</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="proposals-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Client Proposals</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Generate branded client proposals with pricing, scope, timeline, and deliverables.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Proposal</Button>
        </div>

        {proposals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proposals.map((p) => (
              <Card key={p.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display">{p.clientName as string}</CardTitle>
                    <Badge className={statusColors[p.status as string] ?? ''}>{p.status as string}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span><Briefcase className="size-3 inline mr-1" />{p.clientIndustry as string}</span>
                    <span>&middot;</span>
                    <span>{((p.services as unknown[]) ?? []).length} services</span>
                    <span>&middot;</span>
                    <span>${((p.monthlyBudget as number) ?? 0).toLocaleString()}/mo</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <FileText className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">Create your first client proposal</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
