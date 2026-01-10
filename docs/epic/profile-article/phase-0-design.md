# Phase 0: Admin 공통 프레임 정비 설계 문서

## 개요

**목표**: genpresso-admin-frontend의 검증된 패턴을 도입하여 Admin 개발 생산성과 유지보수성을 극대화

**범위**:
- Antd 통합 및 테마 설정
- Admin API 클라이언트 통합
- React Query 안정 옵션 표준화
- 테이블 표준 패턴 확립
- 공통 UI 컴포넌트 라이브러리

**비범위**:
- 실제 도메인 기능 구현 (Phase 1, 2에서 진행)
- 인증/인가 로직 변경

---

## 1. Antd 통합 및 테마 설정

### 1.1 목적
- 디자인시스템 CSS 변수와 Antd 테마 토큰 통합
- Admin 전체에 일관된 테마 적용
- 컴포넌트 스타일 중복 제거

### 1.2 구현 범위

#### 1.2.1 파일 구조
```
frontend/src/admin/
├── shared/
│   └── theme/
│       └── antdTheme.ts          # Antd 테마 설정
└── app/
    └── AdminApp.tsx               # Antd ConfigProvider 적용
```

#### 1.2.2 테마 설정 (`antdTheme.ts`)
```typescript
import { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    // 디자인시스템 CSS 변수 매핑
    colorPrimary: 'var(--color-primary)',
    colorSuccess: 'var(--color-success)',
    colorWarning: 'var(--color-warning)',
    colorError: 'var(--color-error)',
    colorInfo: 'var(--color-info)',

    // 레이아웃
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'var(--font-family)',

    // 간격
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,
  },
  components: {
    // Button 컴포넌트 커스터마이징
    Button: {
      controlHeight: 36,
      borderRadius: 6,
    },

    // Table 컴포넌트 커스터마이징
    Table: {
      headerBg: 'var(--color-surface-secondary)',
      headerColor: 'var(--color-text-primary)',
      rowHoverBg: 'var(--color-surface-hover)',
    },

    // Modal 컴포넌트 커스터마이징
    Modal: {
      borderRadius: 12,
    },

    // Input 컴포넌트 커스터마이징
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },

    // Card 컴포넌트 커스터마이징
    Card: {
      borderRadius: 12,
    },
  },
};
```

#### 1.2.3 AdminApp 적용
```typescript
// admin/app/AdminApp.tsx
import { ConfigProvider } from 'antd';
import { adminTheme } from '../shared/theme/antdTheme';

export function AdminApp() {
  return (
    <ConfigProvider theme={adminTheme}>
      {/* 기존 Admin 라우팅 및 레이아웃 */}
    </ConfigProvider>
  );
}
```

### 1.3 검증 기준
- [ ] Antd 컴포넌트가 디자인시스템 색상을 사용하는가?
- [ ] 모든 Admin 페이지에서 일관된 스타일이 적용되는가?
- [ ] CSS 변수 변경 시 Antd 컴포넌트도 함께 반영되는가?

---

## 2. Admin API 클라이언트 통합

### 2.1 목적
- 중복된 fetch 로직 제거
- 에러 처리 일관성 확보
- 세션 쿠키 기반 인증 표준화
- 공통 로깅 및 모니터링

### 2.2 구현 범위

#### 2.2.1 파일 구조
```
frontend/src/admin/
└── api/
    ├── adminApiClient.ts         # API 클라이언트 클래스
    └── types.ts                  # API 타입 정의
```

#### 2.2.2 AdminApiClient 클래스
```typescript
// admin/api/adminApiClient.ts
import { message } from 'antd';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class AdminApiClient {
  private baseURL = '/api/admin';

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * 파일 업로드 (FormData)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Content-Type은 브라우저가 자동 설정
    });
    return this.handleResponse<T>(response);
  }

  /**
   * URL 빌더 (쿼리 파라미터 포함)
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  /**
   * 공통 헤더
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 응답 처리
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseError(response);
      this.showErrorToast(error);
      throw error;
    }

    // 204 No Content 처리
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * 에러 파싱
   */
  private async parseError(response: Response): Promise<ApiError> {
    try {
      const data = await response.json();
      return {
        message: data.message || '요청 처리 중 오류가 발생했습니다.',
        status: response.status,
        code: data.code,
      };
    } catch {
      return {
        message: '요청 처리 중 오류가 발생했습니다.',
        status: response.status,
      };
    }
  }

  /**
   * 에러 토스트 표시
   */
  private showErrorToast(error: ApiError): void {
    if (error.status === 401) {
      message.error('로그인이 필요합니다.');
    } else if (error.status === 403) {
      message.error('권한이 없습니다.');
    } else if (error.status === 404) {
      message.error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.status >= 500) {
      message.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      message.error(error.message);
    }
  }
}

// 싱글톤 인스턴스
export const adminApiClient = new AdminApiClient();
```

