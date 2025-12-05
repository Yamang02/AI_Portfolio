import React, { useState } from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import {
  useAwsCurrentUsage,
  useAwsUsageTrend30Days,
  useAwsUsageTrend6Months,
  useAwsBreakdown,
  useGcpCurrentUsage,
  useGcpUsageTrend30Days,
  useGcpUsageTrend6Months,
  useGcpBreakdown,
  CloudProvider,
} from '../../../entities/cloud-usage';
import { CloudUsageCard } from './CloudUsageCard';
import { UsageTrendChart } from './UsageTrendChart';
import { ServiceBreakdownTable } from './ServiceBreakdownTable';
import { CostSearchSection } from './CostSearchSection';

const { Title } = Typography;

/**
 * 클라우드 사용량 모니터링 섹션
 */
export const CloudUsageSection: React.FC = () => {
  // AWS 데이터
  const { data: awsUsage, isLoading: awsLoading, error: awsError } = useAwsCurrentUsage();
  const [awsGranularity, setAwsGranularity] = useState<'daily' | 'monthly'>('monthly');
  const { data: awsTrends30DaysDaily, isLoading: awsTrend30DaysDailyLoading, error: awsTrend30DaysDailyError } = 
    useAwsUsageTrend30Days('daily');
  const { data: awsTrends30DaysMonthly, isLoading: awsTrend30DaysMonthlyLoading, error: awsTrend30DaysMonthlyError } = 
    useAwsUsageTrend30Days('monthly');
  const { data: awsTrends6Months, isLoading: awsTrend6MonthsLoading, error: awsTrend6MonthsError } = 
    useAwsUsageTrend6Months();
  const { data: awsBreakdown, isLoading: awsBreakdownLoading, error: awsBreakdownError } = useAwsBreakdown();

  // GCP 데이터
  const { data: gcpUsage, isLoading: gcpLoading, error: gcpError } = useGcpCurrentUsage();
  const [gcpGranularity, setGcpGranularity] = useState<'daily' | 'monthly'>('daily');
  const { data: gcpTrends30DaysDaily, isLoading: gcpTrend30DaysDailyLoading, error: gcpTrend30DaysDailyError } = 
    useGcpUsageTrend30Days('daily');
  const { data: gcpTrends30DaysMonthly, isLoading: gcpTrend30DaysMonthlyLoading, error: gcpTrend30DaysMonthlyError } = 
    useGcpUsageTrend30Days('monthly');
  const { data: gcpTrends6Months, isLoading: gcpTrend6MonthsLoading, error: gcpTrend6MonthsError } = 
    useGcpUsageTrend6Months();
  const { data: gcpBreakdown, isLoading: gcpBreakdownLoading, error: gcpBreakdownError } = useGcpBreakdown();

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <CloudOutlined /> 클라우드 사용량 모니터링
      </Title>

      {/* AWS 섹션 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#ff9900' }}>
          AWS
        </Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <CloudUsageCard
              usage={awsUsage}
              isLoading={awsLoading}
              error={awsError}
              provider={CloudProvider.AWS}
              trends30Days={{
                daily: awsTrends30DaysDaily,
                monthly: awsTrends30DaysMonthly,
                isLoading: awsTrend30DaysDailyLoading || awsTrend30DaysMonthlyLoading,
                error: awsTrend30DaysDailyError || awsTrend30DaysMonthlyError,
              }}
              onGranularityChange={setAwsGranularity}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UsageTrendChart
              trends={awsTrends6Months}
              isLoading={awsTrend6MonthsLoading}
              error={awsTrend6MonthsError}
              title="AWS 비용 추이 (지난 6개월, 월별)"
              provider={CloudProvider.AWS}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ServiceBreakdownTable
              services={awsBreakdown?.awsTop5 || []}
              isLoading={awsBreakdownLoading}
              error={awsBreakdownError}
              title="AWS 서비스별 비용 (Top 5)"
            />
          </Col>
        </Row>
      </div>

      <Divider />

      {/* GCP 섹션 */}
      <div>
        <Title level={4} style={{ marginBottom: '16px', color: '#4285f4' }}>
          GCP
        </Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <CloudUsageCard
              usage={gcpUsage}
              isLoading={gcpLoading}
              error={gcpError}
              provider={CloudProvider.GCP}
              trends30Days={{
                daily: gcpTrends30DaysDaily,
                monthly: gcpTrends30DaysMonthly,
                isLoading: gcpTrend30DaysDailyLoading || gcpTrend30DaysMonthlyLoading,
                error: gcpTrend30DaysDailyError || gcpTrend30DaysMonthlyError,
              }}
              onGranularityChange={setGcpGranularity}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UsageTrendChart
              trends={gcpTrends6Months}
              isLoading={gcpTrend6MonthsLoading}
              error={gcpTrend6MonthsError}
              title="GCP 비용 추이 (지난 6개월, 월별)"
              provider={CloudProvider.GCP}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ServiceBreakdownTable
              services={gcpBreakdown?.gcpTop5 || []}
              isLoading={gcpBreakdownLoading}
              error={gcpBreakdownError}
              title="GCP 서비스별 비용 (Top 5)"
            />
          </Col>
        </Row>
      </div>

      {/* 비용 검색 섹션 (아코디언) */}
      <CostSearchSection />
    </div>
  );
};

