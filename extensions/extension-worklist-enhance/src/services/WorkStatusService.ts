import { PubSubService } from '@ohif/core';

const EVENTS = {
  STATUS_CHANGED: 'event::WorkStatusService:statusChanged',
  WORK_ASSIGNED: 'event::WorkStatusService:workAssigned',
  WORK_UNASSIGNED: 'event::WorkStatusService:workUnassigned',
};

/**
 * Work status enum
 */
export enum WorkStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Status transition rules
 */
const STATUS_TRANSITIONS: Record<WorkStatus, WorkStatus[]> = {
  [WorkStatus.PENDING]: [WorkStatus.IN_PROGRESS, WorkStatus.CANCELLED],
  [WorkStatus.IN_PROGRESS]: [WorkStatus.COMPLETED, WorkStatus.CANCELLED],
  [WorkStatus.COMPLETED]: [],
  [WorkStatus.CANCELLED]: [WorkStatus.PENDING],
};

/**
 * Status transition permissions
 */
const STATUS_TRANSITION_PERMISSIONS: Record<WorkStatus, string[]> = {
  [WorkStatus.PENDING]: ['admin', 'tech'],
  [WorkStatus.IN_PROGRESS]: ['admin', 'doctor'],
  [WorkStatus.COMPLETED]: ['admin', 'reviewer'],
  [WorkStatus.CANCELLED]: ['admin'],
};

/**
 * Work item interface
 */
export interface WorkItem {
  studyInstanceUid: string;
  status: WorkStatus;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
  metadata?: Record<string, any>;
}

/**
 * WorkStatusService manages work status and assignment for the application.
 */
