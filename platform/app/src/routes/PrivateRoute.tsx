import React from 'react';
import { useUserAuthentication } from '@ohif/ui-next';

/**
 * Parse JWT token to extract user roles
 */
function parseJwtRoles(token: string): string[] {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return [];

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles: string[] = [];

    if (payload.resource_access) {
      Object.values(payload.resource_access).forEach((access: any) => {
        if (access.roles) {
          clientRoles.push(...access.roles);
        }
      });
    }

    return [...new Set([...realmRoles, ...clientRoles])].filter(
      (role: string) => !['default-roles-pacs', 'offline_access', 'uma_authorization'].includes(role)
    );
  } catch (error) {
    return [];
  }
}

interface PrivateRouteProps {
  children: React.ReactNode;
  handleUnauthenticated: () => React.ReactNode;
  /** Optional: required roles for the route */
  roles?: string[];
  /** If true, requires all roles (default: false, requires any) */
  requireAllRoles?: boolean;
}

export const PrivateRoute = ({
  children,
  handleUnauthenticated,
  roles,
  requireAllRoles = false,
}: PrivateRouteProps) => {
  const [{ user, enabled }] = useUserAuthentication();

  if (enabled && !user) {
    return handleUnauthenticated();
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && user) {
    const userRoles = user.roles || [];

    // If user has no roles yet, try to parse from JWT token
    let effectiveRoles = userRoles;
    if (effectiveRoles.length === 0 && user.access_token) {
      effectiveRoles = parseJwtRoles(user.access_token);
    }

    const hasAccess = requireAllRoles
      ? roles.every(role => effectiveRoles.includes(role))
      : roles.some(role => effectiveRoles.includes(role));

    if (!hasAccess) {
      return (
        <div className="flex h-screen items-center justify-center bg-black">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-gray-400">
              You do not have the required permissions to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default PrivateRoute;