#### 2.2.3 사용 예시
```typescript
// admin/entities/article/api/adminArticleApi.ts
import { adminApiClient } from '@/admin/api/adminApiClient';
import { Article, CreateArticleDto, UpdateArticleDto } from '../model/article.types';

export const adminArticleApi = {
  getAll: (params: DataTableParams) =>
    adminApiClient.get<DataTableResponse<Article>>('/articles', params),

  getById: (id: number) =>
    adminApiClient.get<Article>(`/articles/${id}`),

  create: (data: CreateArticleDto) =>
    adminApiClient.post<Article>('/articles', data),

  update: (id: number, data: UpdateArticleDto) =>
    adminApiClient.put<Article>(`/articles/${id}`, data),

  delete: (id: number) =>
    adminApiClient.delete<void>(`/articles/${id}`),
};
```

### 2.3 기존 코드 마이그레이션
- [ ] 모든 `entities/*/api/*.ts` 파일에서 개별 `fetch` 호출을 `adminApiClient` 사용으로 변경
- [ ] 중복 에러 처리 로직 제거
- [ ] `credentials: 'include'` 누락 확인 및 통일

### 2.4 검증 기준
- [ ] 모든 API 요청이 `adminApiClient`를 사용하는가?
- [ ] 에러 발생 시 일관된 토스트 메시지가 표시되는가?
- [ ] 세션 쿠키가 모든 요청에 포함되는가?
- [ ] 401/403 에러 시 적절한 메시지가 표시되는가?

---

## 3. React Query 안정 옵션 표준화

### 3.1 목적
- React Query 사용 시 깜빡임 방지 (`placeholderData: keepPreviousData`)
- 공통 옵션 통일 (staleTime, gcTime, retry 등)
- 보일러플레이트 코드 감소

### 3.2 구현 범위

#### 3.2.1 파일 구조
```
frontend/src/admin/
└── hooks/
    ├── useAdminQuery.ts          # Query 래퍼
    └── useAdminMutation.ts       # Mutation 래퍼
```

#### 3.2.2 useAdminQuery 훅
```typescript
// admin/hooks/useAdminQuery.ts
import { useQuery, UseQueryOptions, QueryKey, keepPreviousData } from '@tanstack/react-query';

export function useAdminQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    // 기본 옵션
    placeholderData: keepPreviousData, // 리페치 중 이전 데이터 유지 (깜빡임 방지)
    staleTime: 5 * 60 * 1000,          // 5분 (데이터가 신선한 상태로 간주되는 시간)
    gcTime: 10 * 60 * 1000,            // 10분 (캐시 보관 시간)
    retry: 1,                          // 실패 시 1회 재시도
    refetchOnWindowFocus: false,       // 윈도우 포커스 시 리페치 비활성화

    // 사용자 옵션 병합 (사용자 옵션이 우선)
    ...options,
  });
}
```

#### 3.2.3 useAdminMutation 훅
```typescript
// admin/hooks/useAdminMutation.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { message } from 'antd';

export function useAdminMutation<TData = unknown, TError = Error, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    // 기본 성공 메시지
    onSuccess: (data, variables, context) => {
      // 사용자 정의 onSuccess가 있으면 먼저 실행
      options.onSuccess?.(data, variables, context);
    },

    // 기본 에러 처리 (adminApiClient에서 이미 처리되므로 추가 로직 불필요)
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },

    // 사용자 옵션 병합
    ...options,
  });
}
```

#### 3.2.4 사용 예시
```typescript
// admin/entities/article/api/useAdminArticleQuery.ts
import { useAdminQuery } from '@/admin/hooks/useAdminQuery';
import { adminArticleApi } from './adminArticleApi';

export function useAdminArticlesQuery(params: DataTableParams) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticleApi.getAll(params),
  });
}

export function useAdminArticleQuery(id: number) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', id],
    queryFn: () => adminArticleApi.getById(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
}
```

