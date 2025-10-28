/**
 * Education 관리 페이지
 * Feature-Sliced Design 아키텍처에 맞게 구성
 * 공통 컴포넌트 및 훅을 사용하여 리팩토링됨
 */

import React, { useState } from 'react';
import { Form, Row, Col, Select, Input, App, Divider } from 'antd';
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
  
  // 기술스택 및 프로젝트 관계 상태
  const [techStackRelationships, setTechStackRelationships] = useState<any[]>([]);
  const [projectRelationships, setProjectRelationships] = useState<any[]>([]);

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

  // 공통 페이지네이션 훅 사용
  const pagination = usePagination();

  // 이벤트 핸들러
  const handleCreate = () => {
    setEditingEducation(null);
    form.resetFields();
    setTechStackRelationships([]);
    setProjectRelationships([]);
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

      // Education 생성/수정 및 반환값 받기
      const savedEducation = await createOrUpdateMutation.mutateAsync(formData);
      const educationId = editingEducation ? editingEducation.id : savedEducation.id;
      
      console.log('Updating relationships for education:', educationId);
      console.log('TechStack relationships to save:', techStackRelationships);
      console.log('Project relationships to save:', projectRelationships);
      
      // 관계 저장 (생성/수정 모두)
      let techStackSuccess = false;
      let projectSuccess = false;

      try {
        // 기술스택 관계는 Bulk API 사용 (원자적 트랜잭션)
        const techStackRelationshipsData = techStackRelationships.map(ts => ({
          techStackId: typeof ts.techStack.id === 'string' ? parseInt(ts.techStack.id) : ts.techStack.id,
          isPrimary: ts.isPrimary,
          usageDescription: ts.usageDescription,
        }));

        await relationshipApi.updateEducationTechStacks(educationId, {
          techStackRelationships: techStackRelationshipsData,
        });

        techStackSuccess = true;
      } catch (error) {
        console.error('Failed to update tech stack relationships:', error);
      }

      try {
        // 프로젝트 관계는 Bulk API 사용 (원자적 트랜잭션)
        const projectRelationshipsData = projectRelationships.map(p => ({
          projectBusinessId: p.projectBusinessId,
          projectType: p.projectType,
          grade: p.grade,
        }));

        await relationshipApi.updateEducationProjects(educationId, {
          projectRelationships: projectRelationshipsData,
        });

        projectSuccess = true;
      } catch (error) {
        console.error('Failed to update project relationships:', error);
      }

      // 결과에 따른 메시지 표시
      if (techStackSuccess && projectSuccess) {
        console.log('All relationships updated successfully');
      } else if (!techStackSuccess && !projectSuccess) {
        message.warning('기본 정보는 저장되었지만 관계 업데이트에 실패했습니다.');
      } else if (!techStackSuccess) {
        message.warning('기본 정보와 프로젝트 관계는 저장되었지만 기술스택 관계 업데이트에 실패했습니다.');
      } else if (!projectSuccess) {
        message.warning('기본 정보와 기술스택 관계는 저장되었지만 프로젝트 관계 업데이트에 실패했습니다.');
      }
      
      message.success(editingEducation ? '학력이 성공적으로 수정되었습니다.' : '학력이 성공적으로 추가되었습니다.');
      setIsModalVisible(false);
      form.resetFields();
      setEditingEducation(null);
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

  const handleRowClick = async (education: Education) => {
    setEditingEducation(education);
    
    form.setFieldsValue({
      ...education,
      startDate: education.startDate ? dayjs(education.startDate) : undefined,
      endDate: education.endDate ? dayjs(education.endDate) : undefined,
    });
    
    // 백엔드에서 기존 관계 데이터 가져오기
    try {
      const [techStacks, projects] = await Promise.all([
        relationshipApi.getEducationTechStacks(education.id),
        relationshipApi.getEducationProjects(education.id),
      ]);
      
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
        projectType: p.projectType,  // Education-Project 전용 필드
        grade: p.grade,  // Education-Project 전용 필드
      }));
      
      setTechStackRelationships(techStackRelationships);
      setProjectRelationships(projectRelationships);
    } catch (error) {
      console.error('Failed to load relationships:', error);
      setTechStackRelationships([]);
      setProjectRelationships([]);
    }
    
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
          pagination={pagination}
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

export { EducationManagement };
