import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 자격증 목록 컴포넌트
 */
const CertificationList: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                자격증 관리
            </Title>
            
            <Card>
                <p>자격증 목록이 여기에 표시됩니다.</p>
                <p>구현 예정: 자격증 CRUD, 만료일 관리, 인증서 이미지</p>
            </Card>
        </div>
    );
};

export { CertificationList };
