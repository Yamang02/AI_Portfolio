import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 스킬 목록 컴포넌트
 */
const SkillList: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                스킬 관리
            </Title>
            
            <Card>
                <p>스킬 목록이 여기에 표시됩니다.</p>
                <p>구현 예정: 스킬 CRUD, 카테고리별 관리, 숙련도 설정</p>
            </Card>
        </div>
    );
};

export { SkillList };
