import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { getSubscription, getUsageSnapshot, getUsageCaps, listInvoices } from '@/lib/f15/billing-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { TIER_CAPABILITIES } from '@/types/features/billing';

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'billing.view');
  if (!canView) redirect('/dashboard');
  const isOwner = result.member.role === 'owner';

  const [subscription, usage, invoices] = await Promise.all([
    getSubscription(result.workspaceId),
    getUsageSnapshot(result.workspaceId),
    listInvoices(result.workspaceId),
  ]);
  const caps = getUsageCaps(subscription?.tier as string ?? 'starter');
  const tierLabel = (subscription?.tier as string ?? 'starter').replace('_', ' ');

  const usageItems = [
    { label: 'Content Drafts', used: usage.contentDrafts, cap: caps.contentDrafts },
    { label: 'Publish Jobs', used: usage.publishJobs, cap: caps.publishJobs },
    { label: 'Image Generations', used: usage.imageGenerations, cap: caps.imageGenerations },
    { label: 'Email Campaigns', used: usage.emailCampaigns, cap: caps.emailCampaigns },
    { label: 'Lead Records', used: usage.leadRecords, cap: caps.leadRecords },
    { label: 'Team Members', used: usage.teamMembers, cap: caps.teamMembers },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Billing</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="billing-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Billing</h1>
          {isOwner && <Button size="sm" data-testid="upgrade-button"><TrendingUp className="size-4 mr-1.5" />Upgrade Plan</Button>}
        </div>

        {/* Current Plan */}
        <Card data-testid="current-plan">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><CreditCard className="size-5 text-brand-orange" />Current Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-heading-lg font-display text-foreground capitalize" data-testid="plan-tier">{tierLabel}</p>
                <p className="text-body-sm text-muted-foreground">
                  {subscription?.status === 'trialing' ? 'Free Trial' : `$${((subscription?.baseAmount as number ?? 0) / 100).toFixed(0)}/mo`}
                </p>
              </div>
              <Badge className={subscription?.status === 'trialing' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'}>
                {subscription?.status as string}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <Card data-testid="usage-metrics">
          <CardHeader><CardTitle className="font-display">Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {usageItems.map((item) => {
                const pct = item.cap > 0 ? Math.round((item.used / item.cap) * 100) : 0;
                const isNearLimit = pct >= 80;
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">{item.label}</span>
                      <span className="text-body-sm font-ui text-foreground">
                        {item.used} / {item.cap === -1 ? '∞' : item.cap}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isNearLimit ? 'bg-yellow-500' : 'bg-brand-orange'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    {isNearLimit && (
                      <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                        <AlertTriangle className="size-2.5" />{pct}% used
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card data-testid="invoices">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><FileText className="size-5" />Invoices</CardTitle></CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-ui text-sm text-foreground">${((inv.amountDue as number) / 100).toFixed(2)}</p>
                      <p className="text-[11px] text-muted-foreground">{(inv.periodStart as string)?.split('T')[0]} — {(inv.periodEnd as string)?.split('T')[0]}</p>
                    </div>
                    <Badge className={inv.status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}>
                      {inv.status as string}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground text-center py-4">No invoices yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Tier Comparison */}
        <Card>
          <CardHeader><CardTitle className="font-display">Compare Plans</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {TIER_CAPABILITIES.map((t) => (
                <div key={t.tier} className={`rounded-lg border p-4 ${t.tier === subscription?.tier ? 'border-brand-orange bg-brand-orange/5' : 'border-border'}`}>
                  <p className="font-ui text-sm font-medium capitalize">{t.tier.replace('_', ' ')}</p>
                  <p className="text-heading-md font-display mt-1">${(t.basePrice / 100).toFixed(0)}<span className="text-body-sm text-muted-foreground">/mo</span></p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t.includedSeats === -1 ? 'Unlimited' : t.includedSeats} seat{t.includedSeats !== 1 ? 's' : ''}</p>
                  {t.tier === subscription?.tier && <Badge className="mt-2 text-[10px]">Current</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
