import { ReportTemplate, FieldType } from './index';

/**
 * MRI Report Template
 */
export const mriReportTemplate: ReportTemplate = {
  id: 'mri-template',
  name: 'MRI 报告模板',
  modality: 'MR',
  description: 'MRI 检查报告模板',
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
      id: 'sequence',
      label: '序列',
      type: FieldType.TEXT,
      required: true,
      placeholder: '请输入使用的序列',
    },
    {
      id: 'contrast',
      label: '对比剂',
      type: FieldType.SELECT,
      required: false,
      options: [
        { value: 'none', label: '未使用' },
        { value: 'gadolinium', label: '钆对比剂' },
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

export default mriReportTemplate;
