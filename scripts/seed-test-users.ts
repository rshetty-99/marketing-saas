/**
 * Seed script: Create all test personas via Clerk API + Firestore.
 *
 * Creates:
 *   1. Platform super_admin
 *   2. Freelancer workspace (owner)
 *   3. Organization workspace (owner + admin + editor + viewer)
 *   4. Agency workspace (owner + manager + editor) + 1 client + client_portal user
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Prerequisites:
 *   - .env.local with Clerk + Firebase credentials
 *   - Clerk test mode enabled
 *
 * WARNING: This creates REAL Clerk users and Firestore documents.
 *          Run only in development/test environments.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Load .env.local ────────────────────────────────────────────────

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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local may not exist
  }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

// ─── Clerk API helper ───────────────────────────────────────────────

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  process.stderr.write('Error: CLERK_SECRET_KEY not found in environment\n');
  process.exit(1);
}

const CLERK_API = 'https://api.clerk.com/v1';

async function clerkFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clerk API ${options.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
}

interface ClerkOrg {
  id: string;
  name: string;
}

async function findOrCreateClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<ClerkUser> {
  // First try to find existing user by email
  const searchRes = await clerkFetch<ClerkUser[]>(
    `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  );
  if (searchRes.length > 0) {
    process.stdout.write(`   (existing Clerk user: ${searchRes[0].id})\n`);
    return searchRes[0];
  }

  // Create new user
  return clerkFetch<ClerkUser>('/users', {
    method: 'POST',
    body: JSON.stringify({
      email_address: [email],
      first_name: firstName,
      last_name: lastName,
      password,
      skip_password_checks: true,
    }),
  });
}

async function findOrCreateClerkOrg(name: string, createdBy: string): Promise<ClerkOrg> {
  // Search existing orgs
  const orgs = await clerkFetch<{ data: ClerkOrg[] }>(
    `/organizations?query=${encodeURIComponent(name)}&limit=10`,
  );
  const existing = orgs.data?.find((o: ClerkOrg) => o.name === name);
  if (existing) {
    process.stdout.write(`   (existing Clerk org: ${existing.id})\n`);
    return existing;
  }

  return clerkFetch<ClerkOrg>('/organizations', {
    method: 'POST',
    body: JSON.stringify({
      name,
      created_by: createdBy,
    }),
  });
}

async function addOrgMember(orgId: string, userId: string, role: string): Promise<void> {
  try {
    await clerkFetch(`/organizations/${orgId}/memberships`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        role: role === 'owner' ? 'org:admin' : 'org:member',
      }),
    });
  } catch (error: unknown) {
    // Ignore "already a member" errors
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) {
      process.stdout.write(`   (already a member of org)\n`);
      return;
    }
    throw error;
  }
}

// ─── Firebase Admin init ────────────────────────────────────────────

// Try loading from service account JSON file first (most reliable)
const SERVICE_ACCOUNT_PATH = resolve(
  __dirname,
  '..',
  'aura-saas-firebase-adminsdk-fbsvc-60901e9ecc.json',
);

let serviceAccountExists = false;
try {
  readFileSync(SERVICE_ACCOUNT_PATH);
  serviceAccountExists = true;
} catch {
  serviceAccountExists = false;
}

if (!getApps().length) {
  if (serviceAccountExists) {
    // Use the JSON key file directly
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback to env vars
    const projectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      process.stderr.write(
        'Error: Missing Firebase credentials. Place aura-saas-firebase-adminsdk-fbsvc-60901e9ecc.json in project root or set env vars.\n',
      );
      process.exit(1);
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
}

const db = getFirestore();

// ─── Firestore helpers ──────────────────────────────────────────────

function trialEndsAt(): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() + 15);
  return Timestamp.fromDate(d);
}

async function createWorkspaceDoc(
  workspaceId: string,
  data: {
    name: string;
    ownerId: string;
    accountType: 'freelancer' | 'organization' | 'agency';
    tier: string;
    clerkOrgId: string;
  },
): Promise<void> {
  await db
    .collection('workspaces')
    .doc(workspaceId)
    .set({
      clerkOrgId: data.clerkOrgId,
      name: data.name,
      ownerId: data.ownerId,
      accountType: data.accountType,
      tier: data.tier,
      status: 'trial',
      industry: 'Marketing',
      trialEndsAt: trialEndsAt(),
      onboardingCompleted: true,
      onboardingStep: 6,
      onboardingCompletedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.ownerId,
    });
}

async function createMemberDoc(
  workspaceId: string,
  userId: string,
  data: {
    role: string;
    email: string;
    displayName: string;
    invitedBy: string;
    status?: string;
    assignedClientIds?: string[];
  },
): Promise<void> {
  await db
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(userId)
    .set({
      userId,
      workspaceId,
      role: data.role,
      status: data.status || 'active',
      email: data.email,
      displayName: data.displayName,
      invitedBy: data.invitedBy,
      joinedAt: FieldValue.serverTimestamp(),
      assignedClientIds: data.assignedClientIds || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.invitedBy,
    });
}

async function createProfileScore(
  workspaceId: string,
  accountType: string,
  ownerId: string,
): Promise<void> {
  const maxScores: Record<string, number> = {
    freelancer: 100,
    organization: 115,
    agency: 130,
  };
  const completedActions = ['account_type_selected', 'workspace_created'];
  const score = 10;
  const maxScore = maxScores[accountType] || 100;

  await db
    .collection('workspaces')
    .doc(workspaceId)
    .collection('profile_score')
    .doc('current')
    .set({
      workspaceId,
      accountType,
      completedActions,
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      widgetDismissed: false,
      calculatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: ownerId,
    });
}

async function createPlatformUser(
  userId: string,
  email: string,
  displayName: string,
  role: string,
): Promise<void> {
  await db.collection('platform_users').doc(userId).set({
    userId,
    email,
    displayName,
    role,
    status: 'active',
    invitedBy: role === 'super_admin' ? 'seed' : userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: 'seed',
  });
}

async function createClientDoc(
  agencyWorkspaceId: string,
  clientId: string,
  data: {
    name: string;
    contactEmail: string;
    assignedTeamMembers: string[];
    portalUserIds: string[];
    clerkOrgId: string;
  },
): Promise<void> {
  await db
    .collection('workspaces')
    .doc(agencyWorkspaceId)
    .collection('clients')
    .doc(clientId)
    .set({
      agencyWorkspaceId,
      name: data.name,
      contactEmail: data.contactEmail,
      industry: 'Technology',
      assignedTeamMembers: data.assignedTeamMembers,
      portalUserIds: data.portalUserIds,
      subWorkspaceId: data.clerkOrgId,
      status: 'active',
      reportingSchedule: 'monthly',
      reportingEmail: data.contactEmail,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.assignedTeamMembers[0] || 'seed',
    });
}

// ─── Main ───────────────────────────────────────────────────────────

const TEST_PASSWORD = 'AuraTest2026!';

interface CreatedUser {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  context: string;
}

async function main(): Promise<void> {
  const created: CreatedUser[] = [];

  process.stdout.write('\n🚀 Aura.ai — Seeding test users & workspaces\n\n');

  // ── 1. Platform Super Admin ─────────────────────────────────────
  process.stdout.write('── 1. Creating Platform Super Admin...\n');
  const superAdmin = await findOrCreateClerkUser(
    'superadmin@aura-test.dev',
    'Super',
    'Admin',
    TEST_PASSWORD,
  );
  await createPlatformUser(superAdmin.id, 'superadmin@aura-test.dev', 'Super Admin', 'super_admin');
  created.push({
    clerkId: superAdmin.id,
    email: 'superadmin@aura-test.dev',
    name: 'Super Admin',
    role: 'super_admin (platform)',
    context: 'Platform admin panel',
  });
  process.stdout.write(`   ✓ ${superAdmin.id} — superadmin@aura-test.dev\n\n`);

  // ── 2. Freelancer Workspace ─────────────────────────────────────
  process.stdout.write('── 2. Creating Freelancer Workspace...\n');
  const freelancer = await findOrCreateClerkUser(
    'freelancer@aura-test.dev',
    'Alex',
    'Freelance',
    TEST_PASSWORD,
  );
  const freelancerOrg = await findOrCreateClerkOrg('Alex Marketing', freelancer.id);
  await createWorkspaceDoc(freelancerOrg.id, {
    name: 'Alex Marketing',
    ownerId: freelancer.id,
    accountType: 'freelancer',
    tier: 'starter',
    clerkOrgId: freelancerOrg.id,
  });
  await createMemberDoc(freelancerOrg.id, freelancer.id, {
    role: 'owner',
    email: 'freelancer@aura-test.dev',
    displayName: 'Alex Freelance',
    invitedBy: freelancer.id,
  });
  await createProfileScore(freelancerOrg.id, 'freelancer', freelancer.id);
  created.push({
    clerkId: freelancer.id,
    email: 'freelancer@aura-test.dev',
    name: 'Alex Freelance',
    role: 'owner (freelancer)',
    context: `Workspace: ${freelancerOrg.id}`,
  });
  process.stdout.write(`   ✓ Owner: ${freelancer.id}\n`);
  process.stdout.write(`   ✓ Workspace: ${freelancerOrg.id}\n\n`);

  // ── 3. Organization Workspace ───────────────────────────────────
  process.stdout.write('── 3. Creating Organization Workspace...\n');

  const orgOwner = await findOrCreateClerkUser(
    'org-owner@aura-test.dev',
    'Jordan',
    'TeamLead',
    TEST_PASSWORD,
  );
  const orgAdmin = await findOrCreateClerkUser(
    'org-admin@aura-test.dev',
    'Sam',
    'OpsAdmin',
    TEST_PASSWORD,
  );
  const orgEditor = await findOrCreateClerkUser(
    'org-editor@aura-test.dev',
    'Taylor',
    'Writer',
    TEST_PASSWORD,
  );
  const orgViewer = await findOrCreateClerkUser(
    'org-viewer@aura-test.dev',
    'Morgan',
    'Analyst',
    TEST_PASSWORD,
  );

  const orgWorkspace = await findOrCreateClerkOrg('Acme Marketing Team', orgOwner.id);

  // Add members to Clerk org
  await addOrgMember(orgWorkspace.id, orgAdmin.id, 'admin');
  await addOrgMember(orgWorkspace.id, orgEditor.id, 'member');
  await addOrgMember(orgWorkspace.id, orgViewer.id, 'member');

  // Create Firestore workspace + members
  await createWorkspaceDoc(orgWorkspace.id, {
    name: 'Acme Marketing Team',
    ownerId: orgOwner.id,
    accountType: 'organization',
    tier: 'growth',
    clerkOrgId: orgWorkspace.id,
  });

  await createMemberDoc(orgWorkspace.id, orgOwner.id, {
    role: 'owner',
    email: 'org-owner@aura-test.dev',
    displayName: 'Jordan TeamLead',
    invitedBy: orgOwner.id,
  });
  await createMemberDoc(orgWorkspace.id, orgAdmin.id, {
    role: 'admin',
    email: 'org-admin@aura-test.dev',
    displayName: 'Sam OpsAdmin',
    invitedBy: orgOwner.id,
  });
  await createMemberDoc(orgWorkspace.id, orgEditor.id, {
    role: 'editor',
    email: 'org-editor@aura-test.dev',
    displayName: 'Taylor Writer',
    invitedBy: orgOwner.id,
  });
  await createMemberDoc(orgWorkspace.id, orgViewer.id, {
    role: 'viewer',
    email: 'org-viewer@aura-test.dev',
    displayName: 'Morgan Analyst',
    invitedBy: orgOwner.id,
  });

  await createProfileScore(orgWorkspace.id, 'organization', orgOwner.id);

  created.push(
    { clerkId: orgOwner.id, email: 'org-owner@aura-test.dev', name: 'Jordan TeamLead', role: 'owner (org)', context: `Workspace: ${orgWorkspace.id}` },
    { clerkId: orgAdmin.id, email: 'org-admin@aura-test.dev', name: 'Sam OpsAdmin', role: 'admin (org)', context: `Workspace: ${orgWorkspace.id}` },
    { clerkId: orgEditor.id, email: 'org-editor@aura-test.dev', name: 'Taylor Writer', role: 'editor (org)', context: `Workspace: ${orgWorkspace.id}` },
    { clerkId: orgViewer.id, email: 'org-viewer@aura-test.dev', name: 'Morgan Analyst', role: 'viewer (org)', context: `Workspace: ${orgWorkspace.id}` },
  );
  process.stdout.write(`   ✓ Owner: ${orgOwner.id}\n`);
  process.stdout.write(`   ✓ Admin: ${orgAdmin.id}\n`);
  process.stdout.write(`   ✓ Editor: ${orgEditor.id}\n`);
  process.stdout.write(`   ✓ Viewer: ${orgViewer.id}\n`);
  process.stdout.write(`   ✓ Workspace: ${orgWorkspace.id}\n\n`);

  // ── 4. Agency Workspace + Client ────────────────────────────────
  process.stdout.write('── 4. Creating Agency Workspace + Client...\n');

  const agencyOwner = await findOrCreateClerkUser(
    'agency-owner@aura-test.dev',
    'Riley',
    'AgencyFounder',
    TEST_PASSWORD,
  );
  const agencyManager = await findOrCreateClerkUser(
    'agency-manager@aura-test.dev',
    'Casey',
    'AccountMgr',
    TEST_PASSWORD,
  );
  const agencyEditor = await findOrCreateClerkUser(
    'agency-editor@aura-test.dev',
    'Jamie',
    'ContentPro',
    TEST_PASSWORD,
  );
  const portalUser = await findOrCreateClerkUser(
    'portal-user@aura-test.dev',
    'Client',
    'Contact',
    TEST_PASSWORD,
  );

  const agencyWorkspace = await findOrCreateClerkOrg('Stellar Agency', agencyOwner.id);

  // Add members to Clerk org
  await addOrgMember(agencyWorkspace.id, agencyManager.id, 'member');
  await addOrgMember(agencyWorkspace.id, agencyEditor.id, 'member');

  // Create Firestore agency workspace
  await createWorkspaceDoc(agencyWorkspace.id, {
    name: 'Stellar Agency',
    ownerId: agencyOwner.id,
    accountType: 'agency',
    tier: 'agency',
    clerkOrgId: agencyWorkspace.id,
  });

  await createMemberDoc(agencyWorkspace.id, agencyOwner.id, {
    role: 'owner',
    email: 'agency-owner@aura-test.dev',
    displayName: 'Riley AgencyFounder',
    invitedBy: agencyOwner.id,
  });
  await createMemberDoc(agencyWorkspace.id, agencyManager.id, {
    role: 'manager',
    email: 'agency-manager@aura-test.dev',
    displayName: 'Casey AccountMgr',
    invitedBy: agencyOwner.id,
    assignedClientIds: ['client-acme'],
  });
  await createMemberDoc(agencyWorkspace.id, agencyEditor.id, {
    role: 'editor',
    email: 'agency-editor@aura-test.dev',
    displayName: 'Jamie ContentPro',
    invitedBy: agencyOwner.id,
    assignedClientIds: ['client-acme'],
  });

  await createProfileScore(agencyWorkspace.id, 'agency', agencyOwner.id);

  // Create client sub-workspace in Clerk
  const clientOrg = await findOrCreateClerkOrg('Acme Corp (Client)', agencyOwner.id);
  await addOrgMember(clientOrg.id, portalUser.id, 'member');

  // Create client doc under agency
  await createClientDoc(agencyWorkspace.id, 'client-acme', {
    name: 'Acme Corp',
    contactEmail: 'portal-user@aura-test.dev',
    assignedTeamMembers: [agencyManager.id, agencyEditor.id],
    portalUserIds: [portalUser.id],
    clerkOrgId: clientOrg.id,
  });

  // Create portal user member doc in client workspace context
  await createMemberDoc(agencyWorkspace.id, portalUser.id, {
    role: 'client_portal',
    email: 'portal-user@aura-test.dev',
    displayName: 'Client Contact',
    invitedBy: agencyOwner.id,
  });

  created.push(
    { clerkId: agencyOwner.id, email: 'agency-owner@aura-test.dev', name: 'Riley AgencyFounder', role: 'owner (agency)', context: `Workspace: ${agencyWorkspace.id}` },
    { clerkId: agencyManager.id, email: 'agency-manager@aura-test.dev', name: 'Casey AccountMgr', role: 'manager (agency)', context: `Workspace: ${agencyWorkspace.id}, Client: client-acme` },
    { clerkId: agencyEditor.id, email: 'agency-editor@aura-test.dev', name: 'Jamie ContentPro', role: 'editor (agency)', context: `Workspace: ${agencyWorkspace.id}, Client: client-acme` },
    { clerkId: portalUser.id, email: 'portal-user@aura-test.dev', name: 'Client Contact', role: 'client_portal', context: `Agency: ${agencyWorkspace.id}, Client: client-acme` },
  );

  process.stdout.write(`   ✓ Agency Owner: ${agencyOwner.id}\n`);
  process.stdout.write(`   ✓ Manager: ${agencyManager.id}\n`);
  process.stdout.write(`   ✓ Editor: ${agencyEditor.id}\n`);
  process.stdout.write(`   ✓ Portal User: ${portalUser.id}\n`);
  process.stdout.write(`   ✓ Agency Workspace: ${agencyWorkspace.id}\n`);
  process.stdout.write(`   ✓ Client Org: ${clientOrg.id}\n\n`);

  // ── Summary ─────────────────────────────────────────────────────
  process.stdout.write('═══════════════════════════════════════════════════\n');
  process.stdout.write('  SEED COMPLETE — All test users created\n');
  process.stdout.write('═══════════════════════════════════════════════════\n\n');
  process.stdout.write(`  Password for all users: ${TEST_PASSWORD}\n\n`);
  process.stdout.write('  Users created:\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');

  for (const u of created) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(35)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  Workspaces:\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  process.stdout.write(`  Freelancer:    ${created.find(u => u.role.includes('freelancer'))?.context}\n`);
  process.stdout.write(`  Organization:  ${created.find(u => u.role === 'owner (org)')?.context}\n`);
  process.stdout.write(`  Agency:        ${created.find(u => u.role === 'owner (agency)')?.context}\n`);
  process.stdout.write('\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`\n❌ Seed failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
