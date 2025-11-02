/**
 * 기술 스택 테이블 컬럼 정의
 */

import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TechStackMetadata } from '../../entities/tech-stack';
import { categoryNames, levelMapping, getCategoryColor } from '../lib/techStackMappings';
import styles from './TechStackTableColumns.module.css';

export const createTechStackColumns = (): ColumnsType<TechStackMetadata> => [
  {
    title: '정렬 순서',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 100,
    render: (sortOrder: number) => (
      <div className={styles.sortOrderCell}>
        {sortOrder}
      </div>
    ),
  },
  {
    title: '기술명',
    dataIndex: 'displayName',
    key: 'displayName',
    render: (text: string, record: TechStackMetadata) => (
      <div>
        <div className={styles.techNameDisplay}>{text}</div>
        <div className={styles.techNameSub}>{record.name}</div>
      </div>
    ),
  },
  {
    title: '카테고리',
    dataIndex: 'category',
    key: 'category',
    render: (category: string) => (
      <Tag color={getCategoryColor(category as any)}>
        {categoryNames[category as keyof typeof categoryNames]}
      </Tag>
    ),
    filters: Object.keys(categoryNames).map(cat => ({
      text: categoryNames[cat as keyof typeof categoryNames],
      value: cat,
    })),
    onFilter: (value: boolean | React.Key, record: TechStackMetadata) => record.category === String(value),
  },
  {
    title: '레벨',
    dataIndex: 'level',
    key: 'level',
    render: (level: string, record: TechStackMetadata) => (
      <div>
        <Tag color={level === 'core' ? 'gold' : level === 'general' ? 'blue' : 'green'}>
          {levelMapping[level as keyof typeof levelMapping] || level}
        </Tag>
        {record.isCore && (
          <Tag color="gold" className={styles.coreTag}>
            핵심
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: '상태',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (isActive: boolean) => (
      <Tag color={isActive ? 'green' : 'red'}>
        {isActive ? '활성' : '비활성'}
      </Tag>
    ),
  },
  {
    title: '설명',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
];
