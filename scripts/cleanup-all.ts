/**
 * Nuke all Firestore data. Run before re-seeding.
 * Usage: npx tsx scripts/cleanup-all.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function deleteCollection(path: string): Promise<number> {
  const snap = await db.collection(path).get();
  if (snap.empty) return 0;
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += 500) {
    const chunk = snap.docs.slice(i, i + 500);
    const batch = db.batch();
    for (const doc of chunk) batch.delete(doc.ref);
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

async function main() {
  process.stdout.write('\nCleaning ALL Firestore data...\n\n');

  // Workspaces + subcollections
  const workspaces = await db.collection('workspaces').get();
  let wsTotal = 0;
  for (const ws of workspaces.docs) {
    for (const sub of ['members', 'brand_profiles', 'profile_score', 'clients']) {
      wsTotal += await deleteCollection(ws.ref.path + '/' + sub);
    }
    await ws.ref.delete();
    wsTotal++;
  }
  process.stdout.write(`  workspaces (+ subcollections)    ${wsTotal} deleted\n`);

  // Flat collections
  for (const col of ['entity_profiles', 'clients', 'platform_users', 'workspace_roles', 'platform_roles', 'workspace_permissions', 'platform_permissions']) {
    const count = await deleteCollection(col);
    process.stdout.write(`  ${col.padEnd(35)} ${count} deleted\n`);
  }

  process.stdout.write('\nFirestore is clean.\n\n');
}

main().catch((e) => { process.stderr.write(String(e) + '\n'); process.exit(1); });
