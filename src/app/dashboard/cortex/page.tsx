import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { listSessions } from '@/lib/cortex/cortex-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, Clock } from 'lucide-react';

export default async function CortexPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const sessions = await listSessions(result.workspaceId, userId, 50) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Cortex</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="cortex-history-page">
        <div>
          <h1 className="text-heading-xl font-display text-foreground flex items-center gap-2">
            <Sparkles className="size-6 text-brand-orange" /> Cortex
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">Your AI marketing command center. View past sessions and usage.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3">
            <MessageSquare className="size-8 text-brand-orange" />
            <div><p className="text-2xl font-display font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Total Sessions</p></div>
          </CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3">
            <Sparkles className="size-8 text-brand-indigo" />
            <div><p className="text-2xl font-display font-bold">{sessions.reduce((sum, s) => sum + ((s.messageCount as number) ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Total Messages</p></div>
          </CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3">
            <Clock className="size-8 text-brand-orange" />
            <div><p className="text-2xl font-display font-bold">{sessions.filter((s) => s.status === 'active').length}</p><p className="text-xs text-muted-foreground">Active Sessions</p></div>
          </CardContent></Card>
        </div>

        {/* Session History */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Session History</h2>
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card key={session.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium truncate">{session.title as string}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{session.messageCount as number} messages</span>
                        <span>&middot;</span>
                        <span>{session.tokensConsumed as number ?? 0} tokens</span>
                      </div>
                    </div>
                    <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
                      {session.status as string}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center">
              <Sparkles className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No Cortex sessions yet. Click the ✨ button to start your first conversation.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
