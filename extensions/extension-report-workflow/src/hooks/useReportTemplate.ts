import { useState, useEffect, useCallback } from 'react';
import { ReportTemplate, ReportTemplateField } from '../templates';

/**
 * Hook to manage report templates
 *
 * @example
 * const { templates, getTemplate, validateData, getDefaultValues } = useReportTemplate(servicesManager);
 */
export function useReportTemplate(servicesManager?: AppTypes.ServicesManager) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getReportTemplateService = useCallback(() => {
    if (!servicesManager) return null;
    return servicesManager.services.reportTemplateService;
  }, [servicesManager]);

  /**
   * Load all templates
   */
  const loadTemplates = useCallback(() => {
    const service = getReportTemplateService();
    if (!service) return;

    setIsLoading(true);
    try {
      const allTemplates = service.getAllTemplates();
      setTemplates(allTemplates);
    } finally {
      setIsLoading(false);
    }
  }, [getReportTemplateService]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /**
   * Get a template by ID
   * @param templateId - The template ID
   * @returns The template
   */
  const getTemplate = useCallback(
    (templateId: string): ReportTemplate | undefined => {
      const service = getReportTemplateService();
      if (!service) return undefined;

      return service.getTemplate(templateId);
    },
    [getReportTemplateService]
  );

  /**
   * Get a template by modality
   * @param modality - The modality
   * @returns The template
   */
  const getTemplateByModality = useCallback(
    (modality: string): ReportTemplate | undefined => {
      const service = getReportTemplateService();
      if (!service) return undefined;

      return service.getTemplateByModality(modality);
    },
    [getReportTemplateService]
  );

  /**
   * Validate report data against a template
   * @param templateId - The template ID
   * @param data - The report data to validate
   * @returns Validation result
   */
  const validateData = useCallback(
    (templateId: string, data: Record<string, any>): { valid: boolean; errors: string[] } => {
      const service = getReportTemplateService();
      if (!service) {
        return { valid: false, errors: ['Service not available'] };
      }

      return service.validateReportData(templateId, data);
    },
    [getReportTemplateService]
  );

  /**
   * Get default values for a template
   * @param templateId - The template ID
   * @returns Default values
   */
  const getDefaultValues = useCallback(
    (templateId: string): Record<string, any> => {
      const service = getReportTemplateService();
      if (!service) return {};

      return service.getDefaultValues(templateId);
    },
    [getReportTemplateService]
  );

  return {
    templates,
    isLoading,
    getTemplate,
    getTemplateByModality,
    validateData,
    getDefaultValues,
    loadTemplates,
  };
}

export default useReportTemplate;
