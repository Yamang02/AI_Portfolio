/**
 * Experience 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 * 공통 컴포넌트 및 훅을 사용하여 리팩토링됨
 */

import React, { useState } from 'react';
import { Form, Row, Col, Select, Input, App, Divider } from 'antd';
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
import { 
  Table, 
  SearchFilter, 
  ManagementPageLayout, 
  CRUDModal,
  TechStackRelationshipSection,
  ProjectRelationshipSection 
} from '../shared/ui';
import { usePagination } from '../shared/hooks';
import { DateRangeWithOngoing } from '../../shared/ui/date-range';

// Relationship API
import { relationshipApi } from '../entities/relationship';

const { Option } = Select;

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
  
  // 기술스택 및 프로젝트 관계 상태
  const [techStackRelationships, setTechStackRelationships] = useState<any[]>([]);
  const [projectRelationships, setProjectRelationships] = useState<any[]>([]);

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

  // 공통 페이지네이션 훅 사용
  const pagination = usePagination();


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

      // Experience 생성/수정 및 반환값 받기
      const savedExperience = await createOrUpdateMutation.mutateAsync(formData);
      const experienceId = editingExperience ? editingExperience.id : savedExperience.id;
      
      console.log('Updating relationships for experience:', experienceId);
      console.log('TechStack relationships to save:', techStackRelationships);
      console.log('Project relationships to save:', projectRelationships);
      
      // 관계 저장 (생성/수정 모두)
      try {
        // 기존 기술스택 관계 삭제 및 새로 추가
        const existingTechStacks = await relationshipApi.getExperienceTechStacks(experienceId);
        console.log('Existing tech stacks to delete:', existingTechStacks);
        
        for (const ts of existingTechStacks) {
          await relationshipApi.deleteExperienceTechStack(experienceId, ts.techStackId);
        }
        
        // 새 기술스택 관계 추가
        for (const ts of techStackRelationships) {
          // TechStackMetadata에서 id 추출
          const techStackId = ts.techStack.id;
          
          console.log('Adding tech stack relationship:', { techStackId, isPrimary: ts.isPrimary });
          
          await relationshipApi.addExperienceTechStack(experienceId, {
            techStackId: typeof techStackId === 'string' ? parseInt(techStackId) : techStackId,
            isPrimary: ts.isPrimary,
            usageDescription: ts.usageDescription,
          });
        }
        
        // 기존 프로젝트 관계 삭제
        const existingProjects = await relationshipApi.getExperienceProjects(experienceId);
        console.log('Existing projects to delete:', existingProjects);
        
        for (const p of existingProjects) {
          await relationshipApi.deleteExperienceProject(experienceId, p.projectId);
        }
        
        // 새 프로젝트 관계 추가 (Business ID 사용)
        for (const p of projectRelationships) {
          console.log('Adding project relationship:', p);

          await relationshipApi.addExperienceProject(experienceId, {
            projectBusinessId: p.projectBusinessId,
            usageDescription: p.usageDescription,
            roleInProject: p.roleInProject,
            contributionDescription: p.contributionDescription,
          });
        }
        
        console.log('Relationships updated successfully');
      } catch (error) {
        console.error('Failed to update relationships:', error);
        message.warning('기본 정보는 저장되었지만 관계 업데이트에 실패했습니다.');
      }
      
      message.success(editingExperience ? '경력이 성공적으로 수정되었습니다.' : '경력이 성공적으로 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
      setEditingExperience(null);
      setTechStackRelationships([]);
      setProjectRelationships([]);
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

  const handleRowClick = async (experience: Experience) => {
    setEditingExperience(experience);
    
    form.setFieldsValue({
      ...experience,
      startDate: experience.startDate ? dayjs(experience.startDate) : undefined,
      endDate: experience.endDate ? dayjs(experience.endDate) : undefined,
    });
    
    // 백엔드에서 기존 관계 데이터 가져오기
    console.log('Loading relationships for experience:', experience.id);
    
    let techStacks: any[] = [];
    let projects: any[] = [];
    
    try {
      techStacks = await relationshipApi.getExperienceTechStacks(experience.id);
      console.log('Loaded tech stacks:', techStacks);
    } catch (error) {
      console.error('Failed to load tech stacks:', error);
    }
    
    try {
      projects = await relationshipApi.getExperienceProjects(experience.id);
      console.log('Loaded projects:', projects);
      console.log('Projects length:', projects?.length);
      console.log('Projects data:', JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
      
      // 기술스택 관계 변환
      const techStackRelationships = techStacks.map((ts: any) => ({
        techStack: {
          id: ts.techStackId,
          name: ts.techStackName,
          displayName: ts.techStackDisplayName,
          category: ts.category,
        },
        isPrimary: ts.isPrimary,
        usageDescription: ts.usageDescription,
      }));
      
      // 프로젝트 관계 변환
      // 백엔드가 projectBusinessId와 projectId(DB ID) 모두 반환
      const projectRelationships = projects.map((p: any) => ({
        id: p.id,
        projectBusinessId: p.projectBusinessId,  // Business ID (외부 API용)
        projectTitle: p.projectTitle,
        isPrimary: p.isPrimary || false,
        usageDescription: p.usageDescription,
        roleInProject: p.roleInProject,
        contributionDescription: p.contributionDescription,
      }));
      
      console.log('Transformed techStackRelationships:', techStackRelationships);
      console.log('Transformed projectRelationships:', projectRelationships);
      console.log('Setting projectRelationships with length:', projectRelationships?.length);
      
      setTechStackRelationships(techStackRelationships);
      setProjectRelationships(projectRelationships);
      
      console.log('States set. projectRelationships length:', projectRelationships?.length);
      
    setIsModalVisible(true);
  };
  
  const handleCreate = () => {
    setEditingExperience(null);
    form.resetFields();
    setTechStackRelationships([]);
    setProjectRelationships([]);
    setIsModalVisible(true);
  };

  // 테이블 컬럼 정의
  const columns = createExperienceColumns();

  return (
    <>
      <ManagementPageLayout
        title="경력 관리"
        buttonText="경력 추가"
        onAdd={handleCreate}
        statsCards={<ExperienceStatsCards stats={stats} />}
        filter={
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
        }
      >
        <Table
          dataSource={filteredExperiences}
          columns={columns}
          loading={isLoading}
          onRowClick={handleRowClick}
          rowKey="id"
          pagination={pagination}
        />
      </ManagementPageLayout>

      {/* 생성/수정 모달 */}
      <CRUDModal
        title={editingExperience ? '경력 수정' : '경력 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        isEditMode={!!editingExperience}
        loading={modalLoading}
        onDelete={handleDelete}
        width={920}
        styles={{
          body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }
        }}
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

          <Form.Item name="mainResponsibilities" label="주요 업무">
            <Select mode="tags" placeholder="주요 업무를 입력하세요" />
          </Form.Item>

          <Form.Item name="achievements" label="성과">
            <Select mode="tags" placeholder="성과를 입력하세요" />
          </Form.Item>

          <Divider />

          <Form.Item label="기술 스택">
            <TechStackRelationshipSection
              value={techStackRelationships}
              onChange={setTechStackRelationships}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="관련 프로젝트">
            <ProjectRelationshipSection
              value={projectRelationships}
              onChange={setProjectRelationships}
            />
          </Form.Item>
        </Form>
      </CRUDModal>
    </>
  );
};

export { ExperienceManagement };
