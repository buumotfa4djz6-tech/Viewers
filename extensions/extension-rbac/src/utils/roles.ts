/**
 * Roles and Permissions Configuration
 *
 * Defines the available roles and their permissions.
 */

/**
 * Available roles in the system
 */
export enum Role {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  TECHNICIAN = 'tech',
  REVIEWER = 'reviewer',
}

/**
 * Available permissions in the system
 */
export enum Permission {
  // Study permissions
  VIEW_STUDIES = 'view:studies',
  SEARCH_STUDIES = 'search:studies',

  // Report permissions
  CREATE_REPORT = 'create:report',
  EDIT_REPORT = 'edit:report',
  REVIEW_REPORT = 'review:report',
  SIGN_REPORT = 'sign:report',

  // Worklist permissions
  VIEW_WORKLIST = 'view:worklist',
  ASSIGN_WORK = 'assign:work',
  CHANGE_STATUS = 'change:status',

  // Admin permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_SETTINGS = 'manage:settings',
  VIEW_STATISTICS = 'view:statistics',
  EXPORT_DATA = 'export:data',

  // Viewer permissions
  USE_MEASUREMENT_TOOLS = 'use:measurement-tools',
  USE_ANNOTATION_TOOLS = 'use:annotation-tools',
  VIEW_SEGMENTATIONS = 'view:segmentations',
}

/**
 * Role-Permission mapping
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_STUDIES,
    Permission.SEARCH_STUDIES,
    Permission.CREATE_REPORT,
    Permission.EDIT_REPORT,
    Permission.REVIEW_REPORT,
    Permission.SIGN_REPORT,
    Permission.VIEW_WORKLIST,
    Permission.ASSIGN_WORK,
    Permission.CHANGE_STATUS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_STATISTICS,
    Permission.EXPORT_DATA,
    Permission.USE_MEASUREMENT_TOOLS,
    Permission.USE_ANNOTATION_TOOLS,
    Permission.VIEW_SEGMENTATIONS,
  ],
  [Role.DOCTOR]: [
    // Doctor can view studies, create reports, use measurement tools
    Permission.VIEW_STUDIES,
    Permission.SEARCH_STUDIES,
    Permission.CREATE_REPORT,
    Permission.EDIT_REPORT,
    Permission.VIEW_WORKLIST,
    Permission.USE_MEASUREMENT_TOOLS,
    Permission.USE_ANNOTATION_TOOLS,
    Permission.VIEW_SEGMENTATIONS,
  ],
  [Role.TECHNICIAN]: [
    // Technician can view studies, create reports (initial), use measurement tools
    Permission.VIEW_STUDIES,
    Permission.SEARCH_STUDIES,
    Permission.CREATE_REPORT,
    Permission.VIEW_WORKLIST,
    Permission.USE_MEASUREMENT_TOOLS,
    Permission.USE_ANNOTATION_TOOLS,
    Permission.VIEW_SEGMENTATIONS,
  ],
  [Role.REVIEWER]: [
    // Reviewer can view studies, review and sign reports, view statistics
    Permission.VIEW_STUDIES,
    Permission.SEARCH_STUDIES,
    Permission.REVIEW_REPORT,
    Permission.SIGN_REPORT,
    Permission.VIEW_WORKLIST,
    Permission.VIEW_STATISTICS,
    Permission.USE_MEASUREMENT_TOOLS,
    Permission.USE_ANNOTATION_TOOLS,
    Permission.VIEW_SEGMENTATIONS,
  ],
};

/**
 * Check if a role has a specific permission
 * @param role - The role to check
 * @param permission - The permission to check for
 * @returns True if the role has the permission
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
  const normalizedRole = role.toLowerCase() as Role;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) {
    return false;
  }
  return permissions.includes(permission);
}

/**
 * Check if any of the user's roles have a specific permission
 * @param roles - Array of user roles
 * @param permission - The permission to check for
 * @returns True if any role has the permission
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
  return roles.some(role => roleHasPermission(role, permission));
}

/**
 * Get all permissions for a set of roles
 * @param roles - Array of user roles
 * @returns Array of unique permissions
 */
export function getPermissionsForRoles(roles: string[]): Permission[] {
  const permissions = new Set<Permission>();

  roles.forEach(role => {
    const normalizedRole = role.toLowerCase() as Role;
    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
    if (rolePermissions) {
      rolePermissions.forEach(permission => permissions.add(permission));
    }
  });

  return Array.from(permissions);
}

/**
 * Get the highest priority role from a list of roles
 * Priority: admin > reviewer > doctor > tech
 * @param roles - Array of user roles
 * @returns The highest priority role
 */
export function getHighestPriorityRole(roles: string[]): Role | null {
  const priorityOrder = [Role.ADMIN, Role.REVIEWER, Role.DOCTOR, Role.TECHNICIAN];

  for (const role of priorityOrder) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return null;
}
