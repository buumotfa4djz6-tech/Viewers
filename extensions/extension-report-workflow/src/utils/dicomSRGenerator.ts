import { ReportData, ReportStatus } from '../templates';

/**
 * DICOM SR Generator
 *
 * Generates DICOM SR (Structured Report) objects from report data.
 */

/**
 * Generate a DICOM SR object from report data
 * @param reportData - The report data
 * @returns The DICOM SR object
 */
export function generateDicomSR(reportData: ReportData): any {
  // This is a simplified DICOM SR generator
  // In a real implementation, this would use dcmjs to create a proper DICOM SR

  const srObject = {
    '00080005': {
      vr: 'CS',
      Value: ['ISO_IR 100'],
    },
    '00080016': {
      vr: 'UI',
      Value: ['1.2.840.10008.5.1.4.1.1.88.22'], // SR Document
    },
    '00080018': {
      vr: 'UI',
      Value: [generateUID()],
    },
    '00080020': {
      vr: 'DA',
      Value: [formatDate(reportData.studyDate)],
    },
    '00080030': {
      vr: 'TM',
      Value: [formatTime(new Date().toISOString())],
    },
    '00080050': {
      vr: 'SH',
      Value: [''],
    },
    '00080060': {
      vr: 'CS',
      Value: [reportData.modality],
    },
    '00080070': {
      vr: 'LO',
      Value: ['PACS Client'],
    },
    '00080090': {
      vr: 'PN',
      Value: [reportData.author],
    },
    '00081030': {
      vr: 'LO',
      Value: ['Structured Report'],
    },
    '0008103E': {
      vr: 'LO',
      Value: ['PACS Report'],
    },
    '00100010': {
      vr: 'PN',
      Value: [reportData.patientName],
    },
    '00100020': {
      vr: 'LO',
      Value: [reportData.patientId],
    },
    '0020000D': {
      vr: 'UI',
      Value: [reportData.studyInstanceUid],
    },
    '0020000E': {
      vr: 'UI',
      Value: [reportData.seriesInstanceUid],
    },
    '00200010': {
      vr: 'SH',
      Value: [''],
    },
    '00200011': {
      vr: 'IS',
      Value: ['1'],
    },
    '00200013': {
      vr: 'IS',
      Value: ['1'],
    },
    '0040A040': {
      vr: 'CS',
      Value: ['CONTAINER'],
    },
    '0040A043': {
      vr: 'SQ',
      Value: [
        {
          '00080100': {
            vr: 'SH',
            Value: ['126000'],
          },
          '00080102': {
            vr: 'SH',
            Value: ['DCM'],
          },
          '00080104': {
            vr: 'LO',
            Value: ['Imaging Report'],
          },
        },
      ],
    },
    '0040A050': {
      vr: 'CS',
      Value: ['SEPARATE'],
    },
    '0040A491': {
      vr: 'CS',
      Value: ['COMPLETE'],
    },
    '0040A493': {
      vr: 'CS',
      Value: ['VERIFIED'],
    },
    '0040A504': {
      vr: 'SQ',
      Value: [
        {
          '0040A170': {
            vr: 'SQ',
            Value: [
              {
                '00080100': {
                  vr: 'SH',
                  Value: ['126001'],
                },
                '00080102': {
                  vr: 'SH',
                  Value: ['DCM'],
                },
                '00080104': {
                  vr: 'LO',
                  Value: ['Report Content'],
                },
              },
            ],
          },
        },
      ],
    },
    '0040A730': {
      vr: 'SQ',
      Value: generateContentSequence(reportData),
    },
  };

  return srObject;
}

/**
 * Generate content sequence for the SR
 * @param reportData - The report data
 * @returns The content sequence
 */
function generateContentSequence(reportData: ReportData): any[] {
  const contentItems: any[] = [];

  // Add findings
  if (reportData.findings) {
    contentItems.push({
      '0040A010': {
        vr: 'CS',
        Value: ['CONTAINS'],
      },
      '0040A040': {
        vr: 'CS',
        Value: ['TEXT'],
      },
      '0040A043': {
        vr: 'SQ',
        Value: [
          {
            '00080100': {
              vr: 'SH',
              Value: ['121070'],
            },
            '00080102': {
              vr: 'SH',
              Value: ['DCM'],
            },
            '00080104': {
              vr: 'LO',
              Value: ['Finding'],
            },
          },
        ],
      },
      '0040A160': {
        vr: 'UT',
        Value: [reportData.findings],
      },
    });
  }

  // Add impression
  if (reportData.impression) {
    contentItems.push({
      '0040A010': {
        vr: 'CS',
        Value: ['CONTAINS'],
      },
      '0040A040': {
        vr: 'CS',
        Value: ['TEXT'],
      },
      '0040A043': {
        vr: 'SQ',
        Value: [
          {
            '00080100': {
              vr: 'SH',
              Value: ['121071'],
            },
            '00080102': {
              vr: 'SH',
              Value: ['DCM'],
            },
            '00080104': {
              vr: 'LO',
              Value: ['Impression'],
            },
          },
        ],
      },
      '0040A160': {
        vr: 'UT',
        Value: [reportData.impression],
      },
    });
  }

  // Add recommendation
  if (reportData.recommendation) {
    contentItems.push({
      '0040A010': {
        vr: 'CS',
        Value: ['CONTAINS'],
      },
      '0040A040': {
        vr: 'CS',
        Value: ['TEXT'],
      },
      '0040A043': {
        vr: 'SQ',
        Value: [
          {
            '00080100': {
              vr: 'SH',
              Value: ['121074'],
            },
            '00080102': {
              vr: 'SH',
              Value: ['DCM'],
            },
            '00080104': {
              vr: 'LO',
              Value: ['Recommendation'],
            },
          },
        ],
      },
      '0040A160': {
        vr: 'UT',
        Value: [reportData.recommendation],
      },
    });
  }

  // Add additional fields
  Object.entries(reportData.fields).forEach(([key, value]) => {
    if (value && typeof value === 'string' && key !== 'reviewComments' && key !== 'rejectionReason') {
      contentItems.push({
        '0040A010': {
          vr: 'CS',
          Value: ['CONTAINS'],
        },
        '0040A040': {
          vr: 'CS',
          Value: ['TEXT'],
        },
        '0040A043': {
          vr: 'SQ',
          Value: [
            {
              '00080100': {
                vr: 'SH',
                Value: ['99PACS'],
              },
              '00080102': {
                vr: 'SH',
                Value: ['99LOCAL'],
              },
              '00080104': {
                vr: 'LO',
                Value: [key],
              },
            },
          ],
        },
        '0040A160': {
          vr: 'UT',
          Value: [String(value)],
        },
      });
    }
  });

  return contentItems;
}

/**
 * Generate a unique UID
 * @returns A unique UID string
 */
function generateUID(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().substr(2, 9);
  return `2.25.${timestamp}${random}`;
}

/**
 * Format a date string to DICOM DA format (YYYYMMDD)
 * @param dateString - The date string
 * @returns The formatted date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format a time string to DICOM TM format (HHMMSS)
 * @param dateString - The date string
 * @returns The formatted time
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}${minutes}${seconds}`;
}
