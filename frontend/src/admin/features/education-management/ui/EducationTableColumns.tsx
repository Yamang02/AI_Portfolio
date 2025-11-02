/**
 * Education 테이블 컬럼 정의
 */

import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Education, EducationType } from '@/admin/entities/education';

const educationTypeNames: Record<EducationType, string> = {
  UNIVERSITY: '대학교',
  BOOTCAMP: '부트캠프',
  ONLINE_COURSE: '온라인 강의',
  CERTIFICATION: '자격증',
  OTHER: '기타',
};

const getTypeColor = (type: EducationType): string => {
  const colorMap: Record<EducationType, string> = {
    UNIVERSITY: 'blue',
    BOOTCAMP: 'green',
    ONLINE_COURSE: 'orange',
    CERTIFICATION: 'purple',
    OTHER: 'default',
  };
  return colorMap[type] || 'default';
};

export const createEducationColumns = (): ColumnsType<Education> => [
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
    title: '교육기관',
    dataIndex: 'organization',
    key: 'organization',
    width: 150,
  },
  {
    title: '타입',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    render: (type: EducationType) => (
      <Tag color={getTypeColor(type)}>
        {educationTypeNames[type] || type}
      </Tag>
    ),
    filters: Object.entries(educationTypeNames).map(([type, name]) => ({
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
    title: '종료일',
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
];
