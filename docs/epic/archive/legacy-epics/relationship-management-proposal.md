# 기술스택/프로젝트 연관관계 관리 공통화 제안

**작성일**: 2025-01-26  
**목적**: Experience, Education 등에서 기술스택과 프로젝트 연관관계를 등록/삭제하는 기능 공통화  
**타겟**: Admin 페이지의 CRUD 모달

---

## 📋 현재 상황 분석

### 1. 현재 상태

#### 백엔드 (✅ 완료)
- 릴레이션 테이블이 이미 준비되어 있음:
  - `experience_tech_stack` (경력-기술스택)
  - `education_tech_stack` (교육-기술스택)
  - `project_tech_stack` (프로젝트-기술스택)
- 메타데이터 필드:
  - `isPrimary`: 주요 기술 여부
  - `usageDescription`: 사용 내용 설명

#### 프론트엔드 (⚠️ 개선 필요)
- Experience, Education 페이지에서 `<Select mode="tags">`로 간단하게 선택
- 문자열 배열 (`string[]`)로 관리
- 메타데이터 관리 불가능
- 백엔드 릴레이션 테이블 활용 못함

### 2. 문제점

1. **메타데이터 활용 불가**: 백엔드의 `isPrimary`, `usageDescription` 필드를 활용 못함
2. **일관성 부족**: 각 페이지마다 다른 방식으로 구현됨
3. **UX 개선 필요**: 단순 텍스트 입력보다 캐시된 기술스택/프로젝트 선택이 더 좋음
4. **중복 코드**: 각 페이지에서 비슷한 코드 반복

---

## 🎯 개선 목표

### 목표 1: 공통 컴포넌트 개발
- **TechStackSelector**: 기술스택 선택 컴포넌트 (기존 활용)
- **ProjectSelector**: 프로젝트 선택 컴포넌트 (신규 개발)
- **RelationshipManager**: 메타데이터 관리 포함 통합 컴포넌트

### 목표 2: 백엔드 API 확장
- 기술스택/프로젝트 연관관계 CRUD API
- 메타데이터 포함 저장 API

### 목표 3: Feature-Sliced Design 구조
- `shared/ui`: 공통 컴포넌트
- `features`: 관계 관리 훅 및 로직
- `entities`: API 클라이언트

---

## 📐 아키텍처 설계

### 1. Feature-Sliced Design 구조

```
frontend/src/admin/
├── shared/
│   └── ui/
│       ├── TechStackSelector.tsx          # ✅ 이미 존재
│       ├── ProjectSelector.tsx            # 🔨 신규 개발
│       └── RelationshipManager.tsx         # 🔨 신규 개발 (통합)
│
├── features/
│   └── relationship-management/           # 🔨 신규 개발
│       ├── hooks/
│       │   ├── useRelationship.ts          # 관계 관리 훅
│       │   ├── useTechStackRelationship.ts # 기술스택 관계 훅
│       │   └── useProjectRelationship.ts   # 프로젝트 관계 훅
│       └── ui/
│           ├── TechStackRelationshipManager.tsx
│           └── ProjectRelationshipManager.tsx
│
└── entities/
    ├── tech-stack/                         # ✅ 이미 존재
    ├── project/                            # 🔨 신규 개발 필요
    │   ├── model/
    │   │   └── project.types.ts
    │   ├── api/
    │   │   ├── projectApi.ts
    │   │   └── useProjectQuery.ts
    │   └── index.ts
    └── relationship/                        # 🔨 신규 개발
        ├── model/
        │   └── relationship.types.ts
        ├── api/
        │   ├── relationshipApi.ts
        │   └── useRelationshipQuery.ts
        └── index.ts
```

### 2. 컴포넌트 계층 구조

```
RelationshipManager (통합 컴포넌트)
├── TechStackRelationshipManager
│   ├── Selector (기술스택 선택)
│   └── Metadata Editor (isPrimary, usageDescription)
└── ProjectRelationshipManager
    ├── Selector (프로젝트 선택)
    └── Metadata Editor (isPrimary, usageDescription)
```

---

## 🛠️ 구현 계획

### Phase 1: 백엔드 API 개발 (우선순위: 높음)

#### 1.1 Entity Relationship API 추가

**컨트롤러**: `AdminExperienceController`, `AdminEducationController`

```java
// Experience와 기술스택 연관관계 관리
POST   /api/admin/experiences/{id}/tech-stacks
DELETE /api/admin/experiences/{id}/tech-stacks/{techStackId}

// Experience와 프로젝트 연관관계 관리
POST   /api/admin/experiences/{id}/projects
DELETE /api/admin/experiences/{id}/projects/{projectId}

// Education도 동일
POST   /api/admin/educations/{id}/tech-stacks
DELETE /api/admin/educations/{id}/tech-stacks/{techStackId}
POST   /api/admin/educations/{id}/projects
DELETE /api/admin/educations/{id}/projects/{projectId}
```

