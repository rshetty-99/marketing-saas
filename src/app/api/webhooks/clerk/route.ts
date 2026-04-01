import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ─── Webhook Event Types ───────────────────────────────────────────
interface WebhookEventBase {
  object: string;
}

interface UserCreatedEvent extends WebhookEventBase {
  type: 'user.created';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

interface UserDeletedEvent extends WebhookEventBase {
  type: 'user.deleted';
  data: {
    id: string;
    deleted: boolean;
  };
}

interface OrganizationCreatedEvent extends WebhookEventBase {
  type: 'organization.created';
  data: {
    id: string;
    name: string;
    created_by: string;
  };
}

interface OrganizationMembershipCreatedEvent extends WebhookEventBase {
  type: 'organizationMembership.created';
  data: {
    id: string;
    organization: { id: string };
    public_user_data: {
      user_id: string;
      identifier: string;
      first_name: string | null;
      last_name: string | null;
    };
    role: string;
  };
}

interface OrganizationMembershipDeletedEvent extends WebhookEventBase {
  type: 'organizationMembership.deleted';
  data: {
    id: string;
    organization: { id: string };
    public_user_data: {
      user_id: string;
    };
  };
}

interface OrganizationInvitationAcceptedEvent extends WebhookEventBase {
  type: 'organizationInvitation.accepted';
  data: {
    id: string;
    organization_id: string;
    email_address: string;
  };
}

interface OrganizationInvitationRevokedEvent extends WebhookEventBase {
  type: 'organizationInvitation.revoked';
  data: {
    id: string;
    organization_id: string;
    email_address: string;
  };
}

type WebhookEvent =
  | UserCreatedEvent
  | UserDeletedEvent
  | OrganizationCreatedEvent
  | OrganizationMembershipCreatedEvent
  | OrganizationMembershipDeletedEvent
  | OrganizationInvitationAcceptedEvent
  | OrganizationInvitationRevokedEvent;

// ─── Event Handlers ────────────────────────────────────────────────

async function handleUserDeleted(data: UserDeletedEvent['data']): Promise<void> {
  // Soft-delete all workspace member records for this user
  const membersQuery = await adminDb
    .collectionGroup('members')
    .where('userId', '==', data.id)
    .get();

  if (membersQuery.empty) return;

  const batch = adminDb.batch();
  for (const doc of membersQuery.docs) {
    batch.update(doc.ref, {
      status: 'deleted',
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

async function handleOrganizationCreated(
  data: OrganizationCreatedEvent['data'],
): Promise<void> {
  // Sync to Firestore workspace if it doesn't already exist
  const workspaceRef = adminDb.collection('workspaces').doc(data.id);
  const existing = await workspaceRef.get();

  if (!existing.exists) {
    await workspaceRef.set({
      clerkOrgId: data.id,
      name: data.name,
      ownerId: data.created_by,
      accountType: 'organization',
      tier: 'growth',
      status: 'trial',
      industry: null,
      onboardingCompleted: false,
      onboardingStep: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.created_by,
    });
  }
}

async function handleMembershipCreated(
  data: OrganizationMembershipCreatedEvent['data'],
): Promise<void> {
  const workspaceId = data.organization.id;
  const userId = data.public_user_data.user_id;

  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(userId);

  const existing = await memberRef.get();

  if (existing.exists) {
    // Update existing invited record to active
    await memberRef.update({
      userId,
      status: 'active',
      joinedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    // Create new active member record
    const displayName = [
      data.public_user_data.first_name,
      data.public_user_data.last_name,
    ]
      .filter(Boolean)
      .join(' ') || data.public_user_data.identifier;

    await memberRef.set({
      userId,
      workspaceId,
      role: 'editor',
      status: 'active',
      email: data.public_user_data.identifier,
      displayName,
      joinedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: userId,
    });
  }
}

async function handleMembershipDeleted(
  data: OrganizationMembershipDeletedEvent['data'],
): Promise<void> {
  const workspaceId = data.organization.id;
  const userId = data.public_user_data.user_id;

  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(userId);

  const existing = await memberRef.get();
  if (existing.exists) {
    await memberRef.update({
      status: 'deleted',
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function handleInvitationAccepted(
  data: OrganizationInvitationAcceptedEvent['data'],
): Promise<void> {
  const workspaceId = data.organization_id;
  const inviteDocId = `invite_${Buffer.from(data.email_address).toString('base64url')}`;

  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(inviteDocId);

  const existing = await memberRef.get();
  if (existing.exists) {
    await memberRef.update({
      status: 'active',
      joinedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function handleInvitationRevoked(
  data: OrganizationInvitationRevokedEvent['data'],
): Promise<void> {
  const workspaceId = data.organization_id;
  const inviteDocId = `invite_${Buffer.from(data.email_address).toString('base64url')}`;

  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(inviteDocId);

  const existing = await memberRef.get();
  if (existing.exists) {
    // Hard delete — this member was never active
    await memberRef.delete();
  }
}

// ─── Route Handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 },
    );
  }

  try {
    switch (evt.type) {
      case 'user.created':
        // No-op for now — user creation is handled by onboarding flow
        break;

      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;

      case 'organization.created':
        await handleOrganizationCreated(evt.data);
        break;

      case 'organizationMembership.created':
        await handleMembershipCreated(evt.data);
        break;

      case 'organizationMembership.deleted':
        await handleMembershipDeleted(evt.data);
        break;

      case 'organizationInvitation.accepted':
        await handleInvitationAccepted(evt.data);
        break;

      case 'organizationInvitation.revoked':
        await handleInvitationRevoked(evt.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
