/**
 * 경력 및 학력 관리 페이지
 * Experience와 Education을 하나의 페이지에서 탭으로 관리
 */

import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { ReadOutlined, BankOutlined } from '@ant-design/icons';
import { EducationManagement } from './EducationManagement';
import { ExperienceManagement } from './ExperienceManagement';

const { Title } = Typography;

/**
 * 경력 및 학력 관리 페이지
 */
const CareerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('experience');

  const tabItems = [
    {
      key: 'experience',
      label: (
        <span>
          <BankOutlined />
          경력
        </span>
      ),
      children: <ExperienceManagement />,
    },
    {
      key: 'education',
      label: (
        <span>
          <ReadOutlined />
          학력
        </span>
      ),
      children: <EducationManagement />,
    },
  ];

  return (
    <div>
      {/* 페이지 헤더 - 탭 위에 배치 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          경력 및 학력 관리
        </Title>
      </div>

      {/* 탭 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  );
};

export { CareerManagement };
