import React, { useState } from 'react';
import { AnalyticsFilter } from '../services/AnalyticsService';

interface FilterPanelProps {
  /** Current filter */
  filter: AnalyticsFilter;
  /** Callback when filter changes */
  onFilterChange: (filter: AnalyticsFilter) => void;
  /** Callback when filter is cleared */
  onClearFilter: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * FilterPanel component
 *
 * Displays filter controls for analytics data.
 */
export function FilterPanel({
  filter,
  onFilterChange,
  onClearFilter,
  className = '',
}: FilterPanelProps) {
  const [localFilter, setLocalFilter] = useState<AnalyticsFilter>(filter);

  /**
   * Handle input change
   */
  const handleChange = (key: keyof AnalyticsFilter, value: string) => {
    setLocalFilter(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  /**
   * Apply filter
   */
  const handleApply = () => {
    onFilterChange(localFilter);
  };

  /**
   * Clear filter
   */
  const handleClear = () => {
    setLocalFilter({});
    onClearFilter();
  };

  return (
    <div className={`rounded-lg bg-gray-800 p-4 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-white">Filters</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Start Date */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">Start Date</label>
          <input
            type="date"
            value={localFilter.startDate || ''}
            onChange={e => handleChange('startDate', e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">End Date</label>
          <input
            type="date"
            value={localFilter.endDate || ''}
            onChange={e => handleChange('endDate', e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Department */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">Department</label>
          <select
            value={localFilter.department || ''}
            onChange={e => handleChange('department', e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Radiology">Radiology</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>
        </div>

        {/* Modality */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">Modality</label>
          <select
            value={localFilter.modality || ''}
            onChange={e => handleChange('modality', e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Modalities</option>
            <option value="CT">CT</option>
            <option value="MR">MRI</option>
            <option value="CR">X-Ray</option>
            <option value="US">Ultrasound</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleClear}
          className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
