import React, { useState, useEffect } from 'react';
import { ReportData, ReportStatus } from '../templates';
import { useReport } from '../hooks/useReport';

interface ReportReviewPanelProps {
  /** The services manager */
  servicesManager?: AppTypes.ServicesManager;
  /** The reviewer's user ID */
  reviewerId?: string;
  /** Callback when review is complete */
  onReviewComplete?: (report: ReportData) => void;
  /** Callback when cancelled */
  onCancel?: () => void;
}

/**
 * ReportReviewPanel component
 *
 * Panel for reviewing and approving/rejecting reports.
 */
export function ReportReviewPanel({
  servicesManager,
  reviewerId = '',
  onReviewComplete,
  onCancel,
}: ReportReviewPanelProps) {
  const { getPendingReviewReports, reviewReport } = useReport(servicesManager);

  const [pendingReports, setPendingReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load pending reports
  useEffect(() => {
    loadPendingReports();
  }, []);

  const loadPendingReports = () => {
    setIsLoading(true);
    try {
      const reports = getPendingReviewReports();
      setPendingReports(reports);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle approve
   */
  const handleApprove = async () => {
    if (!selectedReport || !selectedReport.id) return;

    setIsProcessing(true);
    try {
      const report = reviewReport(selectedReport.id, reviewerId, true, comments);
      if (report) {
        onReviewComplete?.(report);
        setSelectedReport(null);
        setComments('');
        loadPendingReports();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle reject
   */
  const handleReject = async () => {
    if (!selectedReport || !selectedReport.id) return;

    setIsProcessing(true);
    try {
      const report = reviewReport(selectedReport.id, reviewerId, false, comments);
      if (report) {
        onReviewComplete?.(report);
        setSelectedReport(null);
        setComments('');
        loadPendingReports();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading pending reports...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white">Report Review</h2>
        <p className="mt-1 text-sm text-gray-400">
          {pendingReports.length} report(s) pending review
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Report List */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
          {pendingReports.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No reports pending review</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {pendingReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full p-4 text-left hover:bg-gray-800 ${
                    selectedReport?.id === report.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="font-medium text-white">{report.patientName}</div>
                  <div className="mt-1 text-sm text-gray-400">
                    {report.modality} - {formatDate(report.studyDate)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    By: {report.author}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Preview */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedReport ? (
            <>
              {/* Report Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Patient Info */}
                  <div className="rounded-lg bg-gray-800 p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-400">Patient</h3>
                    <p className="text-white">{selectedReport.patientName}</p>
                    <p className="text-sm text-gray-400">ID: {selectedReport.patientId}</p>
                  </div>

                  {/* Findings */}
                  {selectedReport.findings && (
                    <div className="rounded-lg bg-gray-800 p-4">
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Findings</h3>
                      <p className="whitespace-pre-wrap text-white">{selectedReport.findings}</p>
                    </div>
                  )}

                  {/* Impression */}
                  {selectedReport.impression && (
                    <div className="rounded-lg bg-gray-800 p-4">
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Impression</h3>
                      <p className="whitespace-pre-wrap text-white">{selectedReport.impression}</p>
                    </div>
                  )}

                  {/* Recommendation */}
                  {selectedReport.recommendation && (
                    <div className="rounded-lg bg-gray-800 p-4">
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Recommendation</h3>
                      <p className="whitespace-pre-wrap text-white">{selectedReport.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="border-t border-gray-700 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Review Comments
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Enter review comments (optional)"
                  rows={3}
                  className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <p>Select a report to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportReviewPanel;
