/**
 * RBAC Service — Reads role definitions and permissions from Firestore
 * with in-memory caching (5-minute TTL).
 *
 * Usage:
 *   import { hasPermission, getRoleDefinition, getAssignableRoles } from '@/lib/rbac/rbac-service';
 *
 *   // Check if a workspace role has a specific permission
 *   const canPublish = await hasPermission('workspace', 'editor', 'publishing.publish');
 *
 *   // Get role metadata
 *   const role = await getRoleDefinition('workspace', 'manager');
 *
 *   // Get roles that a given role can assign
 *   const assignable = await getAssignableRoles('workspace', 'admin');
 */

import { adminDb } from '@/lib/firebase/admin';
import type { RbacConfig, RoleDefinition, RolePermissions } from './types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: RbacConfig | null = null;

async function loadCollection<T>(path: string): Promise<Map<string, T>> {
  const snapshot = await adminDb.collection(path).get();
  const map = new Map<string, T>();
  for (const doc of snapshot.docs) {
    map.set(doc.id, doc.data() as T);
  }
  return map;
}

async function loadConfig(): Promise<RbacConfig> {
  const now = Date.now();

  if (cache && now - cache.loadedAt < CACHE_TTL_MS) {
    return cache;
  }

  const [workspaceRoles, platformRoles, workspacePermissions, platformPermissions] =
    await Promise.all([
      loadCollection<RoleDefinition>('workspace_roles'),
      loadCollection<RoleDefinition>('platform_roles'),
      loadCollection<RolePermissions>('workspace_permissions'),
      loadCollection<RolePermissions>('platform_permissions'),
    ]);

  cache = {
    workspaceRoles,
    platformRoles,
    workspacePermissions,
    platformPermissions,
    loadedAt: now,
  };

  return cache;
}

/**
 * Force-refresh the RBAC cache on next access.
 * Call this after updating roles/permissions in Firestore.
 */
export function invalidateRbacCache(): void {
  cache = null;
}

// ─── Role Definitions ───────────────────────────────────────────────

export async function getRoleDefinition(
  scope: 'workspace' | 'platform',
  roleKey: string,
): Promise<RoleDefinition | null> {
  const config = await loadConfig();
  const roles = scope === 'workspace' ? config.workspaceRoles : config.platformRoles;
  return roles.get(roleKey) ?? null;
}

export async function getAllRoles(
  scope: 'workspace' | 'platform',
): Promise<RoleDefinition[]> {
  const config = await loadConfig();
  const roles = scope === 'workspace' ? config.workspaceRoles : config.platformRoles;
  return Array.from(roles.values()).sort((a, b) => b.hierarchy - a.hierarchy);
}

export async function getAssignableRoles(
  scope: 'workspace' | 'platform',
  assignerRole: string,
): Promise<RoleDefinition[]> {
  const allRoles = await getAllRoles(scope);
  return allRoles.filter((r) => r.assignableBy.includes(assignerRole));
}

// ─── Permission Checks ─────────────────────────────────────────────

export async function hasPermission(
  scope: 'workspace' | 'platform',
  roleKey: string,
  permission: string,
): Promise<boolean> {
  const config = await loadConfig();
  const permMap =
    scope === 'workspace' ? config.workspacePermissions : config.platformPermissions;
  const rolePerms = permMap.get(roleKey);
  if (!rolePerms) return false;
  return rolePerms.permissions[permission] === true;
}

export async function getPermissions(
  scope: 'workspace' | 'platform',
  roleKey: string,
): Promise<Record<string, boolean>> {
  const config = await loadConfig();
  const permMap =
    scope === 'workspace' ? config.workspacePermissions : config.platformPermissions;
  const rolePerms = permMap.get(roleKey);
  return rolePerms?.permissions ?? {};
}

export async function hasAnyPermission(
  scope: 'workspace' | 'platform',
  roleKey: string,
  permissions: string[],
): Promise<boolean> {
  const rolePerms = await getPermissions(scope, roleKey);
  return permissions.some((p) => rolePerms[p] === true);
}

export async function hasAllPermissions(
  scope: 'workspace' | 'platform',
  roleKey: string,
  permissions: string[],
): Promise<boolean> {
  const rolePerms = await getPermissions(scope, roleKey);
  return permissions.every((p) => rolePerms[p] === true);
}

// ─── Hierarchy Checks ───────────────────────────────────────────────

export async function getRoleHierarchy(
  scope: 'workspace' | 'platform',
  roleKey: string,
): Promise<number> {
  const role = await getRoleDefinition(scope, roleKey);
  return role?.hierarchy ?? 0;
}

export async function isAtLeastRole(
  scope: 'workspace' | 'platform',
  userRole: string,
  minRole: string,
): Promise<boolean> {
  const [userHierarchy, minHierarchy] = await Promise.all([
    getRoleHierarchy(scope, userRole),
    getRoleHierarchy(scope, minRole),
  ]);
  return userHierarchy >= minHierarchy;
}
