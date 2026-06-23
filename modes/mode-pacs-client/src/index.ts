import { id } from './id';

/**
 * PACS Client Mode for OHIF
 *
 * This mode integrates all PACS client extensions and provides a complete
 * PACS client experience with user management, report workflow, worklist
 * enhancement, and analytics.
 */
const pacsClientMode = {
  id,
  displayName: 'PACS Client',
  description: 'Complete PACS client with user management, report workflow, and analytics',
  version: '1.0.0',

  /**
   * Extensions required by this mode
   */
  extensions: [
    '@ohif/extension-default',
    '@ohif/extension-cornerstone',
    '@ohif/extension-cornerstone-dicom-sr',
    '@ohif/extension-measurement-tracking',
    '@ohif/extension-rbac',
    '@ohif/extension-multitenant',
    '@ohif/extension-report-workflow',
    '@ohif/extension-worklist-enhance',
    '@ohif/extension-analytics',
  ],

  /**
   * Mode-specific initialization
   */
  onModeEnter({ servicesManager, extensionManager }: any) {
    console.log('Entering PACS Client mode');

    // Initialize services if needed
    const {
      permissionService,
      tenantService,
      reportTemplateService,
      reportWorkflowService,
      workStatusService,
      workAssignmentService,
      analyticsService,
    } = servicesManager.services;

    // Services are already registered by their respective extensions
    // Just log that we're ready
    console.log('PACS Client mode services initialized');
  },

  /**
   * Mode-specific cleanup
   */
  onModeExit({ servicesManager }: any) {
    console.log('Exiting PACS Client mode');
  },

  /**
   * Hanging protocol for this mode
   */
  hangingProtocol: 'default',

  /**
   * Layout template for this mode
   */
  layoutTemplate: ({ servicesManager }: any) => {
    return {
      id: 'pacs-client-layout',
      rows: [
        {
          columns: [
            {
              width: '100%',
              height: '100%',
              viewportOptions: {
                viewportType: 'stack',
              },
            },
          ],
        },
      ],
    };
  },

  /**
   * Toolbar configuration for this mode
   */
  toolbar: [
    {
      id: 'measurement-tools',
      type: 'toolGroup',
      commands: [
        {
          id: 'Length',
          icon: 'tool-length',
          label: 'Length',
        },
        {
          id: 'Angle',
          icon: 'tool-angle',
          label: 'Angle',
        },
        {
          id: 'Bidirectional',
          icon: 'tool-bidirectional',
          label: 'Bidirectional',
        },
      ],
    },
  ],

  /**
   * Panels for this mode
   */
  panels: [
    {
      id: 'report-panel',
      label: 'Report',
      component: 'ReportEditor',
      extension: '@ohif/extension-report-workflow',
    },
    {
      id: 'review-panel',
      label: 'Review',
      component: 'ReportReviewPanel',
      extension: '@ohif/extension-report-workflow',
    },
    {
      id: 'analytics-panel',
      label: 'Analytics',
      component: 'Dashboard',
      extension: '@ohif/extension-analytics',
    },
  ],

  /**
   * Commands for this mode
   */
  commands: [
    {
      id: 'createReport',
      name: 'Create Report',
      action: ({ servicesManager }: any) => {
        console.log('Creating report...');
      },
    },
    {
      id: 'submitReport',
      name: 'Submit Report',
      action: ({ servicesManager }: any) => {
        console.log('Submitting report...');
      },
    },
  ],
};

export default pacsClientMode;
