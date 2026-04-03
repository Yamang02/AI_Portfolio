# 프로젝트 버전 관리 시스템 설계

## 1. 개요

### 1.1 목적
프로젝트의 여러 버전을 관리하여, 사용자가 모달에서 버전을 선택하면 각 버전에 맞는 마크다운 컨텐츠, 스크린샷, 기술 스택 등을 다르게 표시할 수 있도록 함.

### 1.2 사용 시나리오
- **버전 1.0**: MVP 단계 (React + Node.js)
- **버전 2.0**: 리뉴얼 (React + Spring Boot, DB 추가)
- **버전 3.0**: AI 기능 추가 (GPT-4 통합, RAG 시스템)

각 버전마다:
- 다른 기술 스택
- 다른 스크린샷
- 다른 마크다운 문서 (기능 설명, 아키텍처 등)
- 다른 배포 URL (v1.example.com, v2.example.com)

---

## 2. 데이터베이스 스키마 설계

### 2.1 접근 방식 비교

#### 옵션 A: 단일 테이블 (버전 컬럼 추가)
```sql
ALTER TABLE projects ADD COLUMN version VARCHAR(50);
```
**장점:**
- 간단한 구현
- 기존 코드 변경 최소화

**단점:**
- ❌ 버전별 데이터 중복 (같은 프로젝트가 여러 행)
- ❌ 버전 간 관계 표현 어려움
- ❌ 확장성 낮음

#### 옵션 B: 분리 테이블 (1:N 관계) ✅ **권장**
```sql
projects (마스터)
  └── project_versions (1:N)
```
**장점:**
- ✅ 정규화된 구조
- ✅ 공통 메타데이터 재사용 (제목, 카테고리 등)
- ✅ 버전 히스토리 관리 용이
- ✅ 확장성 높음

**단점:**
- JOIN 쿼리 필요
- 초기 구현 복잡도 증가

### 2.2 최종 스키마 설계 (옵션 B)

#### A. projects 테이블 (마스터 프로젝트)
```sql
-- 기존 projects 테이블을 마스터 프로젝트로 전환
-- 버전 공통 메타데이터만 관리
ALTER TABLE projects
  DROP COLUMN readme,
  DROP COLUMN image_url,
  DROP COLUMN screenshots,
  DROP COLUMN github_url,
  DROP COLUMN live_url,
  DROP COLUMN external_url,
  DROP COLUMN my_contributions,
  DROP COLUMN role,
  ADD COLUMN default_version_id BIGINT REFERENCES project_versions(id);

-- 마스터 프로젝트는 다음만 관리:
-- - id, business_id, title, description (공통 요약)
-- - type, source, is_team, status, sort_order
-- - start_date (프로젝트 시작일)
-- - created_at, updated_at
-- - default_version_id (기본 표시 버전)
```

**역할:**
- 프로젝트 카드에 표시되는 기본 정보
- 모든 버전의 공통 메타데이터
- 필터링, 정렬의 기준

#### B. project_versions 테이블 (신규 생성)
```sql
CREATE TABLE project_versions (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- 버전 정보
  version VARCHAR(50) NOT NULL,                 -- "1.0", "2.0", "2.1-beta"
  version_name VARCHAR(255),                    -- "MVP", "Renewal", "AI Edition"
  is_default BOOLEAN DEFAULT FALSE,             -- 기본 표시 버전 여부

  -- 버전별 컨텐츠
  readme TEXT,                                  -- 마크다운 문서 (버전별 다름)
  description TEXT,                             -- 버전별 요약 설명

  -- 버전별 미디어
  image_url VARCHAR(500),                       -- 메인 스크린샷
  screenshots TEXT[],                           -- 추가 스크린샷 배열

  -- 버전별 링크
  github_url VARCHAR(500),                      -- 버전별 GitHub 브랜치/태그
  live_url VARCHAR(500),                        -- 버전별 배포 URL
  external_url VARCHAR(500),                    -- 버전별 외부 문서

  -- 버전별 메타데이터
  release_date DATE,                            -- 출시일
  end_of_life_date DATE,                        -- 종료일 (선택)
  status VARCHAR(50) DEFAULT 'active',          -- active, deprecated, archived

  -- 팀 정보 (버전별로 다를 수 있음)
  role VARCHAR(255),                            -- 해당 버전에서의 역할
  my_contributions TEXT[],                      -- 해당 버전 기여 내용

  -- 릴리즈 노트
  release_notes TEXT,                           -- 버전 변경사항 (마크다운)

  -- 정렬 및 메타
  sort_order INTEGER DEFAULT 0,                 -- 버전 표시 순서
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- 제약 조건
  UNIQUE(project_id, version),                  -- 프로젝트당 버전명 유일
  CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-z0-9]+)?$')  -- 버전 포맷 검증
);

-- 인덱스
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_project_versions_version ON project_versions(version);
CREATE INDEX idx_project_versions_is_default ON project_versions(is_default);
CREATE INDEX idx_project_versions_status ON project_versions(status);
```

