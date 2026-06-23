import React from 'react';
import { StatisticsMetrics } from '../services/AnalyticsService';

interface ReportExportProps {
  /** The statistics metrics */
  metrics: StatisticsMetrics | null;
  /** Callback to export CSV */
  onExportCSV?: () => void;
  /** Callback to export JSON */
  onExportJSON?: () => void;
  /** Callback to export PDF */
  onExportPDF?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * ReportExport component
 *
 * Displays export buttons for analytics data.
 */
export function ReportExport({
  metrics,
  onExportCSV,
  onExportJSON,
  onExportPDF,
  className = '',
}: ReportExportProps) {
  const isDisabled = !metrics;

  return (
    <div className={`rounded-lg bg-gray-800 p-4 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-white">Export Report</h3>

      <div className="flex flex-wrap gap-3">
        {/* CSV Export */}
        <button
          onClick={onExportCSV}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>

        {/* JSON Export */}
        <button
          onClick={onExportJSON}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Export JSON
        </button>

        {/* PDF Export */}
        <button
          onClick={onExportPDF}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Export Info */}
      <div className="mt-4 text-sm text-gray-400">
        <p>Export the current analytics data in your preferred format.</p>
        <p className="mt-1">CSV and JSON formats can be imported into spreadsheet applications.</p>
        <p className="mt-1">PDF format will open a print dialog for saving as PDF.</p>
      </div>
    </div>
  );
}

export default ReportExport;
