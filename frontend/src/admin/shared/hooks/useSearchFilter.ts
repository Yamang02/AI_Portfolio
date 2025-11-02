/**
 * 검색 및 필터링 공통 훅
 * 
 * 책임:
 * - 검색어로 필터링
 * - 특정 필드로 필터링
 * - 통합 필터링 로직
 */

import { useState, useMemo } from 'react';

interface UseSearchFilterOptions<T> {
  data?: T[];
  searchFields: (keyof T)[];
  filterConfig?: Array<{
    key: keyof T;
    value: any;
    operator?: 'equals' | 'includes' | 'startsWith' | 'endsWith';
  }>;
}

/**
 * 검색 및 필터링 훅
 * 
 * @param options - 필터링 옵션
 * @returns 필터링된 데이터 및 상태 관리 함수들
 */
export const useSearchFilter = <T extends Record<string, any>>({
  data = [],
  searchFields,
  filterConfig = [],
}: UseSearchFilterOptions<T>) => {
  const [searchText, setSearchText] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // 통합 필터링
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 검색어 필터링
      const matchesSearch =
        !searchText ||
        searchFields.some((field) => {
          const fieldValue = item[field];
          return fieldValue
            ?.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase());
        });

      // 추가 필터 필터링
      const matchesFilters = filterConfig.every((filter) => {
        const itemValue = item[filter.key];
        const filterValue = filterValues[filter.key as string];

        if (!filterValue) return true;

        switch (filter.operator) {
          case 'equals':
            return itemValue === filterValue;
          case 'includes':
            return Array.isArray(itemValue)
              ? itemValue.includes(filterValue)
              : String(itemValue).includes(String(filterValue));
          case 'startsWith':
            return String(itemValue).startsWith(String(filterValue));
          case 'endsWith':
            return String(itemValue).endsWith(String(filterValue));
          default:
            return itemValue === filterValue;
        }
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchText, filterValues, searchFields, filterConfig]);

  const setFilter = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterValues({});
  };

  return {
    filteredData,
    searchText,
    setSearchText,
    filterValues,
    setFilter,
    clearFilters,
  };
};