#### C. project_version_tech_stacks 테이블 (버전별 기술 스택)
```sql
CREATE TABLE project_version_tech_stacks (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  tech_stack_id BIGINT NOT NULL REFERENCES tech_stacks(id) ON DELETE CASCADE,

  -- 버전별 기술 스택 메타데이터
  category VARCHAR(100),                        -- Frontend, Backend, Database 등
  proficiency_level INTEGER,                    -- 해당 버전에서의 숙련도
  is_primary BOOLEAN DEFAULT FALSE,             -- 주요 기술 여부
  usage_note TEXT,                              -- 사용 방식 메모

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(version_id, tech_stack_id)
);

CREATE INDEX idx_project_version_tech_stacks_version ON project_version_tech_stacks(version_id);
CREATE INDEX idx_project_version_tech_stacks_tech ON project_version_tech_stacks(tech_stack_id);
```

### 2.3 마이그레이션 스크립트

#### V005__create_project_versions.sql
```sql
-- Step 1: project_versions 테이블 생성
CREATE TABLE project_versions (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  version_name VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  readme TEXT,
  description TEXT,
  image_url VARCHAR(500),
  screenshots TEXT[],
  github_url VARCHAR(500),
  live_url VARCHAR(500),
  external_url VARCHAR(500),
  release_date DATE,
  end_of_life_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  role VARCHAR(255),
  my_contributions TEXT[],
  release_notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, version),
  CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-z0-9]+)?$')
);

CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_project_versions_version ON project_versions(version);
CREATE INDEX idx_project_versions_is_default ON project_versions(is_default);

-- Step 2: 기존 프로젝트 데이터를 version 1.0으로 마이그레이션
INSERT INTO project_versions (
  project_id,
  version,
  version_name,
  is_default,
  readme,
  description,
  image_url,
  screenshots,
  github_url,
  live_url,
  external_url,
  release_date,
  status,
  role,
  my_contributions,
  sort_order,
  created_at,
  updated_at
)
SELECT
  id AS project_id,
  '1.0' AS version,
  'Initial Version' AS version_name,
  TRUE AS is_default,
  readme,
  description,
  image_url,
  screenshots,
  github_url,
  live_url,
  external_url,
  COALESCE(start_date, created_at::date) AS release_date,
  CASE
    WHEN status = 'completed' THEN 'active'
    WHEN status = 'in_progress' THEN 'active'
    ELSE 'archived'
  END AS status,
  role,
  my_contributions,
  0 AS sort_order,
  created_at,
  updated_at
FROM projects;

-- Step 3: project_version_tech_stacks 테이블 생성
CREATE TABLE project_version_tech_stacks (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  tech_stack_id BIGINT NOT NULL REFERENCES tech_stacks(id) ON DELETE CASCADE,
  category VARCHAR(100),
  proficiency_level INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  usage_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(version_id, tech_stack_id)
);

CREATE INDEX idx_project_version_tech_stacks_version ON project_version_tech_stacks(version_id);
CREATE INDEX idx_project_version_tech_stacks_tech ON project_version_tech_stacks(tech_stack_id);

-- Step 4: 기존 project_tech_stacks 데이터를 project_version_tech_stacks로 복사
INSERT INTO project_version_tech_stacks (
  version_id,
  tech_stack_id,
  category,
  proficiency_level,
  is_primary,
  created_at
)
SELECT
  pv.id AS version_id,
  pts.tech_stack_id,
  pts.category,
  pts.proficiency_level,
  pts.is_primary,
  pts.created_at
FROM project_tech_stacks pts
INNER JOIN project_versions pv ON pv.project_id = pts.project_id AND pv.version = '1.0';

-- Step 5: projects 테이블에서 버전별 컬럼 제거 (점진적 마이그레이션 후)
-- 주의: 프론트엔드 업데이트 후 실행
-- ALTER TABLE projects
--   DROP COLUMN readme,
--   DROP COLUMN image_url,
--   DROP COLUMN screenshots,
--   DROP COLUMN github_url,
--   DROP COLUMN live_url,
--   DROP COLUMN external_url,
--   DROP COLUMN my_contributions,
--   DROP COLUMN role;

-- Step 6: default_version_id 컬럼 추가
ALTER TABLE projects
  ADD COLUMN default_version_id BIGINT REFERENCES project_versions(id);

-- Step 7: 기본 버전 설정
UPDATE projects p
SET default_version_id = (
  SELECT id
  FROM project_versions pv
  WHERE pv.project_id = p.id AND pv.is_default = TRUE
  LIMIT 1
);
```

