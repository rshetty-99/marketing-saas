import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SettingsPageClient } from './settings-client';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const canManage = await hasPermission('workspace', result.member.role, 'workspace.update_settings');
  const isOwner = result.member.role === 'owner';

  const [wsDoc, profileDoc, notifDoc] = await Promise.all([
    adminDb.collection('workspaces').doc(result.workspaceId).get(),
    adminDb.collection('entity_profiles').doc(result.workspaceId).get(),
    adminDb.collection('workspaces').doc(result.workspaceId).collection('settings').doc('notifications').get(),
  ]);

  const workspace = wsDoc.data() ?? {};
  const entityProfile = profileDoc.data() ?? {};
  const notificationSettings = notifDoc.data() ?? null;

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
              <BreadcrumbPage className="font-ui text-sm">Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <SettingsPageClient
          workspace={{
            name: workspace.name ?? '',
            industry: workspace.industry ?? '',
            timezone: workspace.timezone ?? '',
            locale: workspace.locale ?? '',
            primaryEmail: workspace.primaryEmail ?? '',
          }}
          entityProfile={{
            legalName: entityProfile.legalName ?? '',
            phone: entityProfile.phone ?? '',
            website: entityProfile.website ?? '',
            address: entityProfile.address ?? {},
            socialLinks: entityProfile.socialLinks ?? {},
            companySize: entityProfile.companySize ?? '',
            foundedYear: entityProfile.foundedYear ?? null,
            description: entityProfile.description ?? '',
          }}
          notificationSettings={notificationSettings}
          readOnly={!canManage}
          isOwner={isOwner}
          workspaceName={workspace.name ?? ''}
        />
      </div>
    </>
  );
}
