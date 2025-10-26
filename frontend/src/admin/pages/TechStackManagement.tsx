/**
 * 리팩토링된 기술 스택 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 * 공통 컴포넌트 및 훅을 사용하여 리팩토링됨
 */

import React, { useState } from 'react';
import { 
  Form, 
  Row,
  Col,
  Select,
  Input,
  List,
  Avatar,
  Empty,
  App,
} from 'antd';
import { ProjectOutlined } from '@ant-design/icons';
import styles from './TechStackManagement.module.css';

// Entities 계층에서 타입과 훅 import
import type { TechStackMetadata } from '../entities/tech-stack';
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
  categoryNames
} from '../features/tech-stack-management';

// Shared 컴포넌트 import
import { Table as SharedTable, ManagementPageLayout, CRUDModal } from '../shared/ui';

const { Option } = Select;

const TechStackManagement: React.FC = () => {
  const { message, modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTech, setEditingTech] = useState<TechStackMetadata | null>(null);
  const [selectedTechStack, setSelectedTechStack] = useState<TechStackMetadata | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();

  // Entities 계층의 훅 사용
  const { data: techStacks, isLoading } = useAdminTechStacksQuery();
  const { data: projects, isLoading: projectsLoading } = useTechStackProjectsQuery(selectedTechStack?.name || null);
  
  const createOrUpdateMutation = useTechStackMutation();
  const deleteTechStackMutation = useDeleteTechStackMutation();
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


  // 프론트엔드 검증 함수
  const validateTechStackData = (values: any): string | null => {
    // 기술명 검증
    if (!values.name || values.name.trim() === '') {
      return '기술명을 입력해주세요.';
    }
    
    
    // 표시명 검증
    if (!values.displayName || values.displayName.trim() === '') {
      return '표시명을 입력해주세요.';
    }
    
    // 카테고리 검증
    if (!values.category) {
      return '카테고리를 선택해주세요.';
    }
    
    // 레벨 검증
    if (!values.level) {
      return '레벨을 선택해주세요.';
    }
    
    // 정렬 순서 검증 (수정 시에만)
    if (editingTech && (values.sortOrder === undefined || values.sortOrder === null || values.sortOrder < 1)) {
      return '정렬 순서는 1 이상의 숫자여야 합니다.';
    }
    
    // 색상 코드 검증
    if (values.colorHex && !/^#[0-9A-Fa-f]{6}$/.test(values.colorHex)) {
      return '색상 코드는 #RRGGBB 형식이어야 합니다.';
    }
    
    // URL 검증 (아이콘 URL이 있는 경우)
    if (values.iconUrl && values.iconUrl.trim() !== '') {
      try {
        new URL(values.iconUrl);
      } catch {
        return '올바른 URL 형식을 입력해주세요.';
      }
    }
    
    return null; // 검증 통과
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();
      
      // 프론트엔드 1차 검증
      const validationError = validateTechStackData(values);
      if (validationError) {
        message.error(validationError);
        return;
      }
      
      // 중복 기술명 검증 (생성 시에만)
      if (!editingTech && techStacks) {
        const existingTech = techStacks.find(tech => tech.name === values.name);
        if (existingTech) {
          message.error('이미 존재하는 기술명입니다. 다른 이름을 사용해주세요.');
          return;
        }
      }
      
      // 정렬 순서가 변경된 경우 별도 처리
      if (editingTech && values.sortOrder !== editingTech.sortOrder) {
        await updateSortOrderMutation.mutateAsync({
          techName: editingTech.name,
          newSortOrder: values.sortOrder
        });
        
        // name은 유지하고 sortOrder만 제외하여 업데이트
        const { sortOrder, ...updateData } = values;
        await createOrUpdateMutation.mutateAsync({ 
          data: updateData, 
          editingTech: editingTech.name 
        });
      } else {
        // 새로 생성하는 경우 sortOrder 제거 (백엔드에서 자동 할당)
        const { sortOrder, ...createData } = values;
        await createOrUpdateMutation.mutateAsync({ 
          data: createData, // sortOrder 제외
          editingTech: editingTech?.name || null 
        });
      }
      
      // 성공 메시지 표시
      message.success(editingTech ? '기술스택이 성공적으로 수정되었습니다.' : '기술스택이 성공적으로 추가되었습니다.');
      
      // 모달 닫기
      setIsModalVisible(false);
      setEditingTech(null);
      setSelectedTechStack(null);
      form.resetFields();
      
    } catch (error) {
      message.error(error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTech(null);
    setSelectedTechStack(null);
    form.resetFields();
  };

  const handleDelete = async () => {
    if (!editingTech) return;
    
    // 삭제 확인창 표시
    modal.confirm({
      title: '기술스택 삭제',
      content: `'${editingTech.displayName}' 기술스택을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          setModalLoading(true);
          await deleteTechStackMutation.mutateAsync(editingTech.name);
          
          message.success('기술스택이 성공적으로 삭제되었습니다.');
          setIsModalVisible(false);
          setEditingTech(null);
          setSelectedTechStack(null);
          form.resetFields();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        } finally {
          setModalLoading(false);
        }
      }
    });
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
  const columns = createTechStackColumns();

  // Form 컴포넌트 (중복 제거)
  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isCore: false,
        isActive: true,
        colorHex: '#8c8c8c'
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="기술명 (영문)"
            rules={[
              { required: true, message: '기술명을 입력해주세요.' },
              { min: 1, message: '기술명은 최소 1자 이상이어야 합니다.' },
              { max: 50, message: '기술명은 최대 50자까지 입력할 수 있습니다.' }
            ]}
          >
            <Input placeholder="예: react, nodejs" disabled={!!editingTech} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="displayName"
            label="표시명 (한글)"
            rules={[
              { required: true, message: '표시명을 입력해주세요.' },
              { min: 1, message: '표시명은 최소 1자 이상이어야 합니다.' },
              { max: 100, message: '표시명은 최대 100자까지 입력할 수 있습니다.' }
            ]}
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
            <input type="checkbox" />
          </Form.Item>
          <span>핵심 기술</span>
        </Col>
        <Col span={8}>
          <Form.Item name="isActive" valuePropName="checked">
            <input type="checkbox" />
          </Form.Item>
          <span>활성 상태</span>
        </Col>
        {editingTech && (
          <Col span={8}>
            <Form.Item
              name="sortOrder"
              label="정렬 순서"
              rules={[
                { required: true, message: '정렬 순서를 입력해주세요.' },
                { type: 'number', min: 1, message: '정렬 순서는 1 이상의 숫자여야 합니다.' },
                { type: 'number', max: 9999, message: '정렬 순서는 9999 이하여야 합니다.' }
              ]}
            >
              <Input
                type="number"
                min={1}
                max={9999}
                placeholder="정렬 순서"
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Form.Item
        name="colorHex"
        label="색상"
        rules={[
          { required: true, message: '색상을 선택해주세요.' },
          {
            pattern: /^#[0-9A-Fa-f]{6}$/,
            message: '올바른 색상 코드 형식(#RRGGBB)을 입력해주세요.'
          }
        ]}
      >
        <Input type="color" />
      </Form.Item>

      <Form.Item
        name="iconUrl"
        label="아이콘 URL"
        rules={[
          {
            type: 'url',
            message: '올바른 URL 형식을 입력해주세요.'
          },
          { max: 500, message: 'URL은 최대 500자까지 입력할 수 있습니다.' }
        ]}
      >
        <Input placeholder="https://example.com/icon.png" />
      </Form.Item>

      <Form.Item
        name="description"
        label="설명"
        rules={[
          { max: 500, message: '설명은 최대 500자까지 입력할 수 있습니다.' }
        ]}
      >
        <Input.TextArea rows={3} placeholder="기술에 대한 설명을 입력해주세요." />
      </Form.Item>
    </Form>
  );

  // 모달 탭 아이템 생성
  const modalTabs = editingTech ? [
    {
      key: 'basic',
      label: '기본 정보',
      children: renderForm(),
    },
    {
      key: 'projects',
      label: '사용 프로젝트',
      children: (
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
      ),
    },
  ] : undefined;

  return (
    <>
      <ManagementPageLayout
        title="기술스택 관리"
        buttonText="기술스택 추가"
        onAdd={handleCreate}
        statsCards={<TechStackStatsCards stats={stats} />}
        filter={
          <TechStackFilter
            searchText={searchText}
            onSearchChange={setSearchText}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        }
      >
        <SharedTable
          columns={columns}
          dataSource={filteredTechStacks}
          loading={isLoading}
          rowKey="name"
          onRowClick={handleRowClick}
          pagination={{
            pageSize: pageSize,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range?: [number, number]) => 
              `${range?.[0] || 0}-${range?.[1] || 0} / ${total}개`,
            onShowSizeChange: (_: number, size: number) => {
              setPageSize(size);
            },
          }}
        />
      </ManagementPageLayout>

      {/* 편집 모달 */}
      <CRUDModal
        title={editingTech ? '기술스택 수정' : '기술스택 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        isEditMode={!!editingTech}
        loading={modalLoading}
        onDelete={handleDelete}
        width={800}
        tabs={modalTabs}
      >
        {/* 생성 모드일 때만 children으로 Form 표시 */}
        {!editingTech && renderForm()}
      </CRUDModal>
    </>
  );
};

export { TechStackManagement };