---

## 3. 백엔드 설계

### 3.1 JPA 엔티티

#### ProjectVersionJpaEntity.java
```java
@Entity
@Table(name = "project_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectVersionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectJpaEntity project;

    @Column(name = "version", nullable = false, length = 50)
    @NotBlank
    private String version;  // "1.0", "2.0"

    @Column(name = "version_name")
    private String versionName;  // "MVP", "Renewal"

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "readme", columnDefinition = "TEXT")
    private String readme;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "screenshots", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> screenshots;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "live_url", length = 500)
    private String liveUrl;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "end_of_life_date")
    private LocalDate endOfLifeDate;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "active";  // active, deprecated, archived

    @Column(name = "role", length = 255)
    private String role;

    @Column(name = "my_contributions", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> myContributions;

    @Column(name = "release_notes", columnDefinition = "TEXT")
    private String releaseNotes;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @OneToMany(mappedBy = "version", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectVersionTechStackJpaEntity> techStacks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### ProjectVersionTechStackJpaEntity.java
```java
@Entity
@Table(name = "project_version_tech_stacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectVersionTechStackJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private ProjectVersionJpaEntity version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_stack_id", nullable = false)
    private TechStackJpaEntity techStack;

    @Column(name = "category", length = 100)
    private String category;  // Frontend, Backend, Database, etc.

    @Column(name = "proficiency_level")
    private Integer proficiencyLevel;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "usage_note", columnDefinition = "TEXT")
    private String usageNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 3.2 도메인 모델

#### ProjectVersion.java
```java
public class ProjectVersion {
    private final String id;
    private final String projectId;
    private final String version;
    private final String versionName;
    private final boolean isDefault;
    private final String readme;
    private final String description;
    private final String imageUrl;
    private final List<String> screenshots;
    private final String githubUrl;
    private final String liveUrl;
    private final String externalUrl;
    private final LocalDate releaseDate;
    private final LocalDate endOfLifeDate;
    private final String status;
    private final String role;
    private final List<String> myContributions;
    private final String releaseNotes;
    private final List<TechStack> techStacks;
    private final int sortOrder;
}
```

### 3.3 API 설계

#### A. 프로젝트 목록 조회 (카드용)
```http
GET /api/data/projects

Response:
{
  "projects": [
    {
      "id": "PJT001",
      "title": "AI Portfolio",
      "description": "AI 챗봇 포함 포트폴리오",
      "type": "BUILD",
      "isTeam": false,
      "status": "completed",
      "startDate": "2024-01-01",
      "technologies": ["React", "Spring Boot"],  // 최신 버전 기술 스택
      "imageUrl": "...",  // 기본 버전 이미지
      "defaultVersion": "2.0",
      "availableVersions": ["1.0", "2.0", "3.0-beta"],
      "latestVersion": "3.0-beta"
    }
  ]
}
```

