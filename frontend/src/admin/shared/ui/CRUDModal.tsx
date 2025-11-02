/**
 * 재사용 가능한 CRUD 모달 컴포넌트
 * 
 * 공통 기능:
 * - 생성/수정/삭제 모달 통합
 * - 커스텀 footer 지원
 * - 탭 기반 폼 지원 (옵션)
 */

import React from 'react';
import { Modal as AntModal, Button, Form, FormInstance, Tabs } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface CRUDModalProps {
  title: string;
  open: boolean;
  loading?: boolean;
  isEditMode?: boolean;
  onOk: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  deleteText?: string;
  okText?: string;
  cancelText?: string;
  width?: number;
  children: React.ReactNode;
  tabs?: Array<{
    key: string;
    label: string;
    children: React.ReactNode;
  }>;
  styles?: {
    body?: React.CSSProperties;
  };
}

/**
 * CRUD 모달 컴포넌트
 * 
 * 책임:
 * - 생성/수정 모달 UI 제공
 * - 삭제 버튼 지원
 * - 탭 기반 폼 지원
 */
export const CRUDModal: React.FC<CRUDModalProps> = ({
  title,
  open,
  loading = false,
  isEditMode = false,
  onOk,
  onCancel,
  onDelete,
  deleteText = '삭제',
  okText = '저장',
  cancelText = '취소',
  width = 800,
  children,
  tabs,
  styles,
}) => {
  const renderContent = () => {
    if (tabs && tabs.length > 0) {
      return (
        <Tabs
          defaultActiveKey={tabs[0].key}
          items={tabs.map(tab => ({
            key: tab.key,
            label: tab.label,
            children: tab.children,
          }))}
        />
      );
    }
    return children;
  };

  const renderFooter = () => {
    if (!isEditMode) {
      return undefined;
    }

    return [
      <Button 
        key="delete" 
        danger 
        icon={<DeleteOutlined />}
        onClick={onDelete} 
        loading={loading}
      >
        {deleteText}
      </Button>,
      <Button key="cancel" onClick={onCancel}>
        {cancelText}
      </Button>,
      <Button key="save" type="primary" onClick={onOk} loading={loading}>
        {okText}
      </Button>,
    ];
  };

  return (
    <AntModal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={width}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={loading}
      footer={renderFooter()}
      styles={styles}
    >
      {renderContent()}
    </AntModal>
  );
};

