import React from 'react';
import { StatisticsMetrics } from '../services/AnalyticsService';
import { StatisticsChart } from './StatisticsChart';

interface DashboardProps {
  /** The statistics metrics */
  metrics: StatisticsMetrics | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Dashboard component
 *
 * Displays an analytics dashboard with charts and metrics.
 */
export function Dashboard({
  metrics,
  isLoading = false,
  className = '',
}: DashboardProps) {
  if (isLoading) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  /**
   * Prepare department data for chart
   */
  const departmentData = Object.entries(metrics.byDepartment).map(([name, value]) => ({
    name,
    value,
  }));

  /**
   * Prepare doctor data for chart
   */
  const doctorData = Object.entries(metrics.byDoctor).map(([name, value]) => ({
    name,
    value,
  }));

  /**
   * Prepare trend data for chart
   */
  const trendData = metrics.trends.map(item => ({
    date: item.date.split('-').slice(1).join('-'),
    studies: item.studies,
    reports: item.reports,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Total Studies</div>
          <div className="mt-1 text-3xl font-bold text-blue-400">{metrics.totalStudies}</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Completed Reports</div>
          <div className="mt-1 text-3xl font-bold text-green-400">{metrics.completedReports}</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Pending Reports</div>
          <div className="mt-1 text-3xl font-bold text-yellow-400">{metrics.pendingReports}</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Avg Report Time</div>
          <div className="mt-1 text-3xl font-bold text-purple-400">{metrics.averageReportTime} min</div>
        </div>
      </div>

      {/* Time Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Today</div>
          <div className="mt-1 text-2xl font-bold text-white">{metrics.byTime.today}</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">This Week</div>
          <div className="mt-1 text-2xl font-bold text-white">{metrics.byTime.thisWeek}</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-sm text-gray-400">This Month</div>
          <div className="mt-1 text-2xl font-bold text-white">{metrics.byTime.thisMonth}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Trend Chart */}
        <StatisticsChart
          type="line"
          data={trendData}
          title="Trends (Last 30 Days)"
          xDataKey="date"
          yDataKeys={[
            { key: 'studies', color: '#3B82F6', name: 'Studies' },
            { key: 'reports', color: '#10B981', name: 'Reports' },
          ]}
        />

        {/* Department Chart */}
        <StatisticsChart
          type="bar"
          data={departmentData}
          title="Studies by Department"
          xDataKey="name"
          yDataKeys={[{ key: 'value', color: '#8B5CF6', name: 'Studies' }]}
        />
      </div>

      {/* Doctor Workload */}
      <StatisticsChart
        type="bar"
        data={metrics.doctorWorkload}
        title="Doctor Workload"
        xDataKey="doctorName"
        yDataKeys={[
          { key: 'totalStudies', color: '#3B82F6', name: 'Total Studies' },
          { key: 'completedReports', color: '#10B981', name: 'Completed Reports' },
        ]}
      />

      {/* Department Efficiency */}
      <div className="rounded-lg bg-gray-800 p-4">
        <h3 className="mb-4 text-lg font-semibold text-white">Department Efficiency</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2 text-left text-sm text-gray-400">Department</th>
                <th className="pb-2 text-right text-sm text-gray-400">Total Studies</th>
                <th className="pb-2 text-right text-sm text-gray-400">Completion Rate</th>
                <th className="pb-2 text-right text-sm text-gray-400">Avg Time (min)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.departmentEfficiency.map(item => (
                <tr key={item.departmentId} className="border-b border-gray-700">
                  <td className="py-2 text-white">{item.departmentName}</td>
                  <td className="py-2 text-right text-gray-300">{item.totalStudies}</td>
                  <td className="py-2 text-right text-gray-300">
                    {(item.completionRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-gray-300">{item.averageTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
