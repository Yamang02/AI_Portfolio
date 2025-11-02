/**
 * 관리 페이지 템플릿 예시
 * 
 * 이 컴포넌트는 공통 컴포넌트들의 조합 예시를 보여줍니다.
 * 실제 사용 시에는 각 관리 페이지에서 이 패턴을 참고하여 구현하세요.
 * 
 * @example
 * ```tsx
 * const EducationManagement = () => {
 *   const { modal, message } = App.useApp();
 *   const [form] = Form.useForm();
 *   
 *   // 데이터 로드
 *   const { data, isLoading } = useAdminEducationsQuery();
 *   
 *   // CRUD 설정
 *   const crud = useManagementPage({
 *     onCreate: createMutation.mutateAsync,
 *     onUpdate: (id, data) => updateMutation.mutateAsync({...data, id}),
 *     onDelete: deleteMutation.mutateAsync,
 *     form,
 *     getEntityId: (entity) => entity.id,
 *   });
 *   
 *   // 필터링
 *   const { filteredData, searchText, setSearchText } = useSearchFilter({
 *     data,
 *     searchFields: ['title', 'organization'],
 *   });
 *   
 *   return (
 *     <ManagementPageLayout
 *       title="학력 관리"
 *       buttonText="교육 추가"
 *       onAdd={crud.handleCreate}
 *       statsCards={<EducationStatsCards />}
 *       filter={
 *         <SearchFilter
 *           searchText={searchText}
 *           onSearchChange={setSearchText}
 *           filterOptions={educationTypeOptions}
 *           filterValue={typeFilter}
 *           onFilterChange={setTypeFilter}
 *         />
 *       }
 *     >
 *       <Table
 *         dataSource={filteredData}
 *         columns={columns}
 *         loading={isLoading}
 *         onRowClick={crud.handleEdit}
 *         rowKey="id"
 *       />
 *       
 *       <CRUDModal
 *         title={crud.editingEntity ? '수정' : '추가'}
 *         open={crud.isModalVisible}
 *         loading={crud.isLoading}
 *         isEditMode={!!crud.editingEntity}
 *         onOk={crud.handleModalOk}
 *         onCancel={crud.handleModalCancel}
 *         onDelete={crud.handleDelete}
 *       >
 *         {/* 폼 필드 */}
 *       </CRUDModal>
 *     </ManagementPageLayout>
 *   );
 * };
 * ```
 */

import React from 'react';
import { ManagementPageLayout } from './ManagementPageLayout';
import { CRUDModal } from './CRUDModal';
import { Table } from './Table';
import { SearchFilter } from './SearchFilter';
import { StatsCards } from './StatsCards';
import { useManagementPage } from '../hooks/useManagementPage';
import { useSearchFilter } from '../hooks/useSearchFilter';

/**
 * ManagementPageTemplate 컴포넌트
 * 
 * 이 컴포넌트는 문서용 예시입니다.
 * 실제로는 import하지 말고, 위의 코드 패턴을 참고하여 각 페이지에서 구현하세요.
 */
export const ManagementPageTemplate: React.FC = () => {
  // 이 파일은 문서용 예시입니다.
  // 실제 사용법은 위의 주석에 있습니다.
  return null;
};

