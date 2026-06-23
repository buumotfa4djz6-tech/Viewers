import { ReportTemplate, FieldType } from './index';

/**
 * CT Report Template
 */
export const ctReportTemplate: ReportTemplate = {
  id: 'ct-template',
  name: 'CT 报告模板',
  modality: 'CT',
  description: 'CT 检查报告模板',
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
      id: 'contrast',
      label: '对比剂',
      type: FieldType.SELECT,
      required: false,
      options: [
        { value: 'none', label: '未使用' },
        { value: 'iv', label: '静脉注射' },
        { value: 'oral', label: '口服' },
        { value: 'both', label: '静脉+口服' },
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
    {
      id: 'diagnosis',
      label: '诊断',
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: 'normal', label: '正常' },
        { value: 'abnormal', label: '异常' },
        { value: 'suspect', label: '可疑' },
        { value: 'followup', label: '随访' },
      ],
    },
  ],
};

export default ctReportTemplate;
