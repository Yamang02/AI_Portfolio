import React from 'react';
import { Card, Table, Spin, Alert, Empty } from 'antd';
import { ServiceCost } from '../../../entities/cloud-usage';
import { formatCurrency } from '../../../shared/lib/currencyFormatter';
import type { ColumnsType } from 'antd/es/table';

interface ServiceBreakdownTableProps {
  services: ServiceCost[];
  isLoading: boolean;
  error: Error | null;
  title: string;
}

/**
 * 서비스별 비용 분석 테이블 컴포넌트
 */
export const ServiceBreakdownTable: React.FC<ServiceBreakdownTableProps> = ({
  services,
  isLoading,
  error,
  title,
}) => {
  if (error) {
    return (
      <Card title={title}>
        <Alert
          message="데이터 조회 실패"
          description={error.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title={title}>
        <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '40px' }} />
      </Card>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Card title={title}>
        <Empty description="서비스 데이터가 없습니다." />
      </Card>
    );
  }

  const columns: ColumnsType<ServiceCost> = [
    {
      title: '서비스명',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: '비용',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number, record: ServiceCost) =>
        formatCurrency(cost, record.unit),
      sorter: (a, b) => a.cost - b.cost,
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <Card title={title}>
      <Table
        columns={columns}
        dataSource={services.map((service, index) => ({ ...service, key: index }))}
        pagination={false}
        size="small"
      />
    </Card>
  );
};










