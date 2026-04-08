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
import { Repeat2, ArrowRight } from 'lucide-react';

export default async function RepurposePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canCreate) redirect('/dashboard');

  // Get published content that can be repurposed
  const published = await listDrafts(result.workspaceId, { status: 'published', limit: 30 }) as Record<string, unknown>[];
  const drafts = await listDrafts(result.workspaceId, { status: 'draft', limit: 20 }) as Record<string, unknown>[];
  const allContent = [...published, ...drafts];

  const channelTargets = ['instagram', 'linkedin', 'twitter', 'facebook', 'blog', 'email', 'tiktok', 'youtube'];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Repurpose</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="repurpose-page">
        <div>
          <h1 className="text-heading-xl font-display text-foreground">Repurpose Content</h1>
          <p className="text-body-sm text-muted-foreground mt-1">Transform existing content into new formats for different platforms using AI.</p>
        </div>

        {/* Source Content */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Select Source Content ({allContent.length})</h2>
          {allContent.length > 0 ? (
            <div className="space-y-2">
              {allContent.map((draft) => (
                <Card key={draft.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-sm font-medium truncate">{draft.title as string}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {draft.channel ? <Badge variant="outline" className="text-[10px]">{draft.channel as string}</Badge> : null}
                        {draft.contentType ? <Badge variant="outline" className="text-[10px]">{draft.contentType as string}</Badge> : null}
                        <Badge className={`text-[10px] ${draft.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {draft.status as string}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <ArrowRight className="size-4 text-muted-foreground" />
                      <div className="flex gap-1">
                        {channelTargets.slice(0, 4).map((ch) => (
                          <Badge key={ch} variant="outline" className="text-[9px] cursor-pointer hover:bg-brand-orange/10 hover:border-brand-orange/30">
                            {ch}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline">
                        <Repeat2 className="size-3.5 mr-1" />Repurpose
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center">
              <Repeat2 className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No content to repurpose yet. Create and publish content first.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
