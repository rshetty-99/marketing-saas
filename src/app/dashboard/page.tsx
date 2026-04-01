import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { adminDb } from '@/lib/firebase/admin';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/onboarding');

  const wsId = result.workspaceId;

  // Fetch workspace + profile score in parallel
  const [wsDoc, scoreDoc] = await Promise.all([
    adminDb.collection('workspaces').doc(wsId).get(),
    adminDb.collection('workspaces').doc(wsId).collection('profile_score').doc('current').get(),
  ]);

  const wsData = wsDoc.data();
  const scoreData = scoreDoc.data();

  const trialEndsAt = wsData?.trialEndsAt?.toDate()?.toISOString() ?? null;
  const profileScore = scoreData
    ? { score: scoreData.score ?? 0, maxScore: scoreData.maxScore ?? 100 }
    : null;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-ui text-sm">Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div data-testid="dashboard-main" className="flex flex-1 flex-col gap-6 p-6">
        {/* Trial badge + profile score widgets */}
        <DashboardClient
          trialEndsAt={trialEndsAt ?? undefined}
          profileScore={profileScore ?? undefined}
          workspaceId={wsId}
        />

        {/* Quick stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Content Drafts', value: '0', sublabel: 'This month' },
            { label: 'Published', value: '0', sublabel: 'This month' },
            { label: 'Social Reach', value: '—', sublabel: 'Connect accounts' },
            { label: 'Leads', value: '0', sublabel: 'This month' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-label text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-display-lg text-foreground">{stat.value}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Recent activity placeholder */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-heading-md font-display text-foreground mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="size-6 text-muted-foreground" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 2L2 19h20L12 2z" />
              </svg>
            </div>
            <p className="text-heading-md font-display text-foreground">Start creating</p>
            <p className="text-body-sm text-muted-foreground mt-1 max-w-xs">
              Your activity feed will appear here once you start creating content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
