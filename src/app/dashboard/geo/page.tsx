import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listGeoReports, getMockShareOfVoice } from '@/lib/geo/geo-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ScanSearch, FileCode, Globe, Shield, TrendingUp, Plus } from 'lucide-react';

export default async function GeoPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'seo.view_reports');
  if (!canView) redirect('/dashboard');

  const reports = await listGeoReports(result.workspaceId) as Record<string, unknown>[];
  const shareOfVoice = getMockShareOfVoice(result.workspaceId);

  const citabilityReports = reports.filter((r) => r.type === 'citability_score');
  const crawlerAudits = reports.filter((r) => r.type === 'crawler_audit');

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">GEO</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="geo-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground flex items-center gap-2">
              <Brain className="size-6 text-brand-indigo" />
              GEO — AI Search Optimization
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Optimize your content to be cited by ChatGPT, Perplexity, Claude, Copilot, and Google AI Overviews.
            </p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Score Content</Button>
        </div>

        {/* Share of Voice */}
        <Card className="border-brand-indigo/20">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="size-5 text-brand-indigo" />
              AI Search Share of Voice
            </CardTitle>
            <CardDescription>How often AI engines cite your brand vs competitors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-brand-indigo">{(shareOfVoice.sharePercent as number).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Your Share of Voice</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{shareOfVoice.brandCitations as number}</p>
                <p className="text-xs text-muted-foreground mt-1">Your Citations</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{shareOfVoice.totalCitationsInCategory as number}</p>
                <p className="text-xs text-muted-foreground mt-1">Category Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{((shareOfVoice.engines as Record<string, unknown>[]) ?? []).length}</p>
                <p className="text-xs text-muted-foreground mt-1">AI Engines Tracked</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {((shareOfVoice.engines as Record<string, unknown>[]) ?? []).map((e) => (
                <Badge key={e.engine as string} variant="outline" className="text-xs">
                  {e.engine as string}: {e.citations as number} citations
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* GEO Tools */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="hover:border-brand-indigo/50 transition-colors cursor-pointer">
            <CardContent className="py-4">
              <Brain className="size-8 text-brand-indigo mb-2" />
              <p className="font-ui text-sm font-medium">AI Citability Score</p>
              <p className="text-xs text-muted-foreground mt-1">Score content on how likely AI engines are to cite it.</p>
              <Badge variant="outline" className="mt-2 text-[10px]">{citabilityReports.length} scored</Badge>
            </CardContent>
          </Card>
          <Card className="hover:border-brand-indigo/50 transition-colors cursor-pointer">
            <CardContent className="py-4">
              <ScanSearch className="size-8 text-brand-indigo mb-2" />
              <p className="font-ui text-sm font-medium">AI Crawler Audit</p>
              <p className="text-xs text-muted-foreground mt-1">Check if GPTBot, ClaudeBot, PerplexityBot can access your site.</p>
              <Badge variant="outline" className="mt-2 text-[10px]">{crawlerAudits.length} audited</Badge>
            </CardContent>
          </Card>
          <Card className="hover:border-brand-indigo/50 transition-colors cursor-pointer">
            <CardContent className="py-4">
              <FileCode className="size-8 text-brand-indigo mb-2" />
              <p className="font-ui text-sm font-medium">Schema Markup</p>
              <p className="text-xs text-muted-foreground mt-1">Generate Article, FAQ, HowTo, Organization JSON-LD.</p>
              <Badge variant="outline" className="mt-2 text-[10px]">9 schema types</Badge>
            </CardContent>
          </Card>
          <Card className="hover:border-brand-indigo/50 transition-colors cursor-pointer">
            <CardContent className="py-4">
              <Globe className="size-8 text-brand-indigo mb-2" />
              <p className="font-ui text-sm font-medium">llms.txt Generator</p>
              <p className="text-xs text-muted-foreground mt-1">Create the /llms.txt file that guides AI interpretation.</p>
              <Badge variant="outline" className="mt-2 text-[10px]">New standard</Badge>
            </CardContent>
          </Card>
        </div>

        {/* How GEO Differs from SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Shield className="size-5 text-brand-orange" />
              SEO vs GEO — Why You Need Both
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="font-ui text-sm font-medium text-brand-orange mb-2">Traditional SEO</p>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>Goal: Rank in top 10 blue links</li>
                  <li>Target: Google, Bing search results</li>
                  <li>Metric: Rankings, clicks, impressions</li>
                  <li>Market: ~60% of search (2026)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-brand-indigo/30 bg-brand-indigo/5 p-4">
                <p className="font-ui text-sm font-medium text-brand-indigo mb-2">GEO (Generative Engine Optimization)</p>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>Goal: Get cited in AI-generated answers</li>
                  <li>Target: ChatGPT, Perplexity, Claude, Copilot, Google AI</li>
                  <li>Metric: Citation frequency, share of voice, AI-referred traffic</li>
                  <li>Market: ~25% of search and growing fast</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        {reports.length > 0 ? (
          <div>
            <h2 className="text-heading-md font-display text-foreground mb-3">Recent GEO Reports</h2>
            <div className="space-y-2">
              {reports.slice(0, 10).map((report) => (
                <Card key={report.id as string}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-ui text-sm font-medium">{(report.type as string).replace(/_/g, ' ')}</p>
                      {report.url ? <p className="text-xs text-muted-foreground">{report.url as string}</p> : null}
                    </div>
                    <Badge variant="outline" className="text-xs">{report.type as string}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
