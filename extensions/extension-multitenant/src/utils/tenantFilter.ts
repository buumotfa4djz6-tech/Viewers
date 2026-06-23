/**
 * Tenant Filter Utilities
 *
 * Utilities for filtering data by tenant.
 */

/**
 * Filter an array of items by tenant ID
 * @param items - The array of items to filter
 * @param tenantId - The tenant ID to filter by
 * @param getTenantId - Function to get the tenant ID from an item
 * @returns The filtered array
 */
export function filterByTenant<T>(
  items: T[],
  tenantId: string | null,
  getTenantId: (item: T) => string | undefined
): T[] {
  if (!tenantId) {
    return items;
  }

  return items.filter(item => {
    const itemTenantId = getTenantId(item);
    return !itemTenantId || itemTenantId === tenantId;
  });
}

/**
 * Add tenant ID to an object
 * @param obj - The object to add tenant ID to
 * @param tenantId - The tenant ID to add
 * @returns The object with tenant ID added
 */
export function withTenantId<T extends Record<string, any>>(obj: T, tenantId: string): T & { tenantId: string } {
  return {
    ...obj,
    tenantId,
  };
}

/**
 * Create a tenant-aware query filter
 * @param baseFilter - The base filter
 * @param tenantId - The tenant ID to add
 * @returns The filter with tenant ID added
 */
export function createTenantFilter(
  baseFilter: Record<string, any> = {},
  tenantId: string | null
): Record<string, any> {
  if (!tenantId) {
    return baseFilter;
  }

  return {
    ...baseFilter,
    tenantId,
  };
}

/**
 * Check if an item belongs to a tenant
 * @param item - The item to check
 * @param tenantId - The tenant ID to check against
 * @param getTenantId - Function to get the tenant ID from an item
 * @returns True if the item belongs to the tenant
 */
export function belongsToTenant<T>(
  item: T,
  tenantId: string | null,
  getTenantId: (item: T) => string | undefined
): boolean {
  if (!tenantId) {
    return true;
  }

  const itemTenantId = getTenantId(item);
  return !itemTenantId || itemTenantId === tenantId;
}

/**
 * Group items by tenant
 * @param items - The array of items to group
 * @param getTenantId - Function to get the tenant ID from an item
 * @returns A map of tenant ID to items
 */
export function groupByTenant<T>(
  items: T[],
  getTenantId: (item: T) => string | undefined
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  items.forEach(item => {
    const tenantId = getTenantId(item) || 'default';
    const group = groups.get(tenantId) || [];
    group.push(item);
    groups.set(tenantId, group);
  });

  return groups;
}