#### B. 특정 프로젝트 상세 조회 (모달용)
```http
GET /api/data/projects/{projectId}?version={version}

# 예시
GET /api/data/projects/PJT001?version=2.0

Response:
{
  "project": {
    "id": "PJT001",
    "title": "AI Portfolio",
    "description": "공통 요약",
    "type": "BUILD",
    "isTeam": false,
    "status": "completed",
    "startDate": "2024-01-01",

    // 현재 선택된 버전 정보
    "currentVersion": {
      "version": "2.0",
      "versionName": "Renewal Edition",
      "isDefault": true,
      "readme": "# AI Portfolio v2.0\n\n완전히 새롭게 재설계...",
      "description": "버전 2.0 특화 설명",
      "imageUrl": "https://..../v2-main.png",
      "screenshots": [
        "https://..../v2-screenshot1.png",
        "https://.../v2-screenshot2.png"
      ],
      "githubUrl": "https://github.com/user/repo/tree/v2.0",
      "liveUrl": "https://v2.example.com",
      "releaseDate": "2024-06-01",
      "status": "active",
      "role": "Full Stack Developer",
      "myContributions": [
        "Backend Spring Boot 전환",
        "PostgreSQL 설계"
      ],
      "techStacks": [
        {
          "id": "TS001",
          "name": "React",
          "category": "Frontend",
          "isPrimary": true
        },
        {
          "id": "TS015",
          "name": "Spring Boot",
          "category": "Backend",
          "isPrimary": true
        }
      ],
      "releaseNotes": "## v2.0 주요 변경사항\n- Backend Node.js → Spring Boot 전환\n- DB 추가..."
    },

    // 사용 가능한 모든 버전 목록
    "versions": [
      {
        "version": "1.0",
        "versionName": "MVP",
        "releaseDate": "2024-01-15",
        "status": "archived",
        "isDefault": false
      },
      {
        "version": "2.0",
        "versionName": "Renewal Edition",
        "releaseDate": "2024-06-01",
        "status": "active",
        "isDefault": true
      },
      {
        "version": "3.0-beta",
        "versionName": "AI Edition",
        "releaseDate": "2024-09-01",
        "status": "active",
        "isDefault": false
      }
    ]
  }
}
```

#### C. 프로젝트 버전 목록만 조회
```http
GET /api/data/projects/{projectId}/versions

Response:
{
  "projectId": "PJT001",
  "versions": [
    {
      "version": "1.0",
      "versionName": "MVP",
      "releaseDate": "2024-01-15",
      "status": "archived",
      "isDefault": false,
      "techCount": 5,
      "hasScreenshots": true
    },
    {
      "version": "2.0",
      "versionName": "Renewal Edition",
      "releaseDate": "2024-06-01",
      "status": "active",
      "isDefault": true,
      "techCount": 8,
      "hasScreenshots": true
    }
  ]
}
```

### 3.4 서비스 레이어

#### ProjectService.java
```java
@Service
public class ProjectService {

    // 기본 버전으로 프로젝트 상세 조회
    public Project getProjectById(String businessId) {
        ProjectJpaEntity entity = projectRepository.findByBusinessId(businessId);
        ProjectVersionJpaEntity defaultVersion = projectVersionRepository
            .findByProjectIdAndIsDefault(entity.getId(), true)
            .orElseThrow();

        return ProjectMapper.toDomain(entity, defaultVersion);
    }

    // 특정 버전으로 프로젝트 상세 조회
    public Project getProjectByIdAndVersion(String businessId, String version) {
        ProjectJpaEntity projectEntity = projectRepository.findByBusinessId(businessId);
        ProjectVersionJpaEntity versionEntity = projectVersionRepository
            .findByProjectIdAndVersion(projectEntity.getId(), version)
            .orElseThrow(() -> new VersionNotFoundException(version));

        return ProjectMapper.toDomain(projectEntity, versionEntity);
    }

    // 프로젝트의 모든 버전 조회
    public List<ProjectVersion> getProjectVersions(String businessId) {
        ProjectJpaEntity projectEntity = projectRepository.findByBusinessId(businessId);
        List<ProjectVersionJpaEntity> versions = projectVersionRepository
            .findByProjectIdOrderBySortOrder(projectEntity.getId());

        return versions.stream()
            .map(ProjectVersionMapper::toDomain)
            .toList();
    }
}
```

---

## 4. 프론트엔드 설계

### 4.1 타입 정의

