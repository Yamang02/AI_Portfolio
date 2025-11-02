import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 경력 목록 컴포넌트
 */
const ExperienceList: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                경력 관리
            </Title>
            
            <Card>
                <p>경력 목록이 여기에 표시됩니다.</p>
                <p>구현 예정: 경력 CRUD, 타임라인 뷰, 성과 관리</p>
            </Card>
        </div>
    );
};

export { ExperienceList };
