import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listSEOReports } from '@/lib/f10/seo-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, FileText } from 'lucide-react';

export default async function SEOPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'seo.view_reports');
  if (!canView) redirect('/dashboard');
  const canAnalyze = await hasPermission('workspace', result.member.role, 'seo.run_research');
  const reports = await listSEOReports(result.workspaceId, 20);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">SEO</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="seo-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">SEO & Keywords</h1>
          {canAnalyze && (
            <Button size="sm" data-testid="analyze-button"><Search className="size-4 mr-1.5" />Analyze Content</Button>
          )}
        </div>

        {/* SEO Score Card */}
        <Card data-testid="seo-score-card">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><TrendingUp className="size-5 text-brand-orange" />SEO Overview</CardTitle></CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-ui text-sm text-foreground">{(report.targetKeyword as string) ?? 'Untitled'}</p>
                        <p className="text-[11px] text-muted-foreground">{report.type as string}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{(report.onPageScore as Record<string, unknown>)?.overallScore as number ?? '—'}/100</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-body-sm text-muted-foreground">No SEO reports yet. Analyze your content to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
