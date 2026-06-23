import { PubSubService } from '@ohif/core';
import {
  ReportTemplate,
  ReportTemplateField,
  getTemplate,
  getTemplateByModality,
  getAllTemplates,
  registerTemplate,
  FieldType,
} from '../templates';

const EVENTS = {
  TEMPLATE_REGISTERED: 'event::ReportTemplateService:templateRegistered',
  TEMPLATE_UPDATED: 'event::ReportTemplateService:templateUpdated',
};

/**
 * ReportTemplateService manages report templates for the application.
 * It provides methods to register, get, and validate report templates.
 */
export default class ReportTemplateService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'reportTemplateService',
    create: ({ configuration = {} }) => {
      return new ReportTemplateService();
    },
  };

  constructor() {
    super(ReportTemplateService.EVENTS);
  }

  /**
   * Get a template by ID
   * @param templateId - The template ID
   * @returns The template or undefined
   */
  getTemplate(templateId: string): ReportTemplate | undefined {
    return getTemplate(templateId);
  }

  /**
   * Get a template by modality
   * @param modality - The modality
   * @returns The template or undefined
   */
  getTemplateByModality(modality: string): ReportTemplate | undefined {
    return getTemplateByModality(modality);
  }

  /**
   * Get all templates
   * @returns Array of templates
   */
  getAllTemplates(): ReportTemplate[] {
    return getAllTemplates();
  }

  /**
   * Register a new template
   * @param template - The template to register
   */
  registerTemplate(template: ReportTemplate): void {
    registerTemplate(template);

    this._broadcastEvent(ReportTemplateService.EVENTS.TEMPLATE_REGISTERED, {
      template,
    });
  }

  /**
   * Validate report data against a template
   * @param templateId - The template ID
   * @param data - The report data to validate
   * @returns Validation result with errors
   */
  validateReportData(
    templateId: string,
    data: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const template = getTemplate(templateId);
    if (!template) {
      return { valid: false, errors: [`Template ${templateId} not found`] };
    }

    const errors: string[] = [];

    template.fields.forEach(field => {
      const value = data[field.id];

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.label} is required`);
        return;
      }

      // Skip validation if value is empty and field is not required
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Type-specific validation
      switch (field.type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
          if (typeof value !== 'string') {
            errors.push(`${field.label} must be a string`);
          }
          break;

        case FieldType.NUMBER:
          if (typeof value !== 'number' && isNaN(Number(value))) {
            errors.push(`${field.label} must be a number`);
          }
          break;

        case FieldType.SELECT:
          if (field.options) {
            const validValues = field.options.map(opt => opt.value);
            if (!validValues.includes(value)) {
              errors.push(`${field.label} must be one of: ${validValues.join(', ')}`);
            }
          }
          break;

        case FieldType.DATE:
          if (isNaN(Date.parse(value))) {
            errors.push(`${field.label} must be a valid date`);
          }
          break;

        case FieldType.CHECKBOX:
          if (typeof value !== 'boolean') {
            errors.push(`${field.label} must be a boolean`);
          }
          break;
      }

      // Custom validation
      if (field.validation && !field.validation(value)) {
        errors.push(`${field.label} is invalid`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default values for a template
   * @param templateId - The template ID
   * @returns Default values object
   */
  getDefaultValues(templateId: string): Record<string, any> {
    const template = getTemplate(templateId);
    if (!template) {
      return {};
    }

    const defaults: Record<string, any> = {};

    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      } else {
        switch (field.type) {
          case FieldType.TEXT:
          case FieldType.TEXTAREA:
            defaults[field.id] = '';
            break;
          case FieldType.NUMBER:
            defaults[field.id] = 0;
            break;
          case FieldType.CHECKBOX:
            defaults[field.id] = false;
            break;
          case FieldType.SELECT:
            defaults[field.id] = field.options?.[0]?.value || '';
            break;
          case FieldType.DATE:
            defaults[field.id] = new Date().toISOString().split('T')[0];
            break;
        }
      }
    });

    return defaults;
  }
}

export { ReportTemplateService };