#### types.ts
```typescript
// 프로젝트 버전 메타데이터
export interface ProjectVersionMeta {
  version: string;              // "1.0", "2.0"
  versionName?: string;         // "MVP", "Renewal"
  releaseDate: string;          // "2024-01-15"
  status: 'active' | 'deprecated' | 'archived';
  isDefault: boolean;
  techCount?: number;           // 해당 버전 기술 개수
  hasScreenshots?: boolean;
}

// 버전별 상세 데이터
export interface ProjectVersionDetail {
  version: string;
  versionName?: string;
  isDefault: boolean;
  readme: string;               // 마크다운
  description: string;
  imageUrl: string;
  screenshots: string[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  releaseDate: string;
  endOfLifeDate?: string;
  status: string;
  role?: string;
  myContributions?: string[];
  techStacks: TechStack[];
  releaseNotes?: string;        // 버전 변경사항
}

// 프로젝트 (마스터 + 현재 버전)
export interface Project extends BaseItem {
  // 마스터 데이터
  id: string;
  title: string;
  description: string;          // 공통 요약
  type: ProjectCategory;
  source: ProjectSource;
  isTeam: boolean;
  status: string;
  startDate: string;

  // 현재 선택된 버전 데이터
  currentVersion: ProjectVersionDetail;

  // 사용 가능한 버전 목록
  versions: ProjectVersionMeta[];

  // 편의 속성
  defaultVersion: string;
  latestVersion: string;
}
```

### 4.2 모달 UI 설계

#### A. 버전 선택 UI

**위치**: 모달 헤더 우측 상단

```tsx
<header className="sticky top-0 bg-white z-10 pb-6 border-b">
  {/* Row 1: 제목 + 버전 셀렉터 + 닫기 */}
  <div className="flex justify-between items-start mb-4">
    <h1 className="text-3xl font-bold">{project.title}</h1>

    <div className="flex items-center gap-3">
      {/* 버전 선택 드롭다운 */}
      <VersionSelector
        currentVersion={currentVersion.version}
        versions={project.versions}
        onChange={handleVersionChange}
      />

      <button onClick={onClose}>×</button>
    </div>
  </div>

  {/* Row 2: 메타데이터 (버전별) */}
  <div className="flex flex-wrap gap-3 items-center mb-4">
    <span className="text-gray-600">
      📅 {currentVersion.releaseDate}
      {currentVersion.versionName && ` · ${currentVersion.versionName}`}
    </span>
    <CategoryBadge type={project.type} />
    <StatusBadge status={currentVersion.status} />
    {project.isTeam && <TeamBadge />}
  </div>

  {/* ... 나머지 헤더 내용 (기술스택, 링크 등) ... */}
</header>
```

#### B. VersionSelector 컴포넌트

```tsx
interface VersionSelectorProps {
  currentVersion: string;
  versions: ProjectVersionMeta[];
  onChange: (version: string) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  currentVersion,
  versions,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentMeta = versions.find(v => v.version === currentVersion);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium">
          v{currentVersion}
          {currentMeta?.versionName && ` (${currentMeta.versionName})`}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          {/* Chevron down icon */}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <ul className="py-2">
            {versions.map(version => (
              <li key={version.version}>
                <button
                  onClick={() => {
                    onChange(version.version);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    version.version === currentVersion ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        v{version.version}
                        {version.isDefault && (
                          <span className="ml-2 text-xs text-primary-600">(기본)</span>
                        )}
                      </div>
                      {version.versionName && (
                        <div className="text-sm text-gray-600">{version.versionName}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {version.releaseDate}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={version.status} size="sm" />
                      {version.techCount && (
                        <span className="text-xs text-gray-500">
                          {version.techCount} techs
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

#### C. 버전별 릴리즈 노트 표시 (옵션)

```tsx
// 마크다운 컨텐츠 상단에 릴리즈 노트 섹션 추가
{currentVersion.releaseNotes && (
  <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
    <h3 className="text-lg font-semibold text-blue-900 mb-2">
      📝 Release Notes
    </h3>
    <ReactMarkdown className="prose prose-sm">
      {currentVersion.releaseNotes}
    </ReactMarkdown>
  </div>
)}

<article className="prose prose-lg">
  <ReactMarkdown>{currentVersion.readme}</ReactMarkdown>
