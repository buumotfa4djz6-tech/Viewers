import React, { useState, useEffect } from 'react';
import { ReportTemplate, ReportTemplateField, FieldType, ReportData, ReportStatus } from '../templates';
import { useReportTemplate } from '../hooks/useReportTemplate';
import { useReport } from '../hooks/useReport';

interface ReportEditorProps {
  /** The services manager */
  servicesManager?: AppTypes.ServicesManager;
  /** The study instance UID */
  studyInstanceUid: string;
  /** The series instance UID */
  seriesInstanceUid?: string;
  /** The modality */
  modality?: string;
  /** The patient ID */
  patientId?: string;
  /** The patient name */
  patientName?: string;
  /** The study date */
  studyDate?: string;
  /** The author (user ID) */
  author?: string;
  /** Existing report to edit */
  existingReport?: ReportData;
  /** Callback when report is saved */
  onSave?: (report: ReportData) => void;
  /** Callback when report is submitted */
  onSubmit?: (report: ReportData) => void;
  /** Callback when cancelled */
  onCancel?: () => void;
}

/**
 * ReportEditor component
 *
 * A form-based editor for creating and editing reports.
 */
export function ReportEditor({
  servicesManager,
  studyInstanceUid,
  seriesInstanceUid = '',
  modality = '',
  patientId = '',
  patientName = '',
  studyDate = '',
  author = '',
  existingReport,
  onSave,
  onSubmit,
  onCancel,
}: ReportEditorProps) {
  const { getTemplateByModality, validateData, getDefaultValues } = useReportTemplate(servicesManager);
  const { createReport, updateReport, submitReport } = useReport(servicesManager);

  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template based on modality
  useEffect(() => {
    if (modality) {
      const foundTemplate = getTemplateByModality(modality);
      if (foundTemplate) {
        setTemplate(foundTemplate);

        // Initialize form data
        if (existingReport) {
          setFormData({
            ...getDefaultValues(foundTemplate.id),
            ...existingReport.fields,
            findings: existingReport.findings,
            impression: existingReport.impression,
            recommendation: existingReport.recommendation,
            diagnosis: existingReport.diagnosis,
          });
        } else {
          setFormData(getDefaultValues(foundTemplate.id));
        }
      }
    }
  }, [modality, getTemplateByModality, getDefaultValues, existingReport]);

  /**
   * Handle field change
   */
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear errors for this field
    setErrors(prev => prev.filter(e => !e.includes(fieldId)));
  };

  /**
   * Validate the form
   */
  const validate = (): boolean => {
    if (!template) {
      setErrors(['No template found for this modality']);
      return false;
    }

    const result = validateData(template.id, formData);
    setErrors(result.errors);
    return result.valid;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const reportData = {
        studyInstanceUid,
        seriesInstanceUid,
        templateId: template?.id || '',
        modality,
        patientId,
        patientName,
        studyDate,
        reportDate: new Date().toISOString(),
        author,
        findings: formData.findings || '',
        impression: formData.impression || '',
        recommendation: formData.recommendation,
        diagnosis: formData.diagnosis,
        fields: formData,
      };

      let report: ReportData | null;

      if (existingReport?.id) {
        report = updateReport(existingReport.id, reportData);
      } else {
        report = createReport(reportData);
      }

      if (report && onSave) {
        onSave(report);
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // First save
      const reportData = {
        studyInstanceUid,
        seriesInstanceUid,
        templateId: template?.id || '',
        modality,
        patientId,
        patientName,
        studyDate,
        reportDate: new Date().toISOString(),
        author,
        findings: formData.findings || '',
        impression: formData.impression || '',
        recommendation: formData.recommendation,
        diagnosis: formData.diagnosis,
        fields: formData,
      };

      let report: ReportData | null;

      if (existingReport?.id) {
        report = updateReport(existingReport.id, reportData);
      } else {
        report = createReport(reportData);
      }

      if (report) {
        // Then submit
        const submittedReport = submitReport(report.id, author);
        if (submittedReport && onSubmit) {
          onSubmit(submittedReport);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render a form field
   */
  const renderField = (field: ReportTemplateField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case FieldType.TEXT:
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case FieldType.TEXTAREA:
        return (
          <textarea
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case FieldType.SELECT:
        return (
          <select
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case FieldType.DATE:
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case FieldType.NUMBER:
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleFieldChange(field.id, Number(e.target.value))}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case FieldType.CHECKBOX:
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={e => handleFieldChange(field.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  if (!template) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No template found for modality: {modality}</p>
        <p className="mt-2 text-sm">Please select a study with a supported modality.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white">{template.name}</h2>
        <p className="mt-1 text-sm text-gray-400">
          Patient: {patientName} | Study Date: {studyDate}
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border-b border-red-700 bg-red-900/20 p-4">
          <ul className="list-inside list-disc text-sm text-red-400">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {template.fields.map(field => (
            <div key={field.id}>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {field.label}
                {field.required && <span className="ml-1 text-red-400">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportEditor;
