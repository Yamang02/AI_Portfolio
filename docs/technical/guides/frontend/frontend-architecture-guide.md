# Frontend 개발 가이드라인 - Feature-Sliced Design

## 📚 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [계층별 역할 및 책임](#계층별-역할-및-책임)
3. [디렉토리 구조 규칙](#디렉토리-구조-규칙)
4. [패턴 (Best Practices)](#패턴-best-practices)
5. [안티패턴 (Anti-Patterns)](#안티패턴-anti-patterns)
6. [코드 예시](#코드-예시)
7. [체크리스트](#체크리스트)

---

## 아키텍처 개요

이 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 기반으로 구성되어 있습니다.

### 핵심 원칙
1. **계층화 (Layered Architecture)**: 각 계층은 명확한 책임을 가집니다
2. **단방향 의존성**: 상위 계층만 하위 계층에 의존합니다
3. **독립성**: 각 기능(feature)은 독립적으로 작동합니다
4. **재사용성**: shared 계층을 통해 공통 로직을 공유합니다

### 계층 구조 (위에서 아래로)
```
app         → 애플리케이션 진입점 및 전역 설정
pages       → 라우팅 및 페이지 조합
features    → 비즈니스 기능 (사용자 시나리오)
entities    → 비즈니스 엔티티 (도메인 모델)
shared      → 재사용 가능한 공통 코드
```

### 의존성 방향
```
app (최상위)
 ↓
pages
 ↓
features
 ↓
entities
 ↓
shared (최하위)
```

**중요**: 하위 계층은 상위 계층을 import 할 수 없습니다!

### 현재 프로젝트 구조
```
frontend/src/
├── main/               // 메인 포트폴리오 앱
│   ├── app/           // 앱 설정
│   ├── pages/         // 페이지
│   ├── features/      // 기능
│   ├── entities/      // 엔티티
│   └── layout/        // 레이아웃
└── admin/             // 관리자 앱
    ├── app/           // 앱 설정
    ├── pages/         // 페이지
    ├── features/      // 기능
    └── shared/        // 공통 컴포넌트

shared/                // 전역 공통 코드
├── api/              // API 클라이언트
├── ui/               // 재사용 UI 컴포넌트
├── lib/              // 유틸리티 함수
├── types/            // 공통 타입
└── hooks/            // 공통 훅
```

---

## 계층별 역할 및 책임

### 1️⃣ App Layer (`app/`)

**역할**: 애플리케이션 초기화 및 전역 설정

#### 포함 요소
- **Providers**: Context Provider, Router 설정
- **Global Styles**: 전역 CSS, 테마 설정
- **App Configuration**: 환경 변수, 전역 설정

#### 의존성 규칙
- ✅ **의존 가능**: 모든 하위 계층
- ❌ **의존 금지**: 외부 앱의 app 계층

#### 디렉토리 구조
```
app/
├── providers/
│   ├── AppProvider.tsx       // React Query, Router 등
│   └── index.ts
├── MainApp.tsx               // 앱 진입점
└── index.ts
```

#### 예시
```tsx
// ✅ Good: app/providers/AppProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};
```

---

### 2️⃣ Pages Layer (`pages/`)

**역할**: 라우팅 및 여러 기능(features)의 조합

#### 포함 요소
- **Route Components**: 각 URL에 대응하는 페이지 컴포넌트
- **Layout**: 페이지 레이아웃 구성
- **Feature Composition**: 여러 feature를 조합하여 페이지 구성

#### 의존성 규칙
- ✅ **의존 가능**: features, entities, shared
- ❌ **의존 금지**: 다른 pages
- ❌ **비즈니스 로직 포함 금지**: 로직은 features에 위임

#### 디렉토리 구조
```
pages/
├── SomeDetail/
│   ├── SomeDetailPage.tsx      // 메인 페이지 컴포넌트
│   ├── components/                // 페이지 전용 컴포넌트
│   │   ├── SomeDetailHeader.tsx
│   │   ├── SomeDetailContent.tsx
│   │   └── SomeDetailSidebar.tsx
│   ├── hooks/                     // 페이지 전용 훅
│   │   └── useSomeDetail.ts
│   └── index.ts
└── index.ts
```

#### 예시
```tsx
// ✅ Good: pages/SomeDetail/SomeDetailPage.tsx
import { SomeDetailHeader } from './components/SomeDetailHeader';
import { SomeDetailContent } from './components/SomeDetailContent';
import { useSomeDetail } from './hooks/useSomeDetail';

export const SomeDetailPage: React.FC = () => {
  const { data, isLoading } = useSomeDetail();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <SomeDetailHeader data={data} />
      <SomeDetailContent data={data} />
    </div>
  );
};

// ❌ Bad: 비즈니스 로직이 페이지에 포함
export const SomeDetailPage: React.FC = () => {
  const [data, setData] = useState<SomeData | null>(null);

  useEffect(() => {
    // API 호출 로직이 페이지에 직접 존재 ❌
    fetch(`/api/some-data/${id}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [id]);

  return <div>{/* ... */}</div>;
};
```

---

### 3️⃣ Features Layer (`features/`)

**역할**: 사용자 시나리오 및 비즈니스 기능 구현

#### 포함 요소
- **UI Components**: 기능에 특화된 UI
- **Business Logic**: 해당 기능의 비즈니스 로직
- **Hooks**: 기능 전용 커스텀 훅
- **Types**: 기능 전용 타입

#### 의존성 규칙
- ✅ **의존 가능**: entities, shared
- ❌ **의존 금지**: pages, 다른 features
- ❌ **Feature 간 직접 의존 금지**: shared를 통해 공유

#### 디렉토리 구조
```
features/
├── {feature-name}/
│   ├── ui/                        // UI 컴포넌트
│   │   ├── {Feature}Form.tsx
│   │   └── {Feature}Card.tsx
│   ├── model/                     // 비즈니스 로직
│   │   ├── {feature}.types.ts
│   │   └── {feature}.store.ts (선택)
│   ├── api/                       // API 호출
│   │   └── {feature}Api.ts
│   ├── hooks/                     // 커스텀 훅
│   │   └── use{Feature}.ts
│   └── index.ts
```

#### 예시
```tsx
// ✅ Good: features/auth/ui/LoginForm.tsx
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (values: LoginFormData) => {
    await login(values.username, values.password);
  };

  return (
    <Form onFinish={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
};

// features/auth/hooks/useAuth.ts
export const useAuth = () => {
  const { login: authLogin } = useAuthContext();

  const login = async (username: string, password: string) => {
    const result = await authLogin(username, password);
    if (result.success) {
      navigate('/admin/dashboard');
    }
    return result;
  };

  return { login, isLoading };
};

// ❌ Bad: Feature 간 직접 의존
import { SomeComponent } from '../../other-feature/ui/SomeComponent'; // ❌
```

---

### 4️⃣ Entities Layer (`entities/`)

**역할**: 비즈니스 엔티티 및 도메인 모델

#### 포함 요소
- **Domain Models**: 비즈니스 엔티티 타입
- **API**: 엔티티 관련 API 호출
- **Hooks**: 엔티티 데이터 관리 훅 (React Query)
- **UI**: 엔티티 표현을 위한 기본 UI (선택)

#### 의존성 규칙
- ✅ **의존 가능**: shared
- ❌ **의존 금지**: pages, features, 다른 entities
- ❌ **비즈니스 로직 포함 금지**: 순수 데이터 모델과 CRUD만

#### 디렉토리 구조
```
entities/
├── {entity-name}/
│   ├── model/                     // 도메인 모델
│   │   └── {entity}.types.ts
│   ├── api/                       // API 호출
│   │   ├── {entity}Api.ts
│   │   └── use{Entity}Query.ts    // React Query 훅
│   ├── ui/ (선택)                 // 엔티티 UI
│   │   ├── {Entity}Badge.tsx
│   │   └── {Entity}List.tsx
│   └── index.ts
```

#### 예시
```tsx
// ✅ Good: entities/project/model/project.types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string | null;
}

// entities/project/api/projectApi.ts
class ProjectApi {
  async getProjects(params?: { type?: string }): Promise<Project[]> {
    return apiClient.getProjects(params);
  }

  async getProjectById(id: string): Promise<Project> {
    return apiClient.getProjectById(id);
  }
}

export const projectApi = new ProjectApi();

// entities/project/api/useProjectsQuery.ts
export const useProjectsQuery = (params?: { type?: string }) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApi.getProjects(params),
  });
};

