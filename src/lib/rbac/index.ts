export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  getRoleDefinition,
  getAllRoles,
  getAssignableRoles,
  getRoleHierarchy,
  isAtLeastRole,
  invalidateRbacCache,
} from './rbac-service';

export type {
  RoleDefinition,
  RolePermissions,
  RbacConfig,
} from './types';
