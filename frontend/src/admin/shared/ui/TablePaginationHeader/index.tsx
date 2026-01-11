/**
 * 테이블 페이지네이션 헤더 컴포넌트
 * 
 * 페이지 크기 선택, 통계 표시, 내보내기 버튼 등을 제공하는 헤더 컴포넌트
 */

import { Select, Space, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export interface TablePaginationHeaderProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
  filteredTotal?: number;
  showExport?: boolean;
  onExport?: () => void;
  pageSizeOptions?: number[];
}

export function TablePaginationHeader({
  pageSize,
  onPageSizeChange,
  total,
  filteredTotal,
  showExport = false,
  onExport,
  pageSizeOptions = [10, 20, 50, 100],
}: TablePaginationHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <Space>
        <span>페이지 크기:</span>
        <Select
          value={pageSize}
          onChange={onPageSizeChange}
          style={{ width: 100 }}
          options={pageSizeOptions.map((size) => ({ label: `${size}개`, value: size }))}
        />
        <span>
          전체 {total}개
          {filteredTotal !== undefined && filteredTotal !== total && (
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}(검색 결과: {filteredTotal}개)
            </span>
          )}
        </span>
      </Space>
      {showExport && onExport && (
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          내보내기
        </Button>
      )}
    </div>
  );
}
