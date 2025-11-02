# 관리 페이지 공통 패턴 가이드

## 개요

교육/경력 관리 페이지와 기술스택 관리 페이지의 공통 패턴을 추출하여 재사용 가능한 컴포넌트와 훅을 만들었습니다.

## 공통 컴포넌트

### 1. `ManagementPageLayout`
공통 관리 페이지 레이아웃을 제공합니다.

```tsx
import { ManagementPageLayout } from '@/admin/shared/ui';

<ManagementPageLayout
  title="학력 관리"
  buttonText="교육 추가"
  onAdd={handleCreate}
  statsCards={<EducationStatsCards stats={stats} />}
  filter={<SearchFilter {...} />}
>
  <Table {...tableProps} />
</ManagementPageLayout>
```

### 2. `CRUDModal`
생성/수정/삭제 모달을 통합 제공합니다.

```tsx
import { CRUDModal } from '@/admin/shared/ui';

<CRUDModal
  title={editingEntity ? '수정' : '추가'}
  open={isModalVisible}
  loading={isLoading}
  isEditMode={!!editingEntity}
  onOk={handleModalOk}
  onCancel={handleModalCancel}
  onDelete={handleDelete}
>
  {/* 폼 필드 */}
</CRUDModal>
```

**탭 지원:**
```tsx
<CRUDModal
  tabs={[
    { key: 'basic', label: '기본 정보', children: <BasicForm /> },
    { key: 'advanced', label: '상세', children: <AdvancedForm /> },
  ]}
>
  {/* 기본 정보는 탭에 포함됨 */}
</CRUDModal>
```

### 3. `Table` (기존)
데이터 테이블을 표시합니다.

```tsx
import { Table } from '@/admin/shared/ui';

<Table
  dataSource={filteredData}
  columns={columns}
  loading={isLoading}
  onRowClick={handleRowClick}
  rowKey="id"
/>
```

### 4. `SearchFilter` (기존)
검색 및 필터링을 제공합니다.

```tsx
import { SearchFilter } from '@/admin/shared/ui';

<SearchFilter
  searchText={searchText}
  onSearchChange={setSearchText}
  searchPlaceholder="검색..."
  filterOptions={filterOptions}
  filterValue={filterValue}
  onFilterChange={setFilterValue}
  filterLabel="타입"
/>
```

### 5. `StatsCards` (기존)
통계 카드를 표시합니다.

```tsx
import { StatsCards } from '@/admin/shared/ui';

<StatsCards
  items={[
    { title: '전체', value: stats.total },
    { title: '활성', value: stats.active },
  ]}
/>
```

## 공통 훅

### 1. `useManagementPage`
CRUD 로직을 통합 관리합니다.

```tsx
import { useManagementPage } from '@/admin/shared/hooks';

const {
  isModalVisible,
  editingEntity,
  isLoading,
  handleCreate,
  handleEdit,
  handleModalOk,
  handleModalCancel,
  handleDelete,
} = useManagementPage({
  onCreate: async (data) => {
    await createMutation.mutateAsync(data);
  },
  onUpdate: async (id, data) => {
    await updateMutation.mutateAsync({ ...data, id });
  },
  onDelete: async (id) => {
    await deleteMutation.mutateAsync(id);
  },
  form,
  getEntityId: (entity) => entity.id,
  successMessages: {
    create: '추가되었습니다.',
    update: '수정되었습니다.',
    delete: '삭제되었습니다.',
  },
});
```

### 2. `useSearchFilter`
검색 및 필터링 로직을 제공합니다.

```tsx
import { useSearchFilter } from '@/admin/shared/hooks';

const {
  filteredData,
  searchText,
  setSearchText,
  filterValues,
  setFilter,
  clearFilters,
} = useSearchFilter({
  data,
  searchFields: ['title', 'organization', 'description'],
  filterConfig: [
    {
      key: 'type',
      operator: 'equals',
    },
  ],
});
```

## 실제 사용 예시

### 교육 관리 페이지 리팩토링 예시

**Before:**
```tsx
const EducationManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    setEditingEducation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();
      // ... 복잡한 로직
    } catch (error) {
      // ...
    }
  };

  // ... 수십 줄의 반복 코드
};
```

