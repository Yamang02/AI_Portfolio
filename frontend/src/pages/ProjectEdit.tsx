import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

/**
 * 프로젝트 편집 컴포넌트
 */
const ProjectEdit: React.FC = () => {
    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                프로젝트 편집
            </Title>
            
            <Card>
                <p>프로젝트 편집 폼이 여기에 표시됩니다.</p>
                <p>구현 예정: 마크다운 에디터, 이미지 업로드, 기술 스택 선택</p>
            </Card>
        </div>
    );
};

export default ProjectEdit;
