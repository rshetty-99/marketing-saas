/**
 * F7: Team Management Service
 *
 * Handles member operations: invite, role change, deactivate, reactivate,
 * offboarding with reassignment, and invite link management.
 * All operations sync between Clerk and Firestore.
 */

import { clerkClient } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WorkspaceRole } from '@/types/roles';
import { ROLE_HIERARCHY } from '@/types/roles';

// ─── Role Change ────────────────────────────────────────────────────

export async function updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole,
  updatedBy: string,
  updaterRole: WorkspaceRole,
): Promise<void> {
  // Constraint: cannot assign role >= own level
  if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[updaterRole]) {
    throw new Error('Cannot assign a role equal to or higher than your own');
  }

  // Cannot change the owner's role (must use transfer ownership)
  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(targetUserId);

  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) throw new Error('Member not found');

  const currentRole = memberSnap.data()?.role;
  if (currentRole === 'owner') {
    throw new Error('Cannot change owner role. Use transfer ownership instead.');
  }

  // Update Firestore
  await memberRef.update({
    role: newRole,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update Clerk org membership role
  const client = await clerkClient();
  const clerkRole = newRole === 'admin' ? 'org:admin' : 'org:member';
  try {
    await client.organizations.updateOrganizationMembership({
      organizationId: workspaceId,
      userId: targetUserId,
      role: clerkRole,
    });
  } catch {
    // Clerk sync failure is non-fatal — Firestore is source of truth
  }

  // Audit log
  await writeAuditLog(workspaceId, {
    action: 'member.role_changed',
    resourceType: 'member',
    resourceId: targetUserId,
    actorId: updatedBy,
    details: { oldRole: currentRole, newRole },
  });
}

// ─── Deactivate Member ──────────────────────────────────────────────

export async function deactivateMember(
  workspaceId: string,
  targetUserId: string,
  deactivatedBy: string,
  reason?: string,
  reassignTo?: string,
): Promise<void> {
  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(targetUserId);

  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) throw new Error('Member not found');
  if (memberSnap.data()?.role === 'owner') {
    throw new Error('Cannot deactivate workspace owner');
  }

  // If reassigning, validate the target exists and is active
  if (reassignTo) {
    const reassignRef = adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .collection('members')
      .doc(reassignTo);
    const reassignSnap = await reassignRef.get();
    if (!reassignSnap.exists || reassignSnap.data()?.status !== 'active') {
      throw new Error('Reassignment target member not found or not active');
    }

    // Reassign client assignments
    const clientIds = memberSnap.data()?.assignedClientIds ?? [];
    if (clientIds.length > 0) {
      const reassignData = reassignSnap.data();
      const existingClientIds = reassignData?.assignedClientIds ?? [];
      const mergedClientIds = [...new Set([...existingClientIds, ...clientIds])];
      await reassignRef.update({
        assignedClientIds: mergedClientIds,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  // Soft-deactivate the member
  await memberRef.update({
    status: 'deactivated',
    deactivatedAt: FieldValue.serverTimestamp(),
    deactivatedBy,
    deactivationReason: reason ?? null,
    reassignedTo: reassignTo ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Remove from Clerk org
  const client = await clerkClient();
  try {
    await client.organizations.deleteOrganizationMembership({
      organizationId: workspaceId,
      userId: targetUserId,
    });
  } catch {
    // Non-fatal
  }

  await writeAuditLog(workspaceId, {
    action: 'member.deactivated',
    resourceType: 'member',
    resourceId: targetUserId,
    actorId: deactivatedBy,
    details: { reason, reassignedTo: reassignTo },
  });
}

// ─── Transfer Ownership ─────────────────────────────────────────────

export async function transferOwnership(
  workspaceId: string,
  currentOwnerId: string,
  newOwnerId: string,
): Promise<void> {
  const membersCol = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members');

  const newOwnerSnap = await membersCol.doc(newOwnerId).get();
  if (!newOwnerSnap.exists || newOwnerSnap.data()?.status !== 'active') {
    throw new Error('New owner must be an active member');
  }

  const batch = adminDb.batch();

  // Demote current owner to admin
  batch.update(membersCol.doc(currentOwnerId), {
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Promote new owner
  batch.update(membersCol.doc(newOwnerId), {
    role: 'owner',
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update workspace ownerId
  batch.update(adminDb.collection('workspaces').doc(workspaceId), {
    ownerId: newOwnerId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();

  // Sync Clerk roles
  const client = await clerkClient();
  try {
    await client.organizations.updateOrganizationMembership({
      organizationId: workspaceId,
      userId: newOwnerId,
      role: 'org:admin',
    });
  } catch {
    // Non-fatal
  }

  await writeAuditLog(workspaceId, {
    action: 'workspace.ownership_transferred',
    resourceType: 'workspace',
    resourceId: workspaceId,
    actorId: currentOwnerId,
    details: { previousOwner: currentOwnerId, newOwner: newOwnerId },
  });
}

// ─── Create Invite Link ─────────────────────────────────────────────

export async function createInviteLink(
  workspaceId: string,
  role: WorkspaceRole,
  createdBy: string,
  maxUses?: number,
  expiresInDays?: number,
): Promise<{ linkId: string; token: string }> {
  const token = generateToken();
  const linkRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('invite_links')
    .doc();

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await linkRef.set({
    linkId: linkRef.id,
    workspaceId,
    token,
    role,
    maxUses: maxUses ?? null,
    usedCount: 0,
    expiresAt: expiresAt ? FieldValue.serverTimestamp() : null,
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { linkId: linkRef.id, token };
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── Archive Workspace ──────────────────────────────────────────────

export async function archiveWorkspace(
  workspaceId: string,
  archivedBy: string,
): Promise<void> {
  await adminDb.collection('workspaces').doc(workspaceId).update({
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'workspace.archived',
    resourceType: 'workspace',
    resourceId: workspaceId,
    actorId: archivedBy,
  });
}

// ─── Delete Workspace (soft) ────────────────────────────────────────

export async function deleteWorkspace(
  workspaceId: string,
  deletedBy: string,
): Promise<void> {
  await adminDb.collection('workspaces').doc(workspaceId).update({
    status: 'deleted',
    deletedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'workspace.deleted',
    resourceType: 'workspace',
    resourceId: workspaceId,
    actorId: deletedBy,
  });
}

// ─── Audit Log Helper ───────────────────────────────────────────────

interface AuditLogInput {
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  actorId: string;
  actorName?: string;
  actorIp?: string;
  details?: Record<string, unknown>;
}

export async function writeAuditLog(
  workspaceId: string,
  input: AuditLogInput,
): Promise<void> {
  const logRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('audit_log')
    .doc();

  await logRef.set({
    id: logRef.id,
    workspaceId,
    ...input,
    createdAt: FieldValue.serverTimestamp(),
  });
}

// ─── Get Audit Log ──────────────────────────────────────────────────

export async function getAuditLog(
  workspaceId: string,
  options: {
    limit?: number;
    action?: string;
    resourceType?: string;
    actorId?: string;
  } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('audit_log')
    .orderBy('createdAt', 'desc')
    .limit(options.limit ?? 50) as FirebaseFirestore.Query;

  if (options.action) {
    query = query.where('action', '==', options.action);
  }
  if (options.resourceType) {
    query = query.where('resourceType', '==', options.resourceType);
  }
  if (options.actorId) {
    query = query.where('actorId', '==', options.actorId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
