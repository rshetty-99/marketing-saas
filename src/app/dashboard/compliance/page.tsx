import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listDataRequests } from '@/lib/gdpr/compliance-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileCheck } from 'lucide-react';

export default async function CompliancePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'workspace.update_settings');
  if (!canView) redirect('/dashboard');

  const requests = await listDataRequests(result.workspaceId) as Record<string, unknown>[];
  const pending = requests.filter((r) => (r.status as string) === 'pending').length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Compliance</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="compliance-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Compliance</h1>
            <p className="text-body-sm text-muted-foreground mt-1">GDPR/CCPA data subject requests, consent records, and retention policies.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="py-4 flex items-center gap-3"><Shield className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{requests.length}</p><p className="text-xs text-muted-foreground">Total Requests</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><FileCheck className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><FileCheck className="size-8 text-green-600" /><div><p className="text-2xl font-display font-bold">{requests.length - pending}</p><p className="text-xs text-muted-foreground">Completed</p></div></CardContent></Card>
        </div>
        {requests.length > 0 ? (
          <div className="space-y-2">{requests.map((r) => (
            <Card key={r.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardContent className="py-3"><div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-ui text-sm font-medium">{(r.subjectEmail as string) || (r.subjectName as string) || 'Unknown Subject'}</span>
                    <Badge variant="secondary">{(r.requestType as string) || 'access'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{(r.regulation as string) || 'GDPR'}</p>
                </div>
                <Badge variant={(r.status as string) === 'pending' ? 'default' : 'outline'}>{r.status as string}</Badge>
              </div></CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Shield className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No data requests. All clear on compliance.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