### 3.3 기존 코드 마이그레이션
- [ ] 모든 `useQuery` 호출을 `useAdminQuery`로 변경
- [ ] 모든 `useMutation` 호출을 `useAdminMutation`으로 변경
- [ ] 중복된 옵션 제거 (staleTime, gcTime, retry 등)

### 3.4 검증 기준
- [ ] 페이지 전환 시 깜빡임이 발생하지 않는가? (keepPreviousData)
- [ ] 데이터 리페치가 적절히 캐싱되는가? (staleTime, gcTime)
- [ ] 모든 쿼리가 `useAdminQuery`를 사용하는가?

---

## 4. 테이블 표준 패턴 확립

### 4.1 목적
- 서버 사이드 페이징/정렬/필터 표준화 (DataTables 계약)
- 검색/필터/페이징 UI 통합
- 테이블 로직 재사용성 극대화

### 4.2 구현 범위

#### 4.2.1 파일 구조
```
frontend/src/admin/
├── types/
│   └── dataTable.types.ts        # DataTables 타입 정의
├── hooks/
│   └── useTablePage.ts           # 테이블 로직 훅
└── shared/
    └── ui/
        ├── TableTemplate/        # 테이블 템플릿 컴포넌트
        │   ├── index.tsx
        │   └── types.ts
        └── TablePaginationHeader/ # 테이블 헤더 컴포넌트
            ├── index.tsx
            └── types.ts
```

#### 4.2.2 DataTables 타입 정의
```typescript
// admin/types/dataTable.types.ts

/**
 * DataTables 서버 사이드 요청 파라미터
 * 참고: https://datatables.net/manual/server-side
 */
export interface DataTableParams {
  draw: number;                    // 요청 순서 번호
  start: number;                   // 시작 인덱스 (페이징)
  length: number;                  // 페이지 크기
  'search[value]': string;         // 검색어
  'order[0][column]'?: number;     // 정렬 컬럼 인덱스
  'order[0][dir]'?: 'asc' | 'desc'; // 정렬 방향

  // 커스텀 필터 (선택적)
  [key: string]: any;
}

/**
 * DataTables 서버 사이드 응답
 */
export interface DataTableResponse<T> {
  draw: number;                    // 요청과 동일한 draw 번호
  recordsTotal: number;            // 전체 레코드 수 (필터 전)
  recordsFiltered: number;         // 필터링된 레코드 수
  data: T[];                       // 실제 데이터
}

/**
 * 정렬 설정
 */
export interface SortConfig {
  column: number;                  // 컬럼 인덱스
  dir: 'asc' | 'desc';            // 정렬 방향
}

/**
 * 필터 옵션
 */
export interface FilterOption {
  key: string;                     // 필터 키 (API 파라미터 이름)
  label: string;                   // 필터 라벨 (UI 표시)
  options: Array<{                 // 선택 옵션
    label: string;
    value: string | number;
  }>;
}

/**
 * 검색 설정
 */
export interface SearchConfig {
  placeholder: string;             // 검색창 placeholder
  fields?: string[];               // 검색 대상 필드 (백엔드 참고용, 실제 검색은 서버에서 처리)
}
```

