import { Types } from '@ohif/core';
import { id } from './id';
import AnalyticsService from './services/AnalyticsService';

/**
 * Analytics Extension for OHIF
 *
 * Provides analytics and statistics functionality for the PACS client.
 */
const analyticsExtension: Types.Extensions.Extension = {
  id,

  /**
   * Register services during pre-registration
   */
  preRegistration({ servicesManager, configuration }: Types.Extensions.ExtensionParams) {
    // Register the AnalyticsService
    servicesManager.registerService(AnalyticsService.REGISTRATION);
  },
};

export default analyticsExtension;

// Export types and utilities
export { AnalyticsService } from './services/AnalyticsService';
export type { StatisticsMetrics, AnalyticsFilter } from './services/AnalyticsService';
export { ExportService } from './services/ExportService';
export { useAnalytics } from './hooks';
export { Dashboard, StatisticsChart, FilterPanel, ReportExport } from './components';
