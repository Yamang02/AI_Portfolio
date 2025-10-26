/**
 * Education 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Select,
  Input,
  App,
  DatePicker,
  InputNumber,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
import { Table, Modal, SearchFilter } from '../shared/ui';

const { Option } = Select;
const { RangePicker } = DatePicker;

const educationTypeOptions: { value: EducationType; label: string }[] = [
  { value: 'UNIVERSITY', label: '대학교' },
  { value: 'BOOTCAMP', label: '부트캠프' },
  { value: 'ONLINE_COURSE', label: '온라인 강의' },
  { value: 'CERTIFICATION', label: '자격증' },
  { value: 'OTHER', label: '기타' },
];

const EducationManagement: React.FC = () => {
  const { modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
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
      const values = await form.validateFields();

      // 날짜 변환
      const formData: EducationFormData = {
        ...values,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
      };

      // dateRange 제거
      delete (formData as any).dateRange;

      await createOrUpdateMutation.mutateAsync(formData);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingEducation(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '정말 삭제하시겠습니까?',
      content: '이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        deleteEducationMutation.mutate(id);
      },
    });
  };

  const handleRowClick = (education: Education) => {
    setEditingEducation(education);
    form.setFieldsValue({
      ...education,
      dateRange: education.startDate && education.endDate
        ? [dayjs(education.startDate), dayjs(education.endDate)]
        : education.startDate
        ? [dayjs(education.startDate), null]
        : undefined,
    });
    setIsModalVisible(true);
  };

  // 테이블 컬럼 정의
  const columns = createEducationColumns();

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              교육 추가
            </Button>
          </Col>
        </Row>
      </div>

      {/* 통계 카드 */}
      <EducationStatsCards stats={stats} />

      {/* 필터 */}
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

      {/* 메인 테이블 */}
      <Card>
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
      </Card>

      {/* 생성/수정 모달 */}
      <Modal
        title={editingEducation ? 'Education 수정' : 'Education 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        loading={createOrUpdateMutation.isPending}
        form={form}
        width={800}
      >
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력하세요' }]}
          >
            <Input placeholder="예: 컴퓨터공학 학사" />
          </Form.Item>

          <Form.Item
            name="organization"
            label="교육기관"
            rules={[{ required: true, message: '교육기관을 입력하세요' }]}
          >
            <Input placeholder="예: 서울대학교" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="degree" label="학위">
                <Input placeholder="예: 학사" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="major" label="전공">
                <Input placeholder="예: 컴퓨터공학" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item name="gpa" label="학점">
                <InputNumber
                  min={0}
                  max={4.5}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="예: 3.8"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dateRange" label="교육 기간">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="교육에 대한 설명을 입력하세요" />
          </Form.Item>

          <Form.Item name="technologies" label="기술 스택">
            <Select mode="tags" placeholder="기술 스택을 입력하세요" />
          </Form.Item>

          <Form.Item name="projects" label="프로젝트">
            <Select mode="tags" placeholder="관련 프로젝트를 입력하세요" />
          </Form.Item>
      </Modal>
    </div>
  );
};

export { EducationManagement };
