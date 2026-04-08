import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listAudits } from '@/lib/marketing-ai/website-auditor';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, BarChart3, Plus } from 'lucide-react';

export default async function WebsiteAuditPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const audits = await listAudits(result.workspaceId) as Record<string, unknown>[];

  const totalAudits = audits.length;
  const avgScore = totalAudits > 0
    ? Math.round(audits.reduce((sum, a) => sum + ((a.overallScore as number) ?? 0), 0) / totalAudits)
    : 0;

  const scoreColor = (score: number) =>
    score > 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : score > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Website Audit</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="website-audit-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Website Audit</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Paste any URL to get a comprehensive marketing audit with scores across 6 dimensions.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Audit</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-ui text-muted-foreground">Total Audits</CardTitle></CardHeader>
            <CardContent><div className="flex items-center gap-2"><Globe className="size-5 text-brand-orange" /><span className="text-2xl font-display font-bold">{totalAudits}</span></div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-ui text-muted-foreground">Average Score</CardTitle></CardHeader>
            <CardContent><div className="flex items-center gap-2"><BarChart3 className="size-5 text-brand-orange" /><span className="text-2xl font-display font-bold">{totalAudits > 0 ? `${avgScore}/100` : '—'}</span></div></CardContent>
          </Card>
        </div>

        {/* Audit list */}
        {audits.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {audits.map((a) => (
              <Card key={a.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-heading-md font-display truncate">{a.url as string}</CardTitle>
                    <Badge className={statusColors[a.status as string] ?? ''}>{a.status as string}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge className={scoreColor((a.overallScore as number) ?? 0)}>{a.overallScore as number}/100</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <Globe className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">Paste a URL to run your first marketing audit</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
