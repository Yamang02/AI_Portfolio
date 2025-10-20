import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { FolderOutlined, ToolOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { useAdminProjectsQuery } from '../../entities/project';

const { Title } = Typography;

/**
 * 대시보드 페이지
 */
const DashboardPage: React.FC = () => {
    const { data: projects = [] } = useAdminProjectsQuery();

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
                            value={projects.length}
                            prefix={<FolderOutlined />}
                            valueStyle={{ color: '#8b5cf6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="완료된 프로젝트"
                            value={projects.filter(p => p.status === 'completed').length}
                            prefix={<ToolOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="진행중인 프로젝트"
                            value={projects.filter(p => p.status === 'in_progress').length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="팀 프로젝트"
                            value={projects.filter(p => p.isTeam).length}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="최근 프로젝트" style={{ height: '400px' }}>
                        <div className="space-y-3">
                            {projects.slice(0, 5).map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                                        <p className="text-sm text-gray-600">{project.type}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        project.status === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : project.status === 'in_progress'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {project.status === 'completed' ? '완료' : 
                                         project.status === 'in_progress' ? '진행중' : '유지보수'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                    <Card title="프로젝트 통계" style={{ height: '400px' }}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">개발 프로젝트</span>
                                <span className="font-medium">
                                    {projects.filter(p => p.type === 'BUILD').length}개
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">실험 프로젝트</span>
                                <span className="font-medium">
                                    {projects.filter(p => p.type === 'LAB').length}개
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">유지보수</span>
                                <span className="font-medium">
                                    {projects.filter(p => p.type === 'MAINTENANCE').length}개
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">개인 프로젝트</span>
                                <span className="font-medium">
                                    {projects.filter(p => !p.isTeam).length}개
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
