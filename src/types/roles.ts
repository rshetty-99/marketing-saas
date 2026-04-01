// ─── IMPORTANT ──────────────────────────────────────────────────────
// Role definitions and permissions are now stored in Firestore:
//   config/workspace_roles/roles/{role}
//   config/platform_roles/roles/{role}
//   config/workspace_permissions/roles/{role}
//   config/platform_permissions/roles/{role}
//
// Use the RBAC service for runtime checks:
//   import { hasPermission, getRoleDefinition } from '@/lib/rbac';
//
// The constants below are kept for TypeScript type safety and backward
// compatibility. They are NOT the source of truth — Firestore is.
// To add/modify roles, update Firestore and re-run:
//   npx tsx scripts/seed-roles-permissions.ts
// ─────────────────────────────────────────────────────────────────────

// ─── Workspace Roles ────────────────────────────────────────────────
export const WORKSPACE_ROLES = {
  owner: 'owner',
  admin: 'admin',
  manager: 'manager',
  editor: 'editor',
  viewer: 'viewer',
  client_portal: 'client_portal',
} as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[keyof typeof WORKSPACE_ROLES];

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 60,
  admin: 50,
  manager: 40,
  editor: 30,
  viewer: 20,
  client_portal: 10,
};

// ─── Platform Roles ─────────────────────────────────────────────────
export const PLATFORM_ROLES = {
  super_admin: 'super_admin',
  platform_admin: 'platform_admin',
  partner_manager: 'partner_manager',
  operations: 'operations',
  finance: 'finance',
  support: 'support',
  content_moderator: 'content_moderator',
  analyst: 'analyst',
} as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES];

export const PLATFORM_ROLE_HIERARCHY: Record<PlatformRole, number> = {
  super_admin: 80,
  platform_admin: 70,
  partner_manager: 60,
  operations: 50,
  finance: 40,
  support: 30,
  content_moderator: 20,
  analyst: 10,
};

// ─── Account Types ──────────────────────────────────────────────────
export const ACCOUNT_TYPES = {
  freelancer: 'freelancer',
  organization: 'organization',
  agency: 'agency',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

// ─── Tiers ──────────────────────────────────────────────────────────
export const TIERS = {
  starter: 'starter',
  growth: 'growth',
  agency: 'agency',
  agency_pro: 'agency_pro',
  white_label: 'white_label',
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

// ─── Workspace Status ───────────────────────────────────────────────
export const WORKSPACE_STATUSES = {
  active: 'active',
  trial: 'trial',
  soft_locked: 'soft_locked',
  suspended: 'suspended',
  archived: 'archived',
  deleted: 'deleted',
} as const;

export type WorkspaceStatus =
  (typeof WORKSPACE_STATUSES)[keyof typeof WORKSPACE_STATUSES];

// ─── Role Display Info (client-safe) ────────────────────────────────

export const ROLE_DISPLAY: Record<WorkspaceRole, { label: string; description: string }> = {
  owner: { label: 'Owner', description: 'Full control including billing and deletion' },
  admin: { label: 'Admin', description: 'Manage members, integrations, and all content' },
  manager: { label: 'Manager', description: 'Approve and publish content, assign tasks' },
  editor: { label: 'Editor', description: 'Create and edit content, submit for approval' },
  viewer: { label: 'Viewer', description: 'Read-only access to content and analytics' },
  client_portal: { label: 'Client', description: 'View reports and approved content' },
};

export const PLATFORM_ROLE_DISPLAY: Record<PlatformRole, { label: string; description: string }> = {
  super_admin: { label: 'Super Admin', description: 'Full platform control' },
  platform_admin: { label: 'Platform Admin', description: 'Manage platform team and settings' },
  partner_manager: { label: 'Partner Manager', description: 'Manage agency partnerships and upgrades' },
  operations: { label: 'Operations', description: 'User and workspace management' },
  finance: { label: 'Finance', description: 'Billing, subscriptions, and refunds' },
  support: { label: 'Support', description: 'Customer support and impersonation' },
  content_moderator: { label: 'Content Moderator', description: 'Review flagged content and ToS' },
  analyst: { label: 'Analyst', description: 'Read-only platform analytics' },
};

// ─── Hierarchy Helpers ──────────────────────────────────────────────

/**
 * Returns true if `userRole` is at least as privileged as `minRole`
 * in the workspace role hierarchy.
 */
export function isAtLeastRole(
  userRole: WorkspaceRole,
  minRole: WorkspaceRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/**
 * Returns true if `userRole` is at least as privileged as `minRole`
 * in the platform role hierarchy.
 */
export function isAtLeastPlatformRole(
  userRole: PlatformRole,
  minRole: PlatformRole,
): boolean {
  return PLATFORM_ROLE_HIERARCHY[userRole] >= PLATFORM_ROLE_HIERARCHY[minRole];
}
