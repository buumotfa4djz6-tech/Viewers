import React from 'react';
import { useTenant } from '../hooks/useTenant';
import type { Tenant } from '../services/TenantService';

interface TenantSelectorProps {
  /** The services manager to use */
  servicesManager?: AppTypes.ServicesManager;
  /** Callback when tenant changes */
  onTenantChange?: (tenant: Tenant) => void;
  /** Custom class name */
  className?: string;
  /** Whether to show the tenant name */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
}

/**
 * TenantSelector component
 *
 * A dropdown selector for switching between tenants.
 *
 * @example
 * <TenantSelector servicesManager={servicesManager} />
 */
export function TenantSelector({
  servicesManager,
  onTenantChange,
  className = '',
  showLabel = true,
  label = 'Tenant:',
}: TenantSelectorProps) {
  const { tenant, tenants, setTenant, isLoading, hasTenants } = useTenant(servicesManager);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = event.target.value;
    setTenant(tenantId);

    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant && onTenantChange) {
      onTenantChange(selectedTenant);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-sm text-gray-400">Loading tenants...</span>
      </div>
    );
  }

  if (!hasTenants) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-sm text-gray-400">{label}</span>}
      <select
        value={tenant?.id || ''}
        onChange={handleChange}
        className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {tenants.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * InlineTenantSelector component
 *
 * A compact inline tenant selector for use in headers and toolbars.
 */
export function InlineTenantSelector({
  servicesManager,
  onTenantChange,
  className = '',
}: TenantSelectorProps) {
  const { tenant, tenants, setTenant, isLoading, hasTenants } = useTenant(servicesManager);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = event.target.value;
    setTenant(tenantId);

    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant && onTenantChange) {
      onTenantChange(selectedTenant);
    }
  };

  if (isLoading || !hasTenants) {
    return null;
  }

  return (
    <select
      value={tenant?.id || ''}
      onChange={handleChange}
      className={`rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none ${className}`}
    >
      {tenants.map(t => (
        <option key={t.id} value={t.id} className="bg-gray-800">
          {t.name}
        </option>
      ))}
    </select>
  );
}

export default TenantSelector;
