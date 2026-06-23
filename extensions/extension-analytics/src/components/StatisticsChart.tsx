import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StatisticsChartProps {
  /** The chart type */
  type: 'bar' | 'line' | 'pie';
  /** The chart data */
  data: any[];
  /** The chart title */
  title?: string;
  /** The x-axis data key */
  xDataKey?: string;
  /** The y-axis data keys */
  yDataKeys?: Array<{ key: string; color: string; name: string }>;
  /** Custom class name */
  className?: string;
  /** Chart height */
  height?: number;
}

/**
 * StatisticsChart component
 *
 * Displays various types of charts for analytics data.
 */
export function StatisticsChart({
  type,
  data,
  title,
  xDataKey = 'name',
  yDataKeys = [],
  className = '',
  height = 300,
}: StatisticsChartProps) {
  /**
   * Render bar chart
   */
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey={xDataKey} stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#F3F4F6' }}
        />
        <Legend />
        {yDataKeys.map(item => (
          <Bar key={item.key} dataKey={item.key} fill={item.color} name={item.name} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  /**
   * Render line chart
   */
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey={xDataKey} stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#F3F4F6' }}
        />
        <Legend />
        {yDataKeys.map(item => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            stroke={item.color}
            name={item.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  /**
   * Render pie chart
   */
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={yDataKeys[0]?.key || 'value'}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={yDataKeys[index % yDataKeys.length]?.color || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#F3F4F6' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  /**
   * Render chart based on type
   */
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg bg-gray-800 p-4 ${className}`}>
      {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
      {renderChart()}
    </div>
  );
}

export default StatisticsChart;
