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
  Modal as AntdModal,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Entities 계층에서 타입과 훅 import
import type { Experience, ExperienceFormData, ExperienceTypeString } from '../entities/experience';
import {
  useAdminExperiencesQuery,
  useExperienceMutation,
  useDeleteExperienceMutation,
} from '../entities/experience';

// Features 계층에서 컴포넌트와 훅 import
import {
  ExperienceStatsCards,
  createExperienceColumns,
  useExperienceFilter,
  useExperienceStats,
} from '../features/experience-management';

// Shared 컴포넌트 import
import { Table, SearchFilter } from '../shared/ui';
import { DateRangeWithOngoing } from '../../shared/ui/date-range';

const { Option } = Select;
const { Title } = Typography;

const experienceTypeOptions: { value: ExperienceTypeString; label: string }[] = [
  { value: 'FULL_TIME', label: '정규직' },
  { value: 'CONTRACT', label: '계약직' },
  { value: 'FREELANCE', label: '프리랜서' },
  { value: 'PART_TIME', label: '파트타임' },
  { value: 'INTERNSHIP', label: '인턴십' },
  { value: 'OTHER', label: '기타' },
];

const jobFieldOptions = [
  { value: '개발', label: '개발' },
  { value: '디자인', label: '디자인' },
  { value: '교육', label: '교육' },
  { value: '마케팅', label: '마케팅' },
  { value: '경영', label: '경영' },
  { value: '기타', label: '기타' },
];

const ExperienceManagement: React.FC = () => {
  const { modal, message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
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
      setModalLoading(true);
      const values = await form.validateFields();

      // 날짜 변환 (endDate가 null이면 undefined로 변환)
      const formData: ExperienceFormData = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
      };

      await createOrUpdateMutation.mutateAsync(formData);
      message.success(editingExperience ? '경력이 성공적으로 수정되었습니다.' : '경력이 성공적으로 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
      setEditingExperience(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingExperience(null);
    form.resetFields();
  };

  const handleDelete = async () => {
    if (!editingExperience) return;
    
    // 삭제 확인창 표시
    modal.confirm({
      title: '경력 삭제',
      content: `'${editingExperience.title}' 경력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          setModalLoading(true);
          await deleteExperienceMutation.mutateAsync(editingExperience.id);
          message.success('경력이 성공적으로 삭제되었습니다.');
          setIsModalVisible(false);
          setEditingExperience(null);
          form.resetFields();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        } finally {
          setModalLoading(false);
        }
      }
    });
  };

  const handleRowClick = (experience: Experience) => {
    setEditingExperience(experience);
    
    form.setFieldsValue({
      ...experience,
      startDate: experience.startDate ? dayjs(experience.startDate) : undefined,
      endDate: experience.endDate ? dayjs(experience.endDate) : undefined,
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
            <Title level={4} style={{ margin: 0 }}>
              경력 관리
            </Title>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              경력 추가
            </Button>
          </Col>
        </Row>
      </div>

      {/* 통계 카드 */}
      <ExperienceStatsCards stats={stats} />

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
      <AntdModal
        title={editingExperience ? '경력 수정' : '경력 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="저장"
        cancelText="취소"
        confirmLoading={modalLoading}
        footer={editingExperience ? [
          <Button key="delete" danger onClick={handleDelete} loading={modalLoading}>
            삭제
          </Button>,
          <Button key="cancel" onClick={handleModalCancel}>
            취소
          </Button>,
          <Button key="save" type="primary" onClick={handleModalOk} loading={modalLoading}>
            저장
          </Button>
        ] : undefined}
      >
        <Form form={form} layout="vertical">
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
              <Form.Item name="jobField" label="직무 분야">
                <Select placeholder="직무 분야 선택">
                  {jobFieldOptions.map((option) => (
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
            defaultOngoing={editingExperience ? !editingExperience.endDate : false}
          />

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="경력에 대한 설명을 입력하세요" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="정렬 순서"
                rules={editingExperience ? [
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
                  placeholder={editingExperience ? "정렬 순서" : "자동 할당"} 
                  disabled={!editingExperience}
                />
              </Form.Item>
            </Col>
          </Row>

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
        </Form>
      </AntdModal>
    </div>
  );
};

export { ExperienceManagement };
