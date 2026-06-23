import { Types } from '@ohif/core';
import { id } from './id';
import TenantService from './services/TenantService';

/**
 * Multi-tenant Extension for OHIF
 *
 * Provides multi-tenant support by allowing data isolation between different tenants.
 */
const multitenantExtension: Types.Extensions.Extension = {
  id,

  /**
   * Register the TenantService during pre-registration
   */
  preRegistration({ servicesManager, configuration }: Types.Extensions.ExtensionParams) {
    // Register the TenantService with tenant configuration
    servicesManager.registerService(TenantService.REGISTRATION);
  },
};

export default multitenantExtension;

// Export types and utilities
export { TenantService } from './services/TenantService';
export type { Tenant } from './services/TenantService';
export { useTenant } from './hooks';
export { TenantSelector, InlineTenantSelector } from './components';
export {
  filterByTenant,
  withTenantId,
  createTenantFilter,
  belongsToTenant,
  groupByTenant,
} from './utils';
