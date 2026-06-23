import { useState, useEffect } from 'react';
import { useUserAuthentication } from '@ohif/ui-next';
import {
  Role,
  getHighestPriorityRole,
  extractUserFromToken,
  getAccessToken,
  isTokenExpired,
} from '../utils';

/**
 * Hook to get the current user's role
 *
 * @example
 * const { role, isAdmin, isDoctor, isTechnician, isReviewer } = useRole();
 *
 * // Check role
 * if (isAdmin) {
 *   // Show admin panel
 * }
 */
export function useRole() {
  const [{ user }] = useUserAuthentication();
  const [roles, setRoles] = useState<Role[]>([]);
  const [primaryRole, setPrimaryRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setPrimaryRole(null);
      return;
    }

    // Extract user information from JWT token
    const accessToken = user.access_token || getAccessToken();
    if (accessToken) {
      const extractedUser = extractUserFromToken(accessToken);
      if (extractedUser && !isTokenExpired(extractedUser.tokenExpiry)) {
        const userRoles = extractedUser.roles
          .map(r => r.toLowerCase() as Role)
          .filter(r => Object.values(Role).includes(r));

        setRoles(userRoles);
        setPrimaryRole(getHighestPriorityRole(userRoles));
        return;
      }
    }

    // Fallback: try to get roles from user object
    if (user.roles) {
      const userRoles = user.roles
        .map((r: string) => r.toLowerCase() as Role)
        .filter((r: Role) => Object.values(Role).includes(r));

      setRoles(userRoles);
      setPrimaryRole(getHighestPriorityRole(userRoles));
    }
  }, [user]);

  return {
    roles,
    primaryRole,
    isAdmin: roles.includes(Role.ADMIN),
    isDoctor: roles.includes(Role.DOCTOR),
    isTechnician: roles.includes(Role.TECHNICIAN),
    isReviewer: roles.includes(Role.REVIEWER),
    hasRole: (role: Role) => roles.includes(role),
    hasAnyRole: (roleList: Role[]) => roleList.some(role => roles.includes(role)),
  };
}

export default useRole;
