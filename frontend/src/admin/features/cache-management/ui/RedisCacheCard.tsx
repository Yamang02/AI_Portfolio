/**
 * Redis Cache Card Component
 * Redis 캐시 정보를 표시하는 카드 컴포넌트
 */

import React from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  DatabaseOutlined,
  CloudServerOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { CacheStats } from '../../../entities/cache';

const { Text } = Typography;

interface RedisCacheCardProps {
  stats?: CacheStats;
  loading: boolean;
  onOpenModal: () => void;
}

export const RedisCacheCard: React.FC<RedisCacheCardProps> = ({
  stats,
  loading,
  onOpenModal,
}) => {
  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <DatabaseOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Redis Cache
              </Typography.Title>
              <Text type="secondary">캐시 관리 시스템</Text>
            </div>
          </Space>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={onOpenModal}
          >
            관리
          </Button>
        </div>

        {/* 통계 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title={
                <Space>
                  <CloudServerOutlined />
                  <span>전체 키</span>
                </Space>
              }
              value={stats?.totalKeys ?? 0}
              loading={loading}
              suffix="개"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>세션 키</span>
                </Space>
              }
              value={stats?.sessionKeys ?? 0}
              loading={loading}
              suffix="개"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Space>
                  <LineChartOutlined />
                  <span>메모리 사용</span>
                </Space>
              }
              value={stats?.usedMemory ?? '0B'}
              loading={loading}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Space>
                  <LineChartOutlined />
                  <span>최대 메모리</span>
                </Space>
              }
              value={stats?.usedMemoryPeak ?? '0B'}
              loading={loading}
            />
          </Col>
        </Row>

        {/* 추가 정보 */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">캐시 키:</Text>
              <Text strong>{stats?.cacheKeys ?? 0}개</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">단편화 비율:</Text>
              <Text strong>{stats?.memoryFragmentationRatio ?? '0'}</Text>
            </div>
          </Space>
        </div>
      </Space>
    </Card>
  );
};
