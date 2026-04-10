import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listAlerts } from '@/lib/platform-alerts/alerts-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, ShieldAlert, ExternalLink } from 'lucide-react';
import { SeedAlertsButton } from './seed-alerts-button';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  linkedin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  google: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  tiktok: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  twitter: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  youtube: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  pinterest: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  important: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  informational: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export default async function PlatformAlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'analytics.view_dashboard');
  if (!canView) redirect('/dashboard');

  const alerts = await listAlerts(result.workspaceId) as Record<string, unknown>[];
  const unreadCount = alerts.filter((a) => (a.status as string) === 'unread').length;
  const criticalCount = alerts.filter((a) => (a.severity as string) === 'critical').length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Platform Alerts</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="platform-alerts-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Platform Alerts</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Stay ahead of algorithm changes, policy updates, and new features across all social platforms.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3"><Bell className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{alerts.length}</p><p className="text-xs text-muted-foreground">Total Alerts</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><AlertTriangle className="size-8 text-amber-500" /><div><p className="text-2xl font-display font-bold">{unreadCount}</p><p className="text-xs text-muted-foreground">Unread</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><ShieldAlert className="size-8 text-red-500" /><div><p className="text-2xl font-display font-bold">{criticalCount}</p><p className="text-xs text-muted-foreground">Critical</p></div></CardContent></Card>
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-3">{alerts.map((a) => {
            const platform = (a.platform as string) ?? '';
            const severity = (a.severity as string) ?? 'informational';
            const category = (a.category as string) ?? '';
            const status = (a.status as string) ?? 'read';
            const actionItems = (a.actionItems as string[]) ?? [];
            return (
              <Card key={a.id as string} className="hover:border-brand-orange/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {status === 'unread' ? <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-orange-500" /> : <span className="mt-1.5 size-2.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge className={PLATFORM_COLORS[platform] ?? 'bg-muted text-muted-foreground'}>{platform}</Badge>
                        <Badge className={SEVERITY_COLORS[severity] ?? 'bg-muted text-muted-foreground'}>{severity}</Badge>
                        <Badge variant="outline">{category.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="font-medium text-sm">{a.title as string}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.summary as string}</p>
                      {(a.impactAnalysis as string) ? (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1"><span className="font-medium text-foreground">Impact:</span> {a.impactAnalysis as string}</p>
                      ) : null}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {actionItems.length > 0 ? <span>{actionItems.length} action item{actionItems.length !== 1 ? 's' : ''}</span> : null}
                        {(a.sourceUrl as string) ? <a href={a.sourceUrl as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground"><ExternalLink className="size-3" />Source</a> : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Bell className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground mb-4">No alerts yet</p><SeedAlertsButton /></CardContent></Card>
        )}
      </div>
    </>
  );
}
