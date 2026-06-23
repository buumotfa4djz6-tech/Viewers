import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission, Role } from '../utils/roles';

interface PermissionGuardProps {
  /** The permission(s) required to render the children */
  permission?: Permission | Permission[];
  /** The role(s) required to render the children */
  role?: Role | Role[];
  /** If true, requires all permissions/roles (default: false, requires any) */
  requireAll?: boolean;
  /** Content to render if the user has the required permission(s)/role(s) */
  children: React.ReactNode;
  /** Content to render if the user does not have the required permission(s)/role(s) */
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard component
 *
 * Conditionally renders children based on user permissions or roles.
 *
 * @example
 * // Check a single permission
 * <PermissionGuard permission={Permission.CREATE_REPORT}>
 *   <CreateReportButton />
 * </PermissionGuard>
 *
 * @example
 * // Check multiple permissions (any)
 * <PermissionGuard permission={[Permission.CREATE_REPORT, Permission.EDIT_REPORT]}>
 *   <ReportEditor />
 * </PermissionGuard>
 *
 * @example
 * // Check multiple permissions (all)
 * <PermissionGuard permission={[Permission.CREATE_REPORT, Permission.EDIT_REPORT]} requireAll>
 *   <ReportEditor />
 * </PermissionGuard>
 *
 * @example
 * // Check a role
 * <PermissionGuard role={Role.ADMIN}>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // With fallback
 * <PermissionGuard permission={Permission.VIEW_STATISTICS} fallback={<AccessDenied />}>
 *   <StatisticsPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  role,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermission();

  // Check permissions if provided
  if (permission) {
    const hasAccess = hasPermission(permission, requireAll);
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check roles if provided
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasAccess = requireAll
      ? roles.every(r => hasRole(r))
      : roles.some(r => hasRole(r));

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * withPermission HOC
 *
 * Wraps a component with permission checking.
 *
 * @example
 * const ProtectedComponent = withPermission(MyComponent, {
 *   permission: Permission.CREATE_REPORT,
 * });
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    permission?: Permission | Permission[];
    role?: Role | Role[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
  }
) {
  const WithPermission = (props: P) => (
    <PermissionGuard
      permission={options.permission}
      role={options.role}
      requireAll={options.requireAll}
      fallback={options.fallback}
    >
      <WrappedComponent {...props} />
    </PermissionGuard>
  );

  WithPermission.displayName = `withPermission(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithPermission;
}

export default PermissionGuard;
