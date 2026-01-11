/**
 * 검색/필터 컴포넌트
 * 
 * 검색창과 필터 드롭다운을 제공하는 공통 컴포넌트
 */

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FilterOption } from '@/admin/types/dataTable.types';

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string | number) => void;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder = '검색',
  filters = [],
  onFilterChange,
}: SearchFilterProps) {
  return (
    <Space size="middle">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
      />
      <Button type="primary" onClick={onSearch}>
        검색
      </Button>
      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={filter.label}
          style={{ width: 150 }}
          onChange={(value) => onFilterChange?.(filter.key, value)}
          options={filter.options}
        />
      ))}
    </Space>
  );
}
