import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { adminDb } from '@/lib/firebase/admin';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, FileText, TrendingUp, Users, Award, Target,
  Clock, CheckCircle, Building2, DollarSign, Layers, Mic,
} from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accountTypes: string[];   // Which account types see this report
  category: string;
}

const ALL_REPORTS: ReportCard[] = [
  // ─── All account types ────────────────────────────────
  { id: 'content_performance', title: 'Content Performance', description: 'Impressions, engagement, and top posts across all channels', icon: BarChart3, color: 'text-blue-500', accountTypes: ['freelancer', 'organization', 'agency'], category: 'Performance' },
  { id: 'brand_voice', title: 'Brand Voice Consistency', description: 'Average brand voice score, common violations, improvement trends', icon: Mic, color: 'text-purple-500', accountTypes: ['freelancer', 'organization', 'agency'], category: 'Brand' },
  { id: 'seo_progress', title: 'SEO Progress', description: 'Keyword ranking changes, content scores, optimization opportunities', icon: Target, color: 'text-green-500', accountTypes: ['freelancer', 'organization', 'agency'], category: 'Performance' },
  { id: 'publishing_cadence', title: 'Publishing Cadence', description: 'Content published per week/month, planned vs actual, pipeline throughput', icon: Clock, color: 'text-orange-500', accountTypes: ['freelancer', 'organization', 'agency'], category: 'Productivity' },
  { id: 'platform_comparison', title: 'Platform Comparison', description: 'Which social platforms drive the most engagement and clicks', icon: Layers, color: 'text-indigo-500', accountTypes: ['freelancer', 'organization', 'agency'], category: 'Performance' },

  // ─── Organization + Agency ────────────────────────────
  { id: 'team_performance', title: 'Team Performance', description: 'Content per member, approval turnaround, productivity metrics', icon: Users, color: 'text-pink-500', accountTypes: ['organization', 'agency'], category: 'Team' },
  { id: 'approval_workflow', title: 'Approval Workflow', description: 'Average approval time, rejection rate, bottleneck stages', icon: CheckCircle, color: 'text-emerald-500', accountTypes: ['organization', 'agency'], category: 'Workflow' },
  { id: 'campaign_summary', title: 'Campaign Summary', description: 'Per-campaign metrics, email performance, ROI indicators', icon: FileText, color: 'text-cyan-500', accountTypes: ['organization', 'agency'], category: 'Performance' },
  { id: 'calendar_adherence', title: 'Calendar Adherence', description: 'Planned vs actual publishing dates, deadline compliance', icon: Clock, color: 'text-amber-500', accountTypes: ['organization', 'agency'], category: 'Productivity' },

  // ─── Agency only ──────────────────────────────────────
  { id: 'client_health', title: 'Client Health Dashboard', description: 'All clients at a glance — health scores, churn risk, engagement trends', icon: Building2, color: 'text-brand-orange', accountTypes: ['agency'], category: 'Clients' },
  { id: 'revenue_retainer', title: 'Revenue & Retainer', description: 'Hours used vs allocated per client, overage tracking, MRR summary', icon: DollarSign, color: 'text-green-600', accountTypes: ['agency'], category: 'Financial' },
  { id: 'cross_client', title: 'Cross-Client Comparison', description: 'Which clients get best engagement, which are underserved', icon: BarChart3, color: 'text-violet-500', accountTypes: ['agency'], category: 'Clients' },
  { id: 'team_utilization', title: 'Team Utilization', description: 'Capacity vs allocation across all clients, workload balance', icon: Users, color: 'text-rose-500', accountTypes: ['agency'], category: 'Team' },
  { id: 'monthly_client_report', title: 'Monthly Client Report (PDF)', description: 'White-labeled, auto-generated report for each client', icon: Award, color: 'text-yellow-500', accountTypes: ['agency'], category: 'Clients' },
];

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const wsDoc = await adminDb.collection('workspaces').doc(result.workspaceId).get();
  const accountType = wsDoc.data()?.accountType ?? 'freelancer';

  const visibleReports = ALL_REPORTS.filter((r) => r.accountTypes.includes(accountType));
  const categories = [...new Set(visibleReports.map((r) => r.category))];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Reports</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="reports-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Reports</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {visibleReports.length} reports available for your {accountType} workspace
            </p>
          </div>
          <Badge variant="outline" className="capitalize">{accountType}</Badge>
        </div>

        {categories.map((category) => {
          const categoryReports = visibleReports.filter((r) => r.category === category);
          return (
            <div key={category}>
              <h2 className="text-heading-md font-display text-foreground mb-3">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryReports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <Card key={report.id} className="hover:border-brand-orange/50 transition-colors cursor-pointer" data-testid={`report-${report.id}`}>
                      <CardContent className="py-5">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Icon className={`size-5 ${report.color}`} />
                          </div>
                          <div>
                            <p className="font-ui text-sm font-medium text-foreground">{report.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{report.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
