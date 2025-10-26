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
    title: '전공/학위',
    key: 'major',
    width: 150,
    render: (_: any, record: Education) => {
      if (record.major && record.degree) {
        return `${record.major} (${record.degree})`;
      }
      return record.major || record.degree || '-';
    },
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
    title: '기간',
    key: 'period',
    width: 200,
    render: (_: any, record: Education) => {
      const start = new Date(record.startDate).toLocaleDateString('ko-KR');
      const end = record.endDate
        ? new Date(record.endDate).toLocaleDateString('ko-KR')
        : '진행중';
      return `${start} ~ ${end}`;
    },
  },
  {
    title: '학점',
    dataIndex: 'gpa',
    key: 'gpa',
    width: 80,
    render: (gpa?: number) => gpa ? `${gpa}/4.0` : '-',
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
    title: '관련 프로젝트',
    dataIndex: 'projects',
    key: 'projects',
    width: 200,
    render: (projects: string[]) => (
      <div>
        {projects?.slice(0, 2).map((item, index) => (
          <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
            {item.length > 30 ? `${item.substring(0, 30)}...` : item}
          </Tag>
        ))}
        {projects?.length > 2 && (
          <Tag color="purple">+{projects.length - 2}</Tag>
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