#### 4.2.3 useTablePage 훅
```typescript
// admin/hooks/useTablePage.ts
import { useState, useMemo } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { DataTableParams, DataTableResponse, SortConfig, FilterOption, SearchConfig } from '../types/dataTable.types';

export interface UseTablePageConfig {
  searchConfig?: SearchConfig;
  filters?: FilterOption[];
  sortableColumnIndexMap?: Record<string, number>; // 컬럼명 -> 인덱스 매핑
  defaultSort?: SortConfig;
  defaultPageSize?: number;
}

export interface UseTablePageParams {
  initialParams: DataTableParams;
  config: UseTablePageConfig;
  useQuery: (params: DataTableParams) => UseQueryResult<DataTableResponse<any>>;
  errorMessage?: string;
}

export function useTablePage({
  initialParams,
  config,
  useQuery,
  errorMessage = '데이터를 불러오는데 실패했습니다.',
}: UseTablePageParams) {
  // 테이블 파라미터 상태
  const [params, setParams] = useState<DataTableParams>(initialParams);

  // 검색어 상태 (입력 중인 값)
  const [searchInput, setSearchInput] = useState('');

  // React Query 호출
  const queryResult = useQuery(params);
  const { data, isLoading, error } = queryResult;

  // 페이지 변경
  const handlePageChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      start: (page - 1) * pageSize,
      length: pageSize,
      draw: prev.draw + 1,
    }));
  };

  // 페이지 크기 변경
  const handlePageSizeChange = (current: number, size: number) => {
    setParams((prev) => ({
      ...prev,
      start: 0, // 페이지 크기 변경 시 첫 페이지로
      length: size,
      draw: prev.draw + 1,
    }));
  };

  // 정렬 변경
  const handleSortChange = (columnIndex: number, direction: 'asc' | 'desc') => {
    setParams((prev) => ({
      ...prev,
      'order[0][column]': columnIndex,
      'order[0][dir]': direction,
      draw: prev.draw + 1,
    }));
  };

  // 검색 실행 (엔터 또는 검색 버튼 클릭 시)
  const handleSearch = () => {
    setParams((prev) => ({
      ...prev,
      'search[value]': searchInput,
      start: 0, // 검색 시 첫 페이지로
      draw: prev.draw + 1,
    }));
  };

  // 필터 변경
  const handleFilterChange = (filterKey: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [filterKey]: value,
      start: 0, // 필터 변경 시 첫 페이지로
      draw: prev.draw + 1,
    }));
  };

  // 테이블 props
  const tableProps = useMemo(
    () => ({
      dataSource: data?.data || [],
      loading: isLoading,
      pagination: {
        current: Math.floor(params.start / params.length) + 1,
        pageSize: params.length,
        total: data?.recordsFiltered || 0,
        showSizeChanger: true,
        showTotal: (total: number) => `전체 ${total}개`,
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
      },
      onChange: (pagination: any, filters: any, sorter: any) => {
        // Antd Table의 onChange 이벤트 처리
        if (sorter.order) {
          const columnIndex = config.sortableColumnIndexMap?.[sorter.field] || 0;
          handleSortChange(columnIndex, sorter.order === 'ascend' ? 'asc' : 'desc');
        }
      },
    }),
    [data, isLoading, params, config.sortableColumnIndexMap]
  );

  // 필터 상태
  const filterState = useMemo(
    () => ({
      searchInput,
      setSearchInput,
      handleSearch,
      filters: config.filters || [],
      handleFilterChange,
    }),
    [searchInput, config.filters]
  );

  return {
    tableProps,
    filterState,
    queryResult,
    error: error ? errorMessage : null,
  };
}
```

#### 4.2.4 TableTemplate 컴포넌트
```typescript
// admin/shared/ui/TableTemplate/index.tsx
import { Table, TableProps } from 'antd';
import { ReactNode } from 'react';

export interface TableTemplateProps<T> extends TableProps<T> {
  header?: ReactNode; // 테이블 상단 헤더 (검색/필터/통계 등)
}

export function TableTemplate<T extends Record<string, any>>({
  header,
  ...tableProps
}: TableTemplateProps<T>) {
  return (
    <div className="table-template">
      {header && <div className="table-template__header">{header}</div>}
      <Table {...tableProps} />
    </div>
  );
}
```

#### 4.2.5 사용 예시
```typescript
// admin/pages/ArticleManagement.tsx
import { useTablePage } from '@/admin/hooks/useTablePage';
import { TableTemplate } from '@/admin/shared/ui/TableTemplate';
import { useAdminArticlesQuery } from '@/admin/entities/article/api/useAdminArticleQuery';

export function ArticleManagement() {
  const { tableProps, filterState, error } = useTablePage({
    initialParams: {
      draw: 1,
      start: 0,
      length: 20,
      'search[value]': '',
    },
    config: {
      searchConfig: {
        placeholder: '제목, 내용 검색',
        fields: ['title', 'content'],
      },
      filters: [
        {
          key: 'category',
          label: '카테고리',
          options: [
            { label: '전체', value: '' },
            { label: '튜토리얼', value: 'tutorial' },
            { label: '트러블슈팅', value: 'troubleshooting' },
          ],
        },
        {
          key: 'status',
          label: '상태',
          options: [
            { label: '전체', value: '' },
            { label: '발행', value: 'published' },
            { label: '초안', value: 'draft' },
          ],
        },
      ],
      sortableColumnIndexMap: {
        publishedAt: 0,
        createdAt: 1,
      },
      defaultSort: { column: 0, dir: 'desc' },
      defaultPageSize: 20,
    },
    useQuery: useAdminArticlesQuery,
    errorMessage: '게시글 목록을 불러오는데 실패했습니다.',
  });

  return (
    <div>
      <h1>아티클 관리</h1>
      {error && <div className="error">{error}</div>}
      <TableTemplate
        {...tableProps}
        columns={ARTICLE_COLUMNS}
        rowKey="id"
      />
    </div>
  );
}
```

