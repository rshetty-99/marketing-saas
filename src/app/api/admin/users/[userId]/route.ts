/**
 * PATCH /api/admin/users/[userId] — Suspend/reactivate user (operations+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { hasPermission } from '@/lib/rbac';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId: actorId } = await auth();
  if (!actorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const platformDoc = await adminDb.collection('platform_users').doc(actorId).get();
  if (!platformDoc.exists) return NextResponse.json({ error: 'Not a platform user' }, { status: 403 });

  const { userId: targetUserId } = await params;
  const body = await request.json();
  const action = body.action as string;

  if (action === 'suspend') {
    const allowed = await hasPermission('platform', platformDoc.data()?.role, 'users.suspend');
    if (!allowed) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // Find all member docs for this user and deactivate them
    const memberships = await adminDb.collectionGroup('members').where('userId', '==', targetUserId).get();
    for (const doc of memberships.docs) {
      await doc.ref.update({ status: 'deactivated', updatedAt: FieldValue.serverTimestamp() });
    }
    return NextResponse.json({ success: true, action: 'suspended' });
  }

  if (action === 'reactivate') {
    const allowed = await hasPermission('platform', platformDoc.data()?.role, 'users.reactivate');
    if (!allowed) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const memberships = await adminDb.collectionGroup('members').where('userId', '==', targetUserId).get();
    for (const doc of memberships.docs) {
      await doc.ref.update({ status: 'active', updatedAt: FieldValue.serverTimestamp() });
    }
    return NextResponse.json({ success: true, action: 'reactivated' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
