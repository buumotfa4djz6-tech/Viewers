import { useState, useEffect, useCallback } from 'react';
import { ReportData, ReportStatus } from '../templates';

/**
 * Hook to manage reports
 *
 * @example
 * const { reports, createReport, updateReport, submitReport, isLoading } = useReport(servicesManager);
 */
export function useReport(servicesManager?: AppTypes.ServicesManager) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getReportWorkflowService = useCallback(() => {
    if (!servicesManager) return null;
    return servicesManager.services.reportWorkflowService;
  }, [servicesManager]);

  /**
   * Load all reports
   */
  const loadReports = useCallback(() => {
    const service = getReportWorkflowService();
    if (!service) return;

    setIsLoading(true);
    try {
      const allReports = service.getAllReports();
      setReports(allReports);
    } finally {
      setIsLoading(false);
    }
  }, [getReportWorkflowService]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /**
   * Create a new report
   * @param reportData - The report data
   * @returns The created report
   */
  const createReport = useCallback(
    (reportData: Omit<ReportData, 'id' | 'status'>): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.createReport(reportData);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Update an existing report
   * @param reportId - The report ID
   * @param updates - The updates to apply
   * @returns The updated report
   */
  const updateReport = useCallback(
    (reportId: string, updates: Partial<ReportData>): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.updateReport(reportId, updates);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Submit a report for review
   * @param reportId - The report ID
   * @param authorId - The author's user ID
   * @returns The updated report
   */
  const submitReport = useCallback(
    (reportId: string, authorId: string): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.submitReport(reportId, authorId);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Review a report
   * @param reportId - The report ID
   * @param reviewerId - The reviewer's user ID
   * @param approved - Whether the report is approved
   * @param comments - Optional review comments
   * @returns The updated report
   */
  const reviewReport = useCallback(
    (reportId: string, reviewerId: string, approved: boolean, comments?: string): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.reviewReport(reportId, reviewerId, approved, comments);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Sign a report
   * @param reportId - The report ID
   * @param signerId - The signer's user ID
   * @returns The updated report
   */
  const signReport = useCallback(
    (reportId: string, signerId: string): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.signReport(reportId, signerId);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Reject a report
   * @param reportId - The report ID
   * @param reviewerId - The reviewer's user ID
   * @param reason - The rejection reason
   * @returns The updated report
   */
  const rejectReport = useCallback(
    (reportId: string, reviewerId: string, reason: string): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      const report = service.rejectReport(reportId, reviewerId, reason);
      loadReports();
      return report;
    },
    [getReportWorkflowService, loadReports]
  );

  /**
   * Get a report by ID
   * @param reportId - The report ID
   * @returns The report
   */
  const getReport = useCallback(
    (reportId: string): ReportData | null => {
      const service = getReportWorkflowService();
      if (!service) return null;

      return service.getReport(reportId);
    },
    [getReportWorkflowService]
  );

  /**
   * Get reports by status
   * @param status - The status to filter by
   * @returns Array of reports
   */
  const getReportsByStatus = useCallback(
    (status: ReportStatus): ReportData[] => {
      const service = getReportWorkflowService();
      if (!service) return [];

      return service.getReportsByStatus(status);
    },
    [getReportWorkflowService]
  );

  /**
   * Get reports by author
   * @param authorId - The author's user ID
   * @returns Array of reports
   */
  const getReportsByAuthor = useCallback(
    (authorId: string): ReportData[] => {
      const service = getReportWorkflowService();
      if (!service) return [];

      return service.getReportsByAuthor(authorId);
    },
    [getReportWorkflowService]
  );

  /**
   * Get reports by study
   * @param studyInstanceUid - The study instance UID
   * @returns Array of reports
   */
  const getReportsByStudy = useCallback(
    (studyInstanceUid: string): ReportData[] => {
      const service = getReportWorkflowService();
      if (!service) return [];

      return service.getReportsByStudy(studyInstanceUid);
    },
    [getReportWorkflowService]
  );

  /**
   * Get pending review reports
   * @returns Array of reports pending review
   */
  const getPendingReviewReports = useCallback((): ReportData[] => {
    const service = getReportWorkflowService();
    if (!service) return [];

    return service.getPendingReviewReports();
  }, [getReportWorkflowService]);

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    submitReport,
    reviewReport,
    signReport,
    rejectReport,
    getReport,
    getReportsByStatus,
    getReportsByAuthor,
    getReportsByStudy,
    getPendingReviewReports,
    loadReports,
  };
}

export default useReport;
