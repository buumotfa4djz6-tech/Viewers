import { ctReportTemplate } from './ctReport';
import { mriReportTemplate } from './mriReport';
import { xrayReportTemplate } from './xrayReport';

/**
 * Field types for report templates
 */
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  DATE = 'date',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
}

/**
 * Select option for select fields
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Report template field definition
 */
export interface ReportTemplateField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: SelectOption[];
  rows?: number;
  defaultValue?: any;
  validation?: (value: any) => boolean;
}

/**
 * Report template definition
 */
export interface ReportTemplate {
  id: string;
  name: string;
  modality: string;
  description?: string;
  fields: ReportTemplateField[];
}

/**
 * Report data structure
 */
export interface ReportData {
  id?: string;
  studyInstanceUid: string;
  seriesInstanceUid: string;
  sopInstanceUid?: string;
  templateId: string;
  modality: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  reportDate: string;
  author: string;
  reviewer?: string;
  status: ReportStatus;
  findings: string;
  impression: string;
  recommendation?: string;
  diagnosis?: string;
  fields: Record<string, any>;
  dicomSrUid?: string;
}

/**
 * Report status enum
 */
export enum ReportStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  REVIEWED = 'reviewed',
  SIGNED = 'signed',
  REJECTED = 'rejected',
}

/**
 * Registry of all report templates
 */
const templateRegistry: Map<string, ReportTemplate> = new Map();

/**
 * Register a report template
 * @param template - The template to register
 */
export function registerTemplate(template: ReportTemplate): void {
  templateRegistry.set(template.id, template);
}

/**
 * Get a report template by ID
 * @param templateId - The template ID
 * @returns The template or undefined
 */
export function getTemplate(templateId: string): ReportTemplate | undefined {
  return templateRegistry.get(templateId);
}

/**
 * Get a report template by modality
 * @param modality - The modality
 * @returns The template or undefined
 */
export function getTemplateByModality(modality: string): ReportTemplate | undefined {
  return Array.from(templateRegistry.values()).find(t => t.modality === modality);
}

/**
 * Get all registered templates
 * @returns Array of templates
 */
export function getAllTemplates(): ReportTemplate[] {
  return Array.from(templateRegistry.values());
}

/**
 * Initialize default templates
 */
export function initializeDefaultTemplates(): void {
  registerTemplate(ctReportTemplate);
  registerTemplate(mriReportTemplate);
  registerTemplate(xrayReportTemplate);
}

// Initialize default templates on import
initializeDefaultTemplates();

export { ctReportTemplate } from './ctReport';
export { mriReportTemplate } from './mriReport';
export { xrayReportTemplate } from './xrayReport';
