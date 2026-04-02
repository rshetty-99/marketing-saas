import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listApprovals, getEligibleApprovers } from '@/lib/f6/approval-service';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  in_review: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
  changes_requested: 'bg-orange-500/15 text-orange-400',
};

export default async function ApprovalsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const canSubmit = await hasPermission('workspace', result.member.role, 'approvals.submit_for_approval');
  if (!canSubmit) redirect('/dashboard');

  const canApprove = await hasPermission('workspace', result.member.role, 'approvals.approve_reject');

  const approvals = await listApprovals(result.workspaceId, { limit: 50 });
  const myPending = approvals.filter(
    (a) => a.status === 'in_review' &&
    (a.stages as Array<Record<string, unknown>>)?.some(
      (s: Record<string, unknown>) =>
        s.status === 'in_review' &&
        (s.assignedApproverIds as string[])?.includes(userId),
    ),
  );
  const mySubmissions = approvals.filter((a) => a.submittedBy === userId);

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
              <BreadcrumbPage className="font-ui text-sm">Approvals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="approvals-page">
        <h1 className="text-heading-xl font-display text-foreground">Approvals</h1>

        {/* Pending for me */}
        {canApprove && myPending.length > 0 && (
          <div>
            <h2 className="text-heading-md font-display text-foreground mb-3" data-testid="pending-approvals-heading">
              Pending Your Review ({myPending.length})
            </h2>
            <div className="space-y-2">
              {myPending.map((a) => (
                <Card key={a.id as string}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-ui text-sm text-foreground">
                        {(a.contentSnapshot as Record<string, unknown>)?.title as string}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        Submitted by {a.submittedBy as string}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[a.status as string] ?? ''}>
                      {a.status as string}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My submissions */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3" data-testid="my-submissions-heading">
            My Submissions ({mySubmissions.length})
          </h2>
          {mySubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  No submissions yet. Create content and submit it for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {mySubmissions.map((a) => (
                <Card key={a.id as string}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-ui text-sm text-foreground">
                        {(a.contentSnapshot as Record<string, unknown>)?.title as string}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        Revision #{a.revisionNumber as number}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[a.status as string] ?? ''}>
                      {a.status as string}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
