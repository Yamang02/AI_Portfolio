/**
 * 테이블 페이지 관리 훅
 * 
 * 서버 사이드 페이징/정렬/검색/필터를 관리하는 훅
 * DataTables 계약을 따릅니다.
 */

import { useState, useMemo, useCallback } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { DataTableParams, DataTableResponse, SortConfig, FilterOption, SearchConfig } from '../types/dataTable.types';

export interface UseTablePageConfig {
  searchConfig?: SearchConfig;
  filters?: FilterOption[];
  sortableColumnIndexMap?: Record<string, number>; // 컬럼명 -> 인덱스 매핑
  defaultSort?: SortConfig;
  defaultPageSize?: number;
}

export interface UseTablePageParams {
  initialParams: DataTableParams;
  config: UseTablePageConfig;
  useQuery: (params: DataTableParams) => UseQueryResult<DataTableResponse<any>>;
  errorMessage?: string;
}

export function useTablePage({
  initialParams,
  config,
  useQuery,
  errorMessage = '데이터를 불러오는데 실패했습니다.',
}: UseTablePageParams) {
  // 테이블 파라미터 상태
  const [params, setParams] = useState<DataTableParams>(() => {
    const defaultParams = {
      ...initialParams,
      length: config.defaultPageSize || initialParams.length || 20,
    };
    
    // 기본 정렬 설정
    if (config.defaultSort) {
      defaultParams['order[0][column]'] = config.defaultSort.column;
      defaultParams['order[0][dir]'] = config.defaultSort.dir;
    }
    
    return defaultParams;
  });

  // 검색어 상태 (입력 중인 값)
  const [searchInput, setSearchInput] = useState('');

  // React Query 호출
  const queryResult = useQuery(params);
  const { data, isLoading, error } = queryResult;

  // 페이지 변경
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      start: (page - 1) * pageSize,
      length: pageSize,
      draw: prev.draw + 1,
    }));
  }, []);

  // 페이지 크기 변경
  const handlePageSizeChange = useCallback((current: number, size: number) => {
    setParams((prev) => ({
      ...prev,
      start: 0, // 페이지 크기 변경 시 첫 페이지로
      length: size,
      draw: prev.draw + 1,
    }));
  }, []);

  // 정렬 변경
  const handleSortChange = useCallback((columnIndex: number, direction: 'asc' | 'desc') => {
    setParams((prev) => ({
      ...prev,
      'order[0][column]': columnIndex,
      'order[0][dir]': direction,
      draw: prev.draw + 1,
    }));
  }, []);

  // 검색 실행 (엔터 또는 검색 버튼 클릭 시)
  const handleSearch = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      'search[value]': searchInput,
      start: 0, // 검색 시 첫 페이지로
      draw: prev.draw + 1,
    }));
  }, [searchInput]);

  // 필터 변경
  const handleFilterChange = useCallback((filterKey: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [filterKey]: value,
      start: 0, // 필터 변경 시 첫 페이지로
      draw: prev.draw + 1,
    }));
  }, []);

  // 테이블 props
  const tableProps = useMemo(
    () => ({
      dataSource: data?.data || [],
      loading: isLoading,
      pagination: {
        current: Math.floor(params.start / params.length) + 1,
        pageSize: params.length,
        total: data?.recordsFiltered || 0,
        showSizeChanger: true,
        showTotal: (total: number) => `전체 ${total}개`,
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
      },
      onChange: (pagination: any, filters: any, sorter: any) => {
        // Antd Table의 onChange 이벤트 처리
        if (sorter.order) {
          const columnIndex = config.sortableColumnIndexMap?.[sorter.field] || 0;
          handleSortChange(columnIndex, sorter.order === 'ascend' ? 'asc' : 'desc');
        }
      },
    }),
    [data, isLoading, params, config.sortableColumnIndexMap, handlePageChange, handlePageSizeChange, handleSortChange]
  );

  // 필터 상태
  const filterState = useMemo(
    () => ({
      searchInput,
      setSearchInput,
      handleSearch,
      filters: config.filters || [],
      handleFilterChange,
    }),
    [searchInput, config.filters, handleSearch, handleFilterChange]
  );

  return {
    tableProps,
    filterState,
    queryResult,
    error: error ? errorMessage : null,
  };
}
