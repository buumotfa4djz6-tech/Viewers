import { useState, useEffect, useCallback } from 'react';
import { useUserAuthentication } from '@ohif/ui-next';
import {
  Permission,
  hasPermission,
  getPermissionsForRoles,
  extractUserFromToken,
  getAccessToken,
  isTokenExpired,
  type ParsedUser,
} from '../utils';

/**
 * Hook to check user permissions
 *
 * @example
 * const { hasPermission, permissions, roles, user } = usePermission();
 *
 * // Check a single permission
 * if (hasPermission(Permission.CREATE_REPORT)) {
 *   // Show create report button
 * }
 *
 * // Check multiple permissions
 * if (hasPermission([Permission.CREATE_REPORT, Permission.EDIT_REPORT])) {
 *   // Show report editor
 * }
 */
export function usePermission() {
  const [{ user }] = useUserAuthentication();
  const [parsedUser, setParsedUser] = useState<ParsedUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (!user) {
      setParsedUser(null);
      setRoles([]);
      setPermissions([]);
      return;
    }

    // Extract user information from JWT token
    const accessToken = user.access_token || getAccessToken();
    if (accessToken) {
      const extractedUser = extractUserFromToken(accessToken);
      if (extractedUser && !isTokenExpired(extractedUser.tokenExpiry)) {
        setParsedUser(extractedUser);
        setRoles(extractedUser.roles);
        setPermissions(getPermissionsForRoles(extractedUser.roles));
        return;
      }
    }

    // Fallback: try to get roles from user object
    if (user.roles) {
      setRoles(user.roles);
      setPermissions(getPermissionsForRoles(user.roles));
    }
  }, [user]);

  /**
   * Check if the current user has a specific permission
   * @param permission - The permission or array of permissions to check
   * @param requireAll - If true, requires all permissions (default: false, requires any)
   * @returns True if the user has the permission(s)
   */
  const checkPermission = useCallback(
    (permission: Permission | Permission[], requireAll = false): boolean => {
      if (!user) {
        return false;
      }

      const perms = Array.isArray(permission) ? permission : [permission];

      if (requireAll) {
        return perms.every(p => hasPermission(roles, p));
      }

      return perms.some(p => hasPermission(roles, p));
    },
    [user, roles]
  );

  /**
   * Check if the current user has a specific role
   * @param role - The role to check
   * @returns True if the user has the role
   */
  const checkRole = useCallback(
    (role: string): boolean => {
      if (!user) {
        return false;
      }
      return roles.includes(role.toLowerCase());
    },
    [user, roles]
  );

  return {
    user: parsedUser,
    roles,
    permissions,
    hasPermission: checkPermission,
    hasRole: checkRole,
    isAuthenticated: !!user,
    isAdmin: roles.includes('admin'),
    isDoctor: roles.includes('doctor'),
    isTechnician: roles.includes('tech'),
    isReviewer: roles.includes('reviewer'),
  };
}

export default usePermission;