export default class WorkStatusService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'workStatusService',
    create: ({ configuration = {} }) => {
      return new WorkStatusService();
    },
  };

  private workItems: Map<string, WorkItem> = new Map();

  constructor() {
    super(WorkStatusService.EVENTS);
  }

  /**
   * Get work item by study instance UID
   * @param studyInstanceUid - The study instance UID
   * @returns The work item or null
   */
  getWorkItem(studyInstanceUid: string): WorkItem | null {
    return this.workItems.get(studyInstanceUid) || null;
  }

  /**
   * Get all work items
   * @returns Array of work items
   */
  getAllWorkItems(): WorkItem[] {
    return Array.from(this.workItems.values());
  }

  /**
   * Get work items by status
   * @param status - The status to filter by
   * @returns Array of work items with the specified status
   */
  getWorkItemsByStatus(status: WorkStatus): WorkItem[] {
    return Array.from(this.workItems.values()).filter(item => item.status === status);
  }

  /**
   * Get work items assigned to a user
   * @param userId - The user ID
   * @returns Array of work items assigned to the user
   */
  getWorkItemsByAssignee(userId: string): WorkItem[] {
    return Array.from(this.workItems.values()).filter(item => item.assignedTo === userId);
  }

  /**
   * Initialize a work item with pending status
   * @param studyInstanceUid - The study instance UID
   * @param metadata - Optional metadata
   * @returns The created work item
   */
  initializeWorkItem(studyInstanceUid: string, metadata?: Record<string, any>): WorkItem {
    const existingItem = this.workItems.get(studyInstanceUid);
    if (existingItem) {
      return existingItem;
    }

    const workItem: WorkItem = {
      studyInstanceUid,
      status: WorkStatus.PENDING,
      statusChangedAt: new Date().toISOString(),
      metadata,
    };

    this.workItems.set(studyInstanceUid, workItem);

    return workItem;
  }

  /**
   * Change the status of a work item
   * @param studyInstanceUid - The study instance UID
   * @param newStatus - The new status
   * @param userId - The user ID making the change
   * @param userRoles - The user's roles
   * @returns The updated work item or null if not allowed
   */
  changeStatus(
    studyInstanceUid: string,
    newStatus: WorkStatus,
    userId: string,
    userRoles: string[]
  ): WorkItem | null {
    const workItem = this.workItems.get(studyInstanceUid);
    if (!workItem) {
      console.warn(`Work item ${studyInstanceUid} not found`);
      return null;
    }

    // Check if transition is allowed
    const allowedTransitions = STATUS_TRANSITIONS[workItem.status];
    if (!allowedTransitions.includes(newStatus)) {
      console.warn(
        `Transition from ${workItem.status} to ${newStatus} is not allowed`
      );
      return null;
    }

    // Check permissions
    const allowedRoles = STATUS_TRANSITION_PERMISSIONS[newStatus];
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));
    if (!hasPermission) {
      console.warn(
        `User ${userId} does not have permission to change status to ${newStatus}`
      );
      return null;
    }

    // Update work item
    const updatedItem: WorkItem = {
      ...workItem,
      status: newStatus,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: userId,
    };

    this.workItems.set(studyInstanceUid, updatedItem);

    this._broadcastEvent(WorkStatusService.EVENTS.STATUS_CHANGED, {
      workItem: updatedItem,
      previousStatus: workItem.status,
      newStatus,
      userId,
    });

    return updatedItem;
  }

  /**
   * Assign a work item to a user
   * @param studyInstanceUid - The study instance UID
   * @param assigneeId - The assignee's user ID
   * @param assignerId - The assigner's user ID
   * @returns The updated work item or null
   */
  assignWork(
    studyInstanceUid: string,
    assigneeId: string,
    assignerId: string
  ): WorkItem | null {
    const workItem = this.workItems.get(studyInstanceUid);
    if (!workItem) {
      console.warn(`Work item ${studyInstanceUid} not found`);
      return null;
    }

    const updatedItem: WorkItem = {
      ...workItem,
      assignedTo: assigneeId,
      assignedBy: assignerId,
      assignedAt: new Date().toISOString(),
    };

    this.workItems.set(studyInstanceUid, updatedItem);

    this._broadcastEvent(WorkStatusService.EVENTS.WORK_ASSIGNED, {
      workItem: updatedItem,
      assigneeId,
      assignerId,
    });

    return updatedItem;
  }

  /**
   * Unassign a work item
   * @param studyInstanceUid - The study instance UID
   * @returns The updated work item or null
   */
  unassignWork(studyInstanceUid: string): WorkItem | null {
    const workItem = this.workItems.get(studyInstanceUid);
    if (!workItem) {
      console.warn(`Work item ${studyInstanceUid} not found`);
      return null;
    }

    const updatedItem: WorkItem = {
      ...workItem,
      assignedTo: undefined,
      assignedBy: undefined,
      assignedAt: undefined,
    };

    this.workItems.set(studyInstanceUid, updatedItem);

    this._broadcastEvent(WorkStatusService.EVENTS.WORK_UNASSIGNED, {
      workItem: updatedItem,
    });

    return updatedItem;
  }

  /**
   * Get status label
   * @param status - The status
   * @returns The status label
   */
  getStatusLabel(status: WorkStatus): string {
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
  }

  /**
   * Get status color
   * @param status - The status
   * @returns The status color class
   */
  getStatusColor(status: WorkStatus): string {
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
  }

  /**
   * Check if a user can change the status of a work item
   * @param studyInstanceUid - The study instance UID
   * @param newStatus - The new status
   * @param userRoles - The user's roles
   * @returns True if the user can change the status
   */
  canChangeStatus(
    studyInstanceUid: string,
    newStatus: WorkStatus,
    userRoles: string[]
  ): boolean {
    const workItem = this.workItems.get(studyInstanceUid);
    if (!workItem) {
      return false;
    }

    // Check if transition is allowed
    const allowedTransitions = STATUS_TRANSITIONS[workItem.status];
    if (!allowedTransitions.includes(newStatus)) {
      return false;
    }

    // Check permissions
    const allowedRoles = STATUS_TRANSITION_PERMISSIONS[newStatus];
    return userRoles.some(role => allowedRoles.includes(role));
  }
}

export { WorkStatusService };
