import { PubSubService } from '@ohif/core';

const EVENTS = {
  ASSIGNMENT_CREATED: 'event::WorkAssignmentService:assignmentCreated',
  ASSIGNMENT_REMOVED: 'event::WorkAssignmentService:assignmentRemoved',
  ASSIGNMENT_COMPLETED: 'event::WorkAssignmentService:assignmentCompleted',
};

/**
 * Work assignment interface
 */
export interface WorkAssignment {
  id: string;
  studyInstanceUid: string;
  assigneeId: string;
  assignerId: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * WorkAssignmentService manages work assignments for the application.
 */
export default class WorkAssignmentService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'workAssignmentService',
    create: ({ configuration = {} }) => {
      return new WorkAssignmentService();
    },
  };

  private assignments: Map<string, WorkAssignment> = new Map();

  constructor() {
    super(WorkAssignmentService.EVENTS);
  }

  /**
   * Create a work assignment
   * @param studyInstanceUid - The study instance UID
   * @param assigneeId - The assignee's user ID
   * @param assignerId - The assigner's user ID
   * @param notes - Optional notes
   * @param metadata - Optional metadata
   * @returns The created assignment
   */
  createAssignment(
    studyInstanceUid: string,
    assigneeId: string,
    assignerId: string,
    notes?: string,
    metadata?: Record<string, any>
  ): WorkAssignment {
    const id = this.generateAssignmentId();
    const assignment: WorkAssignment = {
      id,
      studyInstanceUid,
      assigneeId,
      assignerId,
      assignedAt: new Date().toISOString(),
      notes,
      metadata,
    };

    this.assignments.set(id, assignment);

    this._broadcastEvent(WorkAssignmentService.EVENTS.ASSIGNMENT_CREATED, {
      assignment,
    });

    return assignment;
  }

  /**
   * Remove a work assignment
   * @param assignmentId - The assignment ID
   * @returns The removed assignment or null
   */
  removeAssignment(assignmentId: string): WorkAssignment | null {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      console.warn(`Assignment ${assignmentId} not found`);
      return null;
    }

    this.assignments.delete(assignmentId);

    this._broadcastEvent(WorkAssignmentService.EVENTS.ASSIGNMENT_REMOVED, {
      assignment,
    });

    return assignment;
  }

  /**
   * Complete a work assignment
   * @param assignmentId - The assignment ID
   * @returns The completed assignment or null
   */
  completeAssignment(assignmentId: string): WorkAssignment | null {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      console.warn(`Assignment ${assignmentId} not found`);
      return null;
    }

    const completedAssignment: WorkAssignment = {
      ...assignment,
      completedAt: new Date().toISOString(),
    };

    this.assignments.set(assignmentId, completedAssignment);

    this._broadcastEvent(WorkAssignmentService.EVENTS.ASSIGNMENT_COMPLETED, {
      assignment: completedAssignment,
    });

    return completedAssignment;
  }

  /**
   * Get assignment by ID
   * @param assignmentId - The assignment ID
   * @returns The assignment or null
   */
  getAssignment(assignmentId: string): WorkAssignment | null {
    return this.assignments.get(assignmentId) || null;
  }

  /**
   * Get all assignments
   * @returns Array of assignments
   */
  getAllAssignments(): WorkAssignment[] {
    return Array.from(this.assignments.values());
  }

  /**
   * Get assignments by study
   * @param studyInstanceUid - The study instance UID
   * @returns Array of assignments for the study
   */
  getAssignmentsByStudy(studyInstanceUid: string): WorkAssignment[] {
    return Array.from(this.assignments.values()).filter(
      a => a.studyInstanceUid === studyInstanceUid
    );
  }

  /**
   * Get assignments by assignee
   * @param assigneeId - The assignee's user ID
   * @returns Array of assignments for the assignee
   */
  getAssignmentsByAssignee(assigneeId: string): WorkAssignment[] {
    return Array.from(this.assignments.values()).filter(
      a => a.assigneeId === assigneeId
    );
  }

  /**
   * Get active assignments (not completed)
   * @returns Array of active assignments
   */
  getActiveAssignments(): WorkAssignment[] {
    return Array.from(this.assignments.values()).filter(a => !a.completedAt);
  }

  /**
   * Get completed assignments
   * @returns Array of completed assignments
   */
  getCompletedAssignments(): WorkAssignment[] {
    return Array.from(this.assignments.values()).filter(a => a.completedAt);
  }

  /**
   * Get the active assignment for a study
   * @param studyInstanceUid - The study instance UID
   * @returns The active assignment or null
   */
  getActiveAssignmentForStudy(studyInstanceUid: string): WorkAssignment | null {
    return (
      Array.from(this.assignments.values()).find(
        a => a.studyInstanceUid === studyInstanceUid && !a.completedAt
      ) || null
    );
  }

  /**
   * Check if a study is assigned to a user
   * @param studyInstanceUid - The study instance UID
   * @param userId - The user ID
   * @returns True if the study is assigned to the user
   */
  isAssignedTo(studyInstanceUid: string, userId: string): boolean {
    return Array.from(this.assignments.values()).some(
      a => a.studyInstanceUid === studyInstanceUid && a.assigneeId === userId && !a.completedAt
    );
  }

  /**
   * Generate a unique assignment ID
   * @returns A unique assignment ID
   */
  private generateAssignmentId(): string {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { WorkAssignmentService };
