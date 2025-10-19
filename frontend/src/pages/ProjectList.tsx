import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 프로젝트 목록 컴포넌트
 */
const ProjectList: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                프로젝트 관리
            </Title>
            
            <Card>
                <p>프로젝트 목록이 여기에 표시됩니다.</p>
                <p>구현 예정: 프로젝트 CRUD, 필터링, 검색 기능</p>
            </Card>
        </div>
    );
};

export default ProjectList;