// entities/project/ui/ProjectBadge.tsx (선택)
export const ProjectBadge: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Badge>
      {project.title}
    </Badge>
  );
};

// ❌ Bad: 비즈니스 로직 포함
export const useProjects = () => {
  const { data } = useProjectsQuery();

  // 필터링 로직 ❌ - features 계층에서 처리해야 함
  const filteredProjects = data?.filter(p => p.status === 'active');

  return { projects: filteredProjects };
};
```

---

### 5️⃣ Shared Layer (`shared/`)

**역할**: 애플리케이션 전역에서 재사용 가능한 코드

#### 포함 요소
- **UI Components**: 공통 UI 컴포넌트 (Button, Modal, Card 등)
- **API Client**: 백엔드 통신 클라이언트
- **Utils**: 유틸리티 함수
- **Hooks**: 공통 커스텀 훅
- **Types**: 공통 타입 정의
- **Config**: 설정 파일

#### 의존성 규칙
- ✅ **의존 가능**: 외부 라이브러리만
- ❌ **의존 금지**: 모든 상위 계층 (app, pages, features, entities)
- ❌ **비즈니스 로직 포함 금지**: 도메인 독립적이어야 함

#### 디렉토리 구조
```
shared/
├── ui/                            // 공통 UI 컴포넌트
│   ├── modal/
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── icon/
│   └── skeleton/
├── api/                           // API 클라이언트
│   └── apiClient.ts
├── lib/                           // 유틸리티 함수
│   ├── date/
│   │   └── dateUtils.ts
│   └── string/
│       └── stringUtils.ts
├── hooks/                         // 공통 훅
│   ├── useCardHover.ts
│   └── index.ts
├── types/                         // 공통 타입
│   ├── api.ts
│   ├── common.types.ts
│   └── index.ts
└── config/                        // 설정
    └── app.config.ts
