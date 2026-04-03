import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listABTests } from '@/lib/marketing/ab-testing-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FlaskConical, Trophy } from 'lucide-react';

export default async function ABTestsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const tests = await listABTests(result.workspaceId) as Record<string, unknown>[];

  const statusColors: Record<string, string> = { draft: '', running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">A/B Tests</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="ab-tests-page">
        <div className="flex items-center justify-between">
          <div><h1 className="text-heading-xl font-display text-foreground">A/B Tests</h1>
          <p className="text-body-sm text-muted-foreground mt-1">Split-test emails, posts, and landing pages to optimize conversions.</p></div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Test</Button>
        </div>
        {tests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((t) => (
              <Card key={t.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2"><div className="flex items-start justify-between">
                  <CardTitle className="text-heading-md font-display">{t.name as string}</CardTitle>
                  <Badge className={statusColors[t.status as string] ?? ''}>{t.status as string}</Badge>
                </div></CardHeader>
                <CardContent><div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{t.testType as string}</span>
                  <span>&middot;</span>
                  <span>{((t.variants as unknown[]) ?? []).length} variants</span>
                  {t.winnerVariantId ? <span className="flex items-center gap-1 text-green-600"><Trophy className="size-3" />Winner found</span> : null}
                </div></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <FlaskConical className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">No A/B tests yet. Create one to start optimizing your content.</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
