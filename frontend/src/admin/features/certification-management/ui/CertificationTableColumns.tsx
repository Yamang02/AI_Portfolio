/**
 * Certification 테이블 컬럼 정의
 */

import { Tag, Button, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Certification, CertificationCategory } from '../../../entities/certification';

const certificationCategoryNames: Record<CertificationCategory, string> = {
  IT: 'IT',
  LANGUAGE: '언어',
  PROJECT_MANAGEMENT: '프로젝트 관리',
  CLOUD: '클라우드',
  SECURITY: '보안',
  DATA: '데이터',
  OTHER: '기타',
};

const getCategoryColor = (category: CertificationCategory): string => {
  const colorMap: Record<CertificationCategory, string> = {
    IT: 'blue',
    LANGUAGE: 'green',
    PROJECT_MANAGEMENT: 'purple',
    CLOUD: 'cyan',
    SECURITY: 'red',
    DATA: 'orange',
    OTHER: 'default',
  };
  return colorMap[category] || 'default';
};

const isExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const isExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const expiry = new Date(expiryDate);
  return expiry <= threeMonthsFromNow && expiry > new Date();
};

export const createCertificationColumns = (): ColumnsType<Certification> => [
  {
    title: '자격증명',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '발급기관',
    dataIndex: 'issuer',
    key: 'issuer',
    width: 150,
  },
  {
    title: '카테고리',
    dataIndex: 'category',
    key: 'category',
    width: 120,
    render: (category?: CertificationCategory) => {
      if (!category) return '-';
      return (
        <Tag color={getCategoryColor(category)}>
          {certificationCategoryNames[category] || category}
        </Tag>
      );
    },
    filters: Object.entries(certificationCategoryNames).map(([category, name]) => ({
      text: name,
      value: category,
    })),
    onFilter: (value, record) => record.category === value,
  },
  {
    title: '취득일',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: '만료일',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 120,
    render: (expiryDate?: string) => {
      if (!expiryDate) return <Tag color="green">무제한</Tag>;
      
      const expired = isExpired(expiryDate);
      const expiringSoon = isExpiringSoon(expiryDate);
      
      if (expired) {
        return <Tag color="red">만료됨</Tag>;
      } else if (expiringSoon) {
        return <Tag color="orange">만료 임박</Tag>;
      } else {
        return new Date(expiryDate).toLocaleDateString('ko-KR');
      }
    },
  },
  {
    title: '자격증 번호',
    dataIndex: 'credentialId',
    key: 'credentialId',
    width: 150,
    render: (credentialId?: string) => credentialId || '-',
  },
  {
    title: '확인 URL',
    dataIndex: 'credentialUrl',
    key: 'credentialUrl',
    width: 100,
    render: (credentialUrl?: string) => {
      if (!credentialUrl) return '-';
      return (
        <Button
          type="link"
          icon={<LinkOutlined />}
          onClick={() => window.open(credentialUrl, '_blank')}
        >
          확인
        </Button>
      );
    },
  },
  {
    title: '정렬 순서',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 100,
    sorter: (a, b) => a.sortOrder - b.sortOrder,
  },
];