```

#### 예시
```tsx
// ✅ Good: shared/ui/modal/Modal.tsx
export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-header">{title}</div>
      <div className="modal-content">{children}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

// shared/lib/date/dateUtils.ts
export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  // 날짜 포맷팅 로직
  return formattedDate;
};

// shared/api/apiClient.ts
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ❌ Bad: 비즈니스 로직 포함
// shared/utils/projectUtils.ts
export const getActiveProjects = (projects: Project[]) => {
  // 프로젝트 필터링 로직 ❌ - features에서 처리해야 함
  return projects.filter(p => p.status === 'active');
};
```

---

## 디렉토리 구조 규칙

### 규칙 1: Public API (index.ts)
각 슬라이스는 `index.ts`를 통해서만 내보내기를 노출합니다.

```
✅ Good
entities/project/
├── model/
│   └── project.types.ts
├── api/
│   ├── projectApi.ts
│   └── useProjectsQuery.ts
└── index.ts                     // Public API

// index.ts
export type { Project } from './model/project.types';
export { useProjectsQuery } from './api/useProjectsQuery';
export { projectApi } from './api/projectApi';

// 다른 계층에서 사용
import { Project, useProjectsQuery } from '@/entities/project';

❌ Bad
// 직접 파일 경로로 import
import { Project } from '@/entities/project/model/project.types';
```

### 규칙 2: 세그먼트 (Segment) 구조
각 슬라이스는 표준 세그먼트로 구성됩니다.

```
{slice}/
├── ui/          // UI 컴포넌트
├── model/       // 비즈니스 로직, 타입, 스토어
├── api/         // API 호출
├── lib/         // 헬퍼 함수
├── hooks/       // 커스텀 훅
└── index.ts     // Public API
```

### 규칙 3: 명명 규칙

#### 파일명
```
✅ Good
PascalCase: 컴포넌트, 타입 정의
  - SomeComponent.tsx
  - someEntity.types.ts

