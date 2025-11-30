import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import {
  useAwsCurrentUsage,
  useAwsUsageTrend,
  useAwsBreakdown,
  useGcpCurrentUsage,
  useGcpUsageTrend,
  useGcpBreakdown,
  CloudProvider,
} from '../../../entities/cloud-usage';
import { CloudUsageCard } from './CloudUsageCard';
import { UsageTrendChart } from './UsageTrendChart';
import { ServiceBreakdownTable } from './ServiceBreakdownTable';

const { Title } = Typography;

/**
 * 클라우드 사용량 모니터링 섹션
 */
export const CloudUsageSection: React.FC = () => {
  // AWS 데이터
  const { data: awsUsage, isLoading: awsLoading, error: awsError } = useAwsCurrentUsage();
  const { data: awsTrends, isLoading: awsTrendLoading, error: awsTrendError } = useAwsUsageTrend(30);
  const { data: awsBreakdown, isLoading: awsBreakdownLoading, error: awsBreakdownError } = useAwsBreakdown();

  // GCP 데이터
  const { data: gcpUsage, isLoading: gcpLoading, error: gcpError } = useGcpCurrentUsage();
  const { data: gcpTrends, isLoading: gcpTrendLoading, error: gcpTrendError } = useGcpUsageTrend(30);
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
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UsageTrendChart
              trends={awsTrends}
              isLoading={awsTrendLoading}
              error={awsTrendError}
              title="AWS 비용 추이 (최근 30일)"
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
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UsageTrendChart
              trends={gcpTrends}
              isLoading={gcpTrendLoading}
              error={gcpTrendError}
              title="GCP 비용 추이 (최근 30일)"
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
    </div>
  );
};

