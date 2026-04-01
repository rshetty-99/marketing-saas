import { clerkClient } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { workspaceConverter } from '@/lib/firebase/converters/workspace';

interface CreateClientInput {
  name: string;
  contactEmail: string;
  industry?: string;
  assignedTeamMemberIds?: string[];
}

/**
 * Create an agency client sub-workspace.
 * Creates a Clerk child organization and a client document
 * under workspaces/{agencyWorkspaceId}/clients/{clientId}.
 */
export async function createClientWorkspace(
  agencyWorkspaceId: string,
  data: CreateClientInput,
  createdBy: string,
): Promise<string> {
  try {
    // 1. Verify the agency workspace exists and is an agency account type
    const agencySnap = await adminDb
      .collection('workspaces')
      .doc(agencyWorkspaceId)
      .withConverter(workspaceConverter)
      .get();

    if (!agencySnap.exists) {
      throw new Error(`Agency workspace ${agencyWorkspaceId} not found`);
    }

    const agencyWorkspace = agencySnap.data();
    if (!agencyWorkspace) {
      throw new Error(`Agency workspace ${agencyWorkspaceId} data is empty`);
    }

    if (agencyWorkspace.accountType !== 'agency') {
      throw new Error('Client workspaces can only be created under agency accounts');
    }

    // 2. Create Clerk child organization
    const client = await clerkClient();
    const childOrg = await client.organizations.createOrganization({
      name: `${agencyWorkspace.name} - ${data.name}`,
      createdBy,
    });

    // 3. Batch write client doc (flat collection) and child workspace doc
    const batch = adminDb.batch();

    // Client document in flat clients/ collection
    const clientRef = adminDb.collection('clients').doc(childOrg.id);

    batch.set(clientRef, {
      clientId: childOrg.id,
      agencyWorkspaceId,
      clerkOrgId: childOrg.id,
      childWorkspaceId: childOrg.id,
      name: data.name,
      primaryContact: {
        name: '',
        email: data.contactEmail,
      },
      industry: data.industry ?? null,
      assignedTeamMemberIds: data.assignedTeamMemberIds ?? [],
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
    });

    // Child workspace document (linked to parent agency)
    const childWorkspaceRef = adminDb.collection('workspaces').doc(childOrg.id);
    batch.set(childWorkspaceRef, {
      clerkOrgId: childOrg.id,
      name: data.name,
      ownerId: createdBy,
      accountType: 'agency',
      tier: agencyWorkspace.tier,
      status: agencyWorkspace.status,
      industry: data.industry ?? null,
      parentWorkspaceId: agencyWorkspaceId,
      agencyWorkspaceId: agencyWorkspaceId,
      onboardingCompleted: true,
      onboardingStep: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
    });

    await batch.commit();

    return childOrg.id;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes('not found') || error.message.includes('can only be created'))
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create client workspace: ${message}`);
  }
}
