/**
 * Settings Page
 * 관리자 설정 페이지
 */

import React, { useState } from 'react';
import { Typography, Row, Col } from 'antd';
import { RedisCacheCard, RedisCacheModal } from '../features/cache-management';
import {
  useCacheStats,
  useClearAllCache,
  useClearCacheByPattern,
} from '../entities/cache';

const { Title, Paragraph } = Typography;

export const Settings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // React Query 훅
  const { data: stats, isLoading, refetch } = useCacheStats();
  const clearAllMutation = useClearAllCache();
  const clearPatternMutation = useClearCacheByPattern();

  const handleClearAll = () => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleClearPattern = (pattern: string) => {
    clearPatternMutation.mutate(pattern, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>시스템 설정</Title>
        <Paragraph type="secondary">
          관리자 시스템 설정 및 캐시 관리를 할 수 있습니다.
        </Paragraph>
      </div>

      {/* 설정 카드 그리드 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <RedisCacheCard
            stats={stats}
            loading={isLoading}
            onOpenModal={() => setModalVisible(true)}
          />
        </Col>

        {/* 추가 설정 카드들을 여기에 추가할 수 있습니다 */}
      </Row>

      {/* Redis 캐시 관리 모달 */}
      <RedisCacheModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        stats={stats}
        onClearAll={handleClearAll}
        onClearPattern={handleClearPattern}
        onRefresh={handleRefresh}
        loading={clearAllMutation.isPending || clearPatternMutation.isPending}
      />
    </div>
  );
};
