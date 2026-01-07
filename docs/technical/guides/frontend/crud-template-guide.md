# 프론트엔드 CRUD 템플릿 가이드

**작성일**: 2025-01-25  
**목적**: Feature-Sliced Design 기반 CRUD 템플릿 제공  
**대상**: 프론트엔드 개발자

---

## 📋 목차

1. [개요](#개요)
2. [템플릿 패턴](#템플릿-패턴)
3. [Shared 컴포넌트 템플릿](#shared-컴포넌트-템플릿)
4. [디렉토리 구조](#디렉토리-구조)
5. [적용 가이드라인](#적용-가이드라인)
6. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 개요

### Feature-Sliced Design 계층 구조

**프론트엔드 (Feature-Sliced Design)**:
- ✅ **Entities Layer**: API Client, React Query 훅
- ✅ **Features Layer**: 비즈니스 로직 훅, UI 컴포넌트
- ✅ **Pages Layer**: 컴포넌트 조합, 이벤트 핸들링

### 템플릿화 가능한 요소

| 계층 | 템플릿화 가능 | 템플릿화 불가능 (도메인별 커스텀) |
|------|-------------|------------------------------|
| **Frontend** | - API Client 클래스 구조<br>- React Query 훅 패턴<br>- CRUD 페이지 레이아웃<br>- 필터/통계 훅 구조<br>- 테이블 컬럼 생성 패턴 | - 도메인 타입 정의<br>- 필터링 조건<br>- 통계 계산 로직<br>- 폼 필드 구성 |

---

## 템플릿 패턴

### 1. Entities Layer 템플릿

#### 1.1 타입 정의

```typescript
// Template: entities/{entity}/model/{entity}.types.ts

/**
 * {Entity} 엔티티 타입
 *
 * 역할: 도메인 모델 타입 정의
 */
export interface {Entity} {
  id: {IdType};
  {필드}: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * {Entity} 생성/수정 요청 타입
 */
export interface {Entity}FormData {
  {필드}: string;
  isActive: boolean;
  // 생성/수정 시 필요한 필드만
}

/**
 * {Entity} 필터 타입
 */
export interface {Entity}Filter {
  searchText?: string;
  {조건필드}?: {조건타입};
  isActive?: boolean;
}

/**
 * {Entity} 통계 타입
 */
export interface {Entity}Stats {
  total: number;
  active: number;
  // 도메인별 통계 필드
}
```

#### 1.2 API Client

```typescript
// Template: entities/{entity}/api/{entity}Api.ts
import { {Entity}, {Entity}FormData } from '../model/{entity}.types';

/**
 * {Entity} API 클라이언트
 *
 * 책임: 백엔드 REST API와 통신
 */
class {Entity}Api {
  private baseUrl = '/api/{entities}';

  /**
   * 전체 {Entity} 목록 조회
   */
  async get{Entities}(): Promise<{Entity}[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 목록 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * ID로 {Entity} 조회
   */
  async get{Entity}ById(id: {IdType}): Promise<{Entity}> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * {Entity} 생성
   */
  async create{Entity}(data: {Entity}FormData): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 생성 실패');
    }
  }

  /**
   * {Entity} 수정
   */
  async update{Entity}(id: {IdType}, data: {Entity}FormData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 수정 실패');
    }
  }

  /**
   * {Entity} 삭제
   */
  async delete{Entity}(id: {IdType}): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 삭제 실패');
    }
  }

  /**
   * {Entity} 검색
   */
  async search{Entities}(keyword: string): Promise<{Entity}[]> {
    const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '{Entity} 검색 실패');
    }

    const result = await response.json();
    return result.data;
  }
}

export const {entity}Api = new {Entity}Api();
```

#### 1.3 React Query 훅

```typescript
// Template: entities/{entity}/api/use{Entity}Query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {entity}Api } from './{entity}Api';
import { {Entity}, {Entity}FormData } from '../model/{entity}.types';
import { message } from 'antd';

// ==================== Query Keys ====================
export const {ENTITY}_KEYS = {
  all: ['{entities}'] as const,
  lists: () => [...{ENTITY}_KEYS.all, 'list'] as const,
  list: (filter?: any) => [...{ENTITY}_KEYS.lists(), filter] as const,
  details: () => [...{ENTITY}_KEYS.all, 'detail'] as const,
  detail: (id: {IdType}) => [...{ENTITY}_KEYS.details(), id] as const,
};

// ==================== Queries ====================

/**
 * 전체 {Entity} 목록 조회 훅
 */
export const use{Entities}Query = () => {
  return useQuery({
    queryKey: {ENTITY}_KEYS.lists(),
    queryFn: () => {entity}Api.get{Entities}(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * {Entity} 상세 조회 훅
 */
export const use{Entity}Query = (id: {IdType} | null) => {
  return useQuery({
    queryKey: {ENTITY}_KEYS.detail(id!),
    queryFn: () => {entity}Api.get{Entity}ById(id!),
    enabled: !!id,
  });
};

// ==================== Mutations ====================

/**
 * {Entity} 생성/수정 Mutation 훅
 */
export const use{Entity}Mutation = (editing{Entity}?: {Entity} | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {Entity}FormData) => {
      if (editing{Entity}) {
        await {entity}Api.update{Entity}(editing{Entity}.id, data);
      } else {
        await {entity}Api.create{Entity}(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {ENTITY}_KEYS.lists() });
      message.success(
        editing{Entity} ? '{Entity} 수정 성공' : '{Entity} 생성 성공'
      );
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

/**
 * {Entity} 삭제 Mutation 훅
 */
export const useDelete{Entity}Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: {IdType}) => {entity}Api.delete{Entity}(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {ENTITY}_KEYS.lists() });
      message.success('{Entity} 삭제 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};
```

#### 1.4 Public API (index.ts)

```typescript
// Template: entities/{entity}/index.ts

// Types
export type {
  {Entity},
  {Entity}FormData,
  {Entity}Filter,
  {Entity}Stats
} from './model/{entity}.types';

// API
export { {entity}Api } from './api/{entity}Api';

// React Query Hooks
export {
  use{Entities}Query,
  use{Entity}Query,
  use{Entity}Mutation,
  useDelete{Entity}Mutation,
  {ENTITY}_KEYS,
} from './api/use{Entity}Query';
```

---

### 2. Features Layer 템플릿

#### 2.1 필터 훅

```typescript
// Template: features/{entity}-management/hooks/use{Entity}Filter.ts
import { useMemo, useState } from 'react';
import { {Entity}, {Entity}Filter } from '@/entities/{entity}';

/**
 * {Entity} 필터링 훅
 *
 * 책임: {Entity} 목록 필터링 로직
 */
export const use{Entity}Filter = ({entities}: {Entity}[] | undefined) => {
  const [searchText, setSearchText] = useState('');
  const [{조건필드}Filter, set{조건필드}Filter] = useState<{조건타입} | 'all'>('all');

  const filtered{Entities} = useMemo(() => {
    if (!{entities}) return [];

    return {entities}.filter(({entity}) => {
      // 1. 검색어 필터링
      const matchesSearch =
        !searchText ||
        {entity}.{필드}.toLowerCase().includes(searchText.toLowerCase());

      // 2. {조건필드} 필터링
      const matches{조건필드} =
        {조건필드}Filter === 'all' || {entity}.{조건필드} === {조건필드}Filter;

      return matchesSearch && matches{조건필드};
    });
  }, [{entities}, searchText, {조건필드}Filter]);

  return {
    filtered{Entities},
    searchText,
    setSearchText,
    {조건필드}Filter,
    set{조건필드}Filter,
  };
};
```

#### 2.2 통계 훅

```typescript
// Template: features/{entity}-management/hooks/use{Entity}Stats.ts
import { useMemo } from 'react';
import { {Entity}, {Entity}Stats } from '@/entities/{entity}';

/**
 * {Entity} 통계 계산 훅
 *
 * 책임: {Entity} 통계 계산
 */
export const use{Entity}Stats = ({entities}: {Entity}[] | undefined): {Entity}Stats => {
  return useMemo(() => {
    if (!{entities}) {
      return {
        total: 0,
        active: 0,
      };
    }

    return {
      total: {entities}.length,
      active: {entities}.filter(({entity}) => {entity}.isActive).length,
      // 도메인별 통계 계산
    };
  }, [{entities}]);
};
```

#### 2.3 필터 UI 컴포넌트

```typescript
// Template: features/{entity}-management/ui/{Entity}Filter.tsx
import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface {Entity}FilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  {조건필드}Filter: {조건타입} | 'all';
  on{조건필드}Change: (value: {조건타입} | 'all') => void;
}

/**
 * {Entity} 필터 컴포넌트
 *
 * 책임: {Entity} 검색 및 필터 UI
 */
export const {Entity}Filter: React.FC<{Entity}FilterProps> = ({
  searchText,
  onSearchChange,
  {조건필드}Filter,
  on{조건필드}Change,
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
      <Input
        placeholder="{Entity} 검색..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 300 }}
      />

      <Select
        value={{조건필드}Filter}
        onChange={on{조건필드}Change}
        style={{ width: 200 }}
        options={[
          { value: 'all', label: '전체' },
          // 도메인별 옵션
        ]}
      />
    </div>
  );
};
```

#### 2.4 통계 카드 컴포넌트

```typescript
// Template: features/{entity}-management/ui/{Entity}StatsCards.tsx
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { {Entity}Stats } from '@/entities/{entity}';

interface {Entity}StatsCardsProps {
  stats: {Entity}Stats;
}

/**
 * {Entity} 통계 카드 컴포넌트
 *
 * 책임: {Entity} 통계 정보 표시
 */
export const {Entity}StatsCards: React.FC<{Entity}StatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      <Col span={6}>
        <Card>
          <Statistic title="전체 {Entities}" value={stats.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="활성 {Entities}" value={stats.active} />
        </Card>
      </Col>
      {/* 도메인별 통계 카드 추가 */}
    </Row>
  );
};
```

#### 2.5 테이블 컬럼 정의

```typescript
// Template: features/{entity}-management/ui/{Entity}TableColumns.tsx
import { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';
import { {Entity} } from '@/entities/{entity}';

/**
 * {Entity} 테이블 컬럼 생성 함수
 *
 * 책임: Ant Design Table 컬럼 정의
 */
export const create{Entity}Columns = (): ColumnsType<{Entity}> => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '{필드명}',
      dataIndex: '{필드}',
      key: '{필드}',
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => new Date(createdAt).toLocaleString('ko-KR'),
    },
  ];
};
```

#### 2.6 Public API (index.ts)

```typescript
// Template: features/{entity}-management/index.ts

// Hooks
export { use{Entity}Filter } from './hooks/use{Entity}Filter';
export { use{Entity}Stats } from './hooks/use{Entity}Stats';

// UI Components
export { {Entity}Filter } from './ui/{Entity}Filter';
export { {Entity}StatsCards } from './ui/{Entity}StatsCards';
export { create{Entity}Columns } from './ui/{Entity}TableColumns';
```

---

### 3. Pages Layer 템플릿

```typescript
// Template: pages/{Entity}Management.tsx
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  {Entity},
  {Entity}FormData,
  use{Entities}Query,
  use{Entity}Mutation,
  useDelete{Entity}Mutation,
} from '@/entities/{entity}';
import {
  {Entity}Filter,
  {Entity}StatsCards,
  create{Entity}Columns,
  use{Entity}Filter,
  use{Entity}Stats,
} from '@/features/{entity}-management';

/**
 * {Entity} 관리 페이지
 *
 * 책임:
 * - Feature 계층 컴포넌트 조합
 * - CRUD 이벤트 핸들링
 * - 페이지 레벨 상태 관리
 */
export const {Entity}ManagementPage: React.FC = () => {
  // ==================== 상태 ====================
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing{Entity}, setEditing{Entity}] = useState<{Entity} | null>(null);
  const [form] = Form.useForm();

  // ==================== 데이터 페칭 (Entity 계층) ====================
  const { data: {entities}, isLoading } = use{Entities}Query();

  // ==================== 파생 상태 (Feature 계층) ====================
  const {
    filtered{Entities},
    searchText,
    setSearchText,
    {조건필드}Filter,
    set{조건필드}Filter,
  } = use{Entity}Filter({entities});

  const stats = use{Entity}Stats({entities});

  // ==================== Mutations ====================
  const { mutate: createOrUpdate{Entity}, isPending: isSaving } = use{Entity}Mutation(editing{Entity});
  const { mutate: delete{Entity} } = useDelete{Entity}Mutation();

  // ==================== 이벤트 핸들러 ====================

  /**
   * 생성 모달 열기
   */
  const handleCreate = () => {
    setEditing{Entity}(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  /**
   * 수정 모달 열기
   */
  const handleEdit = ({entity}: {Entity}) => {
    setEditing{Entity}({entity});
    form.setFieldsValue({entity});
    setIsModalVisible(true);
  };

  /**
   * 모달 확인 (생성/수정)
   */
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      createOrUpdate{Entity}(values as {Entity}FormData);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  /**
   * 모달 취소
   */
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  /**
   * 삭제
   */
  const handleDelete = (id: {IdType}) => {
    Modal.confirm({
      title: '정말 삭제하시겠습니까?',
      content: '이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        delete{Entity}(id);
      },
    });
  };

  // ==================== 테이블 컬럼 ====================
  const columns = [
    ...create{Entity}Columns(),
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_: any, record: {Entity}) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="small" onClick={() => handleEdit(record)}>
            수정
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  // ==================== 렌더링 ====================
  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1>{Entity} 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {Entity} 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <{Entity}StatsCards stats={stats} />

      {/* 필터 */}
      <{Entity}Filter
        searchText={searchText}
        onSearchChange={setSearchText}
        {조건필드}Filter={{조건필드}Filter}
        on{조건필드}Change={set{조건필드}Filter}
      />

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filtered{Entities}}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* 생성/수정 모달 */}
      <Modal
        title={editing{Entity} ? '{Entity} 수정' : '{Entity} 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={isSaving}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="{필드}"
            label="{필드명}"
            rules={[{ required: true, message: '{필드명}을 입력하세요' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="활성화"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          {/* 도메인별 폼 필드 추가 */}
        </Form>
      </Modal>
    </div>
  );
};
```

---

## Shared 컴포넌트 템플릿

### 1. Table 컴포넌트 (재사용 가능한 테이블)

```typescript
// Template: shared/ui/Table.tsx
import React from 'react';
import { Table as AntTable, Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface TableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  rowKey?: string | ((record: T) => string);
  pagination?: any;
}

/**
 * 재사용 가능한 테이블 컴포넌트
 *
 * 책임: 공통 테이블 UI 및 액션 버튼 제공
 */
export const Table = <T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  onEdit,
  onDelete,
  rowKey = 'id',
  pagination = { pageSize: 10 },
}: TableProps<T>) => {
  // 액션 컬럼 추가
  const actionColumn = {
    title: '작업',
    key: 'actions',
    width: 120,
    render: (_: any, record: T) => (
      <Space size="small">
        {onEdit && (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            수정
          </Button>
        )}
        {onDelete && (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          >
            삭제
          </Button>
        )}
      </Space>
    ),
  };

  const finalColumns = [...columns, actionColumn];

  return (
    <AntTable
      columns={finalColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
    />
  );
};
```

### 2. Modal 컴포넌트 (재사용 가능한 모달)

```typescript
// Template: shared/ui/Modal.tsx
import React from 'react';
import { Modal as AntModal, Form, FormInstance } from 'antd';

interface ModalProps<T> {
  title: string;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  loading?: boolean;
  form: FormInstance;
  children: React.ReactNode;
  width?: number;
}

/**
 * 재사용 가능한 모달 컴포넌트
 *
 * 책임: 공통 모달 UI 및 폼 검증
 */
export const Modal = <T,>({
  title,
  open,
  onOk,
  onCancel,
  loading = false,
  form,
  children,
  width = 600,
}: ModalProps<T>) => {
  const handleOk = async () => {
    try {
      await form.validateFields();
      onOk();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <AntModal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={width}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {children}
      </Form>
    </AntModal>
  );
};
```

### 3. DetailPageLayout 컴포넌트 (재사용 가능한 상세 페이지)

```typescript
// Template: shared/ui/DetailPageLayout.tsx
import React from 'react';
import { Card, Button, Space, Descriptions, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface DetailPageLayoutProps {
  title: string;
  loading?: boolean;
  onEdit?: () => void;
  onBack?: () => void;
  backUrl?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 재사용 가능한 상세 페이지 레이아웃
 *
 * 책임: 공통 상세 페이지 UI 구조
 */
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  title,
  loading = false,
  onEdit,
  onBack,
  backUrl,
  extra,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              뒤로
            </Button>
            <span>{title}</span>
          </Space>
        }
        extra={
          <Space>
            {extra}
            {onEdit && (
              <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
                수정
              </Button>
            )}
          </Space>
        }
      >
        {children}
      </Card>
    </Spin>
  );
};

/**
 * 상세 정보 표시용 Descriptions 래퍼
 */
interface DetailDescriptionsProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
    span?: number;
  }>;
  column?: number;
}

export const DetailDescriptions: React.FC<DetailDescriptionsProps> = ({
  items,
  column = 2,
}) => {
  return (
    <Descriptions bordered column={column}>
      {items.map((item, index) => (
        <Descriptions.Item key={index} label={item.label} span={item.span}>
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
};
```

### 4. StatsCards 컴포넌트 (재사용 가능한 통계 카드)

```typescript
// Template: shared/ui/StatsCards.tsx
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';

interface StatItem {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
}

interface StatsCardsProps {
  items: StatItem[];
  span?: number;
}

/**
 * 재사용 가능한 통계 카드 컴포넌트
 *
 * 책임: 공통 통계 정보 표시
 */
export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  span = 6,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      {items.map((item, index) => (
        <Col span={span} key={index}>
          <Card>
            <Statistic
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              prefix={item.prefix}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
```

### 5. SearchFilter 컴포넌트 (재사용 가능한 검색 필터)

```typescript
// Template: shared/ui/SearchFilter.tsx
import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilterOption {
  value: string | number;
  label: string;
}

interface SearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterValue?: string | number;
  onFilterChange?: (value: string | number) => void;
  filterLabel?: string;
}

/**
 * 재사용 가능한 검색 및 필터 컴포넌트
 *
 * 책임: 공통 검색 및 필터 UI
 */
export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchText,
  onSearchChange,
  searchPlaceholder = '검색...',
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel = '필터',
}) => {
  return (
    <Space style={{ marginBottom: '16px' }}>
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />

      {filterOptions && onFilterChange && (
        <>
          <span>{filterLabel}:</span>
          <Select
            value={filterValue}
            onChange={onFilterChange}
            style={{ width: 200 }}
            options={filterOptions}
            allowClear
          />
        </>
      )}
    </Space>
  );
};
```

### 6. Public API (index.ts)

```typescript
// Template: shared/ui/index.ts

// CRUD Components
export { Table } from './Table';
export { Modal } from './Modal';
export { DetailPageLayout, DetailDescriptions } from './DetailPageLayout';
export { StatsCards } from './StatsCards';
export { SearchFilter } from './SearchFilter';
```

---

## 디렉토리 구조

```
frontend/src/admin/

├── entities/{entity}/                   # 엔티티 계층
│   ├── model/
│   │   └── {entity}.types.ts          # 타입 정의
│   ├── api/
│   │   ├── {entity}Api.ts             # API 클라이언트
│   │   └── use{Entity}Query.ts        # React Query 훅
│   └── index.ts                       # Public API

├── features/{entity}-management/        # 기능 계층
│   ├── hooks/
│   │   ├── use{Entity}Filter.ts       # 필터링 훅
│   │   └── use{Entity}Stats.ts        # 통계 훅
│   ├── ui/
│   │   ├── {Entity}Filter.tsx         # 필터 UI
│   │   ├── {Entity}StatsCards.tsx     # 통계 카드
│   │   └── {Entity}TableColumns.tsx   # 테이블 컬럼
│   └── index.ts                       # Public API

├── pages/
│   └── {Entity}Management.tsx          # 페이지 컴포넌트

└── shared/                              # 공통 계층
    └── ui/
        ├── Table.tsx                    # 재사용 가능한 테이블
        ├── Modal.tsx                    # 재사용 가능한 모달
        ├── DetailPageLayout.tsx         # 재사용 가능한 상세 페이지
        ├── StatsCards.tsx               # 재사용 가능한 통계 카드
        ├── SearchFilter.tsx             # 재사용 가능한 검색 필터
        └── index.ts                     # Public API
```

---

## 적용 가이드라인

### 1. 새 도메인 추가 시 절차

#### 프론트엔드

**0. Shared Layer 작성 (최초 1회만, 이후 재사용)**
   - [ ] Table 컴포넌트 작성 (`shared/ui/Table.tsx`)
   - [ ] Modal 컴포넌트 작성 (`shared/ui/Modal.tsx`)
   - [ ] DetailPageLayout 컴포넌트 작성 (`shared/ui/DetailPageLayout.tsx`)
   - [ ] StatsCards 컴포넌트 작성 (`shared/ui/StatsCards.tsx`)
   - [ ] SearchFilter 컴포넌트 작성 (`shared/ui/SearchFilter.tsx`)
   - [ ] Public API 정의 (`shared/ui/index.ts`)

1. **Entities Layer 작성**
   - [ ] 타입 정의 (`{entity}.types.ts`)
   - [ ] API Client 작성 (`{entity}Api.ts`)
   - [ ] React Query 훅 작성 (`use{Entity}Query.ts`)
   - [ ] Public API 정의 (`index.ts`)

2. **Features Layer 작성**
   - [ ] 필터 훅 작성 (`use{Entity}Filter.ts`)
   - [ ] 통계 훅 작성 (`use{Entity}Stats.ts`)
   - [ ] 테이블 컬럼 정의 (`{Entity}TableColumns.tsx`)
   - [ ] Public API 정의 (`index.ts`)

3. **Pages Layer 작성**
   - [ ] 페이지 컴포넌트 작성 (`{Entity}Management.tsx`)
   - [ ] Shared 컴포넌트 활용 (Table, Modal 등)
   - [ ] CRUD 이벤트 핸들러 구현
   - [ ] 폼 검증 로직 추가

4. **라우팅 추가**
   - [ ] 라우터에 페이지 경로 등록
   - [ ] 네비게이션 메뉴 추가

### 2. 템플릿 커스터마이징 가이드

#### 도메인별로 달라지는 부분

**프론트엔드**:
1. **타입 정의**: 도메인 모델 필드
2. **필터 조건**: `use{Entity}Filter`의 필터링 로직
3. **통계 계산**: `use{Entity}Stats`의 통계 항목
4. **폼 필드**: 페이지의 Form.Item 구성
5. **테이블 컬럼**: 표시할 컬럼 정의

#### 재사용 가능한 부분 (수정 불필요)

**프론트엔드**:
- API Client 기본 구조
- React Query 훅 패턴
- 페이지 레이아웃 구조
- CRUD 이벤트 핸들링 패턴
- **Shared 컴포넌트**: Table, Modal, DetailPageLayout 등

### 3. Shared 컴포넌트 활용 예시

#### 예시 1: Table을 사용한 페이지

```typescript
// pages/{Entity}Management.tsx
import { Table } from '@/shared/ui';
import { create{Entity}Columns } from '@/features/{entity}-management';

export const {Entity}ManagementPage: React.FC = () => {
  const { data, isLoading } = use{Entities}Query();
  const { mutate: delete{Entity} } = useDelete{Entity}Mutation();

  const handleEdit = (record: {Entity}) => {
    // 수정 로직
  };

  const handleDelete = (record: {Entity}) => {
    Modal.confirm({
      title: '정말 삭제하시겠습니까?',
      onOk: () => delete{Entity}(record.id),
    });
  };

  return (
    <div>
      <h1>{Entity} 관리</h1>
      
      <Table
        dataSource={data || []}
        columns={create{Entity}Columns()}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
```

#### 예시 2: Modal을 사용한 페이지

```typescript
// pages/{Entity}Management.tsx
import { Modal } from '@/shared/ui';
import { Form, Input, Switch } from 'antd';

export const {Entity}ManagementPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing{Entity}, setEditing{Entity}] = useState<{Entity} | null>(null);

  const { mutate: createOrUpdate{Entity}, isPending } = use{Entity}Mutation(editing{Entity});

  const handleModalOk = async () => {
    const values = await form.validateFields();
    createOrUpdate{Entity}(values);
    setIsModalVisible(false);
  };

  return (
    <>
      <Modal
        title={editing{Entity} ? '{Entity} 수정' : '{Entity} 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        loading={isPending}
        form={form}
      >
        <Form.Item name="{필드}" label="{필드명}" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="isActive" label="활성화" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Modal>
    </>
  );
};
```

#### 예시 3: DetailPageLayout을 사용한 상세 페이지

```typescript
// pages/{Entity}Detail.tsx
import { DetailPageLayout, DetailDescriptions } from '@/shared/ui';
import { useParams, useNavigate } from 'react-router-dom';

export const {Entity}DetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = use{Entity}Query(id);

  const handleEdit = () => {
    navigate(`/{entities}/${id}/edit`);
  };

  if (!data) return null;

  return (
    <DetailPageLayout
      title="{Entity} 상세"
      loading={isLoading}
      onEdit={handleEdit}
      backUrl="/{entities}"
    >
      <DetailDescriptions
        items={[
          { label: 'ID', value: data.id },
          { label: '{필드명}', value: data.{필드} },
          { label: '상태', value: data.isActive ? '활성' : '비활성' },
          { label: '생성일', value: new Date(data.createdAt).toLocaleString() },
        ]}
      />
    </DetailPageLayout>
  );
};
```

#### 예시 4: StatsCards와 SearchFilter를 사용한 페이지

```typescript
// pages/{Entity}Management.tsx
import { StatsCards, SearchFilter } from '@/shared/ui';

export const {Entity}ManagementPage: React.FC = () => {
  const { data } = use{Entities}Query();
  const [searchText, setSearchText] = useState('');

  const stats = [
    { title: '전체', value: data?.length || 0 },
    { title: '활성', value: data?.filter(d => d.isActive).length || 0 },
  ];

  return (
    <div>
      <StatsCards items={stats} />
      
      <SearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="{Entity} 검색..."
      />
    </div>
  );
};
```

---

## 마이그레이션 체크리스트

### 우선순위

| 순위 | 도메인 | 복잡도 | 예상 작업 시간 | 비고 |
|-----|--------|--------|--------------|------|
| 1 | Education (교육 이력) | 중 | 4-6시간 | 단순 CRUD, 관계 적음 |
| 2 | Experience (경력) | 중 | 4-6시간 | 단순 CRUD, 관계 적음 |
| 3 | Skill (기술 스택) | 중 | 4-6시간 | 단순 CRUD, 관계 적음 |
| 4 | Project (프로젝트) | 높음 | 8-10시간 | 복잡한 관계, 다중 연관 |
| 5 | Admin (관리자) | 중 | 6-8시간 | 인증/인가 로직 포함 |

### 마이그레이션 체크리스트

각 도메인 마이그레이션 시 다음 체크리스트를 따릅니다:

#### ✅ 사전 준비
- [ ] 현재 코드 분석 (구조, 의존성)
- [ ] 템플릿 선택 (CRUD 템플릿 적용 가능 여부)
- [ ] 도메인별 특수 요구사항 파악

#### ✅ 프론트엔드 마이그레이션
- [ ] Shared Layer 구성 (최우선)
  - [ ] Table 컴포넌트 작성
  - [ ] Modal 컴포넌트 작성
  - [ ] DetailPageLayout 컴포넌트 작성
  - [ ] StatsCards 컴포넌트 작성
  - [ ] SearchFilter 컴포넌트 작성
- [ ] Entities Layer 구성
  - [ ] 타입 정의
  - [ ] API Client 작성
  - [ ] React Query 훅 작성
- [ ] Features Layer 구성
  - [ ] 비즈니스 로직 훅 분리
  - [ ] UI 컴포넌트 분리
- [ ] Pages Layer 리팩토링
  - [ ] Shared 컴포넌트 활용
  - [ ] Feature 조합으로 변경
  - [ ] 비즈니스 로직을 Feature로 이동

#### ✅ 테스트 및 검증
- [ ] 단위 테스트 작성/수정
- [ ] 통합 테스트 검증
- [ ] UI 테스트 검증

#### ✅ 문서화
- [ ] 가이드라인 업데이트
- [ ] 마이그레이션 기록 작성
- [ ] 다음 도메인 마이그레이션 계획 수립

---

## 결론

이 템플릿을 활용하면 다음과 같은 이점을 얻을 수 있습니다:

1. **일관성**: 모든 도메인이 동일한 아키텍처 패턴을 따름
2. **생산성**: 반복적인 코드 작성 시간 단축
3. **유지보수성**: 구조화된 코드로 버그 추적 및 수정 용이
4. **확장성**: 새로운 도메인 추가 시 템플릿 기반으로 빠르게 구현
5. **학습 곡선**: 신규 개발자가 코드베이스 이해하기 쉬움
6. **재사용성**: Shared 컴포넌트를 통해 UI 일관성 유지 및 개발 속도 향상

### Shared 컴포넌트의 추가 이점

- **UI 일관성**: 모든 CRUD 페이지가 동일한 UI/UX 패턴을 따름
- **빠른 개발**: 테이블, 모달, 상세 페이지를 매번 새로 작성할 필요 없음
- **중앙 관리**: UI 변경 시 Shared 컴포넌트만 수정하면 모든 페이지에 반영
- **테스트 용이성**: 공통 컴포넌트에 대한 테스트를 한 번만 작성하면 됨

### 권장 작업 순서

1. **1단계**: Shared 컴포넌트 작성 (Table, Modal, DetailPageLayout 등)
2. **2단계**: 첫 번째 도메인(Education)에 템플릿 적용
3. **3단계**: 두 번째 도메인(Experience)에 템플릿 적용
4. **4단계**: 세 번째 도메인(Skill)에 템플릿 적용
5. **5단계**: 템플릿 개선 및 추가 도메인 적용

다음 단계는 이 템플릿을 실제 도메인(Education, Experience, Skill 등)에 적용하고, 마이그레이션 경험을 바탕으로 템플릿을 계속 개선하는 것입니다.

---

**작성일**: 2025-01-25  
**버전**: 1.0  
**작성자**: AI Agent (Claude)

