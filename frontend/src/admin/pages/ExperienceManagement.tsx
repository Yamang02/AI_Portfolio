/**
 * Experience 관리 페이지
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
  Typography,
  DatePicker,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Entities 계층에서 타입과 훅 import
import type { Experience, ExperienceFormData, ExperienceType } from '../entities/experience';
import {
  useAdminExperiencesQuery,
  useExperienceMutation,
  useDeleteExperienceMutation,
} from '../entities/experience';

// Features 계층에서 컴포넌트와 훅 import
import {
  ExperienceFilter,
  ExperienceStatsCards,
  createExperienceColumns,
  useExperienceFilter,
  useExperienceStats,
} from '../features/experience-management';

// Shared 컴포넌트 import
import { Table, Modal, StatsCards, SearchFilter } from '../shared/ui';

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const experienceTypeOptions: { value: ExperienceType; label: string }[] = [
  { value: 'FULL_TIME', label: '정규직' },
  { value: 'PART_TIME', label: '파트타임' },
  { value: 'FREELANCE', label: '프리랜서' },
  { value: 'INTERNSHIP', label: '인턴' },
  { value: 'OTHER', label: '기타' },
];

const ExperienceManagement: React.FC = () => {
  const { message, modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [form] = Form.useForm();

  // Entities 계층의 훅 사용
  const { data: experiences, isLoading } = useAdminExperiencesQuery();
  const createOrUpdateMutation = useExperienceMutation(editingExperience);
  const deleteExperienceMutation = useDeleteExperienceMutation();

  // Features 계층의 훅 사용
  const {
    filteredExperiences,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
  } = useExperienceFilter(experiences);

  const stats = useExperienceStats(experiences);

  // 이벤트 핸들러
  const handleCreate = () => {
    setEditingExperience(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // 날짜 변환
      const formData: ExperienceFormData = {
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
    setEditingExperience(null);
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
        deleteExperienceMutation.mutate(id);
      },
    });
  };

  const handleRowClick = (experience: Experience) => {
    setEditingExperience(experience);
    form.setFieldsValue({
      ...experience,
      dateRange: experience.startDate && experience.endDate
        ? [dayjs(experience.startDate), dayjs(experience.endDate)]
        : experience.startDate
        ? [dayjs(experience.startDate), null]
        : undefined,
    });
    setIsModalVisible(true);
  };

  // 테이블 컬럼 정의
  const columns = createExperienceColumns();

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              경력 추가
            </Button>
          </Col>
        </Row>
      </div>

      {/* 통계 카드 */}
      <StatsCards
        items={[
          { title: '전체', value: stats.total },
          { title: '현재 근무', value: stats.current },
          { title: '정규직', value: stats.byType.FULL_TIME },
          { title: '프리랜서', value: stats.byType.FREELANCE },
        ]}
      />

      {/* 필터 */}
      <SearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="회사명, 역할로 검색..."
        filterOptions={experienceTypeOptions.map(option => ({
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
          dataSource={filteredExperiences}
          columns={columns}
          loading={isLoading}
          onEdit={handleRowClick}
          onDelete={(record) => handleDelete(record.id)}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      </Card>

      {/* 생성/수정 모달 */}
      <Modal
        title={editingExperience ? 'Experience 수정' : 'Experience 추가'}
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
            <Input placeholder="예: 백엔드 개발자" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="organization"
                label="회사/조직"
                rules={[{ required: true, message: '회사/조직을 입력하세요' }]}
              >
                <Input placeholder="예: 카카오" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="역할"
                rules={[{ required: true, message: '역할을 입력하세요' }]}
              >
                <Input placeholder="예: Backend Developer" />
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
                  {experienceTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="근무 기간">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="경력에 대한 설명을 입력하세요" />
          </Form.Item>

          <Form.Item name="technologies" label="기술 스택">
            <Select mode="tags" placeholder="기술 스택을 입력하세요" />
          </Form.Item>

          <Form.Item name="mainResponsibilities" label="주요 업무">
            <Select mode="tags" placeholder="주요 업무를 입력하세요" />
          </Form.Item>

          <Form.Item name="achievements" label="성과">
            <Select mode="tags" placeholder="성과를 입력하세요" />
          </Form.Item>

          <Form.Item name="projects" label="프로젝트">
            <Select mode="tags" placeholder="관련 프로젝트를 입력하세요" />
          </Form.Item>
      </Modal>
    </div>
  );
};

export { ExperienceManagement };