### 4.3 검증 기준
- [ ] 페이징/정렬/검색/필터가 서버 사이드로 동작하는가?
- [ ] DataTables 파라미터가 올바르게 전송되는가?
- [ ] 테이블 상태가 URL 쿼리 파라미터와 동기화되는가? (선택적)
- [ ] 에러 발생 시 적절한 메시지가 표시되는가?

---

## 5. 공통 UI 컴포넌트 라이브러리

### 5.1 목적
- Antd 컴포넌트를 프로젝트 요구사항에 맞게 래핑
- 재사용 가능한 공통 컴포넌트 제공
- Admin 페이지 개발 속도 향상

### 5.2 구현 범위

#### 5.2.1 파일 구조
```
frontend/src/admin/shared/ui/
├── SearchFilter/                 # 검색/필터 UI
│   ├── index.tsx
│   └── types.ts
├── StatsCards/                   # 통계 카드
│   ├── index.tsx
│   └── types.ts
├── FormModal/                    # CRUD 모달
│   ├── index.tsx
│   └── types.ts
├── TablePaginationHeader/        # 테이블 헤더
│   ├── index.tsx
│   └── types.ts
└── ConfirmModal/                 # 확인 모달
    ├── index.tsx
    └── types.ts
```

#### 5.2.2 SearchFilter 컴포넌트
```typescript
// admin/shared/ui/SearchFilter/index.tsx
import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FilterOption } from '@/admin/types/dataTable.types';

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string | number) => void;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder = '검색',
  filters = [],
  onFilterChange,
}: SearchFilterProps) {
  return (
    <Space size="middle">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
      />
      <Button type="primary" onClick={onSearch}>
        검색
      </Button>
      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={filter.label}
          style={{ width: 150 }}
          onChange={(value) => onFilterChange?.(filter.key, value)}
          options={filter.options}
        />
      ))}
    </Space>
  );
}
```

#### 5.2.3 StatsCards 컴포넌트
```typescript
// admin/shared/ui/StatsCards/index.tsx
import { Card, Statistic, Row, Col } from 'antd';

export interface StatCardData {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  valueStyle?: React.CSSProperties;
}

export interface StatsCardsProps {
  stats: StatCardData[];
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <Row gutter={16}>
      {stats.map((stat, index) => (
        <Col key={index} span={24 / stats.length}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              valueStyle={stat.valueStyle}
              loading={loading}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
```

#### 5.2.4 FormModal 컴포넌트
```typescript
// admin/shared/ui/FormModal/index.tsx
import { Modal, Form, FormProps } from 'antd';
import { ReactNode } from 'react';

export interface FormModalProps extends FormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLoading?: boolean;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  children: ReactNode;
}

export function FormModal({
  open,
  onClose,
  title,
  confirmLoading,
  onOk,
  okText = '확인',
  cancelText = '취소',
  children,
  ...formProps
}: FormModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onOk}
      title={title}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
    >
      <Form {...formProps}>{children}</Form>
    </Modal>
  );
}
```

#### 5.2.5 ConfirmModal 컴포넌트
```typescript
// admin/shared/ui/ConfirmModal/index.tsx
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface ConfirmModalOptions {
  title: string;
  content: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
}

export function showConfirmModal({
  title,
  content,
  onConfirm,
  onCancel,
  okText = '확인',
  cancelText = '취소',
  type = 'warning',
}: ConfirmModalOptions) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    onOk: onConfirm,
    onCancel,
    okButtonProps: {
      danger: type === 'error',
    },
  });
}
```

### 5.3 검증 기준
- [ ] 모든 컴포넌트가 Antd 테마를 올바르게 사용하는가?
- [ ] 타입이 명확하게 정의되어 있는가?
- [ ] 재사용 가능하도록 일반화되어 있는가?
- [ ] Admin 페이지에서 실제로 활용 가능한가?

---

## 6. 구현 순서

