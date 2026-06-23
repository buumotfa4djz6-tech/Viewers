import { StatisticsMetrics } from './AnalyticsService';

/**
 * ExportService manages export functionality for analytics data.
 */
export default class ExportService {
  /**
   * Export statistics to CSV format
   * @param metrics - The statistics metrics
   * @param filename - The filename
   */
  static exportToCSV(metrics: StatisticsMetrics, filename: string = 'analytics.csv'): void {
    const rows: string[] = [];

    // Add header
    rows.push('Metric,Value');

    // Add basic statistics
    rows.push(`Total Studies,${metrics.totalStudies}`);
    rows.push(`Completed Reports,${metrics.completedReports}`);
    rows.push(`Pending Reports,${metrics.pendingReports}`);
    rows.push(`Average Report Time (min),${metrics.averageReportTime}`);

    // Add time-based statistics
    rows.push('');
    rows.push('Time Period,Studies');
    rows.push(`Today,${metrics.byTime.today}`);
    rows.push(`This Week,${metrics.byTime.thisWeek}`);
    rows.push(`This Month,${metrics.byTime.thisMonth}`);

    // Add department statistics
    rows.push('');
    rows.push('Department,Studies');
    Object.entries(metrics.byDepartment).forEach(([dept, count]) => {
      rows.push(`${dept},${count}`);
    });

    // Add doctor statistics
    rows.push('');
    rows.push('Doctor,Studies');
    Object.entries(metrics.byDoctor).forEach(([doctor, count]) => {
      rows.push(`${doctor},${count}`);
    });

    // Add doctor workload
    rows.push('');
    rows.push('Doctor,Total Studies,Completed Reports,Average Time (min)');
    metrics.doctorWorkload.forEach(item => {
      rows.push(`${item.doctorName},${item.totalStudies},${item.completedReports},${item.averageTime}`);
    });

    // Add department efficiency
    rows.push('');
    rows.push('Department,Total Studies,Completion Rate,Average Time (min)');
    metrics.departmentEfficiency.forEach(item => {
      rows.push(`${item.departmentName},${item.totalStudies},${(item.completionRate * 100).toFixed(1)}%,${item.averageTime}`);
    });

    // Create and download CSV
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Export statistics to JSON format
   * @param metrics - The statistics metrics
   * @param filename - The filename
   */
  static exportToJSON(metrics: StatisticsMetrics, filename: string = 'analytics.json'): void {
    const jsonContent = JSON.stringify(metrics, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Generate HTML table for PDF export
   * @param metrics - The statistics metrics
   * @returns HTML string
   */
  static generateHTMLTable(metrics: StatisticsMetrics): string {
    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
            .metric-card { display: inline-block; margin: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          
          <h2>Overview</h2>
          <div>
            <div class="metric-card">
              <div>Total Studies</div>
              <div class="metric-value">${metrics.totalStudies}</div>
            </div>
            <div class="metric-card">
              <div>Completed Reports</div>
              <div class="metric-value">${metrics.completedReports}</div>
            </div>
            <div class="metric-card">
              <div>Pending Reports</div>
              <div class="metric-value">${metrics.pendingReports}</div>
            </div>
            <div class="metric-card">
              <div>Avg Report Time</div>
              <div class="metric-value">${metrics.averageReportTime} min</div>
            </div>
          </div>
          
          <h2>Time-based Statistics</h2>
          <table>
            <tr><th>Period</th><th>Studies</th></tr>
            <tr><td>Today</td><td>${metrics.byTime.today}</td></tr>
            <tr><td>This Week</td><td>${metrics.byTime.thisWeek}</td></tr>
            <tr><td>This Month</td><td>${metrics.byTime.thisMonth}</td></tr>
          </table>
          
          <h2>Department Statistics</h2>
          <table>
            <tr><th>Department</th><th>Studies</th></tr>
            ${Object.entries(metrics.byDepartment)
              .map(([dept, count]) => `<tr><td>${dept}</td><td>${count}</td></tr>`)
              .join('')}
          </table>
          
          <h2>Doctor Workload</h2>
          <table>
            <tr><th>Doctor</th><th>Total Studies</th><th>Completed</th><th>Avg Time (min)</th></tr>
            ${metrics.doctorWorkload
              .map(
                item =>
                  `<tr><td>${item.doctorName}</td><td>${item.totalStudies}</td><td>${item.completedReports}</td><td>${item.averageTime}</td></tr>`
              )
              .join('')}
          </table>
          
          <h2>Department Efficiency</h2>
          <table>
            <tr><th>Department</th><th>Total Studies</th><th>Completion Rate</th><th>Avg Time (min)</th></tr>
            ${metrics.departmentEfficiency
              .map(
                item =>
                  `<tr><td>${item.departmentName}</td><td>${item.totalStudies}</td><td>${(item.completionRate * 100).toFixed(1)}%</td><td>${item.averageTime}</td></tr>`
              )
              .join('')}
          </table>
          
          <h2>Trends (Last 30 Days)</h2>
          <table>
            <tr><th>Date</th><th>Studies</th><th>Reports</th></tr>
            ${metrics.trends
              .map(item => `<tr><td>${item.date}</td><td>${item.studies}</td><td>${item.reports}</td></tr>`)
              .join('')}
          </table>
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Export to PDF using print
   * @param metrics - The statistics metrics
   * @param filename - The filename
   */
  static exportToPDF(metrics: StatisticsMetrics, filename: string = 'analytics.pdf'): void {
    const html = this.generateHTMLTable(metrics);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}

export { ExportService };
