import { PubSubService } from '@ohif/core';

const EVENTS = {
  TENANT_CHANGED: 'event::TenantService:tenantChanged',
};

export interface Tenant {
  id: string;
  name: string;
  description?: string;
  dataSources?: string[];
}

/**
 * TenantService manages multi-tenant support for the application.
 * It provides methods to get/set the current tenant and filter data by tenant.
 */
export default class TenantService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'tenantService',
    create: ({ configuration = {} }) => {
      return new TenantService(configuration?.tenants || []);
    },
  };

  private tenants: Tenant[] = [];
  private currentTenant: Tenant | null = null;

  constructor(tenants: Tenant[] = []) {
    super(TenantService.EVENTS);
    this.tenants = tenants;

    // Try to restore tenant from localStorage
    const savedTenantId = localStorage.getItem('ohif_tenant_id');
    if (savedTenantId) {
      this.currentTenant = this.tenants.find(t => t.id === savedTenantId) || null;
    }

    // If no saved tenant, try to get from URL
    if (!this.currentTenant) {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantId = urlParams.get('tenant');
      if (tenantId) {
        this.currentTenant = this.tenants.find(t => t.id === tenantId) || null;
      }
    }

    // If still no tenant and there are tenants available, use the first one
    if (!this.currentTenant && this.tenants.length > 0) {
      this.currentTenant = this.tenants[0];
    }

    // Save to localStorage
    if (this.currentTenant) {
      localStorage.setItem('ohif_tenant_id', this.currentTenant.id);
    }
  }

  /**
   * Get all available tenants
   * @returns Array of tenants
   */
  getTenants(): Tenant[] {
    return this.tenants;
  }

  /**
   * Get the current tenant
   * @returns The current tenant or null
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  /**
   * Get the current tenant ID
   * @returns The current tenant ID or null
   */
  getCurrentTenantId(): string | null {
    return this.currentTenant?.id || null;
  }

  /**
   * Set the current tenant
   * @param tenantId - The tenant ID to set as current
   */
  setCurrentTenant(tenantId: string): void {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      console.warn(`Tenant with ID ${tenantId} not found`);
      return;
    }

    this.currentTenant = tenant;
    localStorage.setItem('ohif_tenant_id', tenant.id);

    this._broadcastEvent(TenantService.EVENTS.TENANT_CHANGED, {
      tenant,
      tenantId: tenant.id,
    });
  }

  /**
   * Add a new tenant
   * @param tenant - The tenant to add
   */
  addTenant(tenant: Tenant): void {
    if (this.tenants.find(t => t.id === tenant.id)) {
      console.warn(`Tenant with ID ${tenant.id} already exists`);
      return;
    }

    this.tenants.push(tenant);
  }

  /**
   * Remove a tenant
   * @param tenantId - The tenant ID to remove
   */
  removeTenant(tenantId: string): void {
    this.tenants = this.tenants.filter(t => t.id !== tenantId);

    if (this.currentTenant?.id === tenantId) {
      this.currentTenant = this.tenants.length > 0 ? this.tenants[0] : null;
      if (this.currentTenant) {
        localStorage.setItem('ohif_tenant_id', this.currentTenant.id);
      } else {
        localStorage.removeItem('ohif_tenant_id');
      }
    }
  }

  /**
   * Update a tenant
   * @param tenantId - The tenant ID to update
   * @param updates - The updates to apply
   */
  updateTenant(tenantId: string, updates: Partial<Tenant>): void {
    const index = this.tenants.findIndex(t => t.id === tenantId);
    if (index === -1) {
      console.warn(`Tenant with ID ${tenantId} not found`);
      return;
    }

    this.tenants[index] = { ...this.tenants[index], ...updates };

    if (this.currentTenant?.id === tenantId) {
      this.currentTenant = this.tenants[index];
    }
  }

  /**
   * Check if the current tenant has access to a data source
   * @param dataSourceId - The data source ID to check
   * @returns True if the tenant has access to the data source
   */
  hasDataSourceAccess(dataSourceId: string): boolean {
    if (!this.currentTenant) {
      return true; // If no tenant, allow access to all data sources
    }

    if (!this.currentTenant.dataSources || this.currentTenant.dataSources.length === 0) {
      return true; // If no data sources specified, allow access to all
    }

    return this.currentTenant.dataSources.includes(dataSourceId);
  }

  /**
   * Get the tenant filter for data queries
   * @returns The tenant filter object
   */
  getTenantFilter(): Record<string, any> {
    if (!this.currentTenant) {
      return {};
    }

    return {
      tenantId: this.currentTenant.id,
    };
  }

  /**
   * Add tenant filter to a query
   * @param query - The original query
   * @returns The query with tenant filter added
   */
  addTenantFilterToQuery(query: Record<string, any>): Record<string, any> {
    if (!this.currentTenant) {
      return query;
    }

    return {
      ...query,
      ...this.getTenantFilter(),
    };
  }
}

export { TenantService };
