import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilterOption {
  value: string | number;
  label: string;
}

interface SearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterValue?: string | number;
  onFilterChange?: (value: string | number) => void;
  filterLabel?: string;
}

/**
 * 재사용 가능한 검색 및 필터 컴포넌트
 *
 * 책임: 공통 검색 및 필터 UI
 */
export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchText,
  onSearchChange,
  searchPlaceholder = '검색...',
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel = '필터',
}) => {
  return (
    <Space style={{ marginBottom: '16px' }}>
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />

      {filterOptions && onFilterChange && (
        <>
          <span>{filterLabel}:</span>
          <Select
            value={filterValue}
            onChange={onFilterChange}
            style={{ width: 200 }}
            options={filterOptions}
            allowClear
          />
        </>
      )}
    </Space>
  );
};

