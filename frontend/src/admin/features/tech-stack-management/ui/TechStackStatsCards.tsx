/**
 * 기술 스택 통계 카드 컴포넌트
 */

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ToolOutlined, CheckCircleOutlined, StarOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { TechStackStats } from '../../entities/tech-stack';
import styles from './TechStackStatsCards.module.css';

interface TechStackStatsCardsProps {
  stats: TechStackStats;
}

export const TechStackStatsCards: React.FC<TechStackStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={16} className={styles.statsRow}>
      <Col span={6}>
        <Card>
          <Statistic
            title="전체 기술"
            value={stats.total}
            prefix={<ToolOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="활성 기술"
            value={stats.active}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="핵심 기술"
            value={stats.core}
            prefix={<StarOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="카테고리 수"
            value={stats.categories}
            prefix={<AppstoreOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};
