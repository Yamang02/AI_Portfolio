/**
 * Certification 관리 페이지
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
import type { Certification, CertificationFormData, CertificationCategory } from '../entities/certification';
// import {
//   useAdminCertificationsQuery,
//   useCertificationMutation,
//   useDeleteCertificationMutation,
// } from '../entities/certification';

// Features 계층에서 컴포넌트와 훅 import
import {
  createCertificationColumns,
  useCertificationFilter,
  useCertificationStats,
} from '../features/certification-management';

// Shared 컴포넌트 import
import { Table, Modal, StatsCards, SearchFilter } from '../shared/ui';

const { Option } = Select;
const { Title } = Typography;

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
  const { message, modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [form] = Form.useForm();

  // 임시 데이터 (실제로는 API에서 가져옴)
  const certifications: Certification[] = [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'AWS-SA-123456',
      credentialUrl: 'https://aws.amazon.com/verification',
      description: 'AWS 클라우드 아키텍처 설계 자격증',
      category: 'CLOUD',
      sortOrder: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'TOEIC',
      issuer: 'ETS',
      date: '2022-03-20',
      credentialId: 'TOEIC-789012',
      credentialUrl: 'https://www.ets.org/toeic',
      description: '영어 능력 평가 시험',
      category: 'LANGUAGE',
      sortOrder: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '3',
      name: '정보처리기사',
      issuer: '한국산업인력공단',
      date: '2021-11-15',
      credentialId: 'ITQ-345678',
      description: '정보처리 관련 국가기술자격',
      category: 'IT',
      sortOrder: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  // const { data: certifications, isLoading } = useAdminCertificationsQuery();
  // const createOrUpdateMutation = useCertificationMutation(editingCertification);
  // const deleteCertificationMutation = useDeleteCertificationMutation();

  // Features 계층의 훅 사용
  const {
    filteredCertifications,
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
  } = useCertificationFilter(certifications);

  const stats = useCertificationStats(certifications);

  // 이벤트 핸들러
  const handleCreate = () => {
    setEditingCertification(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData: CertificationFormData = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
      };

      // await createOrUpdateMutation.mutateAsync(formData);
      console.log('Certification data:', formData);
      message.success(editingCertification ? '자격증이 수정되었습니다.' : '자격증이 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCertification(null);
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
        // deleteCertificationMutation.mutate(id);
        console.log('Delete certification:', id);
        message.success('자격증이 삭제되었습니다.');
      },
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
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              자격증 관리
            </Title>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              자격증 추가
            </Button>
          </Col>
        </Row>
      </div>

      {/* 통계 카드 */}
      <StatsCards
        items={[
          { title: '전체', value: stats.total },
          { title: '만료됨', value: stats.expired },
          { title: '만료 임박', value: stats.expiringSoon },
          { title: 'IT', value: stats.byCategory.IT || 0 },
        ]}
      />

      {/* 필터 */}
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

      {/* 메인 테이블 */}
      <Card>
        <Table
          dataSource={filteredCertifications}
          columns={columns}
          loading={false}
          onRowClick={handleRowClick}
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
        title={editingCertification ? 'Certification 수정' : 'Certification 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        loading={false}
        form={form}
        width={600}
      >
        <Form.Item
          name="name"
          label="자격증명"
          rules={[{ required: true, message: '자격증명을 입력하세요' }]}
        >
          <Input placeholder="예: AWS Solutions Architect" />
        </Form.Item>

        <Form.Item
          name="issuer"
          label="발급기관"
          rules={[{ required: true, message: '발급기관을 입력하세요' }]}
        >
          <Input placeholder="예: Amazon Web Services" />
        </Form.Item>

        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item name="credentialId" label="자격증 번호">
              <Input placeholder="예: AWS-SA-123456" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="date" label="취득일">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expiryDate" label="만료일">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="credentialUrl" label="확인 URL">
          <Input placeholder="https://example.com/verification" />
        </Form.Item>

        <Form.Item name="description" label="설명">
          <Input.TextArea rows={3} placeholder="자격증에 대한 설명을 입력하세요" />
        </Form.Item>
      </Modal>
    </div>
  );
};

export { CertificationManagement };
