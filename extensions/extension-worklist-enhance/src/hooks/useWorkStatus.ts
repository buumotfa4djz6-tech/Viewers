import { useState, useEffect, useCallback } from 'react';
import { WorkStatus, WorkItem } from '../services/WorkStatusService';

/**
 * Hook to manage work status
 *
 * @example
 * const { workItems, changeStatus, getStatus, isLoading } = useWorkStatus(servicesManager);
 */
export function useWorkStatus(servicesManager?: AppTypes.ServicesManager) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getWorkStatusService = useCallback(() => {
    if (!servicesManager) return null;
    return servicesManager.services.workStatusService;
  }, [servicesManager]);

  /**
   * Load all work items
   */
  const loadWorkItems = useCallback(() => {
    const service = getWorkStatusService();
    if (!service) return;

    setIsLoading(true);
    try {
      const items = service.getAllWorkItems();
      setWorkItems(items);
    } finally {
      setIsLoading(false);
    }
  }, [getWorkStatusService]);

  useEffect(() => {
    loadWorkItems();
  }, [loadWorkItems]);

  /**
   * Get work item by study instance UID
   * @param studyInstanceUid - The study instance UID
   * @returns The work item or null
   */
  const getWorkItem = useCallback(
    (studyInstanceUid: string): WorkItem | null => {
      const service = getWorkStatusService();
      if (!service) return null;

      return service.getWorkItem(studyInstanceUid);
    },
    [getWorkStatusService]
  );

  /**
   * Initialize a work item
   * @param studyInstanceUid - The study instance UID
   * @returns The initialized work item
   */
  const initializeWorkItem = useCallback(
    (studyInstanceUid: string): WorkItem | null => {
      const service = getWorkStatusService();
      if (!service) return null;

      const item = service.initializeWorkItem(studyInstanceUid);
      loadWorkItems();
      return item;
    },
    [getWorkStatusService, loadWorkItems]
  );

  /**
   * Change the status of a work item
   * @param studyInstanceUid - The study instance UID
   * @param newStatus - The new status
   * @param userId - The user ID
   * @param userRoles - The user's roles
   * @returns The updated work item
   */
  const changeStatus = useCallback(
    (
      studyInstanceUid: string,
      newStatus: WorkStatus,
      userId: string,
      userRoles: string[]
    ): WorkItem | null => {
      const service = getWorkStatusService();
      if (!service) return null;

      const item = service.changeStatus(studyInstanceUid, newStatus, userId, userRoles);
      if (item) {
        loadWorkItems();
      }
      return item;
    },
    [getWorkStatusService, loadWorkItems]
  );

  /**
   * Get work items by status
   * @param status - The status
   * @returns Array of work items
   */
  const getWorkItemsByStatus = useCallback(
    (status: WorkStatus): WorkItem[] => {
      const service = getWorkStatusService();
      if (!service) return [];

      return service.getWorkItemsByStatus(status);
    },
    [getWorkStatusService]
  );

  /**
   * Get work items by assignee
   * @param userId - The user ID
   * @returns Array of work items
   */
  const getWorkItemsByAssignee = useCallback(
    (userId: string): WorkItem[] => {
      const service = getWorkStatusService();
      if (!service) return [];

      return service.getWorkItemsByAssignee(userId);
    },
    [getWorkStatusService]
  );

  /**
   * Check if a user can change the status
   * @param studyInstanceUid - The study instance UID
   * @param newStatus - The new status
   * @param userRoles - The user's roles
   * @returns True if the user can change the status
   */
  const canChangeStatus = useCallback(
    (studyInstanceUid: string, newStatus: WorkStatus, userRoles: string[]): boolean => {
      const service = getWorkStatusService();
      if (!service) return false;

      return service.canChangeStatus(studyInstanceUid, newStatus, userRoles);
    },
    [getWorkStatusService]
  );

  return {
    workItems,
    isLoading,
    getWorkItem,
    initializeWorkItem,
    changeStatus,
    getWorkItemsByStatus,
    getWorkItemsByAssignee,
    canChangeStatus,
    loadWorkItems,
  };
}

export default useWorkStatus;
