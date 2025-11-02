/**
 * Education 필터 컴포넌트
 */

import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { EducationType } from '@/admin/entities/education';

const { Option } = Select;

const educationTypeNames: Record<EducationType, string> = {
  UNIVERSITY: '대학교',
  BOOTCAMP: '부트캠프',
  ONLINE_COURSE: '온라인 강의',
  CERTIFICATION: '자격증',
  OTHER: '기타',
};

interface EducationFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  typeFilter: EducationType | 'all';
  onTypeChange: (value: EducationType | 'all') => void;
}

export const EducationFilter: React.FC<EducationFilterProps> = ({
  searchText,
  onSearchChange,
  typeFilter,
  onTypeChange,
}) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="교육 검색..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 250 }}
      />
      <Select
        value={typeFilter}
        onChange={onTypeChange}
        style={{ width: 150 }}
        placeholder="타입 선택"
      >
        <Option value="all">전체</Option>
        {Object.entries(educationTypeNames).map(([type, name]) => (
          <Option key={type} value={type}>
            {name}
          </Option>
        ))}
      </Select>
    </Space>
  );
};
