/**
 * 통계 카드 컴포넌트
 * 
 * 여러 통계 정보를 카드 형태로 표시하는 컴포넌트
 */

import { Card, Statistic, Row, Col } from 'antd';

export interface StatCardData {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  valueStyle?: React.CSSProperties;
}

export interface StatsCardsProps {
  stats: StatCardData[];
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <Row gutter={16}>
      {stats.map((stat, index) => (
        <Col key={index} span={24 / stats.length}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              valueStyle={stat.valueStyle}
              loading={loading}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
