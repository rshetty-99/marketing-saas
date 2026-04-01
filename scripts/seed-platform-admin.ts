/**
 * Seed script: Create the initial super_admin platform user.
 *
 * Usage:
 *   npx tsx scripts/seed-platform-admin.ts <clerkUserId> <email> <displayName>
 *
 * Safety: Refuses to run if a super_admin already exists.
 *
 * Prerequisites:
 *   npm install --save-dev tsx dotenv
 *
 * Requires FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 * and FIREBASE_ADMIN_PRIVATE_KEY environment variables.
 * Automatically loads .env.local from the project root.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually without requiring dotenv as a dependency
function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local may not exist; env vars should be set externally
  }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

function exitWithError(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

function printUsage(): void {
  process.stderr.write(
    'Usage: npx tsx scripts/seed-platform-admin.ts <clerkUserId> <email> <displayName>\n',
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    printUsage();
    exitWithError('Missing required arguments');
  }

  const [clerkUserId, email, displayName] = args;

  if (!clerkUserId || !email || !displayName) {
    printUsage();
    exitWithError('All arguments must be non-empty');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    exitWithError(`Invalid email format: ${email}`);
  }

  // Initialize Firebase Admin
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    exitWithError(
      'Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.',
    );
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  const db = getFirestore();

  // Check if a super_admin already exists
  const existingAdmins = await db
    .collection('platform_users')
    .where('role', '==', 'super_admin')
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!existingAdmins.empty) {
    const existing = existingAdmins.docs[0].data();
    exitWithError(
      `A super_admin already exists: ${existing.email} (${existingAdmins.docs[0].id}). ` +
        'Only one super_admin is allowed. Use the platform admin panel to manage roles.',
    );
  }

  // Create the super_admin document
  const platformUserRef = db.collection('platform_users').doc(clerkUserId);

  // Check if this user already exists with a different role
  const existingUser = await platformUserRef.get();
  if (existingUser.exists) {
    exitWithError(
      `User ${clerkUserId} already exists as a platform user with role: ${existingUser.data()?.role}`,
    );
  }

  await platformUserRef.set({
    userId: clerkUserId,
    email,
    displayName,
    role: 'super_admin',
    status: 'active',
    invitedBy: clerkUserId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: clerkUserId,
  });

  process.stdout.write(
    `Successfully created super_admin platform user:\n` +
      `  User ID: ${clerkUserId}\n` +
      `  Email: ${email}\n` +
      `  Display Name: ${displayName}\n` +
      `  Document: platform_users/${clerkUserId}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  exitWithError(`Unexpected error: ${message}`);
});
