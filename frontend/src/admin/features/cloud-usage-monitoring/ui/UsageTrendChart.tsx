import React from 'react';
import { Card, Spin, Alert, Empty, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UsageTrend, CloudProvider } from '../../../entities/cloud-usage';
import { formatCurrency } from '../../../shared/lib';

interface UsageTrendChartProps {
  trends: UsageTrend[] | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  provider?: CloudProvider;
}

/**
 * 비용 추이 차트 컴포넌트
 */
export const UsageTrendChart: React.FC<UsageTrendChartProps> = ({
  trends,
  isLoading,
  error,
  title,
  provider,
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

  if (!trends || trends.length === 0) {
    return (
      <Card title={title}>
        <Empty description="추이 데이터가 없습니다." />
      </Card>
    );
  }

  // Provider에 따라 컬럼 동적 생성
  const columns: ColumnsType<UsageTrend> = [
    {
      title: '날짜',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
  ];

  // Provider가 지정된 경우 해당 provider의 컬럼만 추가
  if (provider === CloudProvider.AWS) {
    columns.push({
      title: 'AWS 비용 (USD)',
      dataIndex: 'awsCost',
      key: 'awsCost',
      render: (cost: number) => formatCurrency(cost, 'USD'),
      sorter: (a, b) => a.awsCost - b.awsCost,
    });
  } else if (provider === CloudProvider.GCP) {
    columns.push({
      title: 'GCP 비용 (KRW)',
      dataIndex: 'gcpCost',
      key: 'gcpCost',
      render: (cost: number) => formatCurrency(cost, 'KRW'),
      sorter: (a, b) => a.gcpCost - b.gcpCost,
    });
  } else {
    // Provider가 지정되지 않은 경우 (통합 뷰) - 기존처럼 둘 다 표시
    columns.push(
      {
        title: 'AWS 비용 (USD)',
        dataIndex: 'awsCost',
        key: 'awsCost',
        render: (cost: number) => formatCurrency(cost, 'USD'),
        sorter: (a, b) => a.awsCost - b.awsCost,
      },
      {
        title: 'GCP 비용 (KRW)',
        dataIndex: 'gcpCost',
        key: 'gcpCost',
        render: (cost: number) => formatCurrency(cost, 'KRW'),
        sorter: (a, b) => a.gcpCost - b.gcpCost,
      }
    );
  }

  return (
    <Card title={title}>
      <Table
        columns={columns}
        dataSource={trends.map((trend, index) => ({ ...trend, key: index }))}
        pagination={{ pageSize: 10 }}
        size="small"
      />
    </Card>
  );
};

