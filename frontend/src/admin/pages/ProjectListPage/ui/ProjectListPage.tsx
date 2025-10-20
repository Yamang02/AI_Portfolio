import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProjectList } from '../../features/project-list';
import { useAdminProjectsQuery } from '../../../../main/entities/project';

const { Title } = Typography;

/**
 * 프로젝트 목록 페이지
 */
const ProjectListPage: React.FC = () => {
    const { data: projects = [], isLoading } = useAdminProjectsQuery();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>
                    프로젝트 관리
                </Title>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />}>
                        새 프로젝트
                    </Button>
                </Space>
            </div>
            
            <Card>
                <ProjectList
                    projects={projects}
                    isLoading={isLoading}
                    showFilter={true}
                />
            </Card>
        </div>
    );
};

export default ProjectListPage;
