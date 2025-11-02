import React from 'react';
import { Table as AntTable } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface TableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  onRowClick?: (record: T) => void;
  onDelete?: (record: T) => void;
  rowKey?: string | ((record: T) => string);
  pagination?: any;
}

/**
 * 재사용 가능한 테이블 컴포넌트
 *
 * 책임: 공통 테이블 UI 제공
 * 행 클릭으로 상세보기/수정 모달 열기
 */
export const Table = <T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  onRowClick,
  onDelete,
  rowKey = 'id',
  pagination = { pageSize: 10 },
}: TableProps<T>) => {
  return (
    <AntTable
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      onRow={(record) => ({
        onClick: onRowClick ? () => onRowClick(record) : undefined,
        style: onRowClick ? { cursor: 'pointer' } : undefined,
      })}
    />
  );
};

