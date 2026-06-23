import { PubSubService } from '@ohif/core';

const EVENTS = {
  STATS_UPDATED: 'event::AnalyticsService:statsUpdated',
  FILTER_CHANGED: 'event::AnalyticsService:filterChanged',
};

/**
 * Statistics metrics interface
 */
export interface StatisticsMetrics {
  // Basic statistics
  totalStudies: number;
  completedReports: number;
  pendingReports: number;
  averageReportTime: number;

  // Time-based statistics
  byTime: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };

  // Department statistics
  byDepartment: Record<string, number>;

  // Doctor statistics
  byDoctor: Record<string, number>;

  // Advanced statistics
  doctorWorkload: Array<{
    doctorId: string;
    doctorName: string;
    totalStudies: number;
    completedReports: number;
    averageTime: number;
  }>;

  departmentEfficiency: Array<{
    departmentId: string;
    departmentName: string;
    totalStudies: number;
    completionRate: number;
    averageTime: number;
  }>;

  trends: Array<{
    date: string;
    studies: number;
    reports: number;
  }>;
}

/**
 * Analytics filter interface
 */
export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  department?: string;
  doctor?: string;
  modality?: string;
}

/**
 * AnalyticsService manages analytics and statistics for the application.
 */
export default class AnalyticsService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'analyticsService',
    create: ({ configuration = {} }) => {
      return new AnalyticsService();
    },
  };

  private currentFilter: AnalyticsFilter = {};
  private cachedMetrics: StatisticsMetrics | null = null;

  constructor() {
    super(AnalyticsService.EVENTS);
  }

  /**
   * Get statistics metrics based on current filter
   * @param filter - Optional filter to apply
   * @returns The statistics metrics
   */
  getStatistics(filter?: AnalyticsFilter): StatisticsMetrics {
    const appliedFilter = filter || this.currentFilter;

    // In a real implementation, this would query the data source
    // For now, return mock data
    const metrics: StatisticsMetrics = {
      totalStudies: 1250,
      completedReports: 980,
      pendingReports: 270,
      averageReportTime: 45,

      byTime: {
        today: 25,
        thisWeek: 150,
        thisMonth: 600,
      },

      byDepartment: {
        Radiology: 500,
        Cardiology: 300,
        Neurology: 200,
        Orthopedics: 250,
      },

      byDoctor: {
        'Dr. Smith': 150,
        'Dr. Johnson': 120,
        'Dr. Williams': 100,
        'Dr. Brown': 80,
        'Dr. Davis': 70,
      },

      doctorWorkload: [
        { doctorId: 'doc1', doctorName: 'Dr. Smith', totalStudies: 150, completedReports: 140, averageTime: 40 },
        { doctorId: 'doc2', doctorName: 'Dr. Johnson', totalStudies: 120, completedReports: 110, averageTime: 45 },
        { doctorId: 'doc3', doctorName: 'Dr. Williams', totalStudies: 100, completedReports: 95, averageTime: 50 },
        { doctorId: 'doc4', doctorName: 'Dr. Brown', totalStudies: 80, completedReports: 75, averageTime: 55 },
        { doctorId: 'doc5', doctorName: 'Dr. Davis', totalStudies: 70, completedReports: 65, averageTime: 60 },
      ],

      departmentEfficiency: [
        { departmentId: 'dept1', departmentName: 'Radiology', totalStudies: 500, completionRate: 0.92, averageTime: 40 },
        { departmentId: 'dept2', departmentName: 'Cardiology', totalStudies: 300, completionRate: 0.88, averageTime: 45 },
        { departmentId: 'dept3', departmentName: 'Neurology', totalStudies: 200, completionRate: 0.85, averageTime: 50 },
        { departmentId: 'dept4', departmentName: 'Orthopedics', totalStudies: 250, completionRate: 0.90, averageTime: 42 },
      ],

      trends: this.generateTrendData(30),
    };

    this.cachedMetrics = metrics;
    return metrics;
  }

  /**
   * Set the current filter
   * @param filter - The filter to set
   */
  setFilter(filter: AnalyticsFilter): void {
    this.currentFilter = filter;
    this.cachedMetrics = null;

    this._broadcastEvent(AnalyticsService.EVENTS.FILTER_CHANGED, {
      filter,
    });
  }

  /**
   * Get the current filter
   * @returns The current filter
   */
  getFilter(): AnalyticsFilter {
    return this.currentFilter;
  }

  /**
   * Clear the current filter
   */
  clearFilter(): void {
    this.currentFilter = {};
    this.cachedMetrics = null;
  }

  /**
   * Get statistics for a specific time range
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns The statistics metrics
   */
  getStatisticsByDateRange(startDate: string, endDate: string): StatisticsMetrics {
    return this.getStatistics({ startDate, endDate });
  }

  /**
   * Get statistics for a specific department
   * @param department - The department
   * @returns The statistics metrics
   */
  getStatisticsByDepartment(department: string): StatisticsMetrics {
    return this.getStatistics({ department });
  }

  /**
   * Get statistics for a specific doctor
   * @param doctor - The doctor
   * @returns The statistics metrics
   */
  getStatisticsByDoctor(doctor: string): StatisticsMetrics {
    return this.getStatistics({ doctor });
  }

  /**
   * Generate trend data for the specified number of days
   * @param days - Number of days
   * @returns Array of trend data
   */
  private generateTrendData(days: number): Array<{ date: string; studies: number; reports: number }> {
    const trends: Array<{ date: string; studies: number; reports: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        studies: Math.floor(Math.random() * 30) + 10,
        reports: Math.floor(Math.random() * 25) + 5,
      });
    }

    return trends;
  }
}

export { AnalyticsService };
