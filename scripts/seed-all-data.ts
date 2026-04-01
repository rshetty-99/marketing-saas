/**
 * MASTER SEED SCRIPT — Aura.ai
 *
 * Cleans ALL existing data in Clerk + Firestore, then creates:
 *
 *   FREELANCERS (3 workspaces, 3 users)
 *     1. Alex Freelance   — freelancer@aura-test.dev        — Photography niche
 *     2. Priya Solo       — freelancer2@aura-test.dev       — Copywriting niche
 *     3. Marcus Indie     — freelancer3@aura-test.dev       — Social media niche
 *
 *   ORGANIZATIONS (3 workspaces, 9 users — owner + 2 members each)
 *     1. Acme Marketing Team       — org1-owner, org1-admin, org1-editor
 *     2. Bloom Digital              — org2-owner, org2-manager, org2-viewer
 *     3. Nexus Growth Co            — org3-owner, org3-editor, org3-viewer
 *
 *   AGENCIES (3 workspaces, 3 owners + 9 client sub-workspaces)
 *     1. Stellar Agency             — 3 clients: Acme Corp, Bloom Retail, Nexus Health
 *     2. Orbit Media Group          — 3 clients: Zenith Auto, Pulse Fitness, Crest Finance
 *     3. Apex Creative Partners     — 3 clients: Nova EdTech, Drift Travel, Forge Manufacturing
 *
 *   PLATFORM TEAM (8 users — all platform roles)
 *     super_admin, platform_admin, partner_manager, operations,
 *     finance, support, content_moderator, analyst
 *
 * Usage:
 *   npx tsx scripts/seed-all-data.ts
 *
 * WARNING: This DELETES all existing data first. Run only in dev/test.
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
    // ignore
  }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

// ─── Clerk API ──────────────────────────────────────────────────────

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  process.stderr.write('Error: CLERK_SECRET_KEY not found\n');
  process.exit(1);
}

const CLERK_API = 'https://api.clerk.com/v1';

async function clerkFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clerk ${options.method || 'GET'} ${path} failed (${res.status}): ${body}`);
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

async function findOrCreateUser(
  email: string,
  firstName: string,
  lastName: string,
): Promise<ClerkUser> {
  const existing = await clerkFetch<ClerkUser[]>(
    `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  );
  if (existing.length > 0) return existing[0];

  return clerkFetch<ClerkUser>('/users', {
    method: 'POST',
    body: JSON.stringify({
      email_address: [email],
      first_name: firstName,
      last_name: lastName,
      password: TEST_PASSWORD,
      skip_password_checks: true,
    }),
  });
}

async function findOrCreateOrg(name: string, createdBy: string): Promise<ClerkOrg> {
  const orgs = await clerkFetch<{ data: ClerkOrg[] }>(
    `/organizations?query=${encodeURIComponent(name)}&limit=10`,
  );
  const existing = orgs.data?.find((o) => o.name === name);
  if (existing) return existing;

  return clerkFetch<ClerkOrg>('/organizations', {
    method: 'POST',
    body: JSON.stringify({ name, created_by: createdBy }),
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
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) return;
    throw error;
  }
}

// ─── Firebase Admin ─────────────────────────────────────────────────

if (!getApps().length) {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    process.stderr.write('Error: Missing Firebase credentials\n');
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
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
    industry?: string;
    parentWorkspaceId?: string;
    agencyWorkspaceId?: string;
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
      industry: data.industry || 'Marketing',
      trialEndsAt: trialEndsAt(),
      parentWorkspaceId: data.parentWorkspaceId || null,
      agencyWorkspaceId: data.agencyWorkspaceId || null,
      onboardingCompleted: true,
      onboardingStep: 6,
      onboardingCompletedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.ownerId,
      workspaceId,
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

async function createBrandProfile(
  workspaceId: string,
  ownerId: string,
  data: { brandName: string; primaryColor: string; voiceTone: string },
): Promise<void> {
  await db
    .collection('workspaces')
    .doc(workspaceId)
    .collection('brand_profiles')
    .doc('default')
    .set({
      brandName: data.brandName,
      primaryColor: data.primaryColor,
      voiceTone: data.voiceTone,
      workspaceId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: ownerId,
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
  const completedActions = ['account_type_selected', 'workspace_created', 'brand_name_set'];
  const score = 20;
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

async function createClientDoc(
  agencyWorkspaceId: string,
  clientId: string,
  data: {
    name: string;
    contactEmail: string;
    industry: string;
    assignedTeamMembers: string[];
    clerkOrgId: string;
    childWorkspaceId: string;
  },
): Promise<void> {
  await db
    .collection('workspaces')
    .doc(agencyWorkspaceId)
    .collection('clients')
    .doc(clientId)
    .set({
      clientId,
      agencyWorkspaceId,
      name: data.name,
      contactEmail: data.contactEmail,
      industry: data.industry,
      assignedTeamMemberIds: data.assignedTeamMembers,
      clerkOrgId: data.clerkOrgId,
      childWorkspaceId: data.childWorkspaceId,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: data.assignedTeamMembers[0] || 'seed',
      workspaceId: agencyWorkspaceId,
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
    invitedBy: role === 'super_admin' ? 'seed' : 'seed',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: 'seed',
    workspaceId: '__platform__',
  });
}

// ─── Cleanup ────────────────────────────────────────────────────────

async function deleteSubcollection(docPath: string, subcollection: string): Promise<void> {
  const snap = await db.collection(`${docPath}/${subcollection}`).get();
  if (snap.empty) return;
  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();
}

async function cleanFirestore(): Promise<void> {
  process.stdout.write('  Cleaning Firestore workspaces...\n');
  const workspaces = await db.collection('workspaces').get();
  for (const ws of workspaces.docs) {
    await deleteSubcollection(ws.ref.path, 'members');
    await deleteSubcollection(ws.ref.path, 'brand_profiles');
    await deleteSubcollection(ws.ref.path, 'profile_score');
    await deleteSubcollection(ws.ref.path, 'clients');
    await ws.ref.delete();
  }

  process.stdout.write('  Cleaning Firestore platform_users...\n');
  const platformUsers = await db.collection('platform_users').get();
  if (!platformUsers.empty) {
    const batch = db.batch();
    for (const doc of platformUsers.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}

async function cleanClerk(): Promise<void> {
  // Delete all organizations first
  process.stdout.write('  Cleaning Clerk organizations...\n');
  let hasMoreOrgs = true;
  while (hasMoreOrgs) {
    const orgs = await clerkFetch<{ data: ClerkOrg[] }>('/organizations?limit=100');
    if (!orgs.data || orgs.data.length === 0) {
      hasMoreOrgs = false;
      break;
    }
    for (const org of orgs.data) {
      await clerkFetch(`/organizations/${org.id}`, { method: 'DELETE' });
    }
  }

  // Delete all users
  process.stdout.write('  Cleaning Clerk users...\n');
  let hasMoreUsers = true;
  while (hasMoreUsers) {
    const users = await clerkFetch<ClerkUser[]>('/users?limit=100');
    if (!users || users.length === 0) {
      hasMoreUsers = false;
      break;
    }
    for (const user of users) {
      try {
        await clerkFetch(`/users/${user.id}`, { method: 'DELETE' });
      } catch {
        // User may already be deleted via org cascade — ignore
      }
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────

const TEST_PASSWORD = 'AuraTest2026!';

interface UserRecord {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  context: string;
}

async function main(): Promise<void> {
  const users: UserRecord[] = [];

  process.stdout.write('\n=========================================================\n');
  process.stdout.write('  AURA.AI — Master Seed Script\n');
  process.stdout.write('=========================================================\n\n');

  // ── STEP 0: CLEANUP ────────────────────────────────────────────────
  process.stdout.write('STEP 0: Cleaning all existing data...\n');
  await cleanClerk();
  await cleanFirestore();
  process.stdout.write('  Done.\n\n');

  // ── STEP 1: FREELANCERS (3) ────────────────────────────────────────
  process.stdout.write('STEP 1: Creating 3 Freelancer workspaces...\n');

  const freelancers = [
    { email: 'freelancer@aura-test.dev', first: 'Alex', last: 'Freelance', orgName: 'Alex Marketing Studio', industry: 'Photography', brand: { brandName: 'Alex Studio', primaryColor: '#FF6B35', voiceTone: 'casual' } },
    { email: 'freelancer2@aura-test.dev', first: 'Priya', last: 'Solo', orgName: 'Priya Copywriting', industry: 'Copywriting', brand: { brandName: 'WordCraft by Priya', primaryColor: '#6366F1', voiceTone: 'professional' } },
    { email: 'freelancer3@aura-test.dev', first: 'Marcus', last: 'Indie', orgName: 'Marcus Social', industry: 'Social Media', brand: { brandName: 'Marcus Social Co', primaryColor: '#10B981', voiceTone: 'playful' } },
  ];

  for (const f of freelancers) {
    const user = await findOrCreateUser(f.email, f.first, f.last);
    const org = await findOrCreateOrg(f.orgName, user.id);
    await createWorkspaceDoc(org.id, {
      name: f.orgName,
      ownerId: user.id,
      accountType: 'freelancer',
      tier: 'starter',
      clerkOrgId: org.id,
      industry: f.industry,
    });
    await createMemberDoc(org.id, user.id, {
      role: 'owner',
      email: f.email,
      displayName: `${f.first} ${f.last}`,
      invitedBy: user.id,
    });
    await createBrandProfile(org.id, user.id, f.brand);
    await createProfileScore(org.id, 'freelancer', user.id);

    users.push({ clerkId: user.id, email: f.email, name: `${f.first} ${f.last}`, role: 'owner (freelancer)', context: `WS: ${org.id} — ${f.orgName}` });
    process.stdout.write(`  + ${f.orgName} — ${user.id}\n`);
  }
  process.stdout.write('\n');

  // ── STEP 2: ORGANIZATIONS (3) ──────────────────────────────────────
  process.stdout.write('STEP 2: Creating 3 Organization workspaces...\n');

  const orgs = [
    {
      name: 'Acme Marketing Team', industry: 'Technology',
      brand: { brandName: 'Acme Digital', primaryColor: '#2563EB', voiceTone: 'professional' },
      members: [
        { email: 'org1-owner@aura-test.dev', first: 'Jordan', last: 'TeamLead', role: 'owner' },
        { email: 'org1-admin@aura-test.dev', first: 'Sam', last: 'OpsAdmin', role: 'admin' },
        { email: 'org1-editor@aura-test.dev', first: 'Taylor', last: 'Writer', role: 'editor' },
      ],
    },
    {
      name: 'Bloom Digital', industry: 'Retail',
      brand: { brandName: 'Bloom', primaryColor: '#EC4899', voiceTone: 'friendly' },
      members: [
        { email: 'org2-owner@aura-test.dev', first: 'Dana', last: 'BloomCEO', role: 'owner' },
        { email: 'org2-manager@aura-test.dev', first: 'Nico', last: 'CampaignMgr', role: 'manager' },
        { email: 'org2-viewer@aura-test.dev', first: 'Avery', last: 'Analyst', role: 'viewer' },
      ],
    },
    {
      name: 'Nexus Growth Co', industry: 'Finance',
      brand: { brandName: 'Nexus Growth', primaryColor: '#F59E0B', voiceTone: 'authoritative' },
      members: [
        { email: 'org3-owner@aura-test.dev', first: 'Kai', last: 'NexusFounder', role: 'owner' },
        { email: 'org3-editor@aura-test.dev', first: 'Reese', last: 'ContentLead', role: 'editor' },
        { email: 'org3-viewer@aura-test.dev', first: 'Quinn', last: 'ReportViewer', role: 'viewer' },
      ],
    },
  ];

  for (const o of orgs) {
    // Create all users
    const memberUsers: { user: ClerkUser; meta: (typeof o.members)[number] }[] = [];
    for (const m of o.members) {
      const user = await findOrCreateUser(m.email, m.first, m.last);
      memberUsers.push({ user, meta: m });
    }
    const ownerId = memberUsers[0].user.id;

    // Create Clerk org + add members
    const clerkOrg = await findOrCreateOrg(o.name, ownerId);
    for (const mu of memberUsers.slice(1)) {
      await addOrgMember(clerkOrg.id, mu.user.id, mu.meta.role);
    }

    // Create Firestore workspace
    await createWorkspaceDoc(clerkOrg.id, {
      name: o.name,
      ownerId,
      accountType: 'organization',
      tier: 'growth',
      clerkOrgId: clerkOrg.id,
      industry: o.industry,
    });

    // Create member docs
    for (const mu of memberUsers) {
      await createMemberDoc(clerkOrg.id, mu.user.id, {
        role: mu.meta.role,
        email: mu.meta.email,
        displayName: `${mu.meta.first} ${mu.meta.last}`,
        invitedBy: ownerId,
      });
      users.push({
        clerkId: mu.user.id,
        email: mu.meta.email,
        name: `${mu.meta.first} ${mu.meta.last}`,
        role: `${mu.meta.role} (org)`,
        context: `WS: ${clerkOrg.id} — ${o.name}`,
      });
    }

    await createBrandProfile(clerkOrg.id, ownerId, o.brand);
    await createProfileScore(clerkOrg.id, 'organization', ownerId);
    process.stdout.write(`  + ${o.name} — ${clerkOrg.id} (${o.members.length} members)\n`);
  }
  process.stdout.write('\n');

  // ── STEP 3: AGENCIES (3) + 3 CLIENTS EACH ─────────────────────────
  process.stdout.write('STEP 3: Creating 3 Agency workspaces with 3 clients each...\n');

  const agencies = [
    {
      name: 'Stellar Agency', industry: 'Marketing',
      brand: { brandName: 'Stellar', primaryColor: '#7C3AED', voiceTone: 'professional' },
      owner: { email: 'agency1-owner@aura-test.dev', first: 'Riley', last: 'AgencyFounder' },
      clients: [
        { name: 'Acme Corp', contactEmail: 'acme-contact@client.dev', industry: 'Technology' },
        { name: 'Bloom Retail', contactEmail: 'bloom-contact@client.dev', industry: 'Retail' },
        { name: 'Nexus Health', contactEmail: 'nexus-contact@client.dev', industry: 'Healthcare' },
      ],
    },
    {
      name: 'Orbit Media Group', industry: 'Advertising',
      brand: { brandName: 'Orbit Media', primaryColor: '#0EA5E9', voiceTone: 'authoritative' },
      owner: { email: 'agency2-owner@aura-test.dev', first: 'Harper', last: 'OrbitCEO' },
      clients: [
        { name: 'Zenith Auto', contactEmail: 'zenith-contact@client.dev', industry: 'Automotive' },
        { name: 'Pulse Fitness', contactEmail: 'pulse-contact@client.dev', industry: 'Health & Fitness' },
        { name: 'Crest Finance', contactEmail: 'crest-contact@client.dev', industry: 'Finance' },
      ],
    },
    {
      name: 'Apex Creative Partners', industry: 'Creative Services',
      brand: { brandName: 'Apex Creative', primaryColor: '#F43F5E', voiceTone: 'playful' },
      owner: { email: 'agency3-owner@aura-test.dev', first: 'Rowan', last: 'ApexFounder' },
      clients: [
        { name: 'Nova EdTech', contactEmail: 'nova-contact@client.dev', industry: 'Education' },
        { name: 'Drift Travel', contactEmail: 'drift-contact@client.dev', industry: 'Travel' },
        { name: 'Forge Manufacturing', contactEmail: 'forge-contact@client.dev', industry: 'Manufacturing' },
      ],
    },
  ];

  for (const a of agencies) {
    // Create agency owner
    const owner = await findOrCreateUser(a.owner.email, a.owner.first, a.owner.last);

    // Create Clerk agency org
    const agencyOrg = await findOrCreateOrg(a.name, owner.id);

    // Create Firestore agency workspace
    await createWorkspaceDoc(agencyOrg.id, {
      name: a.name,
      ownerId: owner.id,
      accountType: 'agency',
      tier: 'agency',
      clerkOrgId: agencyOrg.id,
      industry: a.industry,
    });

    await createMemberDoc(agencyOrg.id, owner.id, {
      role: 'owner',
      email: a.owner.email,
      displayName: `${a.owner.first} ${a.owner.last}`,
      invitedBy: owner.id,
    });

    await createBrandProfile(agencyOrg.id, owner.id, a.brand);
    await createProfileScore(agencyOrg.id, 'agency', owner.id);

    users.push({
      clerkId: owner.id,
      email: a.owner.email,
      name: `${a.owner.first} ${a.owner.last}`,
      role: 'owner (agency)',
      context: `WS: ${agencyOrg.id} — ${a.name}`,
    });

    // Create 3 client sub-workspaces per agency
    for (let i = 0; i < a.clients.length; i++) {
      const c = a.clients[i];
      const clientSlug = c.name.toLowerCase().replace(/\s+/g, '-');
      const clientId = `client-${clientSlug}`;

      // Create Clerk child org for the client
      const clientOrgName = `${a.name} - ${c.name}`;
      const clientOrg = await findOrCreateOrg(clientOrgName, owner.id);

      // Create Firestore client sub-workspace
      await createWorkspaceDoc(clientOrg.id, {
        name: c.name,
        ownerId: owner.id,
        accountType: 'agency',
        tier: 'agency',
        clerkOrgId: clientOrg.id,
        industry: c.industry,
        parentWorkspaceId: agencyOrg.id,
        agencyWorkspaceId: agencyOrg.id,
      });

      // Create client doc in agency's clients subcollection
      await createClientDoc(agencyOrg.id, clientId, {
        name: c.name,
        contactEmail: c.contactEmail,
        industry: c.industry,
        assignedTeamMembers: [owner.id],
        clerkOrgId: clientOrg.id,
        childWorkspaceId: clientOrg.id,
      });

      process.stdout.write(`    - Client: ${c.name} — ${clientOrg.id}\n`);
    }

    process.stdout.write(`  + ${a.name} — ${agencyOrg.id} (3 clients)\n`);
  }
  process.stdout.write('\n');

  // ── STEP 4: PLATFORM TEAM (all 8 roles) ────────────────────────────
  process.stdout.write('STEP 4: Creating platform team (8 roles)...\n');

  const platformTeam = [
    { email: 'superadmin@aura-platform.dev', first: 'Admin', last: 'Supreme', role: 'super_admin' },
    { email: 'platformadmin@aura-platform.dev', first: 'Petra', last: 'PlatformOps', role: 'platform_admin' },
    { email: 'partnermgr@aura-platform.dev', first: 'Parker', last: 'Partnerships', role: 'partner_manager' },
    { email: 'ops@aura-platform.dev', first: 'Oscar', last: 'Operations', role: 'operations' },
    { email: 'finance@aura-platform.dev', first: 'Fiona', last: 'FinanceOps', role: 'finance' },
    { email: 'support@aura-platform.dev', first: 'Sasha', last: 'Support', role: 'support' },
    { email: 'moderator@aura-platform.dev', first: 'Morgan', last: 'Moderator', role: 'content_moderator' },
    { email: 'analyst@aura-platform.dev', first: 'Aria', last: 'Analytics', role: 'analyst' },
  ];

  // Platform users get Clerk accounts but use a separate Firestore collection
  // (platform_users) for role tracking. They don't need a shared Clerk org —
  // the admin panel authenticates via Clerk user + platform_users lookup.

  for (const p of platformTeam) {
    const user = await findOrCreateUser(p.email, p.first, p.last);

    // Each platform user gets their own Clerk org (required by Clerk's org mandate)
    await findOrCreateOrg(`Aura Platform - ${p.first}`, user.id);

    // Create Firestore platform_users doc
    await createPlatformUser(user.id, p.email, `${p.first} ${p.last}`, p.role);

    users.push({
      clerkId: user.id,
      email: p.email,
      name: `${p.first} ${p.last}`,
      role: `${p.role} (platform)`,
      context: 'Platform admin panel',
    });
    process.stdout.write(`  + ${p.role.padEnd(20)} — ${p.email}\n`);
  }
  process.stdout.write('\n');

  // ── STEP 5: E2E TEST USER (for Playwright) ─────────────────────────
  process.stdout.write('STEP 5: Creating E2E test user...\n');
  const e2eUser = await findOrCreateUser('e2e-test@aura-test.dev', 'E2E', 'TestUser');
  users.push({
    clerkId: e2eUser.id,
    email: 'e2e-test@aura-test.dev',
    name: 'E2E TestUser',
    role: 'E2E test account',
    context: 'Playwright tests',
  });
  process.stdout.write(`  + E2E user — ${e2eUser.id}\n\n`);

  // ── SUMMARY ────────────────────────────────────────────────────────
  process.stdout.write('=========================================================\n');
  process.stdout.write('  SEED COMPLETE\n');
  process.stdout.write('=========================================================\n\n');
  process.stdout.write(`  Password for ALL users: ${TEST_PASSWORD}\n\n`);

  process.stdout.write('  FREELANCERS (3 workspaces):\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  for (const u of users.filter((u) => u.role.includes('freelancer'))) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(40)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  ORGANIZATIONS (3 workspaces, 9 users):\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  for (const u of users.filter((u) => u.role.includes('(org)'))) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(40)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  AGENCIES (3 workspaces, 9 client sub-workspaces):\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  for (const u of users.filter((u) => u.role.includes('agency'))) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(40)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  PLATFORM TEAM (8 roles):\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  for (const u of users.filter((u) => u.role.includes('platform'))) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(40)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  E2E TEST:\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  for (const u of users.filter((u) => u.role.includes('E2E'))) {
    process.stdout.write(`  ${u.role.padEnd(25)} ${u.email.padEnd(40)} ${u.clerkId}\n`);
  }

  process.stdout.write('\n  FIRESTORE COLLECTIONS CREATED:\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  process.stdout.write('  workspaces/{id}                          (21 docs)\n');
  process.stdout.write('  workspaces/{id}/members/{userId}         (12+ docs)\n');
  process.stdout.write('  workspaces/{id}/brand_profiles/default   (9 docs)\n');
  process.stdout.write('  workspaces/{id}/profile_score/current    (9 docs)\n');
  process.stdout.write('  workspaces/{id}/clients/{clientId}       (9 docs)\n');
  process.stdout.write('  platform_users/{userId}                  (8 docs)\n');
  process.stdout.write('\n');
}

main().catch((error: unknown) => {
  process.stderr.write(
    `\nSeed failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
