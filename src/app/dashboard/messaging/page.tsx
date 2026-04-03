import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { getMessagingConfig, listConversations } from '@/lib/messaging/messaging-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Phone, Smartphone } from 'lucide-react';

export default async function MessagingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'inbox.view');
  if (!canView) redirect('/dashboard');
  const canRespond = await hasPermission('workspace', result.member.role, 'inbox.respond');

  const [config, conversations] = await Promise.all([
    getMessagingConfig(result.workspaceId),
    listConversations(result.workspaceId),
  ]);

  const smsConvos = (conversations as Record<string, unknown>[]).filter((c) => c.channel === 'sms');
  const whatsappConvos = (conversations as Record<string, unknown>[]).filter((c) => c.channel === 'whatsapp');

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Messaging</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="messaging-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">SMS & WhatsApp</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Two-way messaging with leads and clients via SMS and WhatsApp.</p>
          </div>
          {canRespond && <Button size="sm" data-testid="new-conversation-button"><Plus className="size-4 mr-1.5" />New Conversation</Button>}
        </div>

        {/* Config Status */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Phone className="size-8 text-brand-orange" />
              <div>
                <p className="font-ui text-sm font-medium">SMS</p>
                <Badge variant={config?.smsEnabled ? 'default' : 'outline'}>
                  {config?.smsEnabled ? 'Connected' : 'Not configured'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Smartphone className="size-8 text-green-600" />
              <div>
                <p className="font-ui text-sm font-medium">WhatsApp</p>
                <Badge variant={config?.whatsappEnabled ? 'default' : 'outline'}>
                  {config?.whatsappEnabled ? 'Connected' : 'Not configured'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <MessageSquare className="size-8 text-brand-orange" />
              <div>
                <p className="text-2xl font-display font-bold">{(conversations as unknown[]).length}</p>
                <p className="text-xs text-muted-foreground">Total Conversations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SMS */}
          <div>
            <h2 className="text-heading-md font-display text-foreground mb-3">SMS ({smsConvos.length})</h2>
            {smsConvos.length > 0 ? (
              <div className="space-y-2">
                {smsConvos.map((convo) => (
                  <Card key={convo.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-ui text-sm font-medium">{(convo.contactName as string) || (convo.contactPhone as string)}</p>
                        <p className="text-xs text-muted-foreground">{convo.contactPhone as string} &middot; {convo.messageCount as number} messages</p>
                      </div>
                      <Badge variant={convo.status === 'active' ? 'default' : 'outline'}>{convo.status as string}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="py-8 text-center">
                <Phone className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-body-sm text-muted-foreground">No SMS conversations yet.</p>
              </CardContent></Card>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <h2 className="text-heading-md font-display text-foreground mb-3">WhatsApp ({whatsappConvos.length})</h2>
            {whatsappConvos.length > 0 ? (
              <div className="space-y-2">
                {whatsappConvos.map((convo) => (
                  <Card key={convo.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-ui text-sm font-medium">{(convo.contactName as string) || (convo.contactPhone as string)}</p>
                        <p className="text-xs text-muted-foreground">{convo.contactPhone as string} &middot; {convo.messageCount as number} messages</p>
                      </div>
                      <Badge variant={convo.status === 'active' ? 'default' : 'outline'}>{convo.status as string}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="py-8 text-center">
                <Smartphone className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-body-sm text-muted-foreground">No WhatsApp conversations yet.</p>
              </CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
