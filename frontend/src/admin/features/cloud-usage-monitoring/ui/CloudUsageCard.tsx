import React, { useMemo, useState } from 'react';
import { Card, Statistic, Spin, Alert, Row, Col, Radio } from 'antd';
import { CloudUsage, CloudProvider } from '../../../entities/cloud-usage';

interface CloudUsageCardProps {
  usage: CloudUsage | undefined;
  isLoading: boolean;
  error: Error | null;
  provider: CloudProvider;
  trends30Days?: {
    daily: any;
    monthly: any;
    isLoading: boolean;
    error: Error | null;
  };
  onGranularityChange?: (granularity: 'daily' | 'monthly') => void;
}

/**
 * Currency에 맞는 포맷 반환
 * @param value - 금액
 * @param currency - 통화
 * @param provider - 클라우드 프로바이더 (GCP는 소수점 없이, AWS는 소수점 2자리)
 */
const formatCurrency = (value: number, currency: string, provider?: CloudProvider): string => {
  const isGCP = provider === CloudProvider.GCP;

  switch (currency) {
    case 'USD':
      return isGCP ? value.toFixed(0) : value.toFixed(2);
    case 'KRW':
      return value.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    default:
      return isGCP ? value.toFixed(0) : value.toFixed(2);
  }
};

/**
 * Currency에 맞는 접두사 기호 반환
 */
const getCurrencyPrefix = (currency: string): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'KRW':
      return '₩';
    default:
      return '';
  }
};

/**
 * 기간 평균 일일 비용 계산
 */
const calculateAverageDailyCost = (currentCost: number, period: { startDate: string; endDate: string }): number => {
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  // 기간 총 일수
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) {
    return currentCost;
  }

  // 평균 일일 비용
  return currentCost / totalDays;
};

/**
 * 클라우드 사용량 카드 컴포넌트
 */
export const CloudUsageCard: React.FC<CloudUsageCardProps> = ({
  usage,
  isLoading,
  error,
  provider,
  trends30Days,
  onGranularityChange,
}) => {
  // AWS는 기본 월별, GCP는 기본 일별
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>(
    provider === CloudProvider.AWS ? 'monthly' : 'daily'
  );

  const averageDailyCost = useMemo(() => {
    if (!usage || !usage.period) return null;
    return calculateAverageDailyCost(usage.totalCost, usage.period);
  }, [usage]);

  const handleGranularityChange = (value: 'daily' | 'monthly') => {
    setGranularity(value);
    onGranularityChange?.(value);
  };

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

  // GCP는 KRW, AWS는 USD (프로바이더에 따라 강제 설정)
  const displayCurrency = provider === CloudProvider.AWS ? 'USD' : 'KRW';
  const currencyPrefix = getCurrencyPrefix(displayCurrency);

  // AWS는 지난 6개월, GCP는 최근 30일
  const periodLabel = provider === CloudProvider.AWS ? '지난 6개월' : '최근 30일';

  return (
    <Card>
      {/* 일별/월별 토글 (지난 30일간) */}
      {trends30Days && (
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Radio.Group
            value={granularity}
            onChange={(e) => handleGranularityChange(e.target.value)}
            size="small"
          >
            <Radio.Button value="daily">일별</Radio.Button>
            <Radio.Button value="monthly">월별</Radio.Button>
          </Radio.Group>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title={`${providerName} ${periodLabel} 비용`}
            value={formatCurrency(usage.totalCost, displayCurrency, provider)}
            prefix={currencyPrefix}
            valueStyle={{ color }}
          />
        </Col>
        <Col xs={24} sm={12}>
          {averageDailyCost !== null && (
            <Statistic
              title={`${providerName} 평균 일일 비용`}
              value={formatCurrency(averageDailyCost, displayCurrency, provider)}
              prefix={currencyPrefix}
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
