import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listSequences } from '@/lib/marketing-ai/email-sequence-generator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MailPlus, Workflow, Plus } from 'lucide-react';

export default async function EmailSequencesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'email.create_campaigns');
  if (!canCreate) redirect('/dashboard');

  const sequences = await listSequences(result.workspaceId) as Record<string, unknown>[];

  const typeColors: Record<string, string> = {
    welcome: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    nurture: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    launch: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    onboarding: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    're-engagement': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    upsell: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  };

  const statusColors: Record<string, string> = {
    draft: '',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Email Sequences</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="email-sequences-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Email Sequences</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Generate complete email sequences for welcome, nurture, launch, onboarding, re-engagement, and upsell.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Sequence</Button>
        </div>

        {sequences.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sequences.map((s) => (
              <Card key={s.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display">{s.name as string}</CardTitle>
                    <Badge className={statusColors[s.status as string] ?? ''}>{s.status as string}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={typeColors[s.sequenceType as string] ?? ''} variant="outline">{s.sequenceType as string}</Badge>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span><Workflow className="size-3 inline mr-1" />{s.totalEmails as number} emails</span>
                    <span>&middot;</span>
                    <span>{s.estimatedDuration as string}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <MailPlus className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">Create your first email sequence</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
