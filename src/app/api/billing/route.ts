import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getSubscription, getUsageSnapshot, getUsageCaps, listInvoices } from '@/lib/f15/billing-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth('billing.view');
  if (isAuthError(authResult)) return authResult;
  const { workspaceId, member } = authResult;

  const [subscription, usage, invoices] = await Promise.all([
    getSubscription(workspaceId),
    getUsageSnapshot(workspaceId),
    listInvoices(workspaceId),
  ]);

  const caps = getUsageCaps(subscription?.tier as string ?? 'starter');

  return NextResponse.json({ subscription, usage, caps, invoices });
}
