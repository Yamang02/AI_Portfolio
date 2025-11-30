import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { FolderOutlined, ToolOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { CloudUsageSection } from '../features/cloud-usage-monitoring';

const { Title } = Typography;

/**
 * 대시보드 컴포넌트
 */
const Dashboard: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                대시보드
            </Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="총 프로젝트"
                            value={12}
                            prefix={<FolderOutlined />}
                            valueStyle={{ color: '#8b5cf6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="스킬 수"
                            value={25}
                            prefix={<ToolOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="경력 수"
                            value={3}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="교육/자격증"
                            value={8}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="최근 활동" style={{ height: '300px' }}>
                        <p>최근 프로젝트 업데이트가 없습니다.</p>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="통계" style={{ height: '300px' }}>
                        <p>통계 데이터가 없습니다.</p>
                    </Card>
                </Col>
            </Row>

            {/* 클라우드 사용량 모니터링 섹션 */}
            <CloudUsageSection />
        </div>
    );
};

export { Dashboard };
