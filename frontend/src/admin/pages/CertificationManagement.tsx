/**
 * Certification 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 * 공통 컴포넌트 및 훅을 사용하여 리팩토링됨
 */

import React, { useState } from 'react';
import { Form, Row, Col, Select, Input, DatePicker, App } from 'antd';
import dayjs from 'dayjs';

// Entities 계층에서 타입과 훅 import
import type { Certification, CertificationFormData, CertificationCategory } from '../entities/certification';
import {
  useAdminCertificationsQuery,
  useCertificationMutation,
  useDeleteCertificationMutation,
} from '../entities/certification';

// Features 계층에서 컴포넌트와 훅 import
import {
  CertificationStatsCards,
  createCertificationColumns,
  useCertificationFilter,
  useCertificationStats,
} from '../features/certification-management';

// Shared 컴포넌트 import
import { Table, SearchFilter, ManagementPageLayout, CRUDModal } from '../shared/ui';
import { usePagination } from '../shared/hooks';

const { Option } = Select;

const certificationCategoryOptions: { value: CertificationCategory; label: string }[] = [
  { value: 'IT', label: 'IT' },
  { value: 'LANGUAGE', label: '언어' },
  { value: 'PROJECT_MANAGEMENT', label: '프로젝트 관리' },
  { value: 'CLOUD', label: '클라우드' },
  { value: 'SECURITY', label: '보안' },
  { value: 'DATA', label: '데이터' },
  { value: 'OTHER', label: '기타' },
];

const CertificationManagement: React.FC = () => {
  const { modal, message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Entities 계층의 훅 사용
  const { data: certifications, isLoading } = useAdminCertificationsQuery();
  const createOrUpdateMutation = useCertificationMutation(editingCertification);
  const deleteCertificationMutation = useDeleteCertificationMutation();

  // Features 계층의 훅 사용
  const {
    filteredCertifications,
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
  } = useCertificationFilter(certifications);

  const stats = useCertificationStats(certifications);

  // 공통 페이지네이션 훅 사용
  const pagination = usePagination();

  // 이벤트 핸들러
  const handleCreate = () => {
    setEditingCertification(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();

      // 날짜 변환
      const formData: CertificationFormData = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD') || undefined,
      };

      await createOrUpdateMutation.mutateAsync(formData);
      message.success(editingCertification ? '자격증이 성공적으로 수정되었습니다.' : '자격증이 성공적으로 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
      setEditingCertification(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCertification(null);
    form.resetFields();
  };

  const handleDelete = async () => {
    if (!editingCertification) return;

    // 삭제 확인창 표시
    modal.confirm({
      title: '자격증 삭제',
      content: `'${editingCertification.name}' 자격증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          setModalLoading(true);
          await deleteCertificationMutation.mutateAsync(editingCertification.id);
          message.success('자격증이 성공적으로 삭제되었습니다.');
          setIsModalVisible(false);
          setEditingCertification(null);
          form.resetFields();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        } finally {
          setModalLoading(false);
        }
      }
    });
  };

  const handleRowClick = (certification: Certification) => {
    setEditingCertification(certification);

    form.setFieldsValue({
      ...certification,
      date: certification.date ? dayjs(certification.date) : undefined,
      expiryDate: certification.expiryDate ? dayjs(certification.expiryDate) : undefined,
    });
    setIsModalVisible(true);
  };

  // 테이블 컬럼 정의
  const columns = createCertificationColumns();

  return (
    <>
      <ManagementPageLayout
        title="자격증 관리"
        buttonText="자격증 추가"
        onAdd={handleCreate}
        statsCards={<CertificationStatsCards stats={stats} />}
        filter={
          <SearchFilter
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="자격증명, 발급기관으로 검색..."
            filterOptions={certificationCategoryOptions.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            filterValue={categoryFilter}
            onFilterChange={setCategoryFilter}
            filterLabel="카테고리"
          />
        }
      >
        <Table
          dataSource={filteredCertifications}
          columns={columns}
          loading={isLoading}
          onRowClick={handleRowClick}
          rowKey="id"
          pagination={pagination}
        />
      </ManagementPageLayout>

      {/* 생성/수정 모달 */}
      <CRUDModal
        title={editingCertification ? '자격증 수정' : '자격증 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        isEditMode={!!editingCertification}
        loading={modalLoading}
        onDelete={handleDelete}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="자격증명"
            rules={[{ required: true, message: '자격증명을 입력하세요' }]}
          >
            <Input placeholder="예: AWS Certified Solutions Architect" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issuer"
                label="발급기관"
                rules={[{ required: true, message: '발급기관을 입력하세요' }]}
              >
                <Input placeholder="예: Amazon Web Services" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="카테고리"
              >
                <Select placeholder="카테고리 선택">
                  {certificationCategoryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="취득일"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="만료일 (선택)"
              >
                <DatePicker style={{ width: '100%' }} placeholder="만료일 없으면 비워두세요" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="credentialId"
                label="자격증 번호 (선택)"
              >
                <Input placeholder="자격증 번호" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="credentialUrl"
                label="확인 URL (선택)"
              >
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="설명 (선택)">
            <Input.TextArea rows={3} placeholder="자격증에 대한 설명을 입력하세요" />
          </Form.Item>

          {editingCertification && (
            <Form.Item
              name="sortOrder"
              label="정렬 순서"
              rules={[
                { required: true, message: '정렬 순서를 입력해주세요.' },
                {
                  validator: (_, value) => {
                    const numValue = Number(value);
                    if (!value || isNaN(numValue) || numValue < 1) {
                      return Promise.reject(new Error('정렬 순서는 1 이상의 숫자여야 합니다.'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                type="number"
                min={1}
                placeholder="정렬 순서"
              />
            </Form.Item>
          )}
        </Form>
      </CRUDModal>
    </>
  );
};

export { CertificationManagement };