camelCase: 함수, 훅, 유틸
  - useSomeFeature.ts
  - formatDate.ts
  - someApi.ts

kebab-case: 일반 파일 (선택)
  - some-component.tsx

❌ Bad
some_component.tsx          // snake_case 지양
SomeComponent.ts            // 컴포넌트는 .tsx
usesomefeature.ts           // 첫 글자는 소문자
```

#### 컴포넌트명
```
✅ Good
export const SomeComponent: React.FC<SomeComponentProps> = ({ ... }) => { ... };

❌ Bad
export default function SomeComponent() { ... }  // default export 지양
export const SomeComponentComponent = () => { ... };  // Component 접미사 불필요
```

#### 훅명
```
✅ Good
export const useSomeFeature = () => { ... };
export const useSomeFeatureQuery = () => { ... };

❌ Bad
export const getSomeFeature = () => { ... };  // use 접두사 필수
export const someFeatureHook = () => { ... };  // Hook 접미사 지양
```

### 규칙 4: Import 순서
```tsx
// ✅ Good: Import 순서
// 1. React 및 외부 라이브러리
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from 'antd';

// 2. 내부 절대 경로 (계층 순서대로)
import { useAuth } from '@/features/auth';
import { Project } from '@/entities/project';
import { formatDate } from '@/shared/lib/date';

// 3. 상대 경로
import { SomeComponent } from './components/SomeComponent';
import styles from './SomeList.module.css';

// ❌ Bad: 뒤섞인 Import
import { SomeComponent } from './components/SomeComponent';
import React from 'react';
import { formatDate } from '@/shared/lib/date';
import { Button } from 'antd';
```

---

## 패턴 (Best Practices)

### Pattern 1: React Query를 통한 서버 상태 관리

```tsx
// ✅ Good: entities 계층에서 React Query 훅 정의
// entities/project/api/useProjectsQuery.ts
export const useProjectsQuery = (params?: ProjectQueryParams) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useProjectQuery = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProjectById(id),
    enabled: !!id,
  });
};

// features/some-list/ui/SomeList.tsx
export const SomeList: React.FC = () => {
  const { data: items, isLoading } = useSomeItemsQuery();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {items?.map(item => (
        <SomeCard key={item.id} item={item} />
      ))}
    </div>
  );
};

// ❌ Bad: 컴포넌트에서 직접 fetch
export const SomeList: React.FC = () => {
  const [items, setItems] = useState<SomeItem[]>([]);

  useEffect(() => {
    fetch('/api/some-items')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  return <div>{/* ... */}</div>;
};
```

### Pattern 2: Context + Provider 패턴

```tsx
// ✅ Good: features/auth/model/AuthContext.tsx
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const result = await authApi.login({ username, password });
    setUser(result.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// features/auth/hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ❌ Bad: 전역 변수로 상태 관리
let currentUser: User | null = null;

export const login = (user: User) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;
```

### Pattern 3: API Client 계층 분리

```tsx
// ✅ Good: shared/api/apiClient.ts (하위 레벨)
class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// entities/project/api/projectApi.ts (도메인 레벨)
class ProjectApi {
  async getProjects(params?: ProjectQueryParams): Promise<Project[]> {
    return apiClient.request('/api/projects', {
      method: 'GET',
      params,
    });
  }
}

export const projectApi = new ProjectApi();

// ❌ Bad: 비즈니스 로직이 apiClient에 존재
// shared/api/apiClient.ts
class ApiClient {
  async getActiveProjects(): Promise<Project[]> {
    // 비즈니스 로직 ❌
    const projects = await this.request('/api/projects');
    return projects.filter(p => p.status === 'active');
  }
}
```

### Pattern 4: 컴포넌트 합성 (Composition)

```tsx
// ✅ Good: 작은 컴포넌트로 분리하고 합성
// features/project-management/ui/ProjectCard.tsx
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card>
      <ProjectCardHeader project={project} />
      <ProjectCardContent project={project} />
      <ProjectCardFooter project={project} />
    </Card>
  );
};

const ProjectCardHeader: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="card-header">
      <h3>{project.title}</h3>
      <ProjectStatusBadge status={project.status} />
    </div>
  );
};