</article>
```

### 4.3 상태 관리

#### useProjectVersion 훅
```typescript
interface UseProjectVersionResult {
  currentVersion: ProjectVersionDetail;
  versions: ProjectVersionMeta[];
  selectVersion: (version: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useProjectVersion = (projectId: string, initialVersion?: string) => {
  const [currentVersionId, setCurrentVersionId] = useState<string>(
    initialVersion || 'default'
  );

  // 프로젝트 데이터 조회 (버전 포함)
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', projectId, currentVersionId],
    queryFn: async () => {
      const version = currentVersionId === 'default' ? '' : currentVersionId;
      return fetchProjectDetail(projectId, version);
    }
  });

  const selectVersion = useCallback((version: string) => {
    setCurrentVersionId(version);
  }, []);

  return {
    currentVersion: data?.currentVersion,
    versions: data?.versions || [],
    selectVersion,
    isLoading,
    error
  };
};
```

#### ProjectModal 사용 예시
```tsx
const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialVersion
}) => {
  const { currentVersion, versions, selectVersion, isLoading } = useProjectVersion(
    projectId,
    initialVersion
  );

  if (isLoading) return <Spinner />;
  if (!currentVersion) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header>
          <h1>{project.title}</h1>
          <VersionSelector
            currentVersion={currentVersion.version}
            versions={versions}
            onChange={selectVersion}
          />
        </header>

        <ProjectModalContent
          markdown={currentVersion.readme}
          screenshots={currentVersion.screenshots}
          techStacks={currentVersion.techStacks}
        />
      </div>
    </div>
  );
};
```

---

## 5. 마크다운 버전 관리 전략

### 5.1 파일 구조 (선택사항 - Git 기반)

프로젝트별로 마크다운 파일을 Git에서 버전별로 관리:

```
docs/projects/
├── AI_Portfolio/
│   ├── v1.0.md          # 버전 1.0 마크다운
│   ├── v2.0.md          # 버전 2.0 마크다운
│   ├── v3.0-beta.md     # 버전 3.0 마크다운
│   └── screenshots/
│       ├── v1/
│       ├── v2/
│       └── v3/
├── CloseToU/
│   ├── v1.0.md
│   └── v2.0.md
```

**백엔드에서 파일 읽기:**
```java
@Service
public class MarkdownFileService {

    private static final String DOCS_BASE_PATH = "docs/projects";

    public String loadProjectVersionMarkdown(String projectName, String version) {
        Path filePath = Paths.get(DOCS_BASE_PATH, projectName, "v" + version + ".md");
        try {
            return Files.readString(filePath);
        } catch (IOException e) {
            return ""; // Fallback
        }
    }
}
```

### 5.2 DB 저장 방식 (권장)

마크다운을 DB `project_versions.readme` 컬럼에 직접 저장:

**장점:**
- ✅ API 응답 속도 빠름
- ✅ 버전별 독립적 관리
- ✅ 배포 간단 (파일 동기화 불필요)

**단점:**
- ❌ DB 용량 증가
- ❌ 마크다운 버전 관리 어려움 (Git diff 불가)

**하이브리드 접근:**
```
1. 개발 단계: Git에서 마크다운 파일 관리
2. 배포 시: 마이그레이션 스크립트로 DB에 삽입
```

```sql
-- 마크다운 업데이트 스크립트
UPDATE project_versions
SET readme = '# AI Portfolio v2.0\n\n...'
WHERE project_id = (SELECT id FROM projects WHERE business_id = 'PJT001')
  AND version = '2.0';
