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
      return '\u20A9'; // 원화 기호 (₩) - 유니코드로 명시
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

  // 모든 훅은 early return 전에 호출해야 함!
  
  // 30일 트렌드 데이터에서 선택된 granularity에 따른 비용 계산
  const trendCost = useMemo(() => {
    try {
      if (!trends30Days) return null;
      
      const trendData = granularity === 'daily' ? trends30Days.daily : trends30Days.monthly;
      if (!trendData || !Array.isArray(trendData) || trendData.length === 0) return null;
      
      // 선택된 granularity의 총 비용 합계
      return trendData.reduce((sum, item) => {
        if (!item || typeof item !== 'object') return sum;
        const cost = provider === CloudProvider.AWS 
          ? (item.awsCost ?? item.cost ?? 0)
          : (item.gcpCost ?? item.cost ?? 0);
        return sum + (typeof cost === 'number' ? cost : 0);
      }, 0);
    } catch (error) {
      console.error('trendCost 계산 에러:', error);
      return null;
    }
  }, [trends30Days, granularity, provider]);

  const averageDailyCost = useMemo(() => {
    try {
      if (!usage || !usage.period) return null;
      if (typeof usage.totalCost !== 'number' || isNaN(usage.totalCost)) return null;
      return calculateAverageDailyCost(usage.totalCost, usage.period);
    } catch (error) {
      console.error('averageDailyCost 계산 에러:', error);
      return null;
    }
  }, [usage]);

  // 표시할 비용: trends30Days가 있으면 트렌드 합계, 없으면 현재 월 비용
  const displayCost = trendCost !== null && trendCost !== undefined 
    ? trendCost 
    : (usage?.totalCost ?? 0);
  const periodLabel = trends30Days 
    ? (granularity === 'daily' ? '최근 30일 일별 합계' : '최근 30일 월별 합계')
    : (provider === CloudProvider.AWS ? '현재 월 비용' : '현재 월 비용');

  const providerName = provider === CloudProvider.AWS ? 'AWS' : 'GCP';
  const color = provider === CloudProvider.AWS ? '#ff9900' : '#4285f4';
  const displayCurrency = provider === CloudProvider.AWS ? 'USD' : 'KRW';
  const currencyPrefix = getCurrencyPrefix(displayCurrency);

  const handleGranularityChange = (value: 'daily' | 'monthly') => {
    setGranularity(value);
    onGranularityChange?.(value);
  };

  // early return은 모든 훅 호출 후에
  if (isLoading) {
    return (
      <Card>
        <Spin size="large" />
      </Card>
    );
  }

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

  if (!usage) {
    return (
      <Card>
        <Alert
          message="데이터 없음"
          description="클라우드 사용량 데이터가 없습니다."
          type="info"
          showIcon
        />
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12}>
            <Statistic
              title={`${providerName} 현재 월 비용`}
              value={0}
              prefix={currencyPrefix}
              valueStyle={{ color }}
            />
          </Col>
        </Row>
      </Card>
    );
  }

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
            title={`${providerName} ${periodLabel}`}
            value={formatCurrency(displayCost || 0, displayCurrency, provider)}
            prefix={currencyPrefix}
            valueStyle={{ color }}
          />
        </Col>
        <Col xs={24} sm={12}>
          {averageDailyCost !== null && averageDailyCost !== undefined && !isNaN(averageDailyCost) && (
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
