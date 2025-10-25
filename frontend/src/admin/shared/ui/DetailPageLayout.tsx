import React from 'react';
import { Card, Button, Space, Descriptions, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface DetailPageLayoutProps {
  title: string;
  loading?: boolean;
  onEdit?: () => void;
  onBack?: () => void;
  backUrl?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 재사용 가능한 상세 페이지 레이아웃
 *
 * 책임: 공통 상세 페이지 UI 구조
 */
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  title,
  loading = false,
  onEdit,
  onBack,
  backUrl,
  extra,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              뒤로
            </Button>
            <span>{title}</span>
          </Space>
        }
        extra={
          <Space>
            {extra}
            {onEdit && (
              <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
                수정
              </Button>
            )}
          </Space>
        }
      >
        {children}
      </Card>
    </Spin>
  );
};

/**
 * 상세 정보 표시용 Descriptions 래퍼
 */
interface DetailDescriptionsProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
    span?: number;
  }>;
  column?: number;
}

export const DetailDescriptions: React.FC<DetailDescriptionsProps> = ({
  items,
  column = 2,
}) => {
  return (
    <Descriptions bordered column={column}>
      {items.map((item, index) => (
        <Descriptions.Item key={index} label={item.label} span={item.span}>
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
};

