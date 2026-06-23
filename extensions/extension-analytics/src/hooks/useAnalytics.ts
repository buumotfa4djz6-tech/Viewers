import { useState, useEffect, useCallback } from 'react';
import { StatisticsMetrics, AnalyticsFilter } from '../services/AnalyticsService';
import ExportService from '../services/ExportService';

/**
 * Hook to manage analytics
 *
 * @example
 * const { metrics, filter, setFilter, exportCSV, isLoading } = useAnalytics(servicesManager);
 */
export function useAnalytics(servicesManager?: AppTypes.ServicesManager) {
  const [metrics, setMetrics] = useState<StatisticsMetrics | null>(null);
  const [filter, setFilterState] = useState<AnalyticsFilter>({});
  const [isLoading, setIsLoading] = useState(false);

  const getAnalyticsService = useCallback(() => {
    if (!servicesManager) return null;
    return servicesManager.services.analyticsService;
  }, [servicesManager]);

  /**
   * Load statistics
   */
  const loadStatistics = useCallback(() => {
    const service = getAnalyticsService();
    if (!service) return;

    setIsLoading(true);
    try {
      const stats = service.getStatistics(filter);
      setMetrics(stats);
    } finally {
      setIsLoading(false);
    }
  }, [getAnalyticsService, filter]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  /**
   * Set filter
   * @param newFilter - The new filter
   */
  const setFilter = useCallback(
    (newFilter: AnalyticsFilter) => {
      setFilterState(newFilter);
      const service = getAnalyticsService();
      if (service) {
        service.setFilter(newFilter);
      }
    },
    [getAnalyticsService]
  );

  /**
   * Clear filter
   */
  const clearFilter = useCallback(() => {
    setFilterState({});
    const service = getAnalyticsService();
    if (service) {
      service.clearFilter();
    }
  }, [getAnalyticsService]);

  /**
   * Export to CSV
   * @param filename - The filename
   */
  const exportCSV = useCallback(
    (filename?: string) => {
      if (metrics) {
        ExportService.exportToCSV(metrics, filename);
      }
    },
    [metrics]
  );

  /**
   * Export to JSON
   * @param filename - The filename
   */
  const exportJSON = useCallback(
    (filename?: string) => {
      if (metrics) {
        ExportService.exportToJSON(metrics, filename);
      }
    },
    [metrics]
  );

  /**
   * Export to PDF
   * @param filename - The filename
   */
  const exportPDF = useCallback(
    (filename?: string) => {
      if (metrics) {
        ExportService.exportToPDF(metrics, filename);
      }
    },
    [metrics]
  );

  return {
    metrics,
    filter,
    isLoading,
    setFilter,
    clearFilter,
    exportCSV,
    exportJSON,
    exportPDF,
    loadStatistics,
  };
}

export default useAnalytics;
