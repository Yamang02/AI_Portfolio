import React from 'react';
import { Table as AntTable, Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface TableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  rowKey?: string | ((record: T) => string);
  pagination?: any;
}

/**
 * 재사용 가능한 테이블 컴포넌트
 *
 * 책임: 공통 테이블 UI 및 액션 버튼 제공
 */
export const Table = <T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  onEdit,
  onDelete,
  rowKey = 'id',
  pagination = { pageSize: 10 },
}: TableProps<T>) => {
  // 액션 컬럼 추가
  const actionColumn = {
    title: '작업',
    key: 'actions',
    width: 120,
    render: (_: any, record: T) => (
      <Space size="small">
        {onEdit && (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            수정
          </Button>
        )}
        {onDelete && (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          >
            삭제
          </Button>
        )}
      </Space>
    ),
  };

  const finalColumns = [...columns, actionColumn];

  return (
    <AntTable
      columns={finalColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
    />
  );
};

