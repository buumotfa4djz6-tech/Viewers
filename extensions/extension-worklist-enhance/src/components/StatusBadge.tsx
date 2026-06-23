import React from 'react';
import { WorkStatus } from '../services/WorkStatusService';

interface StatusBadgeProps {
  /** The work status */
  status: WorkStatus;
  /** Custom class name */
  className?: string;
  /** Whether to show the status label */
  showLabel?: boolean;
  /** Custom label override */
  label?: string;
}

/**
 * StatusBadge component
 *
 * Displays a colored badge for work status.
 */
export function StatusBadge({
  status,
  className = '',
  showLabel = true,
  label,
}: StatusBadgeProps) {
  /**
   * Get status color
   */
  const getStatusColor = (status: WorkStatus): string => {
    switch (status) {
      case WorkStatus.PENDING:
        return 'bg-yellow-600';
      case WorkStatus.IN_PROGRESS:
        return 'bg-blue-600';
      case WorkStatus.COMPLETED:
        return 'bg-green-600';
      case WorkStatus.CANCELLED:
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: WorkStatus): string => {
    if (label) return label;

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

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getStatusColor(
        status
      )} ${className}`}
    >
      {showLabel && getStatusLabel(status)}
    </span>
  );
}

/**
 * StatusDot component
 *
 * Displays a small colored dot for work status.
 */
export function StatusDot({
  status,
  className = '',
}: {
  status: WorkStatus;
  className?: string;
}) {
  /**
   * Get status color
   */
  const getStatusColor = (status: WorkStatus): string => {
    switch (status) {
      case WorkStatus.PENDING:
        return 'bg-yellow-400';
      case WorkStatus.IN_PROGRESS:
        return 'bg-blue-400';
      case WorkStatus.COMPLETED:
        return 'bg-green-400';
      case WorkStatus.CANCELLED:
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${getStatusColor(status)} ${className}`}
    />
  );
}

export default StatusBadge;
