import React, { useMemo } from 'react';
import { Card, Statistic, Spin, Alert, Row, Col } from 'antd';
import { CloudUsage, CloudProvider } from '../../../entities/cloud-usage';
import { formatCurrencySeparate } from '../../../shared/lib';

interface CloudUsageCardProps {
  usage: CloudUsage | undefined;
  isLoading: boolean;
  error: Error | null;
  provider: CloudProvider;
}

/**
 * 이번달 예상 청구비용 계산
 */
const calculateEstimatedBill = (currentCost: number, period: { startDate: string; endDate: string }): number => {
  const today = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  // 이번달 총 일수
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 오늘까지 경과 일수
  const elapsedDays = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // 예상 청구비용 = 현재 비용 * (총 일수 / 경과 일수)
  if (elapsedDays >= totalDays) {
    return currentCost; // 이미 월말이면 현재 비용 반환
  }

  return (currentCost / elapsedDays) * totalDays;
};

/**
 * 클라우드 사용량 카드 컴포넌트
 */
export const CloudUsageCard: React.FC<CloudUsageCardProps> = ({
  usage,
  isLoading,
  error,
  provider,
}) => {
  const estimatedBill = useMemo(() => {
    if (!usage || !usage.period) return null;
    return calculateEstimatedBill(usage.totalCost, usage.period);
  }, [usage]);

  if (error) {
    return (
      <Card>
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
      <Card>
        <Spin size="large" />
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <Alert
          message="데이터 없음"
          description="클라우드 사용량 데이터가 없습니다."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const providerName = provider === CloudProvider.AWS ? 'AWS' : 'GCP';
  const color = provider === CloudProvider.AWS ? '#ff9900' : '#4285f4';
  const { prefix, value: currentCostFormatted } = formatCurrencySeparate(usage.totalCost, usage.currency);
  const { value: estimatedBillFormatted } = estimatedBill !== null
    ? formatCurrencySeparate(estimatedBill, usage.currency)
    : { value: '' };

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title={`${providerName} 현재 월 비용`}
            value={currentCostFormatted}
            prefix={prefix}
            valueStyle={{ color }}
          />
        </Col>
        <Col xs={24} sm={12}>
          {estimatedBill !== null && (
            <Statistic
              title={`${providerName} 이번달 예상 청구비용`}
              value={estimatedBillFormatted}
              prefix={prefix}
              valueStyle={{ color: '#52c41a' }}
            />
          )}
        </Col>
      </Row>
      {usage.lastUpdated && (
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
          마지막 업데이트: {new Date(usage.lastUpdated).toLocaleDateString('ko-KR')}
        </div>
      )}
    </Card>
  );
};

