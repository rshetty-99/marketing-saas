import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listConnections } from '@/lib/f9/social-service';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { IntegrationsClient } from './integrations-client';

export default async function IntegrationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const canConnect = await hasPermission('workspace', result.member.role, 'social.connect');
  if (!canConnect) redirect('/dashboard');

  const connections = await listConnections(result.workspaceId);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-ui text-sm">Integrations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <IntegrationsClient
          connections={connections.map((c) => ({
            id: c.id as string,
            platform: c.platform as string,
            platformUsername: c.platformUsername as string,
            platformDisplayName: c.platformDisplayName as string,
            accountType: c.accountType as string,
            status: c.status as string,
            healthStatus: c.healthStatus as string,
            followerCount: (c.metricsSnapshot as Record<string, unknown>)?.followerCount as number ?? 0,
            avgEngagementRate: (c.metricsSnapshot as Record<string, unknown>)?.avgEngagementRate as number ?? 0,
          }))}
        />
      </div>
    </>
  );
}
