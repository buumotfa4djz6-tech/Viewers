import { PubSubService } from '@ohif/core';
import { ReportData, ReportStatus } from '../templates';

const EVENTS = {
  REPORT_CREATED: 'event::ReportWorkflowService:reportCreated',
  REPORT_UPDATED: 'event::ReportWorkflowService:reportUpdated',
  REPORT_STATUS_CHANGED: 'event::ReportWorkflowService:reportStatusChanged',
  REPORT_SUBMITTED: 'event::ReportWorkflowService:reportSubmitted',
  REPORT_REVIEWED: 'event::ReportWorkflowService:reportReviewed',
  REPORT_SIGNED: 'event::ReportWorkflowService:reportSigned',
  REPORT_REJECTED: 'event::ReportWorkflowService:reportRejected',
};

/**
 * ReportWorkflowService manages the report workflow for the application.
 * It provides methods to create, update, submit, review, sign, and reject reports.
 */
export default class ReportWorkflowService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'reportWorkflowService',
    create: ({ configuration = {} }) => {
      return new ReportWorkflowService();
    },
  };

  private reports: Map<string, ReportData> = new Map();

  constructor() {
    super(ReportWorkflowService.EVENTS);
  }

  /**
   * Create a new report
   * @param reportData - The report data
   * @returns The created report
   */
  createReport(reportData: Omit<ReportData, 'id' | 'status'>): ReportData {
    const id = this.generateReportId();
    const report: ReportData = {
      ...reportData,
      id,
      status: ReportStatus.DRAFT,
      reportDate: new Date().toISOString(),
    };

    this.reports.set(id, report);

    this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_CREATED, {
      report,
    });

    return report;
  }

  /**
   * Update an existing report
   * @param reportId - The report ID
   * @param updates - The updates to apply
   * @returns The updated report or null
   */
  updateReport(reportId: string, updates: Partial<ReportData>): ReportData | null {
    const report = this.reports.get(reportId);
    if (!report) {
      console.warn(`Report ${reportId} not found`);
      return null;
    }

    // Only allow updates to draft reports
    if (report.status !== ReportStatus.DRAFT) {
      console.warn(`Cannot update report ${reportId} with status ${report.status}`);
      return null;
    }

    const updatedReport = {
      ...report,
      ...updates,
      id: reportId, // Ensure ID doesn't change
      status: ReportStatus.DRAFT, // Keep as draft
    };

    this.reports.set(reportId, updatedReport);

    this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_UPDATED, {
      report: updatedReport,
    });

    return updatedReport;
  }

  /**
   * Submit a report for review
   * @param reportId - The report ID
   * @param authorId - The author's user ID
   * @returns The updated report or null
   */
  submitReport(reportId: string, authorId: string): ReportData | null {
    return this.changeStatus(reportId, ReportStatus.PENDING_REVIEW, authorId);
  }

  /**
   * Review a report
   * @param reportId - The report ID
   * @param reviewerId - The reviewer's user ID
   * @param approved - Whether the report is approved
   * @param comments - Optional review comments
   * @returns The updated report or null
   */
  reviewReport(
    reportId: string,
    reviewerId: string,
    approved: boolean,
    comments?: string
  ): ReportData | null {
    const report = this.reports.get(reportId);
    if (!report) {
      console.warn(`Report ${reportId} not found`);
      return null;
    }

    if (report.status !== ReportStatus.PENDING_REVIEW) {
      console.warn(`Report ${reportId} is not pending review`);
      return null;
    }

    if (approved) {
      const updatedReport = {
        ...report,
        status: ReportStatus.REVIEWED,
        reviewer: reviewerId,
        fields: {
          ...report.fields,
          reviewComments: comments,
        },
      };

      this.reports.set(reportId, updatedReport);

      this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_REVIEWED, {
        report: updatedReport,
        approved: true,
      });

      return updatedReport;
    } else {
      // Reject the report
      const updatedReport = {
        ...report,
        status: ReportStatus.REJECTED,
        reviewer: reviewerId,
        fields: {
          ...report.fields,
          rejectionComments: comments,
        },
      };

      this.reports.set(reportId, updatedReport);

      this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_REJECTED, {
        report: updatedReport,
        approved: false,
      });

      return updatedReport;
    }
  }

  /**
   * Sign a report
   * @param reportId - The report ID
   * @param signerId - The signer's user ID
   * @returns The updated report or null
   */
  signReport(reportId: string, signerId: string): ReportData | null {
    const report = this.reports.get(reportId);
    if (!report) {
      console.warn(`Report ${reportId} not found`);
      return null;
    }

    if (report.status !== ReportStatus.REVIEWED) {
      console.warn(`Report ${reportId} is not reviewed`);
      return null;
    }

    const updatedReport = {
      ...report,
      status: ReportStatus.SIGNED,
      fields: {
        ...report.fields,
        signedBy: signerId,
        signedDate: new Date().toISOString(),
      },
    };

    this.reports.set(reportId, updatedReport);

    this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_SIGNED, {
      report: updatedReport,
    });

    return updatedReport;
  }

  /**
   * Reject a report (send back to draft)
   * @param reportId - The report ID
   * @param reviewerId - The reviewer's user ID
   * @param reason - The rejection reason
   * @returns The updated report or null
   */
  rejectReport(reportId: string, reviewerId: string, reason: string): ReportData | null {
    const report = this.reports.get(reportId);
    if (!report) {
      console.warn(`Report ${reportId} not found`);
      return null;
    }

    if (report.status !== ReportStatus.PENDING_REVIEW) {
      console.warn(`Report ${reportId} is not pending review`);
      return null;
    }

    const updatedReport = {
      ...report,
      status: ReportStatus.REJECTED,
      reviewer: reviewerId,
      fields: {
        ...report.fields,
        rejectionReason: reason,
      },
    };

    this.reports.set(reportId, updatedReport);

    this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_REJECTED, {
      report: updatedReport,
      approved: false,
    });

    return updatedReport;
  }

  /**
   * Get a report by ID
   * @param reportId - The report ID
   * @returns The report or null
   */
  getReport(reportId: string): ReportData | null {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get all reports
   * @returns Array of reports
   */
  getAllReports(): ReportData[] {
    return Array.from(this.reports.values());
  }

  /**
   * Get reports by status
   * @param status - The status to filter by
   * @returns Array of reports with the specified status
   */
  getReportsByStatus(status: ReportStatus): ReportData[] {
    return Array.from(this.reports.values()).filter(r => r.status === status);
  }

  /**
   * Get reports by author
   * @param authorId - The author's user ID
   * @returns Array of reports by the specified author
   */
  getReportsByAuthor(authorId: string): ReportData[] {
    return Array.from(this.reports.values()).filter(r => r.author === authorId);
  }

  /**
   * Get reports by study
   * @param studyInstanceUid - The study instance UID
   * @returns Array of reports for the specified study
   */
  getReportsByStudy(studyInstanceUid: string): ReportData[] {
    return Array.from(this.reports.values()).filter(
      r => r.studyInstanceUid === studyInstanceUid
    );
  }

  /**
   * Get reports pending review
   * @returns Array of reports pending review
   */
  getPendingReviewReports(): ReportData[] {
    return this.getReportsByStatus(ReportStatus.PENDING_REVIEW);
  }

  /**
   * Change the status of a report
   * @param reportId - The report ID
   * @param newStatus - The new status
   * @param userId - The user ID making the change
   * @returns The updated report or null
   */
  private changeStatus(
    reportId: string,
    newStatus: ReportStatus,
    userId: string
  ): ReportData | null {
    const report = this.reports.get(reportId);
    if (!report) {
      console.warn(`Report ${reportId} not found`);
      return null;
    }

    const updatedReport = {
      ...report,
      status: newStatus,
    };

    this.reports.set(reportId, updatedReport);

    this._broadcastEvent(ReportWorkflowService.EVENTS.REPORT_STATUS_CHANGED, {
      report: updatedReport,
      previousStatus: report.status,
      newStatus,
      userId,
    });

    return updatedReport;
  }

  /**
   * Generate a unique report ID
   * @returns A unique report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { ReportWorkflowService };
