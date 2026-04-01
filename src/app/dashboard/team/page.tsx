import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { adminDb } from '@/lib/firebase/admin';
import { hasPermission } from '@/lib/rbac';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TeamPageClient } from './team-client';

export default async function TeamPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const canManage = await hasPermission('workspace', result.member.role, 'workspace.invite_members');
  if (!canManage) redirect('/dashboard');

  const membersSnap = await adminDb
    .collection('workspaces')
    .doc(result.workspaceId)
    .collection('members')
    .orderBy('createdAt', 'desc')
    .get();

  const members = membersSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      role: data.role ?? 'viewer',
      status: data.status ?? 'active',
      title: data.title ?? '',
      department: data.department ?? '',
      employmentType: data.employmentType ?? 'full_time',
      availabilityStatus: data.availabilityStatus ?? 'available',
      joinedAt: data.joinedAt?.toDate()?.toISOString() ?? null,
      lastActiveAt: data.lastActiveAt?.toDate()?.toISOString() ?? null,
    };
  });

  const wsDoc = await adminDb.collection('workspaces').doc(result.workspaceId).get();
  const isOwner = result.member.role === 'owner';

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
              <BreadcrumbPage className="font-ui text-sm">Team</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <TeamPageClient
          members={members}
          currentUserId={userId}
          currentUserRole={result.member.role}
          workspaceName={wsDoc.data()?.name ?? 'Workspace'}
          isOwner={isOwner}
          workspaceId={result.workspaceId}
        />
      </div>
    </>
  );
}