**Request DTO**:
```java
@Data
public class TechStackRelationshipRequest {
    private Long techStackId;
    private Boolean isPrimary;
    private String usageDescription;
}

@Data
public class ProjectRelationshipRequest {
    private Long projectId;
    private Boolean isPrimary;
    private String usageDescription;
}
```

**Response DTO**:
```java
@Data
public class RelationshipResponse {
    private Long id;
    private String name; // 기술스택 이름 or 프로젝트 제목
    private Boolean isPrimary;
    private String usageDescription;
}
```

#### 1.2 UseCase 추가

```java
// domain/portfolio/port/in/ManageExperienceUseCase.java
public interface ManageExperienceUseCase {
    // 기존 메서드들...
    
    // 새로 추가
    void addTechStackRelationship(String experienceId, TechStackRelationshipRequest request);
    void removeTechStackRelationship(String experienceId, Long techStackId);
    void addProjectRelationship(String experienceId, ProjectRelationshipRequest request);
    void removeProjectRelationship(String experienceId, Long projectId);
    List<RelationshipResponse> getTechStackRelationships(String experienceId);
    List<RelationshipResponse> getProjectRelationships(String experienceId);
}
```

#### 1.3 Repository Method 추가

```java
// domain/portfolio/port/out/PortfolioRepositoryPort.java
public interface PortfolioRepositoryPort {
    // 기존 메서드들...
    
    // 새로 추가
    void saveExperienceTechStack(String experienceId, Long techStackId, Boolean isPrimary, String usageDescription);
    void deleteExperienceTechStack(String experienceId, Long techStackId);
    List<RelationshipResponse> findExperienceTechStacks(String experienceId);
    
    void saveExperienceProject(String experienceId, Long projectId, Boolean isPrimary, String usageDescription);
    void deleteExperienceProject(String experienceId, Long projectId);
    List<RelationshipResponse> findExperienceProjects(String experienceId);
}
```

### Phase 2: 프론트엔드 Entity 계층 개발

#### 2.1 Project Entity 개발

```typescript
// entities/project/model/project.types.ts
export interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  // ... 기타 필드
}
```

```typescript
// entities/project/api/projectApi.ts
class ProjectApi {
  async getProjects(): Promise<Project[]> {
    const response = await fetch('/api/projects');
    const data = await response.json();
    return data.data || [];
  }
  
  async getProjectById(id: number): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`);
    const data = await response.json();
    return data.data;
  }
}

export const projectApi = new ProjectApi();
```

```typescript
// entities/project/api/useProjectQuery.ts
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
    staleTime: 5 * 60 * 1000,
  });
};
```

#### 2.2 Relationship Entity 개발

```typescript
// entities/relationship/model/relationship.types.ts
export interface TechStackRelationship {
  id: number;
  techStackId: number;
  techStackName: string;
  isPrimary: boolean;
  usageDescription?: string;
}

export interface ProjectRelationship {
  id: number;
  projectId: number;
  projectTitle: string;
  isPrimary: boolean;
  usageDescription?: string;
}

export interface RelationshipFormData {
  entityId: string; // experienceId or educationId
  isPrimary: boolean;
  usageDescription?: string;
}
```

```typescript
// entities/relationship/api/relationshipApi.ts
class RelationshipApi {
  // Experience - TechStack
  async addExperienceTechStack(experienceId: string, techStackId: number, data: RelationshipFormData) {
    const response = await fetch(`/api/admin/experiences/${experienceId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...data, techStackId }),
    });
    if (!response.ok) throw new Error('Failed to add tech stack');
  }
  
  async removeExperienceTechStack(experienceId: string, techStackId: number) {
    const response = await fetch(`/api/admin/experiences/${experienceId}/tech-stacks/${techStackId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to remove tech stack');
  }
  
  async getExperienceTechStacks(experienceId: string): Promise<TechStackRelationship[]> {
    const response = await fetch(`/api/admin/experiences/${experienceId}/tech-stacks`);
    const data = await response.json();
    return data.data || [];
  }
  
  // Project도 동일하게 구현
  async addExperienceProject(experienceId: string, projectId: number, data: RelationshipFormData) {
    // ...
  }
}

export const relationshipApi = new RelationshipApi();
```

### Phase 3: Shared UI 컴포넌트 개발

#### 3.1 ProjectSelector 컴포넌트

```typescript
// shared/ui/ProjectSelector.tsx
interface ProjectSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ value = [], onChange }) => {
  const { data: projects, isLoading } = useProjectsQuery();
  const [searchValue, setSearchValue] = useState('');
  
