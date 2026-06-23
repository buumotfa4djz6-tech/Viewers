import { Types } from '@ohif/core';
import { id } from './id';
import WorkStatusService from './services/WorkStatusService';
import WorkAssignmentService from './services/WorkAssignmentService';

/**
 * Worklist Enhancement Extension for OHIF
 *
 * Provides work status tracking and work assignment functionality.
 */
const worklistEnhanceExtension: Types.Extensions.Extension = {
  id,

  /**
   * Register services during pre-registration
   */
  preRegistration({ servicesManager, configuration }: Types.Extensions.ExtensionParams) {
    // Register the WorkStatusService
    servicesManager.registerService(WorkStatusService.REGISTRATION);

    // Register the WorkAssignmentService
    servicesManager.registerService(WorkAssignmentService.REGISTRATION);
  },
};

export default worklistEnhanceExtension;

// Export types and utilities
export { WorkStatusService, WorkStatus } from './services/WorkStatusService';
export type { WorkItem } from './services/WorkStatusService';
export { WorkAssignmentService } from './services/WorkAssignmentService';
export type { WorkAssignment } from './services/WorkAssignmentService';
export { useWorkStatus, useWorkAssignment } from './hooks';
export { StatusBadge, StatusDot, StatusTransition, AssignmentDialog } from './components';
