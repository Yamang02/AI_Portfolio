/**
 * Experience 테이블 컬럼 정의
 */

import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Experience, ExperienceTypeString } from '../../../entities/experience';

const experienceTypeNames: Record<ExperienceTypeString, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  FREELANCE: '프리랜서',
  PART_TIME: '파트타임',
  INTERNSHIP: '인턴십',
  OTHER: '기타',
};

const getTypeColor = (type: ExperienceTypeString): string => {
  const colorMap: Record<ExperienceTypeString, string> = {
    FULL_TIME: 'blue',
    CONTRACT: 'cyan',
    FREELANCE: 'orange',
    PART_TIME: 'green',
    INTERNSHIP: 'purple',
    OTHER: 'default',
  };
  return colorMap[type] || 'default';
};

export const createExperienceColumns = (): ColumnsType<Experience> => [
  {
    title: '정렬 순서',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 100,
    fixed: 'left',
  },
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
    render: (type: ExperienceTypeString) => (
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
    title: '시작일',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 130,
    render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  },
  {
    title: '완료일',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 130,
    render: (date?: string) => date ? new Date(date).toLocaleDateString('ko-KR') : '진행중',
    sorter: (a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
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
    title: '주요 업무',
    dataIndex: 'mainResponsibilities',
    key: 'mainResponsibilities',
    width: 200,
    render: (mainResponsibilities: string[]) => (
      <div>
        {mainResponsibilities?.slice(0, 2).map((item, index) => (
          <Tag key={index} style={{ marginBottom: 4 }}>
            {item.length > 30 ? `${item.substring(0, 30)}...` : item}
          </Tag>
        ))}
        {mainResponsibilities?.length > 2 && (
          <Tag>+{mainResponsibilities.length - 2}</Tag>
        )}
      </div>
    ),
  },
];
