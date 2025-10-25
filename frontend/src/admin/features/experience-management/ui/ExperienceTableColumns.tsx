/**
 * Experience 테이블 컬럼 정의
 */

import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Experience, ExperienceType } from '@/admin/entities/experience';

const experienceTypeNames: Record<ExperienceType, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '파트타임',
  FREELANCE: '프리랜서',
  INTERNSHIP: '인턴',
  OTHER: '기타',
};

const getTypeColor = (type: ExperienceType): string => {
  const colorMap: Record<ExperienceType, string> = {
    FULL_TIME: 'blue',
    PART_TIME: 'green',
    FREELANCE: 'orange',
    INTERNSHIP: 'purple',
    OTHER: 'default',
  };
  return colorMap[type] || 'default';
};

export const createExperienceColumns = (): ColumnsType<Experience> => [
  {
    title: '제목',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: '회사/조직',
    dataIndex: 'organization',
    key: 'organization',
    width: 150,
  },
  {
    title: '역할',
    dataIndex: 'role',
    key: 'role',
    width: 120,
  },
  {
    title: '타입',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    render: (type: ExperienceType) => (
      <Tag color={getTypeColor(type)}>
        {experienceTypeNames[type] || type}
      </Tag>
    ),
    filters: Object.entries(experienceTypeNames).map(([type, name]) => ({
      text: name,
      value: type,
    })),
    onFilter: (value, record) => record.type === value,
  },
  {
    title: '기간',
    key: 'period',
    width: 200,
    render: (_: any, record: Experience) => {
      const start = new Date(record.startDate).toLocaleDateString('ko-KR');
      const end = record.endDate
        ? new Date(record.endDate).toLocaleDateString('ko-KR')
        : '진행중';
      return `${start} ~ ${end}`;
    },
  },
  {
    title: '기술스택',
    dataIndex: 'technologies',
    key: 'technologies',
    width: 200,
    render: (technologies: string[]) => (
      <div>
        {technologies?.slice(0, 3).map(tech => (
          <Tag key={tech} style={{ marginBottom: 4 }}>{tech}</Tag>
        ))}
        {technologies?.length > 3 && (
          <Tag>+{technologies.length - 3}</Tag>
        )}
      </div>
    ),
  },
  {
    title: '정렬 순서',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 100,
  },
];
