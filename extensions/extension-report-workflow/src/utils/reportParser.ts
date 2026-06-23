import { ReportData, ReportStatus } from '../templates';

/**
 * Report Parser Utilities
 *
 * Utilities for parsing and converting report data.
 */

/**
 * Parse a DICOM SR object to report data
 * @param srObject - The DICOM SR object
 * @returns The parsed report data
 */
export function parseDicomSR(srObject: any): Partial<ReportData> {
  const reportData: Partial<ReportData> = {};

  // Extract study instance UID
  if (srObject['0020000D']?.Value?.[0]) {
    reportData.studyInstanceUid = srObject['0020000D'].Value[0];
  }

  // Extract series instance UID
  if (srObject['0020000E']?.Value?.[0]) {
    reportData.seriesInstanceUid = srObject['0020000E'].Value[0];
  }

  // Extract patient name
  if (srObject['00100010']?.Value?.[0]) {
    reportData.patientName = srObject['00100010'].Value[0];
  }

  // Extract patient ID
  if (srObject['00100020']?.Value?.[0]) {
    reportData.patientId = srObject['00100020'].Value[0];
  }

  // Extract study date
  if (srObject['00080020']?.Value?.[0]) {
    reportData.studyDate = parseDicomDate(srObject['00080020'].Value[0]);
  }

  // Extract modality
  if (srObject['00080060']?.Value?.[0]) {
    reportData.modality = srObject['00080060'].Value[0];
  }

  // Extract author
  if (srObject['00080090']?.Value?.[0]) {
    reportData.author = srObject['00080090'].Value[0];
  }

  // Extract content items
  if (srObject['0040A730']?.Value) {
    const contentItems = srObject['0040A730'].Value;
    const fields: Record<string, any> = {};

    contentItems.forEach((item: any) => {
      const conceptNameCode = item['0040A043']?.Value?.[0];
      const textValue = item['0040A160']?.Value?.[0];

      if (conceptNameCode && textValue) {
        const codeValue = conceptNameCode['00080100']?.Value?.[0];

        switch (codeValue) {
          case '121070': // Finding
            reportData.findings = textValue;
            break;
          case '121071': // Impression
            reportData.impression = textValue;
            break;
          case '121074': // Recommendation
            reportData.recommendation = textValue;
            break;
          default:
            // Store as custom field
            const fieldName = conceptNameCode['00080104']?.Value?.[0] || codeValue;
            fields[fieldName] = textValue;
            break;
        }
      }
    });

    reportData.fields = fields;
  }

  return reportData;
}

/**
 * Convert report data to a simple object for storage
 * @param reportData - The report data
 * @returns The simple object
 */
export function reportToSimpleObject(reportData: ReportData): Record<string, any> {
  return {
    id: reportData.id,
    studyInstanceUid: reportData.studyInstanceUid,
    seriesInstanceUid: reportData.seriesInstanceUid,
    sopInstanceUid: reportData.sopInstanceUid,
    templateId: reportData.templateId,
    modality: reportData.modality,
    patientId: reportData.patientId,
    patientName: reportData.patientName,
    studyDate: reportData.studyDate,
    reportDate: reportData.reportDate,
    author: reportData.author,
    reviewer: reportData.reviewer,
    status: reportData.status,
    findings: reportData.findings,
    impression: reportData.impression,
    recommendation: reportData.recommendation,
    diagnosis: reportData.diagnosis,
    fields: reportData.fields,
    dicomSrUid: reportData.dicomSrUid,
  };
}

/**
 * Parse a simple object to report data
 * @param obj - The simple object
 * @returns The report data
 */
export function simpleObjectToReport(obj: Record<string, any>): ReportData {
  return {
    id: obj.id,
    studyInstanceUid: obj.studyInstanceUid,
    seriesInstanceUid: obj.seriesInstanceUid,
    sopInstanceUid: obj.sopInstanceUid,
    templateId: obj.templateId,
    modality: obj.modality,
    patientId: obj.patientId,
    patientName: obj.patientName,
    studyDate: obj.studyDate,
    reportDate: obj.reportDate,
    author: obj.author,
    reviewer: obj.reviewer,
    status: obj.status as ReportStatus,
    findings: obj.findings,
    impression: obj.impression,
    recommendation: obj.recommendation,
    diagnosis: obj.diagnosis,
    fields: obj.fields || {},
    dicomSrUid: obj.dicomSrUid,
  };
}

/**
 * Parse a DICOM date string (YYYYMMDD) to ISO date string
 * @param dicomDate - The DICOM date string
 * @returns The ISO date string
 */
function parseDicomDate(dicomDate: string): string {
  if (dicomDate.length !== 8) {
    return dicomDate;
  }

  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Format a report for display
 * @param reportData - The report data
 * @returns The formatted report string
 */
export function formatReportForDisplay(reportData: ReportData): string {
  const lines: string[] = [];

  lines.push(`Patient: ${reportData.patientName}`);
  lines.push(`Patient ID: ${reportData.patientId}`);
  lines.push(`Study Date: ${reportData.studyDate}`);
  lines.push(`Modality: ${reportData.modality}`);
  lines.push(`Author: ${reportData.author}`);
  lines.push(`Status: ${reportData.status}`);
  lines.push('');

  if (reportData.findings) {
    lines.push('Findings:');
    lines.push(reportData.findings);
    lines.push('');
  }

  if (reportData.impression) {
    lines.push('Impression:');
    lines.push(reportData.impression);
    lines.push('');
  }

  if (reportData.recommendation) {
    lines.push('Recommendation:');
    lines.push(reportData.recommendation);
    lines.push('');
  }

  if (reportData.diagnosis) {
    lines.push('Diagnosis:');
    lines.push(reportData.diagnosis);
    lines.push('');
  }

  // Add custom fields
  if (reportData.fields) {
    Object.entries(reportData.fields).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        lines.push(`${key}: ${value}`);
      }
    });
  }

  return lines.join('\n');
}
