import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';

interface StatItem {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
}

interface StatsCardsProps {
  items: StatItem[];
  span?: number;
}

/**
 * 재사용 가능한 통계 카드 컴포넌트
 *
 * 책임: 공통 통계 정보 표시
 */
export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  span = 6,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      {items.map((item, index) => (
        <Col span={span} key={index}>
          <Card>
            <Statistic
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              prefix={item.prefix}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

