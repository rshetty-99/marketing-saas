/**
 * Seed Firestore reference collections for RBAC roles + permissions.
 *
 * Collections created:
 *   config/workspace_roles/{role}         — 6 workspace role definitions
 *   config/platform_roles/{role}          — 8 platform role definitions
 *   config/workspace_permissions/{role}   — permission matrix per workspace role
 *   config/platform_permissions/{role}    — permission matrix per platform role
 *
 * Usage:
 *   npx tsx scripts/seed-roles-permissions.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

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

// ─── Workspace Role Definitions ─────────────────────────────────────

interface RoleDefinition {
  key: string;
  label: string;
  description: string;
  hierarchy: number;
  scope: 'workspace' | 'platform';
  assignableBy: string[];   // which roles can assign this role
  isDefault?: boolean;       // auto-assigned on creation
  isExternal?: boolean;      // external-only (client_portal)
}

const WORKSPACE_ROLES: RoleDefinition[] = [
  {
    key: 'owner',
    label: 'Owner',
    description: 'Full control including billing, deletion, and ownership transfer. One per workspace.',
    hierarchy: 60,
    scope: 'workspace',
    assignableBy: [],
    isDefault: true,
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'Manage members, integrations, and all content. Cannot delete workspace or transfer ownership.',
    hierarchy: 50,
    scope: 'workspace',
    assignableBy: ['owner'],
  },
  {
    key: 'manager',
    label: 'Manager',
    description: 'Approve and publish content, assign tasks, view analytics. Cannot manage members or integrations.',
    hierarchy: 40,
    scope: 'workspace',
    assignableBy: ['owner', 'admin'],
  },
  {
    key: 'editor',
    label: 'Editor',
    description: 'Create and edit content, submit for approval. Cannot approve, publish, or access admin settings.',
    hierarchy: 30,
    scope: 'workspace',
    assignableBy: ['owner', 'admin'],
  },
  {
    key: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to content, analytics, and reports.',
    hierarchy: 20,
    scope: 'workspace',
    assignableBy: ['owner', 'admin'],
  },
  {
    key: 'client_portal',
    label: 'Client',
    description: 'View reports and approved content for their specific client workspace only.',
    hierarchy: 10,
    scope: 'workspace',
    assignableBy: ['owner', 'admin'],
    isExternal: true,
  },
];

// ─── Platform Role Definitions ──────────────────────────────────────

const PLATFORM_ROLES: RoleDefinition[] = [
  {
    key: 'super_admin',
    label: 'Super Admin',
    description: 'Founders / CTO. God-mode. Everything. Cannot be created via UI — only via seed.',
    hierarchy: 80,
    scope: 'platform',
    assignableBy: [],
  },
  {
    key: 'platform_admin',
    label: 'Platform Admin',
    description: 'All operations except destructive platform-level actions.',
    hierarchy: 70,
    scope: 'platform',
    assignableBy: ['super_admin'],
  },
  {
    key: 'partner_manager',
    label: 'Partner Manager',
    description: 'Approve account type upgrades, manage agency partnerships, onboard enterprise clients.',
    hierarchy: 60,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
  {
    key: 'operations',
    label: 'Operations',
    description: 'User/workspace management, subscription overrides, trial extensions, feature flag toggles.',
    hierarchy: 50,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
  {
    key: 'finance',
    label: 'Finance',
    description: 'Billing, subscriptions, refunds, revenue reports, invoicing, MRR/churn dashboards.',
    hierarchy: 40,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
  {
    key: 'support',
    label: 'Support',
    description: 'View customer workspaces (impersonation read-only), respond to tickets, escalate issues.',
    hierarchy: 30,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
  {
    key: 'content_moderator',
    label: 'Content Moderator',
    description: 'Review flagged content, enforce ToS violations, suspend content, issue warnings.',
    hierarchy: 20,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
  {
    key: 'analyst',
    label: 'Analyst',
    description: 'Read-only platform analytics. View all dashboards, export platform reports.',
    hierarchy: 10,
    scope: 'platform',
    assignableBy: ['super_admin', 'platform_admin'],
  },
];

// ─── Workspace Permission Matrix ────────────────────────────────────
// From RBAC spec Section 7.1

type PermissionMap = Record<string, boolean>;

function wp(
  owner: boolean,
  admin: boolean,
  manager: boolean,
  editor: boolean,
  viewer: boolean,
  clientPortal: boolean,
): Record<string, boolean> {
  return { owner, admin, manager, editor, viewer, client_portal: clientPortal };
}

// Each key maps to a permission; each value is {role: boolean}
const WORKSPACE_PERMISSIONS_RAW: Record<string, Record<string, boolean>> = {
  // ── Content (F1, F2) ──
  'content.create_edit_drafts':       wp(true, true, true, true, false, false),
  'content.delete_own_drafts':        wp(true, true, true, true, false, false),
  'content.delete_any_draft':         wp(true, true, false, false, false, false),
  'content.view_all_drafts':          wp(true, true, true, true, true, false),

  // ── Approvals (F6) ──
  'approvals.submit_for_approval':    wp(true, true, true, true, false, false),
  'approvals.approve_reject':         wp(true, true, true, false, false, false),
  'approvals.self_approve':           wp(true, true, false, false, false, false),
  'approvals.override_rejection':     wp(true, true, false, false, false, false),
  'approvals.configure_rules':        wp(true, true, false, false, false, false),

  // ── Publishing (F3) ──
  'publishing.publish':               wp(true, true, true, false, false, false),
  'publishing.schedule':              wp(true, true, true, false, false, false),
  'publishing.unpublish':             wp(true, true, true, false, false, false),

  // ── Calendar (F4) ──
  'calendar.view':                    wp(true, true, true, true, true, false),
  'calendar.create_edit':             wp(true, true, true, true, false, false),
  'calendar.delete':                  wp(true, true, true, false, false, false),

  // ── Analytics (F5) ──
  'analytics.view_dashboard':         wp(true, true, true, true, true, true),
  'analytics.export_reports':         wp(true, true, true, false, false, false),

  // ── Workspaces (F7) ──
  'workspace.update_settings':        wp(true, true, false, false, false, false),
  'workspace.invite_members':         wp(true, true, false, false, false, false),
  'workspace.remove_members':         wp(true, true, false, false, false, false),
  'workspace.assign_roles':           wp(true, true, false, false, false, false),
  'workspace.delete':                 wp(true, false, false, false, false, false),
  'workspace.transfer_ownership':     wp(true, false, false, false, false, false),
  'workspace.request_upgrade':        wp(true, false, false, false, false, false),

  // ── Brand Voice (F8) ──
  'brand.create_edit_profile':        wp(true, true, false, false, false, false),
  'brand.upload_assets':              wp(true, true, true, false, false, false),
  'brand.view_profile':               wp(true, true, true, true, true, false),

  // ── Social Connections (F9) ──
  'social.connect':                   wp(true, true, false, false, false, false),
  'social.disconnect':                wp(true, true, false, false, false, false),
  'social.view_connected':            wp(true, true, true, true, false, false),

  // ── SEO & Keywords (F10) ──
  'seo.run_research':                 wp(true, true, true, true, false, false),
  'seo.view_reports':                 wp(true, true, true, true, true, false),

  // ── Email Campaigns (F11) ──
  'email.create_campaigns':           wp(true, true, true, true, false, false),
  'email.send_campaigns':             wp(true, true, true, false, false, false),
  'email.view_analytics':             wp(true, true, true, true, true, false),
  'email.manage_suppression':         wp(true, true, false, false, false, false),

  // ── Lead Management (F12) ──
  'leads.create':                     wp(true, true, true, true, false, false),
  'leads.edit_any':                   wp(true, true, true, false, false, false),
  'leads.edit_assigned':              wp(false, false, false, true, false, false),
  'leads.delete':                     wp(true, true, false, false, false, false),
  'leads.reassign':                   wp(true, true, true, false, false, false),
  'leads.export':                     wp(true, true, true, false, false, false),

  // ── Image Generation (F13) ──
  'images.generate':                  wp(true, true, true, true, false, false),
  'images.delete':                    wp(true, true, true, false, false, false),

  // ── Client Management (F14) ──
  'clients.create_workspace':         wp(true, true, false, false, false, false),
  'clients.archive':                  wp(true, true, false, false, false, false),
  'clients.assign_team':              wp(true, true, false, false, false, false),
  'clients.switch_context':           wp(true, true, true, true, false, false),
  'clients.generate_reports':         wp(true, true, true, false, false, false),
  'clients.send_reports':             wp(true, true, true, false, false, false),
  'clients.provision_portal_user':    wp(true, true, false, false, false, false),
  'clients.view_own_reports':         wp(false, false, false, false, false, true),
  'clients.view_approved_content':    wp(false, false, false, false, false, true),

  // ── Billing (F15) ──
  'billing.view':                     wp(true, true, false, false, false, false),
  'billing.change_plan':              wp(true, false, false, false, false, false),

  // ── DAM (F16) ──
  'dam.upload':                       wp(true, true, true, true, false, false),
  'dam.delete':                       wp(true, true, true, false, false, false),
  'dam.view_download':                wp(true, true, true, true, true, false),
};

// ─── Platform Permission Matrix ─────────────────────────────────────
// From RBAC spec Section 8.1

function pp(
  superAdmin: boolean,
  platformAdmin: boolean,
  partnerManager: boolean,
  operations: boolean,
  finance: boolean,
  support: boolean,
  contentModerator: boolean,
  analyst: boolean,
): Record<string, boolean> {
  return {
    super_admin: superAdmin,
    platform_admin: platformAdmin,
    partner_manager: partnerManager,
    operations,
    finance,
    support,
    content_moderator: contentModerator,
    analyst,
  };
}

const PLATFORM_PERMISSIONS_RAW: Record<string, Record<string, boolean>> = {
  // ── Dashboard ──
  'dashboard.view_metrics':                pp(true, true, true, true, true, true, true, true),
  'dashboard.export_reports':              pp(true, true, true, true, true, false, false, true),

  // ── User Management ──
  'users.search_view':                     pp(true, true, true, true, false, true, true, false),
  'users.suspend':                         pp(true, true, false, true, false, false, true, false),
  'users.reactivate':                      pp(true, true, false, true, false, false, false, false),
  'users.delete':                          pp(true, true, false, false, false, false, false, false),

  // ── Workspace Management ──
  'workspaces.view_any':                   pp(true, true, true, true, false, true, true, false),
  'workspaces.force_archive':              pp(true, true, false, true, false, false, false, false),
  'workspaces.restore':                    pp(true, true, false, true, false, false, false, false),

  // ── Impersonation ──
  'impersonation.view_as':                 pp(true, true, false, true, false, true, false, false),

  // ── Subscriptions ──
  'subscriptions.view_all':                pp(true, true, true, true, true, true, false, true),
  'subscriptions.override_tier':           pp(true, true, false, true, true, false, false, false),
  'subscriptions.extend_trial':            pp(true, true, true, true, true, false, false, false),
  'subscriptions.process_refund':          pp(true, true, false, false, true, false, false, false),

  // ── Upgrade Requests ──
  'upgrades.view_pending':                 pp(true, true, true, true, false, false, false, false),
  'upgrades.approve_deny':                 pp(true, true, true, false, false, false, false, false),

  // ── Feature Flags ──
  'feature_flags.toggle_global':           pp(true, true, false, false, false, false, false, false),
  'feature_flags.toggle_per_workspace':    pp(true, true, false, true, false, false, false, false),

  // ── Content Moderation ──
  'moderation.view_flagged':               pp(true, true, false, false, false, false, true, false),
  'moderation.suspend_content':            pp(true, true, false, false, false, false, true, false),
  'moderation.issue_warning':              pp(true, true, false, false, false, false, true, false),
  'moderation.suspend_workspace':          pp(true, true, false, false, false, false, false, false),

  // ── Agency Partnerships ──
  'partnerships.view_applications':        pp(true, true, true, false, false, false, false, false),
  'partnerships.approve':                  pp(true, true, true, false, false, false, false, false),
  'partnerships.manage_enterprise':        pp(true, true, true, false, false, false, false, false),

  // ── Platform Team Management ──
  'team.create_users':                     pp(true, true, false, false, false, false, false, false),
  'team.assign_roles':                     pp(true, true, false, false, false, false, false, false),
  'team.deactivate_users':                 pp(true, true, false, false, false, false, false, false),

  // ── Platform Settings ──
  'settings.configure_global':             pp(true, true, false, false, false, false, false, false),
  'settings.manage_webhooks':              pp(true, true, false, false, false, false, false, false),
  'settings.view_audit_logs':              pp(true, true, true, true, true, true, true, true),

  // ── Destructive Operations ──
  'destructive.purge_data':                pp(true, false, false, false, false, false, false, false),
  'destructive.modify_super_admin':        pp(true, false, false, false, false, false, false, false),
  'destructive.platform_reset':            pp(true, false, false, false, false, false, false, false),
};

// ─── Pivot helpers ──────────────────────────────────────────────────
// Raw data is structured as { permission: { role: bool } }
// We need to pivot to { role: { permission: bool } } for Firestore

function pivotToPerRole(
  raw: Record<string, Record<string, boolean>>,
  roleKeys: string[],
): Record<string, PermissionMap> {
  const result: Record<string, PermissionMap> = {};
  for (const role of roleKeys) {
    result[role] = {};
  }
  for (const [permission, roleMap] of Object.entries(raw)) {
    for (const role of roleKeys) {
      if (roleMap[role]) {
        result[role][permission] = true;
      }
    }
  }
  return result;
}

// ─── Cleanup old nested config/ structure ───────────────────────────

async function deleteSubcollection(parentPath: string, subcollection: string): Promise<number> {
  const snap = await db.collection(`${parentPath}/${subcollection}`).get();
  if (snap.empty) return 0;
  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();
  return snap.size;
}

async function cleanupOldConfig(): Promise<void> {
  const configDocs = ['workspace_roles', 'platform_roles', 'workspace_permissions', 'platform_permissions'];
  let deleted = 0;

  for (const docId of configDocs) {
    const parentPath = `config/${docId}`;
    deleted += await deleteSubcollection(parentPath, 'roles');
    // Delete the parent doc itself
    const parentRef = db.collection('config').doc(docId);
    const parentSnap = await parentRef.get();
    if (parentSnap.exists) {
      await parentRef.delete();
      deleted++;
    }
  }

  if (deleted > 0) {
    process.stdout.write(`  Cleaned up ${deleted} old config/ docs\n`);
  }
}

async function cleanupCollection(collectionName: string): Promise<number> {
  const snap = await db.collection(collectionName).get();
  if (snap.empty) return 0;
  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();
  return snap.size;
}

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  process.stdout.write('\n=========================================================\n');
  process.stdout.write('  AURA.AI — Seed RBAC Roles & Permissions (flat)\n');
  process.stdout.write('=========================================================\n\n');

  // ── 0. Cleanup ──
  process.stdout.write('0. Cleaning up old data...\n');
  await cleanupOldConfig();
  await cleanupCollection('workspace_roles');
  await cleanupCollection('platform_roles');
  await cleanupCollection('workspace_permissions');
  await cleanupCollection('platform_permissions');
  process.stdout.write('  Done.\n\n');

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  // ── 1. workspace_roles/{role} ──
  process.stdout.write('1. Writing workspace_roles/...\n');
  for (const role of WORKSPACE_ROLES) {
    const ref = db.collection('workspace_roles').doc(role.key);
    batch.set(ref, {
      ...role,
      createdAt: now,
      updatedAt: now,
    });
    process.stdout.write(`   + ${role.key} (hierarchy: ${role.hierarchy})\n`);
  }

  // ── 2. platform_roles/{role} ──
  process.stdout.write('\n2. Writing platform_roles/...\n');
  for (const role of PLATFORM_ROLES) {
    const ref = db.collection('platform_roles').doc(role.key);
    batch.set(ref, {
      ...role,
      createdAt: now,
      updatedAt: now,
    });
    process.stdout.write(`   + ${role.key} (hierarchy: ${role.hierarchy})\n`);
  }

  // ── 3. workspace_permissions/{role} ──
  process.stdout.write('\n3. Writing workspace_permissions/...\n');
  const wsRoleKeys = WORKSPACE_ROLES.map((r) => r.key);
  const wsPerRole = pivotToPerRole(WORKSPACE_PERMISSIONS_RAW, wsRoleKeys);

  for (const [role, permissions] of Object.entries(wsPerRole)) {
    const permCount = Object.keys(permissions).length;
    const ref = db.collection('workspace_permissions').doc(role);
    batch.set(ref, {
      role,
      scope: 'workspace',
      permissions,
      permissionCount: permCount,
      createdAt: now,
      updatedAt: now,
    });
    process.stdout.write(`   + ${role}: ${permCount} permissions\n`);
  }

  // ── 4. platform_permissions/{role} ──
  process.stdout.write('\n4. Writing platform_permissions/...\n');
  const platRoleKeys = PLATFORM_ROLES.map((r) => r.key);
  const platPerRole = pivotToPerRole(PLATFORM_PERMISSIONS_RAW, platRoleKeys);

  for (const [role, permissions] of Object.entries(platPerRole)) {
    const permCount = Object.keys(permissions).length;
    const ref = db.collection('platform_permissions').doc(role);
    batch.set(ref, {
      role,
      scope: 'platform',
      permissions,
      permissionCount: permCount,
      createdAt: now,
      updatedAt: now,
    });
    process.stdout.write(`   + ${role}: ${permCount} permissions\n`);
  }

  // ── Commit ──
  process.stdout.write('\nCommitting batch...\n');
  await batch.commit();

  process.stdout.write('\n=========================================================\n');
  process.stdout.write('  SEED COMPLETE\n');
  process.stdout.write('=========================================================\n\n');
  process.stdout.write('  Firestore collections (flat):\n');
  process.stdout.write('  ─────────────────────────────────────────────────\n');
  process.stdout.write(`  workspace_roles/{role}         — ${WORKSPACE_ROLES.length} docs\n`);
  process.stdout.write(`  platform_roles/{role}          — ${PLATFORM_ROLES.length} docs\n`);
  process.stdout.write(`  workspace_permissions/{role}   — ${wsRoleKeys.length} docs\n`);
  process.stdout.write(`  platform_permissions/{role}    — ${platRoleKeys.length} docs\n`);
  process.stdout.write(`\n  Total permissions defined:\n`);
  process.stdout.write(`    Workspace: ${Object.keys(WORKSPACE_PERMISSIONS_RAW).length} keys\n`);
  process.stdout.write(`    Platform:  ${Object.keys(PLATFORM_PERMISSIONS_RAW).length} keys\n`);
  process.stdout.write('\n');
}

main().catch((error: unknown) => {
  process.stderr.write(
    `\nSeed failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
