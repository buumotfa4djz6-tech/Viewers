import React from 'react';
import { ReportData, ReportStatus } from '../templates';
import { formatReportForDisplay } from '../utils/reportParser';

interface ReportViewerProps {
  /** The report data to display */
  report: ReportData;
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when review is clicked */
  onReview?: () => void;
  /** Callback when sign is clicked */
  onSign?: () => void;
  /** Callback when reject is clicked */
  onReject?: () => void;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** The current user's roles */
  userRoles?: string[];
}

/**
 * ReportViewer component
 *
 * Displays a report in read-only mode with optional action buttons.
 */
export function ReportViewer({
  report,
  onEdit,
  onReview,
  onSign,
  onReject,
  showActions = true,
  userRoles = [],
}: ReportViewerProps) {
  /**
   * Get status badge color
   */
  const getStatusColor = (status: ReportStatus): string => {
    switch (status) {
      case ReportStatus.DRAFT:
        return 'bg-gray-600';
      case ReportStatus.PENDING_REVIEW:
        return 'bg-yellow-600';
      case ReportStatus.REVIEWED:
        return 'bg-blue-600';
      case ReportStatus.SIGNED:
        return 'bg-green-600';
      case ReportStatus.REJECTED:
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: ReportStatus): string => {
    switch (status) {
      case ReportStatus.DRAFT:
        return 'Draft';
      case ReportStatus.PENDING_REVIEW:
        return 'Pending Review';
      case ReportStatus.REVIEWED:
        return 'Reviewed';
      case ReportStatus.SIGNED:
        return 'Signed';
      case ReportStatus.REJECTED:
        return 'Rejected';
      default:
        return status;
    }
  };

  /**
   * Check if user can edit
   */
  const canEdit = (): boolean => {
    return report.status === ReportStatus.DRAFT;
  };

  /**
   * Check if user can review
   */
  const canReview = (): boolean => {
    return (
      report.status === ReportStatus.PENDING_REVIEW &&
      (userRoles.includes('reviewer') || userRoles.includes('admin'))
    );
  };

  /**
   * Check if user can sign
   */
  const canSign = (): boolean => {
    return (
      report.status === ReportStatus.REVIEWED &&
      (userRoles.includes('reviewer') || userRoles.includes('admin'))
    );
  };

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Report</h2>
            <p className="mt-1 text-sm text-gray-400">
              Patient: {report.patientName} | Study Date: {report.studyDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium text-white ${getStatusColor(
                report.status
              )}`}
            >
              {getStatusLabel(report.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-400">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Patient Name</span>
                <p className="text-white">{report.patientName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Patient ID</span>
                <p className="text-white">{report.patientId}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Study Date</span>
                <p className="text-white">{report.studyDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Modality</span>
                <p className="text-white">{report.modality}</p>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-400">Report Details</h3>
            <div className="space-y-4">
              {report.findings && (
                <div>
                  <span className="text-xs text-gray-500">Findings</span>
                  <p className="mt-1 whitespace-pre-wrap text-white">{report.findings}</p>
                </div>
              )}
              {report.impression && (
                <div>
                  <span className="text-xs text-gray-500">Impression</span>
                  <p className="mt-1 whitespace-pre-wrap text-white">{report.impression}</p>
                </div>
              )}
              {report.recommendation && (
                <div>
                  <span className="text-xs text-gray-500">Recommendation</span>
                  <p className="mt-1 whitespace-pre-wrap text-white">{report.recommendation}</p>
                </div>
              )}
              {report.diagnosis && (
                <div>
                  <span className="text-xs text-gray-500">Diagnosis</span>
                  <p className="mt-1 whitespace-pre-wrap text-white">{report.diagnosis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Fields */}
          {report.fields && Object.keys(report.fields).length > 0 && (
            <div className="rounded-lg bg-gray-800 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-400">Additional Fields</h3>
              <div className="space-y-2">
                {Object.entries(report.fields).map(([key, value]) => {
                  if (value && typeof value === 'string' && !key.startsWith('_')) {
                    return (
                      <div key={key}>
                        <span className="text-xs text-gray-500">{key}</span>
                        <p className="mt-1 text-white">{value}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-400">Author Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Author</span>
                <p className="text-white">{report.author}</p>
              </div>
              {report.reviewer && (
                <div>
                  <span className="text-xs text-gray-500">Reviewer</span>
                  <p className="text-white">{report.reviewer}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">Report Date</span>
                <p className="text-white">{report.reportDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex justify-end gap-2">
            {canEdit() && onEdit && (
              <button
                onClick={onEdit}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            {canReview() && onReview && (
              <button
                onClick={onReview}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
              >
                Review
              </button>
            )}
            {canSign() && onSign && (
              <button
                onClick={onSign}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Sign
              </button>
            )}
            {canReview() && onReject && (
              <button
                onClick={onReject}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportViewer;
