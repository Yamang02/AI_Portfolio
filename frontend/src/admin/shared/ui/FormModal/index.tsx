/**
 * 폼 모달 컴포넌트
 * 
 * CRUD 작업을 위한 폼이 포함된 모달 컴포넌트
 */

import { Modal, Form, FormProps } from 'antd';
import { ReactNode } from 'react';

export interface FormModalProps extends FormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLoading?: boolean;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  children: ReactNode;
}

export function FormModal({
  open,
  onClose,
  title,
  confirmLoading,
  onOk,
  okText = '확인',
  cancelText = '취소',
  children,
  ...formProps
}: FormModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onOk}
      title={title}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
    >
      <Form {...formProps}>{children}</Form>
    </Modal>
  );
}
