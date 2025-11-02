/**
 * 공통 페이지네이션 훅
 * 
 * 페이지네이션 상태와 설정을 통합 관리
 */

import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: string[];
}

interface PaginationConfig {
  pageSize: number;
  pageSizeOptions: string[];
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number, range?: [number, number]) => string;
  onShowSizeChange: (current: number, size: number) => void;
}

/**
 * 페이지네이션 훅
 * 
 * @param options 페이지네이션 옵션
 * @returns 페이지네이션 설정
 */
export const usePagination = (
  options: UsePaginationOptions = {}
): PaginationConfig => {
  const {
    defaultPageSize = 20,
    pageSizeOptions = ['10', '20', '50', '100'],
  } = options;

  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const paginationConfig: PaginationConfig = useMemo(
    () => ({
      pageSize,
      pageSizeOptions,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range?: [number, number]) =>
        `${range?.[0] || 0}-${range?.[1] || 0} / ${total}개`,
      onShowSizeChange: (_current: number, size: number) => {
        setPageSize(size);
      },
    }),
    [pageSize, pageSizeOptions]
  );

  return paginationConfig;
};

