/**
 * 관리 페이지 공통 훅
 * 
 * 책임:
 * - 모달 상태 관리
 * - CRUD 동작 공통 로직
 * - 에러 핸들링
 */

import { useState, useCallback } from 'react';
import { App } from 'antd';
import type { FormInstance } from 'antd';

interface UseManagementPageOptions<T> {
  onCreate: (data: T) => Promise<void>;
  onUpdate: (id: string, data: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  form: FormInstance;
  getEntityId: (entity: any) => string;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

/**
 * 관리 페이지 공통 훅
 * 
 * @param options - 관리 페이지 옵션
 * @returns 모달 상태 및 핸들러들
 */
export const useManagementPage = <T, Entity extends { id: string }>({
  onCreate,
  onUpdate,
  onDelete,
  form,
  getEntityId,
  successMessages = {
    create: '성공적으로 추가되었습니다.',
    update: '성공적으로 수정되었습니다.',
    delete: '성공적으로 삭제되었습니다.',
  },
}: UseManagementPageOptions<T>) => {
  const { modal, message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);

  // 생성 모달 열기
  const handleCreate = useCallback(() => {
    setEditingEntity(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  // 수정 모달 열기
  const handleEdit = useCallback(
    (entity: Entity) => {
      setEditingEntity(entity);
      form.resetFields();
      // 폼 데이터 설정은 사용자가 직접 해야 함 (타입마다 다름)
      setIsModalVisible(true);
    },
    [form]
  );

  // 모달 확인 처리
  const handleModalOk = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingEntity) {
        // 수정
        await onUpdate(getEntityId(editingEntity), values);
        message.success(successMessages.update);
      } else {
        // 생성
        await onCreate(values);
        message.success(successMessages.create);
      }

      setIsModalVisible(false);
      setEditingEntity(null);
      form.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : '작업 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    editingEntity,
    form,
    onCreate,
    onUpdate,
    getEntityId,
    successMessages,
    message,
  ]);

  // 모달 취소 처리
  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingEntity(null);
    form.resetFields();
  }, [form]);

  // 삭제 처리
  const handleDelete = useCallback(async () => {
    if (!editingEntity) return;

    modal.confirm({
      title: '삭제 확인',
      content: '정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          setLoading(true);
          await onDelete(getEntityId(editingEntity));
          message.success(successMessages.delete);
          setIsModalVisible(false);
          setEditingEntity(null);
          form.resetFields();
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : '삭제 중 오류가 발생했습니다.'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  }, [
    editingEntity,
    getEntityId,
    onDelete,
    successMessages,
    message,
    modal,
    form,
  ]);

  return {
    isModalVisible,
    editingEntity,
    isLoading: loading,
    handleCreate,
    handleEdit,
    handleModalOk,
    handleModalCancel,
    handleDelete,
    setEditingEntity, // 필요시 직접 설정 가능
  };
};