const ProjectCardContent: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="card-content">
      <p>{project.description}</p>
      <TechStackList technologies={project.technologies} />
    </div>
  );
};

// ❌ Bad: 거대한 단일 컴포넌트
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card>
      <div className="card-header">
        <h3>{project.title}</h3>
        <span className="badge">{project.status}</span>
      </div>
      <div className="card-content">
        <p>{project.description}</p>
        <div className="tech-stack">
          {project.technologies.map(tech => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <button>Edit</button>
        <button>Delete</button>
      </div>
      {/* 100+ lines ... */}
    </Card>
  );
};
```

### Pattern 5: Custom Hook 추출

```tsx
// ✅ Good: 로직을 커스텀 훅으로 추출
// features/project-list/hooks/useProjectFilter.ts
export const useProjectFilter = (projects: Project[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'all' || project.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [projects, searchQuery, selectedType]);

  return {
    filteredProjects,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
  };
};

// features/project-list/ui/ProjectList.tsx
export const ProjectList: React.FC = () => {
  const { data: projects } = useProjectsQuery();
  const {
    filteredProjects,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
  } = useProjectFilter(projects || []);

  return (
    <div>
      <ProjectFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />
      <ProjectGrid projects={filteredProjects} />
    </div>
  );
};

// ❌ Bad: 모든 로직이 컴포넌트 내부에
export const ProjectList: React.FC = () => {
  const { data: projects } = useProjectsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesType;
  });

  return <div>{/* ... */}</div>;
};
```

### Pattern 6: TypeScript 타입 정의

```tsx
// ✅ Good: 명확한 타입 정의
// entities/project/model/project.types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  technologies: string[];
  startDate: string;
  endDate?: string | null;
}

export type ProjectType = 'BUILD' | 'LAB' | 'MAINTENANCE';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

// features/project-management/ui/ProjectCard.tsx
interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  // 타입 안전성 보장
  const handleEdit = () => onEdit?.(project);
  const handleDelete = () => onDelete?.(project.id);

  return <div>{/* ... */}</div>;
};

// ❌ Bad: any 타입 사용
export const ProjectCard: React.FC<{ project: any }> = ({ project }) => {
  // 타입 안정성 없음
  return <div>{project.title}</div>;
};
```

---

## 안티패턴 (Anti-Patterns)

### Anti-Pattern 1: 계층 우회 (Layer Violation)

```tsx
// ❌ Bad: pages에서 entities를 건너뛰고 shared/api 직접 호출
// pages/ProjectList/ProjectListPage.tsx
import { apiClient } from '@/shared/api/apiClient';

export const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    apiClient.request('/api/projects').then(setProjects);
  }, []);

  return <div>{/* ... */}</div>;
};

// ✅ Good: entities 계층의 훅 사용
import { useProjectsQuery } from '@/entities/project';

export const ProjectListPage: React.FC = () => {
  const { data: projects, isLoading } = useProjectsQuery();

  if (isLoading) return <Skeleton />;

  return <div>{/* ... */}</div>;
};
```

### Anti-Pattern 2: Feature 간 직접 의존

```tsx
// ❌ Bad: features 간 직접 import
// features/project-list/ui/ProjectList.tsx
import { LoginForm } from '@/features/auth/ui/LoginForm'; // ❌

