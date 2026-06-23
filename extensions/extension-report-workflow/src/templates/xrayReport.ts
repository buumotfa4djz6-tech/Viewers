import { ReportTemplate, FieldType } from './index';

/**
 * X-Ray Report Template
 */
export const xrayReportTemplate: ReportTemplate = {
  id: 'xray-template',
  name: 'X-Ray 报告模板',
  modality: 'CR',
  description: 'X-Ray 检查报告模板',
  fields: [
    {
      id: 'clinicalInfo',
      label: '临床信息',
      type: FieldType.TEXT,
      required: true,
      placeholder: '请输入临床信息',
    },
    {
      id: 'technique',
      label: '检查技术',
      type: FieldType.TEXT,
      required: true,
      placeholder: '请输入检查技术',
    },
    {
      id: 'view',
      label: '投照位置',
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: 'pa', label: 'PA' },
        { value: 'ap', label: 'AP' },
        { value: 'lateral', label: 'Lateral' },
        { value: 'oblique', label: 'Oblique' },
        { value: 'other', label: '其他' },
      ],
    },
    {
      id: 'findings',
      label: '检查所见',
      type: FieldType.TEXTAREA,
      required: true,
      placeholder: '请详细描述检查所见',
      rows: 6,
    },
    {
      id: 'impression',
      label: '诊断意见',
      type: FieldType.TEXTAREA,
      required: true,
      placeholder: '请输入诊断意见',
      rows: 4,
    },
    {
      id: 'recommendation',
      label: '建议',
      type: FieldType.TEXTAREA,
      required: false,
      placeholder: '请输入建议',
      rows: 2,
    },
  ],
};

export default xrayReportTemplate;
