import { useState, useEffect, useCallback } from 'react';
import { WorkAssignment } from '../services/WorkAssignmentService';

/**
 * Hook to manage work assignments
 *
 * @example
 * const { assignments, createAssignment, removeAssignment, isLoading } = useWorkAssignment(servicesManager);
 */
export function useWorkAssignment(servicesManager?: AppTypes.ServicesManager) {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getWorkAssignmentService = useCallback(() => {
    if (!servicesManager) return null;
    return servicesManager.services.workAssignmentService;
  }, [servicesManager]);

  /**
   * Load all assignments
   */
  const loadAssignments = useCallback(() => {
    const service = getWorkAssignmentService();
    if (!service) return;

    setIsLoading(true);
    try {
      const allAssignments = service.getAllAssignments();
      setAssignments(allAssignments);
    } finally {
      setIsLoading(false);
    }
  }, [getWorkAssignmentService]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /**
   * Create a work assignment
   * @param studyInstanceUid - The study instance UID
   * @param assigneeId - The assignee's user ID
   * @param assignerId - The assigner's user ID
   * @param notes - Optional notes
   * @returns The created assignment
   */
  const createAssignment = useCallback(
    (
      studyInstanceUid: string,
      assigneeId: string,
      assignerId: string,
      notes?: string
    ): WorkAssignment | null => {
      const service = getWorkAssignmentService();
      if (!service) return null;

      const assignment = service.createAssignment(
        studyInstanceUid,
        assigneeId,
        assignerId,
        notes
      );
      loadAssignments();
      return assignment;
    },
    [getWorkAssignmentService, loadAssignments]
  );

  /**
   * Remove a work assignment
   * @param assignmentId - The assignment ID
   * @returns The removed assignment
   */
  const removeAssignment = useCallback(
    (assignmentId: string): WorkAssignment | null => {
      const service = getWorkAssignmentService();
      if (!service) return null;

      const assignment = service.removeAssignment(assignmentId);
      loadAssignments();
      return assignment;
    },
    [getWorkAssignmentService, loadAssignments]
  );

  /**
   * Complete a work assignment
   * @param assignmentId - The assignment ID
   * @returns The completed assignment
   */
  const completeAssignment = useCallback(
    (assignmentId: string): WorkAssignment | null => {
      const service = getWorkAssignmentService();
      if (!service) return null;

      const assignment = service.completeAssignment(assignmentId);
      loadAssignments();
      return assignment;
    },
    [getWorkAssignmentService, loadAssignments]
  );

  /**
   * Get assignments by study
   * @param studyInstanceUid - The study instance UID
   * @returns Array of assignments
   */
  const getAssignmentsByStudy = useCallback(
    (studyInstanceUid: string): WorkAssignment[] => {
      const service = getWorkAssignmentService();
      if (!service) return [];

      return service.getAssignmentsByStudy(studyInstanceUid);
    },
    [getWorkAssignmentService]
  );

  /**
   * Get assignments by assignee
   * @param assigneeId - The assignee's user ID
   * @returns Array of assignments
   */
  const getAssignmentsByAssignee = useCallback(
    (assigneeId: string): WorkAssignment[] => {
      const service = getWorkAssignmentService();
      if (!service) return [];

      return service.getAssignmentsByAssignee(assigneeId);
    },
    [getWorkAssignmentService]
  );

  /**
   * Get active assignment for a study
   * @param studyInstanceUid - The study instance UID
   * @returns The active assignment or null
   */
  const getActiveAssignmentForStudy = useCallback(
    (studyInstanceUid: string): WorkAssignment | null => {
      const service = getWorkAssignmentService();
      if (!service) return null;

      return service.getActiveAssignmentForStudy(studyInstanceUid);
    },
    [getWorkAssignmentService]
  );

  /**
   * Check if a study is assigned to a user
   * @param studyInstanceUid - The study instance UID
   * @param userId - The user ID
   * @returns True if the study is assigned to the user
   */
  const isAssignedTo = useCallback(
    (studyInstanceUid: string, userId: string): boolean => {
      const service = getWorkAssignmentService();
      if (!service) return false;

      return service.isAssignedTo(studyInstanceUid, userId);
    },
    [getWorkAssignmentService]
  );

  return {
    assignments,
    isLoading,
    createAssignment,
    removeAssignment,
    completeAssignment,
    getAssignmentsByStudy,
    getAssignmentsByAssignee,
    getActiveAssignmentForStudy,
    isAssignedTo,
    loadAssignments,
  };
}

export default useWorkAssignment;