export const ProjectList: React.FC = () => {
  return (
    <div>
      <LoginForm /> {/* Feature 간 직접 사용 */}
    </div>
  );
};

// ✅ Good: 공통 기능은 shared로, 또는 pages에서 조합
// shared/ui/auth/AuthModal.tsx
export const AuthModal: React.FC<AuthModalProps> = ({ ... }) => {
  // 공통 인증 모달
};

// pages/ProjectList/ProjectListPage.tsx
import { ProjectList } from '@/features/project-list';
import { AuthModal } from '@/shared/ui/auth';

export const ProjectListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {!isAuthenticated && <AuthModal />}
      <ProjectList />
    </div>
  );
};
```

### Anti-Pattern 3: Props Drilling

```tsx
// ❌ Bad: 여러 레벨로 props 전달
export const ProjectListPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  return <ProjectList user={user} setUser={setUser} />;
};

const ProjectList: React.FC<{ user: User | null; setUser: (u: User) => void }> = ({
  user,
  setUser,
}) => {
  return <ProjectCard user={user} setUser={setUser} />;
};

const ProjectCard: React.FC<{ user: User | null; setUser: (u: User) => void }> = ({
  user,
  setUser,
}) => {
  return <ProjectCardHeader user={user} setUser={setUser} />;
};

// ✅ Good: Context API 사용
const UserContext = createContext<UserContextType | undefined>(undefined);

export const ProjectListPage: React.FC = () => {
  return (
    <UserProvider>
      <ProjectList />
    </UserProvider>
  );
};

const ProjectCard: React.FC = () => {
  const { user } = useUserContext();
  return <div>{user.name}</div>;
};
```

### Anti-Pattern 4: 비대한 useEffect

```tsx
// ❌ Bad: useEffect에서 모든 로직 처리
export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* ... */}</div>;
};

// ✅ Good: React Query 사용
export const ProjectList: React.FC = () => {
  const { data: projects, isLoading, error } = useProjectsQuery();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* ... */}</div>;
};
```

### Anti-Pattern 5: 인라인 함수 남용

```tsx
// ❌ Bad: 모든 핸들러가 인라인
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card>
      <button
        onClick={() => {
          // 복잡한 로직
          const confirmed = window.confirm('삭제하시겠습니까?');
          if (confirmed) {
            fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
              .then(() => {
                // 성공 처리
              })
              .catch(() => {
                // 오류 처리
              });
          }
        }}
      >
        Delete
      </button>
    </Card>
  );
};

// ✅ Good: 핸들러 함수 분리
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const { mutate: deleteProject } = useDeleteProjectMutation();

  const handleDelete = useCallback(() => {
    if (window.confirm('삭제하시겠습니까?')) {
      deleteProject(project.id);
    }
  }, [deleteProject, project.id]);

  return (
    <Card>
      <button onClick={handleDelete}>Delete</button>
    </Card>
  );
};
```

### Anti-Pattern 6: CSS-in-JS 남용

```tsx
// ❌ Bad: 인라인 스타일 과다 사용
export const ProjectCard: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        margin: '10px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }}
      >
        Title
      </h3>
      {/* ... */}
    </div>
  );
};

// ✅ Good: CSS 모듈 또는 styled-components
// ProjectCard.module.css
.card {
  padding: 20px;
  margin: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

// ProjectCard.tsx
import styles from './ProjectCard.module.css';

export const ProjectCard: React.FC = () => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Title</h3>
    </div>
  );
};
```

### Anti-Pattern 7: key prop 누락 또는 index 사용

```tsx
// ❌ Bad: key에 index 사용
export const SomeList: React.FC<{ items: SomeItem[] }> = ({ items }) => {
  return (
    <div>
      {items.map((item, index) => (
        <SomeCard key={index} item={item} /> // ❌
      ))}
    </div>
  );
};

