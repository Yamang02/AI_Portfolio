/**
 * Redis Cache Modal Component
 * Redis 캐시를 제어하는 모달 컴포넌트
 */

import React, { useState } from 'react';
import { Modal, Tabs, Button, Space, Popconfirm, Input, Form, Divider, Typography, Alert, List, Tag } from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  FilterOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { CacheStats } from '../../../entities/cache';
import { useAllCacheKeys } from '../../../entities/cache';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface RedisCacheModalProps {
  visible: boolean;
  onClose: () => void;
  stats?: CacheStats;
  onClearAll: () => void;
  onClearPattern: (pattern: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const RedisCacheModal: React.FC<RedisCacheModalProps> = ({
  visible,
  onClose,
  stats,
  onClearAll,
  onClearPattern,
  onRefresh,
  loading,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  // 캐시 키 목록 조회
  const { data: cacheKeys, isLoading: keysLoading, refetch: refetchKeys } = useAllCacheKeys();

  const handleClearPattern = async () => {
    try {
      const values = await form.validateFields();
      onClearPattern(values.pattern);
      form.resetFields();
    } catch {
      // Validation 실패 - 폼이 자동으로 에러 표시
    }
  };

  const handleViewKeys = () => {
    setActiveTab('3');
    refetchKeys();
  };

  const commonPatterns = [
    { label: '세션 캐시', pattern: 'spring:session:*' },
    { label: '일반 캐시', pattern: 'cache:*' },
    { label: '모든 캐시', pattern: '*' },
  ];

  // 캐시 키를 카테고리별로 분류
  const categorizedKeys = React.useMemo(() => {
    if (!cacheKeys) return { session: [], portfolio: [], github: [], other: [] };

    return {
      session: cacheKeys.filter(key => key.startsWith('spring:session:')),
      portfolio: cacheKeys.filter(key => key.startsWith('portfolio::')),
      github: cacheKeys.filter(key => key.startsWith('github::')),
      other: cacheKeys.filter(key =>
        !key.startsWith('spring:session:') &&
        !key.startsWith('portfolio::') &&
        !key.startsWith('github::')
      ),
    };
  }, [cacheKeys]);

  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined />
          <span>Redis 캐시 관리</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="통계 정보" key="1">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="실시간 캐시 통계"
              description="현재 Redis 캐시의 상태를 확인할 수 있습니다."
              type="info"
              showIcon
            />

            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>전체 키 개수:</Text>
                  <Text>{stats?.totalKeys ?? 0}개</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>세션 키:</Text>
                  <Text>{stats?.sessionKeys ?? 0}개</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>캐시 키:</Text>
                  <Text>{stats?.cacheKeys ?? 0}개</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>메모리 사용량:</Text>
                  <Text>{stats?.usedMemory ?? '0B'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>최대 메모리:</Text>
                  <Text>{stats?.usedMemoryPeak ?? '0B'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>단편화 비율:</Text>
                  <Text>{stats?.memoryFragmentationRatio ?? '0'}</Text>
                </div>
              </Space>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              block
            >
              통계 새로고침
            </Button>
          </Space>
        </TabPane>

        <TabPane tab="캐시 삭제" key="2">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="주의"
              description="캐시 삭제는 되돌릴 수 없습니다. 신중하게 진행해주세요."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
            />

            {/* 전체 삭제 */}
            <div>
              <Title level={5}>전체 캐시 삭제</Title>
              <Text type="secondary">모든 캐시 데이터를 삭제합니다.</Text>
              <div style={{ marginTop: '12px' }}>
                <Popconfirm
                  title="전체 캐시 삭제"
                  description="정말로 모든 캐시를 삭제하시겠습니까?"
                  onConfirm={onClearAll}
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} loading={loading}>
                    전체 캐시 삭제
                  </Button>
                </Popconfirm>
              </div>
            </div>

            <Divider />

            {/* 패턴별 삭제 */}
            <div>
              <Title level={5}>패턴별 캐시 삭제</Title>
              <Text type="secondary">특정 패턴과 일치하는 캐시만 삭제합니다.</Text>

              <Form form={form} layout="vertical" style={{ marginTop: '12px' }}>
                <Form.Item
                  name="pattern"
                  label="삭제 패턴"
                  rules={[{ required: true, message: '패턴을 입력해주세요' }]}
                >
                  <Input
                    placeholder="예: spring:session:*, cache:*"
                    prefix={<FilterOutlined />}
                  />
                </Form.Item>

                <Space wrap>
                  {commonPatterns.map((item) => (
                    <Button
                      key={item.pattern}
                      size="small"
                      onClick={() => form.setFieldsValue({ pattern: item.pattern })}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Space>

                <div style={{ marginTop: '16px' }}>
                  <Popconfirm
                    title="패턴별 캐시 삭제"
                    description="해당 패턴과 일치하는 캐시를 삭제하시겠습니까?"
                    onConfirm={handleClearPattern}
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={loading}>
                      패턴 삭제
                    </Button>
                  </Popconfirm>
                </div>
              </Form>
            </div>
          </Space>
        </TabPane>

        <TabPane tab={
          <Space>
            <UnorderedListOutlined />
            <span>캐시 키 목록</span>
          </Space>
        } key="3">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="캐시 키 탐색"
              description="현재 Redis에 저장된 모든 캐시 키를 확인할 수 있습니다."
              type="info"
              showIcon
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchKeys()}
              loading={keysLoading}
              block
            >
              키 목록 새로고침
            </Button>

            <div>
              <Title level={5}>세션 키 ({categorizedKeys.session.length})</Title>
              <List
                size="small"
                bordered
                dataSource={categorizedKeys.session}
                renderItem={(key) => (
                  <List.Item>
                    <Text code copyable ellipsis style={{ maxWidth: '100%' }}>
                      {key}
                    </Text>
                    <Tag color="blue">Session</Tag>
                  </List.Item>
                )}
                style={{ maxHeight: '150px', overflow: 'auto' }}
                locale={{ emptyText: '세션 키가 없습니다.' }}
              />
            </div>

            <div>
              <Title level={5}>포트폴리오 캐시 ({categorizedKeys.portfolio.length})</Title>
              <List
                size="small"
                bordered
                dataSource={categorizedKeys.portfolio}
                renderItem={(key) => (
                  <List.Item>
                    <Text code copyable ellipsis style={{ maxWidth: '100%' }}>
                      {key}
                    </Text>
                    <Tag color="green">Portfolio</Tag>
                  </List.Item>
                )}
                style={{ maxHeight: '150px', overflow: 'auto' }}
                locale={{ emptyText: '포트폴리오 캐시가 없습니다.' }}
              />
            </div>

            {categorizedKeys.other.length > 0 && (
              <div>
                <Title level={5}>기타 ({categorizedKeys.other.length})</Title>
                <List
                  size="small"
                  bordered
                  dataSource={categorizedKeys.other}
                  renderItem={(key) => (
                    <List.Item>
                      <Text code copyable ellipsis style={{ maxWidth: '100%' }}>
                        {key}
                      </Text>
                      <Tag>Other</Tag>
                    </List.Item>
                  )}
                  style={{ maxHeight: '150px', overflow: 'auto' }}
                />
              </div>
            )}
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  );
};
