import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listDrafts } from '@/lib/f1/content-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Clock, CheckCircle, Globe } from 'lucide-react';

export default async function PublishPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canPublish = await hasPermission('workspace', result.member.role, 'publishing.publish');
  if (!canPublish) redirect('/dashboard');

  // Get approved and scheduled drafts ready to publish
  const approved = await listDrafts(result.workspaceId, { status: 'approved', limit: 20 }) as Record<string, unknown>[];
  const scheduled = await listDrafts(result.workspaceId, { status: 'scheduled', limit: 20 }) as Record<string, unknown>[];
  const published = await listDrafts(result.workspaceId, { status: 'published', limit: 20 }) as Record<string, unknown>[];

  const statusIcon: Record<string, typeof Send> = { approved: CheckCircle, scheduled: Clock, published: Globe };
  const statusColor: Record<string, string> = {
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    published: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  };

  function renderDrafts(drafts: Record<string, unknown>[], status: string) {
    if (drafts.length === 0) {
      return (
        <Card><CardContent className="py-8 text-center">
          <p className="text-body-sm text-muted-foreground">No {status} content.</p>
        </CardContent></Card>
      );
    }
    return (
      <div className="space-y-2">
        {drafts.map((draft) => (
          <Card key={draft.id as string} className="hover:border-brand-orange/50 transition-colors">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-ui text-sm font-medium truncate">{draft.title as string}</p>
                <div className="flex items-center gap-2 mt-1">
                  {draft.channel ? <Badge variant="outline" className="text-[10px]">{draft.channel as string}</Badge> : null}
                  {draft.contentType ? <Badge variant="outline" className="text-[10px]">{draft.contentType as string}</Badge> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${statusColor[status] ?? ''}`}>{status}</Badge>
                {status === 'approved' && (
                  <Button size="sm" className="bg-brand-orange text-white hover:bg-brand-orange-hover">
                    <Send className="size-3.5 mr-1" />Publish
                  </Button>
                )}
                {status === 'scheduled' && (
                  <Button size="sm" variant="outline">
                    <Clock className="size-3.5 mr-1" />Reschedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Publish</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="publish-page">
        <div>
          <h1 className="text-heading-xl font-display text-foreground">Publish</h1>
          <p className="text-body-sm text-muted-foreground mt-1">Review approved content and publish to your connected platforms.</p>
        </div>

        {/* Ready to Publish */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="size-5 text-green-500" /> Ready to Publish ({approved.length})
          </h2>
          {renderDrafts(approved, 'approved')}
        </div>

        {/* Scheduled */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3 flex items-center gap-2">
            <Clock className="size-5 text-blue-500" /> Scheduled ({scheduled.length})
          </h2>
          {renderDrafts(scheduled, 'scheduled')}
        </div>

        {/* Recently Published */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3 flex items-center gap-2">
            <Globe className="size-5 text-brand-orange" /> Recently Published ({published.length})
          </h2>
          {renderDrafts(published, 'published')}
        </div>
      </div>
    </>
  );
}
