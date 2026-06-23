import React, { useState } from 'react';
import { WorkAssignment } from '../services/WorkAssignmentService';

interface AssignmentDialogProps {
  /** The study instance UID */
  studyInstanceUid: string;
  /** Current assignment */
  currentAssignment?: WorkAssignment | null;
  /** Available users to assign to */
  availableUsers?: Array<{ id: string; name: string; role: string }>;
  /** Callback when assignment is made */
  onAssign?: (assigneeId: string, notes?: string) => void;
  /** Callback when assignment is removed */
  onUnassign?: () => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Whether the dialog is open */
  isOpen?: boolean;
}

/**
 * AssignmentDialog component
 *
 * Dialog for assigning work to users.
 */
export function AssignmentDialog({
  studyInstanceUid,
  currentAssignment,
  availableUsers = [],
  onAssign,
  onUnassign,
  onCancel,
  isOpen = true,
}: AssignmentDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentAssignment?.assigneeId || ''
  );
  const [notes, setNotes] = useState<string>(currentAssignment?.notes || '');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle assign
   */
  const handleAssign = async () => {
    if (!selectedUserId) return;

    setIsProcessing(true);
    try {
      await onAssign?.(selectedUserId, notes);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle unassign
   */
  const handleUnassign = async () => {
    setIsProcessing(true);
    try {
      await onUnassign?.();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Assign Work</h2>
          <p className="mt-1 text-sm text-gray-400">
            Study: {studyInstanceUid}
          </p>
        </div>

        {/* Current Assignment */}
        {currentAssignment && (
          <div className="mb-4 rounded-lg bg-gray-800 p-3">
            <div className="text-sm text-gray-400">Currently assigned to</div>
            <div className="mt-1 font-medium text-white">
              {availableUsers.find(u => u.id === currentAssignment.assigneeId)?.name ||
                currentAssignment.assigneeId}
            </div>
            {currentAssignment.notes && (
              <div className="mt-1 text-sm text-gray-400">
                Notes: {currentAssignment.notes}
              </div>
            )}
          </div>
        )}

        {/* User Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Assign to
          </label>
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a user...</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this assignment"
            rows={3}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {currentAssignment && onUnassign && (
              <button
                onClick={handleUnassign}
                disabled={isProcessing}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Unassign'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleAssign}
              disabled={!selectedUserId || isProcessing}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDialog;
