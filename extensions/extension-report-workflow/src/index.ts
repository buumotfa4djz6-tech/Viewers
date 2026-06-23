import { Types } from '@ohif/core';
import { id } from './id';
import ReportTemplateService from './services/ReportTemplateService';
import ReportWorkflowService from './services/ReportWorkflowService';

/**
 * Report Workflow Extension for OHIF
 *
 * Provides report template management and workflow functionality.
 */
const reportWorkflowExtension: Types.Extensions.Extension = {
  id,

  /**
   * Register services during pre-registration
   */
  preRegistration({ servicesManager, configuration }: Types.Extensions.ExtensionParams) {
    // Register the ReportTemplateService
    servicesManager.registerService(ReportTemplateService.REGISTRATION);

    // Register the ReportWorkflowService
    servicesManager.registerService(ReportWorkflowService.REGISTRATION);
  },
};

export default reportWorkflowExtension;

// Export types and utilities
export { ReportTemplateService } from './services/ReportTemplateService';
export { ReportWorkflowService } from './services/ReportWorkflowService';
export { useReport, useReportTemplate } from './hooks';
export { ReportEditor, ReportViewer, ReportReviewPanel } from './components';
export {
  FieldType,
  ReportStatus,
  type ReportTemplate,
  type ReportTemplateField,
  type ReportData,
  type SelectOption,
} from './templates';
export { generateDicomSR, parseDicomSR, formatReportForDisplay } from './utils';
