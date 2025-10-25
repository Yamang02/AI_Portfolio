/**
 * Education 통계 카드 컴포넌트
 */

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import type { EducationStats } from '@/admin/entities/education';

interface EducationStatsCardsProps {
  stats: EducationStats;
}

export const EducationStatsCards: React.FC<EducationStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="전체 교육" value={stats.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="진행중" value={stats.ongoing} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="대학교" value={stats.byType.UNIVERSITY} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="부트캠프" value={stats.byType.BOOTCAMP} />
        </Card>
      </Col>
    </Row>
  );
};
