/**
 * Experience 필터 컴포넌트
 */

import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ExperienceType } from '@/admin/entities/experience';

const { Option } = Select;

const experienceTypeNames: Record<ExperienceType, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '파트타임',
  FREELANCE: '프리랜서',
  INTERNSHIP: '인턴',
  OTHER: '기타',
};

interface ExperienceFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  typeFilter: ExperienceType | 'all';
  onTypeChange: (value: ExperienceType | 'all') => void;
}

export const ExperienceFilter: React.FC<ExperienceFilterProps> = ({
  searchText,
  onSearchChange,
  typeFilter,
  onTypeChange,
}) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="경력 검색..."
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
        {Object.entries(experienceTypeNames).map(([type, name]) => (
          <Option key={type} value={type}>
            {name}
          </Option>
        ))}
      </Select>
    </Space>
  );
};
