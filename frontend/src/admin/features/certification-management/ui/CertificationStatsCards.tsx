/**
 * Certification 통계 카드 컴포넌트
 */

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import type { CertificationStats } from '@/admin/entities/certification';

interface CertificationStatsCardsProps {
  stats: CertificationStats;
}

export const CertificationStatsCards: React.FC<CertificationStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card>
          <Statistic title="전체 자격증" value={stats.total} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic 
            title="만료됨" 
            value={stats.expired} 
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic 
            title="만료 임박 (3개월 이내)" 
            value={stats.expiringSoon} 
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