```

---

## 6. UI/UX 고려사항

### 6.1 버전 전환 애니메이션
```tsx
const ProjectModalContent = ({ content, version }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={version}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </motion.div>
    </AnimatePresence>
  );
};
```

### 6.2 버전 상태 배지 스타일
```tsx
const getVersionStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'deprecated':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};
```

### 6.3 버전 히스토리 타임라인 (고급)

```tsx
const VersionTimeline: React.FC<{ versions: ProjectVersionMeta[] }> = ({ versions }) => {
  return (
    <div className="version-timeline">
      {versions.map((v, idx) => (
        <div key={v.version} className="timeline-item">
          <div className="timeline-marker" />
          <div className="timeline-content">
            <h4>v{v.version}</h4>
            <p className="text-sm text-gray-600">{v.releaseDate}</p>
            {v.versionName && <span className="badge">{v.versionName}</span>}
          </div>
          {idx < versions.length - 1 && <div className="timeline-line" />}
        </div>
      ))}
    </div>
  );
};
```

---

## 7. 마이그레이션 계획

### 7.1 단계별 롤아웃

#### Phase 1: 스키마 및 백엔드 구현 (1주)
- [x] DB 마이그레이션 스크립트 작성
- [x] JPA 엔티티 생성
- [x] Repository 및 Service 구현
- [x] API 엔드포인트 추가

#### Phase 2: 프론트엔드 UI 구현 (1주)
- [ ] ProjectVersion 타입 정의
- [ ] VersionSelector 컴포넌트
- [ ] useProjectVersion 훅
- [ ] ProjectModal 버전 통합

#### Phase 3: 데이터 마이그레이션 (3일)
- [ ] 기존 프로젝트 → v1.0 자동 생성
- [ ] 대표 프로젝트 2-3개 v2.0 작성
- [ ] 스크린샷 업로드 및 URL 설정

#### Phase 4: 테스트 및 최적화 (3일)
- [ ] API 응답 시간 측정
- [ ] 버전 전환 애니메이션 테스트
- [ ] 모바일 반응형 검증

### 7.2 호환성 전략

**기존 API 유지 (Backward Compatible):**
```java
// 기존 엔드포인트: 기본 버전 반환
@GetMapping("/api/data/projects/{id}")
public ProjectResponse getProject(@PathVariable String id) {
    return projectService.getProjectById(id);  // default version
}

// 신규 엔드포인트: 버전 지정
@GetMapping("/api/data/projects/{id}")
public ProjectResponse getProject(
    @PathVariable String id,
    @RequestParam(required = false) String version
) {
    if (version == null) {
        return projectService.getProjectById(id);
    }
    return projectService.getProjectByIdAndVersion(id, version);
}
```

---

## 8. 예상 효과

### 8.1 사용자 경험
- ✅ **프로젝트 진화 가시화**: 버전별 기술 스택 변화 확인
- ✅ **성장 스토리텔링**: v1.0 → v2.0 → v3.0 발전 과정 표현
- ✅ **기술 다양성 표현**: 같은 프로젝트도 여러 기술로 구현 경험 강조

### 8.2 포트폴리오 가치
- ✅ **전문성**: 체계적인 버전 관리 능력 증명
- ✅ **학습 곡선**: 시간에 따른 기술 성장 과정 표현
- ✅ **유지보수 경험**: 장기 프로젝트 관리 역량 어필

### 8.3 유지보수성
- ✅ **데이터 정규화**: 버전별 독립 관리로 수정 용이
- ✅ **확장성**: 새 버전 추가 시 기존 데이터 영향 없음
- ✅ **히스토리 보존**: 과거 버전 데이터 손실 방지

---

## 9. 참고 자료

### 9.1 버전 관리 UI 참고 사이트
- [GitHub Release Pages](https://github.com/facebook/react/releases)
- [Notion Version History](https://notion.so)
- [Stripe API Versions](https://stripe.com/docs/api/versioning)

### 9.2 기술 문서
- [Semantic Versioning](https://semver.org/)
- [PostgreSQL Array Types](https://www.postgresql.org/docs/current/arrays.html)
- [React Query Versioning Pattern](https://tanstack.com/query/latest)

---

## 10. 다음 액션 아이템

### 백엔드 개발자
- [ ] V005 마이그레이션 스크립트 작성 및 테스트
- [ ] ProjectVersionJpaEntity 및 Repository 구현
- [ ] API 엔드포인트 추가 (/projects/{id}?version=X)
- [ ] 버전별 기술 스택 조인 쿼리 최적화

### 프론트엔드 개발자
- [ ] ProjectVersion 타입 정의
- [ ] VersionSelector 컴포넌트 구현
- [ ] useProjectVersion 훅 구현
- [ ] ProjectModal에 버전 선택 UI 통합
- [ ] 버전 전환 애니메이션 추가

### 컨텐츠 작성자
- [ ] 대표 프로젝트의 버전별 마크다운 작성
- [ ] 버전별 스크린샷 촬영 및 업로드
- [ ] 릴리즈 노트 작성 (주요 변경사항)

---

**문서 작성일**: 2025-10-07
**최종 수정일**: 2025-10-07
**작성자**: AI Agent (Claude)
**검토자**: TBD
