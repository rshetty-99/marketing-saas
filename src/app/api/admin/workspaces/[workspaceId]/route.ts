/**
 * PATCH /api/admin/workspaces/[workspaceId] — Extend trial, override tier (operations+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { hasPermission } from '@/lib/rbac';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const platformDoc = await adminDb.collection('platform_users').doc(userId).get();
  if (!platformDoc.exists) return NextResponse.json({ error: 'Not a platform user' }, { status: 403 });

  const { workspaceId } = await params;
  const body = await request.json();
  const action = body.action as string;

  if (action === 'extend_trial') {
    const allowed = await hasPermission('platform', platformDoc.data()?.role, 'subscriptions.extend_trial');
    if (!allowed) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const days = body.days ?? 15;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    await adminDb.collection('workspaces').doc(workspaceId).update({
      trialEndsAt: Timestamp.fromDate(newExpiry),
      status: 'trial',
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, trialEndsAt: newExpiry.toISOString() });
  }

  if (action === 'override_tier') {
    const allowed = await hasPermission('platform', platformDoc.data()?.role, 'subscriptions.override_tier');
    if (!allowed) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    await adminDb.collection('workspaces').doc(workspaceId).update({
      tier: body.tier,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, tier: body.tier });
  }

  if (action === 'archive') {
    const allowed = await hasPermission('platform', platformDoc.data()?.role, 'workspaces.force_archive');
    if (!allowed) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    await adminDb.collection('workspaces').doc(workspaceId).update({
      status: 'archived',
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, action: 'archived' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