### 6.1 단계별 작업 순서
1. **Antd 통합 및 테마 설정** (가장 먼저)
   - 모든 컴포넌트가 일관된 테마를 사용하도록 기반 구축

2. **Admin API 클라이언트 통합**
   - 이후 모든 API 호출에 사용될 공통 클라이언트 구축

3. **React Query 안정 옵션 표준화**
   - API 클라이언트 완성 후 Query 래퍼 구축

4. **테이블 표준 패턴 확립**
   - API 클라이언트 + Query 래퍼를 활용한 테이블 로직 구축

5. **공통 UI 컴포넌트 라이브러리**
   - 테이블 패턴과 함께 사용될 UI 컴포넌트 구축

### 6.2 병렬 작업 가능 영역
- Antd 테마 설정과 API 클라이언트는 독립적으로 병렬 작업 가능
- 공통 UI 컴포넌트는 일부 독립적으로 병렬 작업 가능 (SearchFilter, StatsCards 등)

---

## 7. 검증 및 테스트

### 7.1 단위 테스트
- [ ] `adminApiClient` 메서드별 테스트 (get, post, put, delete, upload)
- [ ] 에러 처리 로직 테스트 (401, 403, 404, 500 등)
- [ ] `useTablePage` 훅 테스트 (페이징, 정렬, 검색, 필터)

### 7.2 통합 테스트
- [ ] Antd 테마가 모든 페이지에 적용되는지 확인
- [ ] API 클라이언트가 세션 쿠키를 올바르게 전송하는지 확인
- [ ] 테이블 컴포넌트가 서버 사이드 페이징/정렬을 올바르게 수행하는지 확인

### 7.3 UI/UX 테스트
- [ ] 모든 Antd 컴포넌트가 디자인시스템 색상을 사용하는지 확인
- [ ] 에러 토스트가 적절히 표시되는지 확인
- [ ] 테이블 페이징/정렬/검색이 부드럽게 동작하는지 확인 (깜빡임 없이)

---

## 8. 마이그레이션 가이드

### 8.1 기존 코드 마이그레이션 체크리스트
- [ ] 모든 `fetch` 호출을 `adminApiClient` 사용으로 변경
- [ ] 모든 `useQuery` 호출을 `useAdminQuery`로 변경
- [ ] 모든 `useMutation` 호출을 `useAdminMutation`으로 변경
- [ ] 중복된 에러 처리 로직 제거
- [ ] 중복된 React Query 옵션 제거

### 8.2 마이그레이션 예시

**Before:**
```typescript
// entities/article/api/adminArticleApi.ts
export const adminArticleApi = {
  getAll: async (params: DataTableParams) => {
    const response = await fetch('/api/admin/articles', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },
};

// entities/article/api/useAdminArticleQuery.ts
export function useAdminArticlesQuery(params: DataTableParams) {
  return useQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticleApi.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
```

**After:**
```typescript
// entities/article/api/adminArticleApi.ts
import { adminApiClient } from '@/admin/api/adminApiClient';

export const adminArticleApi = {
  getAll: (params: DataTableParams) =>
    adminApiClient.get<DataTableResponse<Article>>('/articles', params),
};

// entities/article/api/useAdminArticleQuery.ts
import { useAdminQuery } from '@/admin/hooks/useAdminQuery';

export function useAdminArticlesQuery(params: DataTableParams) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticleApi.getAll(params),
  });
}
```

---

## 9. 완료 기준

### 9.1 Phase 0 완료 조건
- [ ] Antd 테마가 모든 Admin 페이지에 적용됨
- [ ] 모든 API 호출이 `adminApiClient`를 사용함
- [ ] 모든 Query/Mutation이 `useAdminQuery`/`useAdminMutation`을 사용함
- [ ] `TableTemplate` 및 `useTablePage` 훅이 구현되어 있음
- [ ] 공통 UI 컴포넌트 5개가 모두 구현되어 있음 (SearchFilter, StatsCards, FormModal, TablePaginationHeader, ConfirmModal)
- [ ] 단위 테스트 및 통합 테스트 통과
- [ ] 기존 코드가 새로운 패턴으로 마이그레이션됨

### 9.2 다음 단계 (Phase 1)
- Phase 0 완료 후 Phase 1 (자기소개 Markdown 관리) 진행
- Phase 0에서 구축한 공통 프레임을 활용하여 빠르게 개발

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 설계 완료
