import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listCampaigns, BUILT_IN_TEMPLATES } from '@/lib/f11/email-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Send } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/15 text-blue-400',
  sending: 'bg-yellow-500/15 text-yellow-400',
  sent: 'bg-green-500/15 text-green-400',
  failed: 'bg-red-500/15 text-red-400',
};

export default async function EmailPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'email.view_analytics');
  if (!canView) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'email.create_campaigns');
  const campaigns = await listCampaigns(result.workspaceId, { limit: 20 });

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Email</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="email-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Email Campaigns</h1>
          {canCreate && (
            <Button size="sm" data-testid="create-campaign-button"><Plus className="size-4 mr-1.5" />New Campaign</Button>
          )}
        </div>

        {/* Template selector */}
        {canCreate && (
          <Card data-testid="template-selector">
            <CardHeader><CardTitle className="font-display text-sm">Start from a template</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {BUILT_IN_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="rounded-lg border border-border p-3 hover:border-brand-orange/50 cursor-pointer transition-colors" data-testid={`template-${tpl.category}`}>
                    <Mail className="size-5 text-brand-orange mb-2" />
                    <p className="font-ui text-sm font-medium">{tpl.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{tpl.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign list */}
        <Card>
          <CardHeader><CardTitle className="font-display">Campaigns ({campaigns.length})</CardTitle></CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.id as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Send className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-ui text-sm text-foreground">{c.name as string}</p>
                        <p className="text-[11px] text-muted-foreground">{c.subject as string}</p>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[c.status as string] ?? ''}>{c.status as string}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-body-sm text-muted-foreground">No campaigns yet. Create one to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
