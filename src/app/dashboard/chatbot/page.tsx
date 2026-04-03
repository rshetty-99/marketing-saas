import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listChatbots, listChatSessions } from '@/lib/chatbot/chatbot-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageCircle, Bot, Users, Code } from 'lucide-react';

export default async function ChatbotPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'content.create');

  const [chatbots, sessions] = await Promise.all([
    listChatbots(result.workspaceId),
    listChatSessions(result.workspaceId),
  ]);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">AI Chatbot</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="chatbot-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">AI Chatbot</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Deploy AI-powered chatbots to capture leads and answer questions on your website.</p>
          </div>
          {canCreate && <Button size="sm" data-testid="create-chatbot-button"><Plus className="size-4 mr-1.5" />New Chatbot</Button>}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Bot className="size-8 text-brand-orange" />
              <div>
                <p className="text-2xl font-display font-bold">{(chatbots as unknown[]).length}</p>
                <p className="text-xs text-muted-foreground">Active Chatbots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <MessageCircle className="size-8 text-brand-orange" />
              <div>
                <p className="text-2xl font-display font-bold">{(sessions as unknown[]).length}</p>
                <p className="text-xs text-muted-foreground">Chat Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Users className="size-8 text-brand-orange" />
              <div>
                <p className="text-2xl font-display font-bold">
                  {(sessions as Record<string, unknown>[]).filter((s) => s.status === 'converted').length}
                </p>
                <p className="text-xs text-muted-foreground">Leads Captured</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chatbot List */}
        {(chatbots as Record<string, unknown>[]).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(chatbots as Record<string, unknown>[]).map((bot) => (
              <Card key={bot.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display">{bot.name as string}</CardTitle>
                    <Badge variant={bot.isActive ? 'default' : 'outline'}>
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {bot.aiEnabled ? 'AI-powered' : 'Rule-based'} &middot; {bot.position as string}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Code className="size-3.5" />
                    <span className="font-mono truncate">{bot.embedCode ? 'Embed code ready' : 'Not deployed'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <Bot className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">No chatbots configured. Create one to start capturing leads from your website.</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
