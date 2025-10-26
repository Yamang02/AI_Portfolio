/**
 * 재사용 가능한 관리 페이지 레이아웃
 * 
 * 공통 구조:
 * - 페이지 헤더 (제목 + 추가 버튼)
 * - 통계 카드
 * - 필터
 * - 테이블
 */

import React from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ManagementPageLayoutProps {
  title: string;
  buttonText: string;
  onAdd?: () => void;
  statsCards?: React.ReactNode;
  filter?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 관리 페이지 공통 레이아웃 컴포넌트
 * 
 * 책임:
 * - 페이지 헤더 (제목 + 추가 버튼) 렌더링
 * - 통계 카드, 필터, 콘텐츠 영역 레이아웃 제공
 */
export const ManagementPageLayout: React.FC<ManagementPageLayoutProps> = ({
  title,
  buttonText,
  onAdd,
  statsCards,
  filter,
  children,
}) => {
  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {title}
            </Title>
          </Col>
          <Col>
            {onAdd && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                {buttonText}
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {/* 통계 카드 */}
      {statsCards && <div style={{ marginBottom: 24 }}>{statsCards}</div>}

      {/* 필터 */}
      {filter}

      {/* 메인 콘텐츠 (테이블 등) */}
      <Card>{children}</Card>
    </div>
  );
};

