/**
 * 리팩토링된 기술 스택 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 */

import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  message, 
  Row,
  Col,
  Select,
  Input,
  Tabs,
  List,
  Avatar,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ProjectOutlined
} from '@ant-design/icons';
import { Form as AntForm } from 'antd';
import styles from './TechStackManagement.module.css';

// Entities 계층에서 타입과 훅 import
import type { TechStackMetadata, TechStackFormData } from '../entities/tech-stack';
import { 
  useAdminTechStacksQuery,
  useTechStackProjectsQuery,
  useTechStackMutation,
  useDeleteTechStackMutation,
  useUpdateSortOrderMutation 
} from '../entities/tech-stack';

// Features 계층에서 컴포넌트와 훅 import
import { 
  TechStackFilter,
  TechStackStatsCards,
  createTechStackColumns,
  useTechStackFilter,
  useTechStackStats,
  categoryNames,
  levelMapping
} from '../features/tech-stack-management';

const { Option } = Select;
const { TabPane } = Tabs;

const TechStackManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTech, setEditingTech] = useState<TechStackMetadata | null>(null);
  const [selectedTechStack, setSelectedTechStack] = useState<TechStackMetadata | null>(null);
  const [form] = AntForm.useForm();

  // Entities 계층의 훅 사용
  const { data: techStacks, isLoading } = useAdminTechStacksQuery();
  const { data: projects, isLoading: projectsLoading } = useTechStackProjectsQuery(selectedTechStack?.name || null);
  
  const createOrUpdateMutation = useTechStackMutation();
  const deleteMutation = useDeleteTechStackMutation();
  const updateSortOrderMutation = useUpdateSortOrderMutation();

  // Features 계층의 훅 사용
  const {
    filteredTechStacks,
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
  } = useTechStackFilter(techStacks);

  const stats = useTechStackStats(techStacks);

  // 이벤트 핸들러들
  const handleCreate = () => {
    setEditingTech(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tech: TechStackMetadata) => {
    setEditingTech(tech);
    form.setFieldsValue({
      ...tech,
      colorHex: tech.colorHex || '#8c8c8c'
    });
    setIsModalVisible(true);
  };

  const handleDelete = (name: string) => {
    deleteMutation.mutate(name, {
      onSuccess: () => {
        message.success('기술스택이 삭제되었습니다.');
      },
      onError: (error: Error) => {
        message.error(error.message || '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 정렬 순서가 변경된 경우 별도 처리
      if (editingTech && values.sortOrder !== editingTech.sortOrder) {
        await updateSortOrderMutation.mutateAsync({
          techName: editingTech.name,
          newSortOrder: values.sortOrder
        });
        
        const { sortOrder, ...updateData } = values;
        createOrUpdateMutation.mutate({ 
          data: updateData, 
          editingTech: editingTech.name 
        });
      } else {
        createOrUpdateMutation.mutate({ 
          data: values, 
          editingTech: editingTech?.name || null 
        });
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTech(null);
    setSelectedTechStack(null);
    form.resetFields();
  };

  const handleViewProjects = (tech: TechStackMetadata) => {
    setSelectedTechStack(tech);
  };

  const handleRowClick = (tech: TechStackMetadata) => {
    setEditingTech(tech);
    setSelectedTechStack(tech);
    form.setFieldsValue({
      ...tech,
      colorHex: tech.colorHex || '#8c8c8c'
    });
    setIsModalVisible(true);
  };

  // 테이블 컬럼 생성
  const columns = createTechStackColumns(handleEdit, handleDelete, handleViewProjects);

  return (
    <div className={styles.pageContainer}>
      <h1>기술 스택 관리</h1>
      
      {/* 통계 카드 */}
      <TechStackStatsCards stats={stats} />
      
      {/* 필터 */}
      <TechStackFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* 메인 테이블 */}
      <Card>
        <div className={styles.buttonContainer}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            기술스택 추가
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTechStacks}
          loading={isLoading}
          rowKey="name"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: styles.clickableRow
          })}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total}개`,
          }}
        />
      </Card>

      {/* 편집 모달 */}
      <Modal
        title={editingTech ? '기술스택 수정' : '기술스택 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="저장"
        cancelText="취소"
      >
        <Tabs defaultActiveKey="basic">
          <TabPane tab="기본 정보" key="basic">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                isCore: false,
                isActive: true,
                colorHex: '#8c8c8c',
                sortOrder: 1
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="기술명 (영문)"
                    rules={[{ required: true, message: '기술명을 입력해주세요.' }]}
                  >
                    <Input placeholder="예: react, nodejs" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="displayName"
                    label="표시명 (한글)"
                    rules={[{ required: true, message: '표시명을 입력해주세요.' }]}
                  >
                    <Input placeholder="예: React, Node.js" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="카테고리"
                    rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
                  >
                    <Select placeholder="카테고리 선택">
                      {Object.keys(categoryNames).map((category) => (
                        <Option key={category} value={category}>
                          {categoryNames[category as keyof typeof categoryNames]}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="level"
                    label="레벨"
                    rules={[{ required: true, message: '레벨을 선택해주세요.' }]}
                  >
                    <Select placeholder="레벨 선택">
                      <Option value="core">핵심</Option>
                      <Option value="general">일반</Option>
                      <Option value="learning">학습중</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="isCore" valuePropName="checked">
                    <input type="checkbox" /> 핵심 기술
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="isActive" valuePropName="checked">
                    <input type="checkbox" /> 활성 상태
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sortOrder"
                    label="정렬 순서"
                    rules={[{ required: true, message: '정렬 순서를 입력해주세요.' }]}
                  >
                    <Input type="number" min={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="colorHex"
                label="색상"
                rules={[{ required: true, message: '색상을 선택해주세요.' }]}
              >
                <Input type="color" />
              </Form.Item>

              <Form.Item
                name="description"
                label="설명"
              >
                <Input.TextArea rows={3} placeholder="기술에 대한 설명을 입력해주세요." />
              </Form.Item>
            </Form>
          </TabPane>
          
          {editingTech && (
            <TabPane tab="사용 프로젝트" key="projects">
              <div className={styles.modalContent}>
                {projectsLoading ? (
                  <div className={styles.loadingContainer}>로딩 중...</div>
                ) : projects && projects.length > 0 ? (
                  <List
                    dataSource={projects}
                    renderItem={(project) => (
                      <List.Item key={project.id}>
                        <List.Item.Meta
                          avatar={
                            project.thumbnailUrl ? (
                              <Avatar src={project.thumbnailUrl} size={48} />
                            ) : (
                              <Avatar size={48} icon={<ProjectOutlined />} />
                            )
                          }
                          title={project.title}
                          description={
                            <div>
                              <div className={styles.projectDescription}>{project.description}</div>
                              <div className={styles.projectDate}>
                                {project.startDate} ~ {project.endDate || '진행중'}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description="이 기술스택을 사용하는 프로젝트가 없습니다" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </TabPane>
          )}
        </Tabs>
      </Modal>
    </div>
  );
};

export { TechStackManagement };