  const filteredProjects = useMemo(() => {
    if (!projects || !searchValue) return projects || [];
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      project.description.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [projects, searchValue]);
  
  const handleToggle = (projectId: number, checked: boolean) => {
    if (checked) {
      onChange?.([...value, projectId]);
    } else {
      onChange?.(value.filter(id => id !== projectId));
    }
  };
  
  // TechStackSelector와 유사한 UI 구현
  return (
    <div>
      <Input
        placeholder="프로젝트 검색..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <Row gutter={[8, 8]}>
        {filteredProjects?.map((project) => (
          <Col key={project.id}>
            <Card>
              <Checkbox
                checked={value.includes(project.id)}
                onChange={(e) => handleToggle(project.id, e.target.checked)}
              />
              {project.title}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
```

#### 3.2 RelationshipManager 통합 컴포넌트

```typescript
// shared/ui/RelationshipManager.tsx
interface RelationshipManagerProps {
  parentEntityId: string;
  parentEntityType: 'experience' | 'education';
  type: 'tech-stack' | 'project';
  value?: Relationship[];
  onChange?: (value: Relationship[]) => void;
}

export const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  parentEntityId,
  parentEntityType,
  type,
  value = [],
  onChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isMetadataModalVisible, setIsMetadataModalVisible] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  
  const handleAdd = async () => {
    // 선택된 항목들에 대한 메타데이터 입력 모달 표시
  };
  
  const handleRemove = async (id: number) => {
    // 관계 삭제
  };
  
  const handleEdit = (relationship: Relationship) => {
    // 메타데이터 수정
  };
  
  // Tab 구조로 구현
  // Tab 1: Selector (선택)
  // Tab 2: Relationship List (관계 목록 및 메타데이터 관리)
  
  return (
    <Tabs>
      <TabPane key="select" tab="선택">
        {type === 'tech-stack' ? (
          <TechStackSelector value={selectedIds} onChange={setSelectedIds} />
        ) : (
          <ProjectSelector value={selectedIds} onChange={setSelectedIds} />
        )}
        <Button onClick={handleAdd}>관계 추가</Button>
      </TabPane>
      <TabPane key="manage" tab="관계 관리">
        <List
          dataSource={value}
          renderItem={(item) => (
            <List.Item>
              <span>{item.name}</span>
              {item.isPrimary && <Tag color="gold">주요</Tag>}
              <Button onClick={() => handleEdit(item)}>수정</Button>
              <Button onClick={() => handleRemove(item.id)}>삭제</Button>
            </List.Item>
          )}
        />
      </TabPane>
    </Tabs>
  );
};
```

### Phase 4: Page 레벨 적용

#### 4.1 Experience 페이지 적용

```typescript
// pages/ExperienceManagement.tsx 수정
<Form.Item name="techStackRelationships">
  <RelationshipManager
    parentEntityId={editingExperience?.id}
    parentEntityType="experience"
    type="tech-stack"
    value={techStackRelationships}
    onChange={setTechStackRelationships}
  />
</Form.Item>

<Form.Item name="projectRelationships">
  <RelationshipManager
    parentEntityId={editingExperience?.id}
    parentEntityType="experience"
    type="project"
    value={projectRelationships}
    onChange={setProjectRelationships}
  />
</Form.Item>
```

---

## 🎨 UX 개선 사항

### Before (현재)
```typescript
<Form.Item name="technologies" label="기술 스택">
  <Select mode="tags" placeholder="기술 스택을 입력하세요" />
</Form.Item>
```

**문제점**: 
- 사용자가 직접 텍스트 입력
- 오타 발생 가능
- 일관성 없는 데이터
- 메타데이터 관리 불가

### After (개선 후)
```typescript
<Form.Item name="techStackRelationships">
  <RelationshipManager
    parentEntityId={editingExperience?.id}
    parentEntityType="experience"
    type="tech-stack"
  />
</Form.Item>
```

**장점**:
- 캐시된 기술스택 선택
- 일관성 있는 데이터
- 메타데이터 관리 (주요 기술 여부, 사용 설명)
- 자동완성 및 검색 기능
- 직관적인 UI

---

## 📊 작업 우선순위

| 단계 | 작업 | 예상 시간 | 우선순위 |
|------|------|----------|---------|
| 1 | 백엔드 API 개발 | 4-6시간 | 높음 |
| 2 | Project Entity 개발 | 2-3시간 | 높음 |
| 3 | Relationship Entity 개발 | 3-4시간 | 높음 |
| 4 | Shared UI 컴포넌트 개발 | 4-6시간 | 중간 |
| 5 | Page 레벨 적용 | 3-4시간 | 중간 |
| 6 | 테스트 및 검증 | 2-3시간 | 낮음 |

**총 예상 시간**: 18-26시간

---

## 🚀 다음 단계

1. **백엔드 개발**부터 시작 (Base API)
2. **Project Entity** 개발 (기존 TechStack과 동일한 구조)
3. **Relationship Entity** 개발
4. **Shared UI 컴포넌트** 개발
5. **Experience, Education** 페이지 적용
6. **검증 및 개선**

---

**작성자**: AI Agent (Claude)  
**작성일**: 2025-01-26  
**버전**: 1.0

