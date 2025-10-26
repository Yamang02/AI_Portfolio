# Admin Shared Components

어드민 페이지의 공통 컴포넌트와 훅을 제공합니다.

## 구조

```
shared/
├── ui/                    # 공통 UI 컴포넌트
│   ├── ManagementPageLayout.tsx    # 관리 페이지 레이아웃
│   ├── CRUDModal.tsx               # CRUD 모달
│   ├── Table.tsx                    # 테이블
│   ├── SearchFilter.tsx             # 검색 필터
│   ├── StatsCards.tsx               # 통계 카드
│   └── index.ts
├── hooks/                  # 공통 훅
│   ├── useManagementPage.ts        # CRUD 로직
│   ├── useSearchFilter.ts          # 검색 및 필터
│   └── index.ts
└── components/             # 레이아웃 컴포넌트
    └── AdminLayout.tsx
```

## 사용법

### 1. ManagementPageLayout

관리 페이지의 공통 레이아웃을 제공합니다.

```tsx
import { ManagementPageLayout } from '@/admin/shared/ui';

<ManagementPageLayout
  title="제목"
  buttonText="추가"
  onAdd={handleCreate}
  statsCards={<YourStatsCards />}
  filter={<YourFilter />}
>
  <Table dataSource={data} columns={columns} />
</ManagementPageLayout>
```

### 2. CRUDModal

생성/수정/삭제 모달을 통합 제공합니다.

```tsx
import { CRUDModal } from '@/admin/shared/ui';

<CRUDModal
  title={isEdit ? '수정' : '추가'}
  open={isModalVisible}
  loading={isLoading}
  isEditMode={isEdit}
  onOk={handleOk}
  onCancel={handleCancel}
  onDelete={handleDelete}
>
  <Form.Item name="title" label="제목">
    <Input />
  </Form.Item>
</CRUDModal>
```

**탭 지원:**
```tsx
<CRUDModal
  tabs={[
    { key: 'basic', label: '기본 정보', children: <BasicForm /> },
    { key: 'detail', label: '상세 정보', children: <DetailForm /> },
  ]}
/>
```

### 3. useManagementPage

CRUD 로직을 통합 관리하는 훅입니다.

```tsx
import { useManagementPage } from '@/admin/shared/hooks';

const crud = useManagementPage({
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
});
```

**반환 값:**
- `isModalVisible`: 모달 표시 여부
- `editingEntity`: 수정 중인 엔티티
- `isLoading`: 로딩 상태
- `handleCreate`: 생성 모달 열기
- `handleEdit`: 수정 모달 열기
- `handleModalOk`: 저장
- `handleModalCancel`: 취소
- `handleDelete`: 삭제

### 4. useSearchFilter

검색 및 필터링 로직을 제공하는 훅입니다.

```tsx
import { useSearchFilter } from '@/admin/shared/hooks';

const {
  filteredData,
  searchText,
  setSearchText,
} = useSearchFilter({
  data: items,
  searchFields: ['title', 'description'],
});
```

**반환 값:**
- `filteredData`: 필터링된 데이터
- `searchText`: 검색어
- `setSearchText`: 검색어 설정
- `filterValues`: 필터 값들
- `setFilter`: 필터 값 설정
- `clearFilters`: 필터 초기화

## 전체 예시

```tsx
import React from 'react';
import { Form } from 'antd';
import {
  ManagementPageLayout,
  CRUDModal,
  Table,
  SearchFilter,
} from '@/admin/shared/ui';
import { useManagementPage } from '@/admin/shared/hooks';

const YourManagement: React.FC = () => {
  const [form] = Form.useForm();
  const { data, isLoading } = useYourDataQuery();

  // CRUD 로직
  const crud = useManagementPage({
    onCreate: async (data) => createMutation.mutateAsync(data),
    onUpdate: async (id, data) => updateMutation.mutateAsync({ ...data, id }),
    onDelete: async (id) => deleteMutation.mutateAsync(id),
    form,
    getEntityId: (entity) => entity.id,
  });

  // 필터링
  const { filteredData, searchText, setSearchText } = useSearchFilter({
    data,
    searchFields: ['title'],
  });

  return (
    <ManagementPageLayout
      title="제목"
      buttonText="추가"
      onAdd={crud.handleCreate}
      statsCards={<YourStatsCards />}
      filter={
        <SearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
        />
      }
    >
      <Table
        dataSource={filteredData}
        columns={columns}
        loading={isLoading}
        onRowClick={crud.handleEdit}
        rowKey="id"
      />

      <CRUDModal
        title={crud.editingEntity ? '수정' : '추가'}
        open={crud.isModalVisible}
        loading={crud.isLoading}
        isEditMode={!!crud.editingEntity}
        onOk={crud.handleModalOk}
        onCancel={crud.handleModalCancel}
        onDelete={crud.handleDelete}
      >
        <Form.Item name="field" label="필드">
          <Input />
        </Form.Item>
      </CRUDModal>
    </ManagementPageLayout>
  );
};
```

## 기존 컴포넌트

### Table
```tsx
<Table
  dataSource={data}
  columns={columns}
  loading={isLoading}
  onRowClick={handleClick}
  rowKey="id"
/>
```

### SearchFilter
```tsx
<SearchFilter
  searchText={searchText}
  onSearchChange={setSearchText}
  filterOptions={options}
  filterValue={filter}
  onFilterChange={setFilter}
/>
```

### StatsCards
```tsx
<StatsCards
  items={[
    { title: '전체', value: total },
    { title: '활성', value: active },
  ]}
/>
```

## 더 보기

자세한 사용법은 [패턴 가이드](../../../../docs/admin/management-page-pattern-guide.md)를 참고하세요.

