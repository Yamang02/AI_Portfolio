/**
 * Education 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 * 공통 컴포넌트 및 훅을 사용하여 리팩토링됨
 */

import React, { useState } from 'react';
import { Form, Row, Col, Select, Input, App } from 'antd';
import dayjs from 'dayjs';

// Entities 계층에서 타입과 훅 import
import type { Education, EducationFormData, EducationType } from '../entities/education';
import {
  useAdminEducationsQuery,
  useEducationMutation,
  useDeleteEducationMutation,
} from '../entities/education';

// Features 계층에서 컴포넌트와 훅 import
import {
  EducationStatsCards,
  createEducationColumns,
  useEducationFilter,
  useEducationStats,
} from '../features/education-management';

// Shared 컴포넌트 import
import { Table, SearchFilter, ManagementPageLayout, CRUDModal } from '../shared/ui';
import { DateRangeWithOngoing } from '../../shared/ui/date-range';

const { Option } = Select;

const educationTypeOptions: { value: EducationType; label: string }[] = [
  { value: 'UNIVERSITY', label: '대학교' },
  { value: 'BOOTCAMP', label: '부트캠프' },
  { value: 'ONLINE_COURSE', label: '온라인 강의' },
  { value: 'CERTIFICATION', label: '자격증' },
  { value: 'OTHER', label: '기타' },
];

const EducationManagement: React.FC = () => {
  const { modal, message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Entities 계층의 훅 사용
  const { data: educations, isLoading } = useAdminEducationsQuery();
  const createOrUpdateMutation = useEducationMutation(editingEducation);
  const deleteEducationMutation = useDeleteEducationMutation();

  // Features 계층의 훅 사용
  const {
    filteredEducations,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
  } = useEducationFilter(educations);

  const stats = useEducationStats(educations);

  // 이벤트 핸들러
  const handleCreate = () => {
    setEditingEducation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();

      // 날짜 변환 (endDate가 null이면 undefined로 변환)
      const formData: EducationFormData = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
      };

      await createOrUpdateMutation.mutateAsync(formData);
      message.success(editingEducation ? '학력이 성공적으로 수정되었습니다.' : '학력이 성공적으로 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
      setEditingEducation(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingEducation(null);
    form.resetFields();
  };

  const handleDelete = async () => {
    if (!editingEducation) return;
    
    // 삭제 확인창 표시
    modal.confirm({
      title: '학력 삭제',
      content: `'${editingEducation.title}' 학력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          setModalLoading(true);
          await deleteEducationMutation.mutateAsync(editingEducation.id);
          message.success('학력이 성공적으로 삭제되었습니다.');
          setIsModalVisible(false);
          setEditingEducation(null);
          form.resetFields();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        } finally {
          setModalLoading(false);
        }
      }
    });
  };

  const handleRowClick = (education: Education) => {
    setEditingEducation(education);
    
    form.setFieldsValue({
      ...education,
      startDate: education.startDate ? dayjs(education.startDate) : undefined,
      endDate: education.endDate ? dayjs(education.endDate) : undefined,
    });
    setIsModalVisible(true);
  };

  // 테이블 컬럼 정의
  const columns = createEducationColumns();

  return (
    <>
      <ManagementPageLayout
        title="학력 관리"
        buttonText="교육 추가"
        onAdd={handleCreate}
        statsCards={<EducationStatsCards stats={stats} />}
        filter={
          <SearchFilter
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="교육 제목, 기관명으로 검색..."
            filterOptions={educationTypeOptions.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            filterValue={typeFilter}
            onFilterChange={setTypeFilter}
            filterLabel="타입"
          />
        }
      >
        <Table
          dataSource={filteredEducations}
          columns={columns}
          loading={isLoading}
          onRowClick={handleRowClick}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total: number) => `총 ${total}개`,
          }}
        />
      </ManagementPageLayout>

      {/* 생성/수정 모달 */}
      <CRUDModal
        title={editingEducation ? '학력 수정' : '학력 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        isEditMode={!!editingEducation}
        loading={modalLoading}
        onDelete={handleDelete}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력하세요' }]}
          >
            <Input placeholder="예: 컴퓨터공학 학사" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="organization"
                label="교육기관"
                rules={[{ required: true, message: '교육기관을 입력하세요' }]}
              >
                <Input placeholder="예: 서울대학교" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="타입"
                rules={[{ required: true, message: '타입을 선택하세요' }]}
              >
                <Select placeholder="타입 선택">
                  {educationTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <DateRangeWithOngoing
            startDateName="startDate"
            endDateName="endDate"
            startDateLabel="시작일"
            endDateLabel="종료일"
            ongoingLabel="진행중"
            defaultOngoing={editingEducation ? !editingEducation.endDate : false}
          />

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="교육에 대한 설명을 입력하세요" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="정렬 순서"
                rules={editingEducation ? [
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
                ] : []}
              >
                <Input 
                  type="number" 
                  min={1} 
                  placeholder={editingEducation ? "정렬 순서" : "자동 할당"} 
                  disabled={!editingEducation}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="technologies" label="기술 스택">
            <Select mode="tags" placeholder="기술 스택을 입력하세요" />
          </Form.Item>
        </Form>
      </CRUDModal>
    </>
  );
};

export { EducationManagement };
