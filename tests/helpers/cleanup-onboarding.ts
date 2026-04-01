/**
 * Cleanup helper for onboarding E2E tests.
 * Removes all workspace data for a given Clerk user so they can
 * go through the onboarding flow fresh on each test run.
 */

import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let db: Firestore;

function getDb(): Firestore {
  if (!db) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = getFirestore(getApps()[0]);
  }
  return db;
}

async function deleteCollection(
  firestore: Firestore,
  collectionPath: string,
): Promise<void> {
  const snapshot = await firestore.collection(collectionPath).get();
  if (snapshot.empty) return;

  const batch = firestore.batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
}

/**
 * Delete all Clerk organizations where this user is the creator.
 * This ensures the "choose-organization" task reappears on next sign-in.
 */
async function cleanupClerkOrgs(userId: string): Promise<void> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return;

  // List user's org memberships
  const res = await fetch(
    `https://api.clerk.com/v1/users/${userId}/organization_memberships?limit=100`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!res.ok) return;

  const data = (await res.json()) as { data: { organization: { id: string } }[] };

  for (const membership of data.data ?? []) {
    const orgId = membership.organization.id;
    // Delete the organization (only works if user is admin/creator)
    await fetch(`https://api.clerk.com/v1/organizations/${orgId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secretKey}` },
    });
  }
}

/**
 * Delete all workspaces owned by a user and their subcollections,
 * so the user appears "fresh" for onboarding.
 */
export async function cleanupUserOnboardingData(userId: string): Promise<void> {
  const firestore = getDb();

  // Find all workspaces owned by this user
  const workspacesSnapshot = await firestore
    .collection('workspaces')
    .where('ownerId', '==', userId)
    .get();

  for (const wsDoc of workspacesSnapshot.docs) {
    const wsId = wsDoc.id;

    // Delete subcollections
    await deleteCollection(firestore, `workspaces/${wsId}/members`);
    await deleteCollection(firestore, `workspaces/${wsId}/brand_profiles`);
    await deleteCollection(firestore, `workspaces/${wsId}/profile_score`);
    await deleteCollection(firestore, `workspaces/${wsId}/clients`);

    // Delete workspace document
    await wsDoc.ref.delete();
  }

  // Clean up Clerk organizations
  await cleanupClerkOrgs(userId);

  // Also clean up any member records where this user is a member (not owner)
  // These use the userId as document ID
  const allWorkspaces = await firestore.collection('workspaces').get();
  for (const wsDoc of allWorkspaces.docs) {
    const memberRef = firestore
      .collection('workspaces')
      .doc(wsDoc.id)
      .collection('members')
      .doc(userId);
    const memberDoc = await memberRef.get();
    if (memberDoc.exists) {
      await memberRef.delete();
    }
  }
}
