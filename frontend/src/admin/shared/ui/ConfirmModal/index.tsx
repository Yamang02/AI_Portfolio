/**
 * 확인 모달 컴포넌트
 * 
 * 삭제 확인 등에 사용되는 확인 모달
 */

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface ConfirmModalOptions {
  title: string;
  content: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
}

export function showConfirmModal({
  title,
  content,
  onConfirm,
  onCancel,
  okText = '확인',
  cancelText = '취소',
  type = 'warning',
}: ConfirmModalOptions) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    onOk: onConfirm,
    onCancel,
    okButtonProps: {
      danger: type === 'error',
    },
  });
}
