import React from 'react';
import { Modal as AntModal, Form, FormInstance } from 'antd';

interface ModalProps<T> {
  title: string;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  loading?: boolean;
  form: FormInstance;
  children: React.ReactNode;
  width?: number;
}

/**
 * 재사용 가능한 모달 컴포넌트
 *
 * 책임: 공통 모달 UI 및 폼 검증
 */
export const Modal = <T,>({
  title,
  open,
  onOk,
  onCancel,
  loading = false,
  form,
  children,
  width = 600,
}: ModalProps<T>) => {
  const handleOk = async () => {
    try {
      await form.validateFields();
      onOk();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <AntModal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={width}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {children}
      </Form>
    </AntModal>
  );
};