// ✅ Good: 고유한 ID 사용
export const SomeList: React.FC<{ items: SomeItem[] }> = ({ items }) => {
  return (
    <div>
      {items.map(item => (
        <SomeCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### Anti-Pattern 8: Default Export 남용

```tsx
// ❌ Bad: default export 사용
export default function SomeComponent() {
  return <div>Some Component</div>;
}

// ✅ Good: named export 사용
export const SomeComponent: React.FC = () => {
  return <div>Some Component</div>;
};
```

### Anti-Pattern 9: 인라인 스타일 남용

```tsx
// ❌ Bad: 인라인 스타일 과다 사용
export const SomeComponent: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        margin: '10px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }}
      >
        Title
      </h3>
      {/* ... */}
    </div>
  );
};

// ✅ Good: CSS 모듈 또는 styled-components
// SomeComponent.module.css
.card {
  padding: 20px;
  margin: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

// SomeComponent.tsx
import styles from './SomeComponent.module.css';

export const SomeComponent: React.FC = () => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Title</h3>
    </div>
  );
};
```

---

## 코드 예시

### 완전한 예시: 프로젝트 목록 기능

#### 1. Entities Layer

```tsx
// entities/project/model/project.types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  technologies: string[];
  startDate: string;
  endDate?: string | null;
}

export type ProjectType = 'BUILD' | 'LAB' | 'MAINTENANCE';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

// entities/project/api/projectApi.ts
import { apiClient } from '@/shared/api/apiClient';
import type { Project } from '../model/project.types';

class ProjectApi {
  async getProjects(params?: { type?: string }): Promise<Project[]> {
    return apiClient.request('/api/projects', { params });
  }

  async getProjectById(id: string): Promise<Project> {
    return apiClient.request(`/api/projects/${id}`);
  }
}

export const projectApi = new ProjectApi();

// entities/project/api/useProjectsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { projectApi } from './projectApi';

export const useProjectsQuery = (params?: { type?: string }) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApi.getProjects(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectQuery = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProjectById(id),
    enabled: !!id,
  });
};

// entities/project/index.ts
export type { Project, ProjectType, ProjectStatus } from './model/project.types';
export { useProjectsQuery, useProjectQuery } from './api/useProjectsQuery';
export { projectApi } from './api/projectApi';
```

#### 2. Features Layer

```tsx
// features/project-list/hooks/useProjectFilter.ts
import { useMemo, useState } from 'react';
import type { Project, ProjectType } from '@/entities/project';

export const useProjectFilter = (projects: Project[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'all' || project.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [projects, searchQuery, selectedType]);

  return {
    filteredProjects,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
  };
};

// features/project-list/ui/ProjectFilter.tsx
import React from 'react';
import { Input, Select } from 'antd';
import type { ProjectType } from '@/entities/project';

interface ProjectFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: ProjectType | 'all';
  onTypeChange: (value: ProjectType | 'all') => void;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="project-filter">
      <Input
        placeholder="프로젝트 검색..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
      />
      <Select
        value={selectedType}
        onChange={onTypeChange}
        options={[
          { value: 'all', label: '전체' },
          { value: 'BUILD', label: '개발' },
          { value: 'LAB', label: '실험' },
          { value: 'MAINTENANCE', label: '유지보수' },
        ]}
      />
    </div>
  );
};

// features/project-list/ui/ProjectGrid.tsx
import React from 'react';
import type { Project } from '@/entities/project';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="project-grid">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

// features/project-list/index.ts
export { ProjectFilter } from './ui/ProjectFilter';
export { ProjectGrid } from './ui/ProjectGrid';
export { useProjectFilter } from './hooks/useProjectFilter';
```

#### 3. Pages Layer

```tsx
// pages/ProjectList/ProjectListPage.tsx
import React from 'react';
import { useProjectsQuery } from '@/entities/project';
import { ProjectFilter, ProjectGrid, useProjectFilter } from '@/features/project-list';
import { Skeleton } from '@/shared/ui/skeleton';

export const ProjectListPage: React.FC = () => {
  const { data: projects, isLoading } = useProjectsQuery();

  const {
    filteredProjects,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
  } = useProjectFilter(projects || []);

  if (isLoading) {
    return <Skeleton count={6} />;
  }

  return (
    <div className="project-list-page">
      <h1>프로젝트 목록</h1>

      <ProjectFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      <ProjectGrid projects={filteredProjects} />
    </div>
  );
};
```

---

## 체크리스트

### 새로운 기능 개발 시

#### ✅ Entities Layer
- [ ] 엔티티 타입이 `entities/{entity}/model/`에 정의되어 있는가?
- [ ] API 클라이언트가 `entities/{entity}/api/`에 있는가?
- [ ] React Query 훅이 정의되어 있는가?
- [ ] `index.ts`를 통해 Public API가 노출되는가?
- [ ] 비즈니스 로직이 없고 순수 데이터 관리만 하는가?

#### ✅ Features Layer
- [ ] 기능이 독립적으로 작동하는가?
- [ ] 다른 features에 직접 의존하지 않는가?
- [ ] 비즈니스 로직이 features에 있는가?
- [ ] 커스텀 훅으로 로직이 분리되어 있는가?
- [ ] UI 컴포넌트가 단일 책임을 가지는가?

#### ✅ Pages Layer
- [ ] 페이지가 features를 조합만 하는가?
- [ ] 비즈니스 로직이 없는가?
- [ ] 라우팅 로직만 포함하는가?

#### ✅ Shared Layer
- [ ] 도메인 독립적인가?
- [ ] 상위 계층을 import 하지 않는가?
- [ ] 재사용 가능한가?

#### ✅ 의존성 방향
- [ ] 하위 계층이 상위 계층을 import 하지 않는가?
- [ ] Public API (`index.ts`)를 통해서만 import 하는가?

#### ✅ 코드 품질
- [ ] TypeScript 타입이 명확하게 정의되어 있는가?
- [ ] `any` 타입을 사용하지 않는가?
- [ ] 컴포넌트가 100줄 이하인가?
- [ ] useEffect가 필요 이상으로 복잡하지 않은가?
- [ ] key prop이 적절하게 사용되었는가?
- [ ] default export 대신 named export를 사용하는가?
- [ ] 인라인 스타일 대신 CSS 모듈을 사용하는가?

### 기존 코드 리팩토링 시

#### ✅ 문제 파악
- [ ] 계층 우회가 있는가?
- [ ] Feature 간 직접 의존이 있는가?
- [ ] Props drilling이 심한가?
- [ ] 비대한 컴포넌트가 있는가?
- [ ] 중복 코드가 있는가?

#### ✅ 리팩토링 순서
1. [ ] 타입 정의를 entities로 이동
2. [ ] API 호출을 entities로 이동
3. [ ] React Query 훅 생성
4. [ ] 비즈니스 로직을 features로 이동
5. [ ] UI 컴포넌트 분리
6. [ ] 커스텀 훅 추출
7. [ ] Public API (`index.ts`) 정의

---

## 참고 자료

### 기존 잘 설계된 코드 예시
- ✅ `entities/project` - 엔티티 구조
- ✅ `features/auth` - 인증 기능
- ✅ `shared/api/apiClient` - API 클라이언트

### 개선이 필요한 코드 예시
- ❌ 일부 `pages`에서 entities 건너뛰고 API 직접 호출
- ❌ 일부 컴포넌트에서 비즈니스 로직 포함

### 추가 학습 자료
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [React 공식 문서 - Best Practices](https://react.dev/learn)

---

**작성일**: 2025-01-25
**버전**: 2.0
**작성자**: AI Agent (Claude)
