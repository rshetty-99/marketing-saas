import { clerkClient } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WorkspaceRole } from '@/types/roles';

interface InvitationInput {
  email: string;
  role: WorkspaceRole;
}

interface InvitationResult {
  sent: number;
  failed: string[];
}

/**
 * Batch invite team members to a workspace.
 * Creates Firestore member docs (status: 'invited') and triggers Clerk org invitations.
 * Uses batch writes for Firestore atomicity.
 */
export async function inviteTeamMembers(
  workspaceId: string,
  invitations: InvitationInput[],
  invitedBy: string,
): Promise<InvitationResult> {
  if (invitations.length === 0) {
    return { sent: 0, failed: [] };
  }

  const client = await clerkClient();
  const failed: string[] = [];
  const successfulInvitations: InvitationInput[] = [];

  // 1. Send Clerk org invitations first (these are non-transactional)
  for (const invitation of invitations) {
    try {
      await client.organizations.createOrganizationInvitation({
        organizationId: workspaceId,
        emailAddress: invitation.email,
        inviterUserId: invitedBy,
        role: 'org:member',
      });
      successfulInvitations.push(invitation);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      failed.push(`${invitation.email}: ${message}`);
    }
  }

  // 2. Batch write Firestore member docs for successful Clerk invitations
  if (successfulInvitations.length > 0) {
    try {
      const batch = adminDb.batch();

      for (const invitation of successfulInvitations) {
        // Use a deterministic doc ID based on email hash for invited members
        // They will be re-keyed to userId when they accept the invitation
        const inviteDocId = `invite_${Buffer.from(invitation.email).toString('base64url')}`;
        const memberRef = adminDb
          .collection('workspaces')
          .doc(workspaceId)
          .collection('members')
          .doc(inviteDocId);

        batch.set(memberRef, {
          userId: inviteDocId,
          workspaceId,
          role: invitation.role,
          status: 'invited',
          email: invitation.email,
          displayName: invitation.email.split('@')[0],
          invitedBy,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: invitedBy,
        });
      }

      await batch.commit();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write invitation records to Firestore: ${message}`);
    }
  }

  return {
    sent: successfulInvitations.length,
    failed,
  };
}
