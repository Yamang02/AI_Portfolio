/**
 * 기술 스택 필터 컴포넌트
 */

import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TechStackCategory } from '../../entities/tech-stack';
import { categoryNames } from '../lib/techStackMappings';

const { Option } = Select;

interface TechStackFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  categoryFilter: TechStackCategory | 'all';
  onCategoryChange: (value: TechStackCategory | 'all') => void;
}

export const TechStackFilter: React.FC<TechStackFilterProps> = ({
  searchText,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
}) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="기술명 검색..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 200 }}
      />
      <Select
        value={categoryFilter}
        onChange={onCategoryChange}
        style={{ width: 150 }}
        placeholder="카테고리 선택"
      >
        <Option value="all">전체</Option>
        {Object.keys(categoryNames).map((category) => (
          <Option key={category} value={category}>
            {categoryNames[category as keyof typeof categoryNames]}
          </Option>
        ))}
      </Select>
    </Space>
  );
};
