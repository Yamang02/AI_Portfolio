/**
 * 경력 및 학력 관리 페이지
 * Experience와 Education을 하나의 페이지에서 탭으로 관리
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, BankOutlined } from '@ant-design/icons';
import { EducationManagement } from './EducationManagement';
import { ExperienceManagement } from './ExperienceManagement';

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
          교육 이력
        </span>
      ),
      children: <EducationManagement />,
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: '16px' }}
      />
    </div>
  );
};

export { CareerManagement };
