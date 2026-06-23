import React from 'react';
import { StatusBadge, StatusDot } from '../components/StatusBadge';
import { WorkStatus } from '../services/WorkStatusService';

/**
 * Custom worklist columns for status display
 */
export const worklistStatusColumns = [
  {
    id: 'status',
    header: 'Status',
    accessorFn: (row: any) => {
      // Try to get status from work item
      const workItem = row.workItem;
      return workItem?.status || WorkStatus.PENDING;
    },
    cell: ({ row }: any) => {
      const status = row.getValue('status') as WorkStatus;
      return <StatusBadge status={status} />;
    },
    meta: {
      label: 'Status',
      columnName: 'Status',
    },
  },
  {
    id: 'assignedTo',
    header: 'Assigned To',
    accessorFn: (row: any) => {
      const workItem = row.workItem;
      return workItem?.assignedTo || 'Unassigned';
    },
    cell: ({ row }: any) => {
      const assignedTo = row.getValue('assignedTo');
      return (
        <span className="text-sm text-gray-300">
          {assignedTo === 'Unassigned' ? (
            <span className="text-gray-500">Unassigned</span>
          ) : (
            assignedTo
          )}
        </span>
      );
    },
    meta: {
      label: 'Assigned To',
      columnName: 'Assigned To',
    },
  },
];

/**
 * Default worklist status customization
 */
export default function getWorklistStatusCustomization() {
  return {
    'workList.columns': worklistStatusColumns,
  };
}
