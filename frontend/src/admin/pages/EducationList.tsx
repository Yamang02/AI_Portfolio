import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 교육 목록 컴포넌트
 */
const EducationList: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                교육 관리
            </Title>
            
            <Card>
                <p>교육 목록이 여기에 표시됩니다.</p>
                <p>구현 예정: 교육 CRUD, 학위 관리, GPA 표시</p>
            </Card>
        </div>
    );
};

export default EducationList;
