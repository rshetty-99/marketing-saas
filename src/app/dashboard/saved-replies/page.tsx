import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listSavedReplies } from '@/lib/marketing/saved-replies-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquareText, Bookmark } from 'lucide-react';

export default async function SavedRepliesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'inbox.view');
  if (!canView) redirect('/dashboard');

  const replies = await listSavedReplies(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Saved Replies</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="saved-replies-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Saved Replies</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Quick response templates for your unified inbox.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Reply</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><MessageSquareText className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{replies.length}</p><p className="text-xs text-muted-foreground">Saved Replies</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Bookmark className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{replies.reduce((s, r) => s + ((r.usageCount as number) ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Total Uses</p></div></CardContent></Card>
        </div>
        {replies.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{replies.map((r) => (
            <Card key={r.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{r.title as string}</CardTitle>{(r.category as string) && <Badge variant="secondary">{r.category as string}</Badge>}</div></CardHeader>
              <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground">
                {(r.shortcut as string) && <Badge variant="outline">/{r.shortcut as string}</Badge>}
                <span>{(r.usageCount as number) ?? 0} uses</span>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><MessageSquareText className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No saved replies yet. Create templates for quick inbox responses.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
