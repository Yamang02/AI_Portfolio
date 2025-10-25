/**
 * 학력 및 경력 관리 페이지
 * Education과 Experience를 하나의 페이지에서 탭으로 관리
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, BankOutlined } from '@ant-design/icons';
import { EducationManagement } from './EducationManagement';
import { ExperienceManagement } from './ExperienceManagement';

/**
 * 학력 및 경력 관리 페이지
 */
const CareerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('education');

  const tabItems = [
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
