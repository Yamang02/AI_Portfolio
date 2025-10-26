/**
 * Experience 통계 카드 컴포넌트
 */

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import type { ExperienceStats } from '@/admin/entities/experience';

interface ExperienceStatsCardsProps {
  stats: ExperienceStats;
}

export const ExperienceStatsCards: React.FC<ExperienceStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="전체" value={stats.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="정규직" value={stats.byType.FULL_TIME} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="계약직" value={stats.byType.CONTRACT} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="프리랜서" value={stats.byType.FREELANCE} />
        </Card>
      </Col>
    </Row>
  );
};
