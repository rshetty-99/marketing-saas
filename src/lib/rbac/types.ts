/**
 * RBAC types — derived from Firestore config collections at runtime.
 * These are the shapes of docs in config/workspace_roles, config/platform_roles,
 * config/workspace_permissions, and config/platform_permissions.
 */

export interface RoleDefinition {
  key: string;
  label: string;
  description: string;
  hierarchy: number;
  scope: 'workspace' | 'platform';
  assignableBy: string[];
  isDefault?: boolean;
  isExternal?: boolean;
}

export interface RolePermissions {
  role: string;
  scope: 'workspace' | 'platform';
  permissions: Record<string, boolean>;
  permissionCount: number;
}

/**
 * The full RBAC config loaded from Firestore.
 * Cached in-memory with TTL.
 */
export interface RbacConfig {
  workspaceRoles: Map<string, RoleDefinition>;
  platformRoles: Map<string, RoleDefinition>;
  workspacePermissions: Map<string, RolePermissions>;
  platformPermissions: Map<string, RolePermissions>;
  loadedAt: number;
}
