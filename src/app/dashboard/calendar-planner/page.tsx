import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listCalendarPlans } from '@/lib/marketing-ai/calendar-generator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Sparkles, Plus } from 'lucide-react';

export default async function CalendarPlannerPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canCreate = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canCreate) redirect('/dashboard');

  const plans = await listCalendarPlans(result.workspaceId) as Record<string, unknown>[];

  const statusColors: Record<string, string> = {
    draft: '',
    generated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    generating: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Content Calendar Planner</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="calendar-planner-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Content Calendar Planner</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Generate a full 30-day content calendar tailored to your business and platforms.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Generate Calendar</Button>
        </div>

        {plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display">{p.name as string}</CardTitle>
                    <Badge className={statusColors[p.status as string] ?? ''}>{p.status as string}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{p.businessType as string}</span>
                    <span>&middot;</span>
                    <span>{p.totalPosts as number} posts</span>
                  </div>
                  {((p.platforms as string[]) ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {((p.platforms as string[]) ?? []).map((platform) => (
                        <Badge key={platform} variant="outline" className="text-[10px]">{platform}</Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <CalendarDays className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">Generate your first 30-day content calendar</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