**After:**
```tsx
const EducationManagement: React.FC = () => {
  const [form] = Form.useForm();
  const { data: educations, isLoading } = useAdminEducationsQuery();
  
  // 공통 CRUD 로직
  const crud = useManagementPage({
    onCreate: async (data) => {
      await createMutation.mutateAsync({
        ...data,
        startDate: data.startDate?.format('YYYY-MM-DD'),
        endDate: data.endDate?.format('YYYY-MM-DD'),
      });
    },
    onUpdate: async (id, data) => {
      await updateMutation.mutateAsync({ ...data, id });
    },
    onDelete: deleteMutation.mutateAsync,
    form,
    getEntityId: (entity) => entity.id,
    successMessages: {
      create: '학력이 추가되었습니다.',
      update: '학력이 수정되었습니다.',
      delete: '학력이 삭제되었습니다.',
    },
  });

  // 필터링
  const { filteredData, searchText, setSearchText } = useSearchFilter({
    data: educations,
    searchFields: ['title', 'organization'],
  });

  const stats = useEducationStats(educations);

  return (
    <ManagementPageLayout
      title="학력 관리"
      buttonText="교육 추가"
      onAdd={crud.handleCreate}
      statsCards={<EducationStatsCards stats={stats} />}
      filter={
        <SearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="교육 검색..."
        />
      }
    >
      <Table
        dataSource={filteredData}
        columns={createEducationColumns()}
        loading={isLoading}
        onRowClick={crud.handleEdit}
        rowKey="id"
      />

      <CRUDModal
        title={crud.editingEntity ? '학력 수정' : '학력 추가'}
        open={crud.isModalVisible}
        loading={crud.isLoading}
        isEditMode={!!crud.editingEntity}
        onOk={crud.handleModalOk}
        onCancel={crud.handleModalCancel}
        onDelete={crud.handleDelete}
      >
        {/* 폼 필드 */}
      </CRUDModal>
    </ManagementPageLayout>
  );
};
```

## 차이점과 공통점

### 공통점
- 페이지 레이아웃 구조 (헤더 → 통계 → 필터 → 테이블)
- CRUD 모달 로직
- 검색 및 필터링 패턴
- 통계 계산 로직

### 차이점

| 구분 | 교육/경력 | 기술스택 |
|------|---------|----------|
| **필터** | `SearchFilter` | 커스텀 `TechStackFilter` |
| **모달** | 단일 폼 | Tabs 구조 |
| **스타일링** | 인라인 | CSS 모듈 |
| **아이콘** | 없음 | 통계에 아이콘 사용 |
| **폼 검증** | 단순 | 복잡한 검증 로직 |

## 리팩토링 가이드

### 1단계: 공통 컴포넌트 사용
```tsx
// 기존
<div>
  <Row justify="space-between">
    <Title>제목</Title>
    <Button>추가</Button>
  </Row>
  <StatsCards />
  <SearchFilter />
  <Table />
</div>

// 리팩토링
<ManagementPageLayout
  title="제목"
  buttonText="추가"
  statsCards={<StatsCards />}
  filter={<SearchFilter />}
>
  <Table />
</ManagementPageLayout>
```

### 2단계: CRUD 로직 공통화
```tsx
// 기존: 중복된 CRUD 로직
const [isModalVisible, setIsModalVisible] = useState(false);
const [editingEntity, setEditingEntity] = useState(null);
const [modalLoading, setModalLoading] = useState(false);

const handleCreate = () => { /* ... */ };
const handleModalOk = async () => { /* ... */ };
const handleModalCancel = () => { /* ... */ };
const handleDelete = async () => { /* ... */ };

// 리팩토링: 공통 훅 사용
const crud = useManagementPage({
  onCreate,
  onUpdate,
  onDelete,
  form,
  getEntityId: (entity) => entity.id,
});
```

### 3단계: 필터링 로직 공통화
```tsx
// 기존: 커스텀 필터 훅
const { filteredEducations, ... } = useEducationFilter(educations);

// 리팩토링: 공통 훅 사용 (필요시)
const { filteredData } = useSearchFilter({
  data: educations,
  searchFields: ['title', 'organization'],
});
```

## 파일 구조

```
frontend/src/admin/shared/
├── ui/
│   ├── ManagementPageLayout.tsx      # 관리 페이지 레이아웃
│   ├── CRUDModal.tsx                  # CRUD 모달
│   ├── ManagementPageTemplate.tsx     # 사용 예시
│   ├── Table.tsx                      # 테이블 (기존)
│   ├── SearchFilter.tsx               # 검색 필터 (기존)
│   ├── StatsCards.tsx                 # 통계 카드 (기존)
│   └── index.ts                       # export
├── hooks/
│   ├── useManagementPage.ts           # CRUD 로직 훅
│   ├── useSearchFilter.ts             # 필터링 훅
│   └── index.ts                       # export
└── components/
    └── AdminLayout.tsx                # 어드민 레이아웃 (기존)
```

## 다음 단계

1. **교육 관리 페이지 리팩토링**: 새로운 공통 컴포넌트 적용
2. **경력 관리 페이지 리팩토링**: 동일한 패턴 적용
3. **기술스택 관리 페이지 리팩토링**: Tabs 지원 확인
4. **자격증 관리 페이지 생성**: 새 패턴으로 구현
5. **테스트 코드 작성**: 공통 컴포넌트 테스트

## 참고사항

- 각 페이지의 특수한 요구사항은 컴포넌트를 확장하여 구현
- 탭이 필요한 경우 `CRUDModal`의 `tabs` prop 사용
- 추가 필드가 필요한 경우 폼에서 확장 가능
- 스타일은 CSS 모듈로 통일 권장

