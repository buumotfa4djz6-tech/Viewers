import React, { useState } from 'react';
import { WorkStatus } from '../services/WorkStatusService';

interface StatusTransitionProps {
  /** Current status */
  currentStatus: WorkStatus;
  /** Available transitions */
  availableTransitions?: WorkStatus[];
  /** User roles */
  userRoles?: string[];
  /** Callback when status is changed */
  onStatusChange?: (newStatus: WorkStatus) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * StatusTransition component
 *
 * Displays a dropdown for changing work status.
 */
export function StatusTransition({
  currentStatus,
  availableTransitions = [],
  userRoles = [],
  onStatusChange,
  disabled = false,
}: StatusTransitionProps) {
  const [isChanging, setIsChanging] = useState(false);

  /**
   * Get status label
   */
  const getStatusLabel = (status: WorkStatus): string => {
    switch (status) {
      case WorkStatus.PENDING:
        return 'Pending';
      case WorkStatus.IN_PROGRESS:
        return 'In Progress';
      case WorkStatus.COMPLETED:
        return 'Completed';
      case WorkStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: WorkStatus): string => {
    switch (status) {
      case WorkStatus.PENDING:
        return 'text-yellow-400';
      case WorkStatus.IN_PROGRESS:
        return 'text-blue-400';
      case WorkStatus.COMPLETED:
        return 'text-green-400';
      case WorkStatus.CANCELLED:
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus: WorkStatus) => {
    setIsChanging(true);
    try {
      await onStatusChange?.(newStatus);
    } finally {
      setIsChanging(false);
    }
  };

  if (disabled || availableTransitions.length === 0) {
    return (
      <span className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
        {getStatusLabel(currentStatus)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
        {getStatusLabel(currentStatus)}
      </span>
      <span className="text-gray-500">→</span>
      <select
        onChange={e => handleStatusChange(e.target.value as WorkStatus)}
        disabled={isChanging}
        className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
        defaultValue=""
      >
        <option value="" disabled>
          {isChanging ? 'Changing...' : 'Change to...'}
        </option>
        {availableTransitions.map(status => (
          <option key={status} value={status}>
            {getStatusLabel(status)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StatusTransition;
