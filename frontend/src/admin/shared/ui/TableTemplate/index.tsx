/**
 * 테이블 템플릿 컴포넌트
 * 
 * Antd Table을 래핑하여 헤더 영역을 지원하는 템플릿 컴포넌트
 */

import { Table, TableProps } from 'antd';
import { ReactNode } from 'react';

export interface TableTemplateProps<T> extends TableProps<T> {
  header?: ReactNode; // 테이블 상단 헤더 (검색/필터/통계 등)
}

export function TableTemplate<T extends Record<string, any>>({
  header,
  ...tableProps
}: TableTemplateProps<T>) {
  return (
    <div className="table-template">
      {header && <div className="table-template__header" style={{ marginBottom: 16 }}>{header}</div>}
      <Table {...tableProps} />
    </div>
  );
}
