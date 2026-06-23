import { useState, useEffect, useCallback } from 'react';
import type { Tenant } from '../services/TenantService';

/**
 * Hook to get and manage the current tenant
 *
 * @example
 * const { tenant, tenantId, tenants, setTenant, isLoading } = useTenant();
 *
 * // Get current tenant
 * console.log(tenant.name);
 *
 * // Switch tenant
 * setTenant('tenant-2');
 */
export function useTenant(servicesManager?: AppTypes.ServicesManager) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [tenants, setTenantsState] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!servicesManager) {
      setIsLoading(false);
      return;
    }

    const { tenantService } = servicesManager.services;
    if (!tenantService) {
      setIsLoading(false);
      return;
    }

    // Get initial state
    setTenantState(tenantService.getCurrentTenant());
    setTenantsState(tenantService.getTenants());
    setIsLoading(false);

    // Subscribe to tenant changes
    const subscription = tenantService.subscribe(
      'event::TenantService:tenantChanged',
      (event: any) => {
        setTenantState(event.tenant);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [servicesManager]);

  /**
   * Set the current tenant
   * @param tenantId - The tenant ID to set as current
   */
  const setTenant = useCallback(
    (tenantId: string) => {
      if (!servicesManager) return;

      const { tenantService } = servicesManager.services;
      if (tenantService) {
        tenantService.setCurrentTenant(tenantId);
      }
    },
    [servicesManager]
  );

  /**
   * Get tenant filter for data queries
   * @returns The tenant filter object
   */
  const getTenantFilter = useCallback(() => {
    if (!servicesManager) return {};

    const { tenantService } = servicesManager.services;
    if (!tenantService) return {};

    return tenantService.getTenantFilter();
  }, [servicesManager]);

  /**
   * Add tenant filter to a query
   * @param query - The original query
   * @returns The query with tenant filter added
   */
  const addTenantFilter = useCallback(
    (query: Record<string, any>) => {
      if (!servicesManager) return query;

      const { tenantService } = servicesManager.services;
      if (!tenantService) return query;

      return tenantService.addTenantFilterToQuery(query);
    },
    [servicesManager]
  );

  return {
    tenant,
    tenantId: tenant?.id || null,
    tenants,
    setTenant,
    getTenantFilter,
    addTenantFilter,
    isLoading,
    hasTenants: tenants.length > 0,
  };
}

export default useTenant;
