import { Types } from '@ohif/core';
import { id } from './id';
import PermissionService from './services/PermissionService';

/**
 * RBAC Extension for OHIF
 *
 * Provides role-based access control functionality by integrating with Keycloak.
 * Extracts roles from JWT tokens and provides permission checking capabilities.
 */
const rbacExtension: Types.Extensions.Extension = {
  id,

  /**
   * Register the PermissionService during pre-registration
   */
  preRegistration({ servicesManager, configuration }: Types.Extensions.ExtensionParams) {
    // Register the PermissionService
    servicesManager.registerService(PermissionService.REGISTRATION);

    // Initialize the PermissionService when the user authentication service is available
    const { userAuthenticationService, permissionService } = servicesManager.services;

    if (permissionService && userAuthenticationService) {
      permissionService.initialize(userAuthenticationService);
    }
  },
};

export default rbacExtension;

// Export types and utilities
export { Permission, Role } from './utils/roles';
export { usePermission, useRole } from './hooks';
export { PermissionGuard, withPermission } from './components';
export { PermissionService };
export type { ParsedUser, KeycloakTokenPayload } from './utils/jwtParser';
