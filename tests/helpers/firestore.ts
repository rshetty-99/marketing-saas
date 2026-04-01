/**
 * Firestore test helpers for seeding and cleaning up test data.
 * Uses Firebase Admin SDK to bypass security rules during test setup.
 *
 * IMPORTANT: These helpers should only be used in test setup/teardown.
 * Never import these in production code.
 */

import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore, FieldValue } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function getAdminDb(): Firestore {
  if (!adminDb) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-marketing-saas',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? 'test@demo-marketing-saas.iam.gserviceaccount.com',
          privateKey: process.env.FIREBASE_PRIVATE_KEY ?? 'test-key',
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
    adminDb = getFirestore(adminApp);
  }
  return adminDb;
}

export interface TestWorkspace {
  id: string;
  name: string;
  accountType: 'freelancer' | 'organization' | 'agency';
  ownerId: string;
  trialEndsAt: Date;
  profileScore: number;
  brandSetupComplete: boolean;
  teamInviteComplete: boolean;
  clientSetupComplete: boolean;
}

export interface TestMember {
  id: string;
  userId: string;
  workspaceId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer';
  inviteStatus: 'pending' | 'accepted';
}

export interface TestPlatformUser {
  id: string;
  userId: string;
  email: string;
  platformRole: 'platform_admin' | 'platform_support';
}

export async function seedTestWorkspace(
  overrides: Partial<TestWorkspace> = {},
): Promise<TestWorkspace> {
  const db = getAdminDb();
  const workspace: TestWorkspace = {
    id: overrides.id ?? 'ws_test_001',
    name: overrides.name ?? 'Test Workspace',
    accountType: overrides.accountType ?? 'organization',
    ownerId: overrides.ownerId ?? 'user_test_owner',
    trialEndsAt: overrides.trialEndsAt ?? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    profileScore: overrides.profileScore ?? 25,
    brandSetupComplete: overrides.brandSetupComplete ?? false,
    teamInviteComplete: overrides.teamInviteComplete ?? false,
    clientSetupComplete: overrides.clientSetupComplete ?? false,
  };

  await db.collection('workspaces').doc(workspace.id).set({
    ...workspace,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    workspaceId: workspace.id,
    createdBy: workspace.ownerId,
  });

  return workspace;
}

export async function seedTestMember(
  overrides: Partial<TestMember> = {},
): Promise<TestMember> {
  const db = getAdminDb();
  const member: TestMember = {
    id: overrides.id ?? 'member_test_001',
    userId: overrides.userId ?? 'user_test_editor',
    workspaceId: overrides.workspaceId ?? 'ws_test_001',
    email: overrides.email ?? 'editor@test.com',
    role: overrides.role ?? 'editor',
    inviteStatus: overrides.inviteStatus ?? 'accepted',
  };

  await db
    .collection('workspaces')
    .doc(member.workspaceId)
    .collection('members')
    .doc(member.id)
    .set({
      ...member,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      workspaceId: member.workspaceId,
      createdBy: member.userId,
    });

  return member;
}

export async function seedPlatformUser(
  overrides: Partial<TestPlatformUser> = {},
): Promise<TestPlatformUser> {
  const db = getAdminDb();
  const platformUser: TestPlatformUser = {
    id: overrides.id ?? 'platform_test_001',
    userId: overrides.userId ?? 'user_test_admin',
    email: overrides.email ?? 'admin@test.com',
    platformRole: overrides.platformRole ?? 'platform_admin',
  };

  await db.collection('platform_users').doc(platformUser.id).set({
    ...platformUser,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    workspaceId: '__platform__',
    createdBy: platformUser.userId,
  });

  return platformUser;
}

export async function cleanupTestData(workspaceId: string = 'ws_test_001'): Promise<void> {
  const db = getAdminDb();

  // Delete workspace members
  const membersSnapshot = await db
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .get();
  const memberDeletes = membersSnapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(memberDeletes);

  // Delete workspace document
  await db.collection('workspaces').doc(workspaceId).delete();

  // Delete platform users created during tests
  const platformSnapshot = await db
    .collection('platform_users')
    .where('userId', 'in', [
      'user_test_admin',
      'user_test_editor',
      'user_test_owner',
      'user_test_portal',
    ])
    .get();
  const platformDeletes = platformSnapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(platformDeletes);
}

export async function seedCompleteTestEnvironment(): Promise<{
  workspace: TestWorkspace;
  members: TestMember[];
}> {
  const workspace = await seedTestWorkspace();

  const members = await Promise.all([
    seedTestMember({ id: 'member_owner', userId: 'user_test_owner', role: 'owner' }),
    seedTestMember({ id: 'member_admin', userId: 'user_test_admin', role: 'admin' }),
    seedTestMember({ id: 'member_editor', userId: 'user_test_editor', role: 'editor' }),
    seedTestMember({ id: 'member_viewer', userId: 'user_test_viewer', role: 'viewer' }),
    seedTestMember({ id: 'member_manager', userId: 'user_test_manager', role: 'manager' }),
  ]);

  await seedPlatformUser();

  return { workspace, members };
}
