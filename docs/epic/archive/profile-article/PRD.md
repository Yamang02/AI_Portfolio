# Epic: Profile Article Management

## Epic Goal

```text
프로필 페이지의 자기소개 섹션을 마크다운 형식으로 관리할 수 있게 하고,
프로젝트와 연계 가능한 기술 아티클 게시판을 추가하여
개발 인사이트 공유 및 프로젝트 컨텍스트 제공을 가능하게 한다.
```

**목적**: 개발자의 기술적 인사이트와 경험 공유 + 프로젝트 관련 상세 설명 제공
**범위**: DB 스키마 추가, Backend API, Admin UI, Frontend 표시 UI
**비범위**: 마크다운 에디터 직접 구현 (기존 라이브러리 활용), 댓글 기능, 좋아요 기능

---

## Motivation

### 현재 문제점

1. **자기소개 관리의 한계**
   - 프로필 페이지의 자기소개가 단순 텍스트로만 표시됨
   - 관리자 페이지에서 편집 불가능 (하드코딩 상태)
   - 마크다운 지원이 없어 풍부한 표현 불가능

2. **프로젝트 설명의 한계**
   - 프로젝트 상세 페이지에 README만 표시됨
   - 개발 과정, 기술적 의사결정, 트러블슈팅 내용이 분리되지 않음
   - 프로젝트 컨텍스트를 제공할 추가 콘텐츠 공간 부재

3. **기술 인사이트 공유 부재**
   - 개발자의 기술적 사고와 경험을 공유할 공간이 없음
   - 단순 프로젝트 결과물만 나열되어 "판단 과정"이 보이지 않음

### 해결 방안

1. **자기소개 Markdown 관리**
   - DB에 `introduction_content` 필드 추가 (markdown 형식)
   - Admin 페이지에서 마크다운 에디터로 편집 가능
   - Profile 페이지에서 렌더링된 HTML로 표시

2. **기술 아티클 시스템**
   - 프로젝트와 연계 가능한(선택적) Article 도메인 추가
   - 독립 게시글 또는 프로젝트 연관 게시글 작성 가능
   - 개발 과정, 기술 선택 이유, 트러블슈팅 등 상세 기술 가능

---

## Requirements

### 0. 공통 전제 / 제약 (Admin 개발 전제 조건)

#### 0.1 인증 방식
- **세션 쿠키 기반 고정** (`credentials: include` 사용)
- **토큰 기반(리프레시/인터셉터) 구조는 이번 에픽 범위에서 제외**

#### 0.2 데이터 규모 가정 (Article)
- **현실적 범위(혼자 운영)**: 10 ~ 200개
- **중간 규모(체감 시작)**: 1,000개 (목록 검색/필터/정렬 체감, 서버 페이징 권장)
- **대규모(설계가 중요)**: 10,000개 이상 (인덱스/검색 전략/커서 페이징 고려)

> 결론: 초기부터 **서버 사이드 페이지네이션/정렬/필터 계약**을 잡아두면, 1,000개 이상으로 늘어도 문서/구조를 다시 뜯지 않아도 됩니다.

#### 0.3 Markdown 렌더링 정책 (보안)
- **현재 정책(기본)**: Markdown 내부 **HTML은 렌더링하지 않음** (escape)
- **향후 옵션**: HTML 렌더링이 필요해지면 `rehype-raw` + `rehype-sanitize`로 **허용 태그/속성 whitelist**를 정의하여 제한적으로 허용

### 1. 자기소개 Markdown 관리

#### 1.1 DB 스키마

```sql
CREATE TABLE IF NOT EXISTS profile_introduction (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,  -- Markdown 형식
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**설계 선택:**
- 별도 테이블로 생성하여 명확한 책임 분리
- 버전 관리 가능 (향후 확장성)

#### 1.2 Backend 구조 (Hexagonal Architecture)

**Domain Layer:**
```
domain/portfolio/model/ProfileIntroduction.java
domain/portfolio/port/in/ManageProfileIntroductionUseCase.java
domain/portfolio/port/in/GetProfileIntroductionUseCase.java
domain/portfolio/port/out/ProfileIntroductionRepositoryPort.java
```

**Application Layer:**
```
application/portfolio/ManageProfileIntroductionService.java
application/portfolio/GetProfileIntroductionService.java
```

**Infrastructure Layer:**
```
infrastructure/persistence/postgres/entity/ProfileIntroductionJpaEntity.java
infrastructure/persistence/postgres/repository/ProfileIntroductionJpaRepository.java
infrastructure/persistence/postgres/mapper/ProfileIntroductionMapper.java
infrastructure/persistence/postgres/adapter/PostgresProfileIntroductionRepository.java
infrastructure/web/admin/controller/AdminProfileIntroductionController.java
infrastructure/web/controller/ProfileIntroductionController.java
```

#### 1.3 Admin UI (Feature-Sliced Design)

**Entities Layer:**
```
frontend/src/admin/entities/profile-introduction/
  ├── model/profileIntroduction.types.ts
  ├── api/adminProfileIntroductionApi.ts
  ├── api/useAdminProfileIntroductionQuery.ts
  └── index.ts
```

**Features Layer:**
```
frontend/src/admin/features/profile-introduction-management/
  ├── hooks/useProfileIntroductionForm.ts
  └── ui/ProfileIntroductionEditor.tsx
```

**Pages Layer:**
```
frontend/src/admin/pages/ProfileIntroductionManagement.tsx
```

**기능:**
- 현재 자기소개 조회
- 마크다운 에디터로 편집 (`admin/shared/ui/markdown/MarkdownEditor.tsx` 재사용)
- 미리보기 기능
- 저장 (Update만 지원, 단일 레코드)

**공유 컴포넌트 활용:**
- `admin/shared/ui/markdown/MarkdownEditor.tsx` - 마크다운 에디터 (이미 구현됨)
- `admin/shared/ui/ManagementPageTemplate.tsx` - 관리 페이지 템플릿 (선택적)

#### 1.4 Frontend 표시 UI

**위치:** `frontend/src/main/pages/ProfilePage/components/IntroductionSection.tsx`

**Entities Layer:**
```
frontend/src/main/entities/profile-introduction/
  ├── model/profileIntroduction.types.ts
  ├── api/profileIntroductionApi.ts
  ├── api/useProfileIntroductionQuery.ts
  └── index.ts
```

**변경사항:**
- API에서 마크다운 콘텐츠 조회 (Entities Layer 활용)
- `react-markdown` 라이브러리로 렌더링
- 기존 하드코딩 제거
- 디자인 시스템 컴포넌트 사용 (`@/design-system`의 `Card`, `SectionTitle` 등)

---

### 1.5 Featured Project 노출 순서 조정

**요구사항:**
- 메인페이지 Featured Project 섹션에서 프로젝트 노출 순서 조정 가능
- Admin에서 Featured Project 지정 및 순서 관리

**스키마 변경 필요:**
- `projects` 테이블에 다음 필드 추가:
  - `is_featured BOOLEAN DEFAULT FALSE`: Featured Project 여부 (이미 V003 마이그레이션에 존재)
  - `featured_sort_order INTEGER`: Featured Project 섹션 내 노출 순서 (is_featured=true일 때만 사용) - **신규 추가 필요**

**구현 방안:**
```sql
-- projects 테이블에 featured_sort_order 필드 추가 (is_featured는 이미 V003에 존재)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS featured_sort_order INTEGER;

-- 인덱스 추가 (is_featured 인덱스는 V003에 이미 존재할 수 있음)
CREATE INDEX IF NOT EXISTS idx_projects_featured_sort_order ON projects(featured_sort_order) WHERE is_featured = TRUE;
```

**참고:**
- `is_featured` 필드는 이미 `V003__add_is_featured_to_projects.sql` 마이그레이션에 존재
- `featured_sort_order` 필드만 추가하면 됨

**Admin UI:**
- 프로젝트 관리 페이지에서 `is_featured` 설정 (Switch)
- Featured Project 지정 시 `featured_sort_order` 입력/조정
- Featured Project 목록에서 드래그 앤 드롭 또는 숫자 입력으로 순서 조정
- **라우팅**: `/admin/projects` (기존 프로젝트 관리 페이지 활용)

**Public API:**
- `GET /api/projects/featured`: Featured Project 목록 조회 (featured_sort_order 기준 정렬)

---

### 2. 기술 아티클 시스템

#### 2.1 DB 스키마

```sql
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,  -- 외부 식별자 (PK와 분리)
    title VARCHAR(255) NOT NULL,
    summary TEXT,  -- 요약 (목록에서 표시)
    content TEXT NOT NULL,  -- Markdown 형식 본문

    -- 프로젝트 연계 (Optional)
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,

    -- 분류
    category VARCHAR(50),  -- 'tutorial', 'troubleshooting', 'architecture', 'insight', 'development-timeline' 등
    tags TEXT[],  -- 태그 배열

    -- 메타데이터
    status VARCHAR(50) DEFAULT 'published',  -- 'draft', 'published', 'archived'
    published_at TIMESTAMP,  -- 발행일 (status를 'published'로 변경 시 NULL이면 현재 시각으로 자동 설정)
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,  -- 조회수 (아티클 상세 조회 시 증가)

    -- 메인페이지 노출
    is_featured BOOLEAN DEFAULT FALSE,  -- 추천 아티클 (메인페이지 노출)
    series_id VARCHAR(50),  -- 시리즈 그룹 ID (같은 series_id를 가진 아티클들이 하나의 시리즈, Backend 자동 생성, 상세는 2.2 참조)
    series_order INTEGER,  -- 시리즈 내 순서 (series_id가 있을 때만 사용)

    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 아티클-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS article_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, tech_name)
);

-- 시리즈 메타데이터 테이블
CREATE TABLE IF NOT EXISTS article_series (
    id BIGSERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,  -- articles.series_id와 매칭, 형식: 'article-series-n' (예: 'article-series-001')
    title VARCHAR(255) NOT NULL,  -- 시리즈 대표명
    description TEXT,  -- 시리즈 설명 (선택적)
    thumbnail_url VARCHAR(500),  -- 시리즈 썸네일 (선택적)
    sort_order INTEGER DEFAULT 0,  -- 메인페이지 노출 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_business_id ON articles(business_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON articles(sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_series_id ON articles(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count) WHERE status = 'published';  -- 인기 아티클 조회용

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON article_tech_stack(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON article_tech_stack(tech_name);

CREATE INDEX IF NOT EXISTS idx_article_series_series_id ON article_series(series_id);
CREATE INDEX IF NOT EXISTS idx_article_series_sort_order ON article_series(sort_order);
```

**주요 필드 설명:**
- `business_id`: 외부 식별자 (예: "article-001"), PK와 분리하여 URL 등에 사용
- `project_id`: NULL 허용 (프로젝트 연관 없는 독립 게시글 가능), 프로젝트 테이블의 PK(id) 참조
- `category`: 게시글 유형 분류
  - `'tutorial'`: 튜토리얼/가이드
  - `'troubleshooting'`: 트러블슈팅/문제 해결
  - `'architecture'`: 아키텍처 설계
  - `'insight'`: 인사이트/경험 공유
  - `'development-timeline'`: 프로젝트 발전 과정 (프로젝트 상세 페이지와 연결)
- `tags`: 키워드 태그 (검색 및 필터링)
- `status`: 초안/발행/보관 상태 관리
- `view_count`: 조회수 (아티클 상세 조회 시 증가)
- `is_featured`: 추천 아티클 여부 (메인페이지 노출용)
- `series_id`: 시리즈 그룹 ID (같은 ID를 가진 아티클들이 하나의 시리즈)
- `series_order`: 시리즈 내 순서 (series_id가 있을 때만 사용)

**이미지 처리:**
- 마크다운 콘텐츠 내에 이미지 포함 가능 (`![alt](url)` 형식)
- 이미지는 별도 테이블에 저장하지 않고, 파일 시스템/클라우드 스토리지에 저장
- 마크다운 내 이미지 URL은 업로드된 이미지의 URL로 자동 삽입
- 게시글 삭제 시 연관 이미지 정리 정책 필요 (참고: [이미지 관리 정책](#이미지-관리-정책))

**삭제 정책:**
- **Article 삭제 시 ArticleTechStack**: `ON DELETE CASCADE`로 자동 삭제 (명시적 처리 불필요)
- **Article 삭제 시 Project**: `ON DELETE SET NULL`로 `project_id`가 NULL로 변경 (의도된 동작)
- **Article Series 삭제 정책**: 
  - `article_series` 테이블 삭제 시 해당 `series_id`를 가진 Article들의 `series_id`를 NULL로 설정
  - Application Layer에서 처리: `ArticleSeriesService.delete()` 메서드에서 연관 Article들의 `series_id` NULL 처리 후 시리즈 삭제
- **Project 삭제 시 Article**: `ON DELETE SET NULL`로 Article의 `project_id`가 NULL로 변경 (의도된 동작, Article은 유지)

#### 2.2 Backend 구조 (Hexagonal Architecture)

**Domain Layer:**
```
domain/article/
  ├── model/
  │   └── Article.java
  ├── port/
  │   ├── in/
  │   │   ├── ManageArticleUseCase.java
  │   │   └── GetArticleUseCase.java
  │   └── out/
  │       └── ArticleRepositoryPort.java
  └── service/
      └── ArticleDomainService.java  (비즈니스 로직)
```

**Application Layer:**
```
application/article/
  ├── ManageArticleService.java
  └── GetArticleService.java
```

**Infrastructure Layer:**
```
infrastructure/persistence/postgres/
  ├── entity/
  │   ├── ArticleJpaEntity.java
  │   └── ArticleTechStackJpaEntity.java
  ├── repository/
  │   ├── ArticleJpaRepository.java
  │   └── ArticleTechStackJpaRepository.java
  ├── mapper/
  │   └── ArticleMapper.java
  └── adapter/
      └── PostgresArticleRepository.java

infrastructure/web/
  ├── admin/controller/
  │   ├── AdminArticleController.java
  │   └── AdminArticleSeriesController.java
  └── controller/
      └── ArticleController.java
```

**Article Domain Model:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private Long id;  // PK (내부 식별자)
    private String businessId;  // 외부 식별자 (예: "article-001")
    private String title;
    private String summary;
    private String content;  // Markdown

    // 프로젝트 연계 (Optional)
    private Long projectId;  // 프로젝트 PK 참조, JOIN은 DTO/Response 레벨에서 처리

    // 분류
    private String category;
    private List<String> tags;

    // 기술 스택
    private List<TechStackMetadata> techStackMetadata;

    // 메타데이터
    private String status;
    private LocalDateTime publishedAt;
    private Integer sortOrder;
    private Integer viewCount;  // 조회수 (아티클 상세 조회 시 증가)

    // 메인페이지 노출
    private Boolean isFeatured;  // 추천 아티클 (메인페이지 노출)
    private String seriesId;  // 시리즈 그룹 ID (같은 seriesId를 가진 아티클들이 하나의 시리즈)
    private Integer seriesOrder;  // 시리즈 내 순서 (seriesId가 있을 때만 사용)

    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 비즈니스 로직
    public boolean isPublished() {
        return "published".equals(status);
    }

    public boolean hasProject() {
        return projectId != null;
    }
}
```

**참고:** `Project` 객체는 도메인 모델이 아닌 **DTO/Response 레벨**에서 필요시 JOIN하여 포함합니다.
- Domain Model: `projectId` (PK, Long)로 참조 관계만 유지
- DTO/Response: 
  - 백엔드 내부에서는 PK(`project_id`) 사용
  - API 응답으로 변환 시 프로젝트의 `businessId`를 조회하여 `projectId` 필드로 노출
  - 클라이언트 요구사항에 따라 `project` 객체 포함 (예: 상세 조회 시)

**Article Series Domain Model:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSeries {
    private String id;
    private String seriesId;  // articles.series_id와 매칭, 형식: 'article-series-n' (예: 'article-series-001')
    private String title;  // 시리즈 대표명
    private String description;  // 시리즈 설명 (Optional)
    private String thumbnailUrl;  // 시리즈 썸네일 (Optional)
    private Integer sortOrder;  // 메인페이지 노출 순서
    
    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**시리즈 ID 생성 규칙:**
- **형식**: `article-series-n` (예: `article-series-001`, `article-series-002`)
- **생성 방식**: Backend에서 자동 생성 (고유 ID 생성 패턴 사용)
- **생성 시점**: Admin에서 시리즈 생성 시 자동 할당
- **제약사항**: UNIQUE 제약조건으로 중복 방지

**시리즈 메타데이터 테이블 활용:**
- `article_series` 테이블은 시리즈의 메타데이터(제목, 설명, 썸네일)를 관리
- **초기 구현 (Phase 2)**: 시리즈 생성 시 `article_series` 레코드 자동 생성 (Backend에서 처리)
  - Admin에서 Article 생성/수정 시 `seriesId` 입력 시 자동으로 `article_series` 레코드 생성
  - 시리즈 제목은 첫 번째 Article의 제목 또는 별도 입력 필드 제공
- **향후 개선 (Phase 2.5, 선택적)**: 별도 시리즈 관리 페이지 추가
  - `ArticleSeriesManagement.tsx` 페이지에서 시리즈 메타데이터 직접 관리
  - 시리즈 썸네일, 설명 등 상세 정보 관리

#### 2.3 Admin UI (Feature-Sliced Design + Antd)

**Entities Layer:**
```
frontend/src/admin/entities/article/
  ├── model/
  │   └── article.types.ts
  ├── api/
  │   ├── adminArticleApi.ts      (adminApiClient 사용)
  │   └── useAdminArticleQuery.ts (useAdminQuery 래퍼 활용)
  └── index.ts
```

**Features Layer:**
```
frontend/src/admin/features/article-management/
  ├── hooks/
  │   ├── useArticleForm.ts       (Antd Form 연동)
  │   └── useArticleModal.ts      (모달 상태 관리)
  ├── ui/
  │   ├── ArticleFormModal.tsx    (Antd Modal + Form, 마크다운 에디터 포함)
  │   └── ArticlePreview.tsx      (react-markdown 렌더링)
  └── config/
      ├── articleColumns.tsx      (Antd Table columns 설정)
      ├── articleFilters.ts       (필터 옵션 정의)
      └── articleSearchConfig.ts  (검색 설정)
```

**Pages Layer:**
```
frontend/src/admin/pages/ArticleManagement.tsx
frontend/src/admin/pages/ArticleSeriesManagement.tsx  (선택적, 시리즈 관리 전용 페이지)
```

**Admin 라우팅:**
- `/admin/profile-introduction` - 자기소개 관리
- `/admin/articles` - 기술 아티클 관리
- `/admin/article-series` - 시리즈 관리 (선택적, Phase 2.5 참조)
- `/admin/projects` - Featured Project 순서 조정 포함 (Phase 0.5)

**페이지 구현 예시:**
```typescript
// admin/pages/ArticleManagement.tsx
export const ArticleManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // useTablePage 훅으로 테이블 로직 통합
  const { tableProps, filterState } = useTablePage({
    initialParams: {
      draw: 1,
      start: 0,
      length: 20,
      'search[value]': '',
    },
    config: {
      searchConfig: ARTICLE_CONFIG.searchConfig,
      filters: ARTICLE_CONFIG.filters,
      sortableColumnIndexMap: ARTICLE_CONFIG.sortableColumnIndexMap,
      defaultSort: { column: 0, dir: 'desc' }, // publishedAt desc
      defaultPageSize: 20,
    },
    useQuery: useAdminArticlesQuery,
    errorMessage: '게시글 목록을 불러오는데 실패했습니다.',
  });

  // 통계 데이터
  const stats = useMemo(() => ({
    total: tableProps.paginationConfig.total,
    published: filterState.status === 'published' ? tableProps.dataSource.length : 0,
    draft: filterState.status === 'draft' ? tableProps.dataSource.length : 0,
  }), [tableProps, filterState]);

  const handleCreate = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader title="기술 아티클 관리" onAdd={handleCreate} />

      <StatsCards stats={[
        { title: '전체 게시글', value: stats.total, icon: 'FileTextOutlined' },
        { title: '발행됨', value: stats.published, icon: 'CheckCircleOutlined' },
        { title: '초안', value: stats.draft, icon: 'EditOutlined' },
      ]} />

      <TableTemplate
        {...tableProps}
        columns={ARTICLE_CONFIG.columns}
        rowKey="id"
        onRowClick={handleEdit}
      />

      <ArticleFormModal
        open={isModalOpen}
        article={editingArticle}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch(); // 목록 갱신
        }}
      />
    </div>
  );
};
```

**기능:**
- 게시글 목록 (서버 사이드 페이징/정렬/필터)
  - 필터: 카테고리, 태그, 프로젝트, 상태
  - 검색: 제목, 내용
  - 정렬: 발행일, 생성일, 정렬 순서
- 게시글 생성/수정 (Antd Form + Modal)
  - 마크다운 에디터 (`admin/shared/ui/markdown/MarkdownEditor.tsx` 재사용)
    - **이미지 업로드 기능 통합** (드래그 앤 드롭 또는 버튼 클릭)
    - 업로드된 이미지 URL을 마크다운에 자동 삽입 (`![alt](url)` 형식)
    - 업로드 타입: `'article'` (기존 `adminUploadApi` 활용)
  - 프로젝트 선택 (Antd Select)
  - 기술 스택 다중 선택 (Antd Select multiple)
  - 카테고리/태그 입력
  - 상태 선택 (초안/발행/보관)
  - **발행일 자동 설정**: `status`를 'published'로 변경 시 `publishedAt`이 NULL이면 현재 시각으로 자동 설정 (Backend에서 처리)
  - **초안 미리보기**: Admin에서 초안 상태 게시글도 미리보기 가능 (Admin 전용 기능)
- 게시글 삭제 (확인 모달)
- 실시간 미리보기 (react-markdown)
- 통계 카드 (전체/발행/초안 개수)

**공유 컴포넌트 활용:**
- `admin/shared/ui/TableTemplate/` - 테이블 템플릿 (**Antd Table 기반**, Phase 0에서 생성)
- `admin/shared/ui/FormModal/` - CRUD 모달 (**Antd Modal + Form**, Phase 0에서 생성)
- `admin/shared/ui/SearchFilter/` - 검색/필터 UI (**Antd Input + Select**, Phase 0에서 생성)
- `admin/shared/ui/StatsCards/` - 통계 카드 (**Antd Card + Statistic**, Phase 0에서 생성)
- `admin/shared/ui/markdown/MarkdownEditor.tsx` - 마크다운 에디터 (이미 구현됨)
- `admin/shared/ui/ConfirmModal/` - 확인 모달 (삭제 등)
- `admin/hooks/useTablePage.ts` - 테이블 로직 통합 (Phase 0에서 생성)

**Antd 컴포넌트 활용:**
- `Table` - 데이터 테이블
- `Form` - 폼 (자동 유효성 검사)
- `Modal` - 모달 창
- `Select` - 드롭다운 선택
- `Input.TextArea` - 텍스트 영역
- `DatePicker` - 날짜 선택
- `Tag` - 태그 표시
- `Badge` - 상태 배지
- `Statistic` - 통계 수치
- `Button` - 버튼
- `Space` - 간격 조정
- `message` - 토스트 알림

#### 2.4 Frontend 표시 UI

**새 페이지 추가:**
```
frontend/src/main/pages/ArticlesPage/
  ├── ArticlesPage.tsx  (게시글 목록)
  ├── ArticleDetailPage.tsx  (게시글 상세)
  ├── components/
  │   ├── ArticleCard.tsx
  │   ├── ArticleList.tsx
  │   └── ArticleContent.tsx  (마크다운 렌더링)
  └── index.ts
```

**Entities Layer:**
```
frontend/src/main/entities/article/
  ├── model/
  │   └── article.types.ts
  ├── api/
  │   ├── articleApi.ts
  │   ├── useArticleQuery.ts
  │   └── useArticlesQuery.ts
  └── index.ts
```

**Features Layer:**
```
frontend/src/main/features/article-view/
  ├── hooks/
  │   └── useArticleFilter.ts
  └── ui/
  │   └── ArticleCard.tsx
  └── index.ts
```

**라우팅 추가:**
```tsx
// frontend/src/main/app/MainApp.tsx 또는 라우팅 설정 파일
<Route path="/articles" element={<ArticlesPage />} />
<Route path="/articles/:id" element={<ArticleDetailPage />} />
```

**주요 기능:**
- 게시글 목록 (필터링: 카테고리, 태그, 프로젝트)
- 게시글 상세 (마크다운 렌더링, 관련 프로젝트 링크, 기술 스택 표시)
- **프로젝트 상세 페이지에 "프로젝트 발전 과정" 섹션 추가**
  - `projectId` + `category='development-timeline'` 조건으로 아티클 조회
  - 시간순 정렬 (`sortOrder` 또는 `publishedAt` 기준)
  - 프로젝트 상세 페이지는 비즈니스적 내용 중심, 기술적 내용은 아티클로 연결
  - 각 아티클 카드에 제목, 요약, 발행일 표시
  - 클릭 시 아티클 상세 페이지로 이동

**디자인 시스템 활용:**
- `@/design-system` 컴포넌트 사용 (Card, Badge, SectionTitle, TextLink 등)
- CSS 변수 기반 스타일링 (`--color-*`, `--spacing-*` 등)
- 다크모드 자동 지원 (`@media (prefers-color-scheme: dark)`)

---

## Technical Decisions

### 1. 마크다운 에디터 선택

**옵션:**
1. `@uiw/react-md-editor` - 가벼움, 미리보기 기본 제공
2. `react-markdown-editor-lite` - 기능 풍부, 플러그인 지원
3. `react-simplemde-editor` - SimpleMDE 기반, 안정적

**선택:** `@uiw/react-md-editor` (가벼움, 미리보기, 다크모드 지원)

**재사용 방침(AI_PortFolio Admin):**
- 신규 구현 대신 **기존 Admin 구현을 공통 컴포넌트로 재사용**
  - 마크다운 에디터: `frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx` (이미 구현됨, `@uiw/react-md-editor` 사용)
  - 기존 프로젝트 README 편집: `frontend/src/admin/features/project-management/ui/ProjectMarkdownEditor.tsx` → 공통 컴포넌트 사용
  - 공유 UI 컴포넌트: `admin/shared/ui/` 디렉토리의 컴포넌트들 재사용

### 2. 마크다운 렌더링

**선택:** `react-markdown` + `remark-gfm` (GitHub Flavored Markdown 지원)

### 3. 게시물 이미지 처리

**요구사항:**
- 마크다운 콘텐츠 내에 이미지 포함 가능 (`![alt](url)` 형식)
- 에디터에서 이미지 업로드 및 자동 삽입
- 업로드된 이미지 관리 (삭제, 정리)

**구현 방안:**

#### 3.1 이미지 업로드 통합
- **기존 API 재사용**: `adminUploadApi.uploadImage()` 활용
- **업로드 타입 확장**: `'article'` 타입 추가
  ```typescript
  // admin/api/adminUploadApi.ts
  type UploadType = 'project' | 'screenshots' | 'skill' | 'profile' | 'article';
  ```
- **마크다운 에디터 확장**: `MarkdownEditor` 컴포넌트에 이미지 업로드 기능 추가
  - 드래그 앤 드롭 지원
  - 이미지 선택 버튼 추가
  - 업로드 중 로딩 상태 표시
  - 업로드 완료 시 마크다운에 자동 삽입: `![alt](uploaded-url)`

#### 3.2 이미지 저장 위치
- **파일 시스템/클라우드 스토리지**: 기존 업로드 시스템과 동일한 방식
- **URL 형식**: 업로드된 이미지의 공개 URL 사용
- **DB 저장**: 이미지 URL은 마크다운 콘텐츠 내에 포함 (별도 테이블 불필요)

#### 3.3 이미지 관리 정책
**옵션 1: 자동 정리 (권장)**
- 게시글 삭제 시 마크다운 내 이미지 URL 추출
- 추출된 이미지 자동 삭제 (미사용 이미지 정리)
- **장점**: 스토리지 낭비 방지
- **단점**: 구현 복잡도 증가

**옵션 2: 수동 정리**
- 게시글 삭제 시 이미지는 유지
- 주기적으로 미사용 이미지 정리 작업 (별도 스케줄러)
- **장점**: 구현 단순
- **단점**: 스토리지 낭비 가능성

**선택:** 옵션 2 (초기 구현), 옵션 1은 향후 개선 사항

**게시글 삭제 시 이미지 정리 정책:**
- **초기 구현**: 옵션 2 (수동 정리)
  - 게시글 삭제 시 마크다운 내 이미지는 유지
  - 주기적으로 미사용 이미지 정리 작업 (별도 스케줄러 또는 수동)
- **향후 개선**: 옵션 1 (자동 정리)
  - 게시글 삭제 시 마크다운 내 이미지 URL 추출 후 자동 삭제

#### 3.4 구현 예시
```typescript
// admin/shared/ui/markdown/MarkdownEditorWithImage.tsx
import { useUploadImage } from '@/admin/hooks/useUpload';
import { MarkdownEditor } from './MarkdownEditor';

export const MarkdownEditorWithImage: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  ...props
}) => {
  const uploadImage = useUploadImage();

  const handleImageUpload = async (file: File) => {
    const result = await uploadImage.mutateAsync({
      file,
      type: 'article',
    });
    // 마크다운에 이미지 삽입
    const imageMarkdown = `![${file.name}](${result.url})`;
    onChange?.(value + '\n' + imageMarkdown);
  };

  return (
    <MarkdownEditor
      value={value}
      onChange={onChange}
      onImageUpload={handleImageUpload}  // 커스텀 핸들러 전달
      {...props}
    />
  );
};
```

**참고:**
- `@uiw/react-md-editor`는 기본적으로 이미지 업로드를 지원하지 않음
- 커스텀 툴바 버튼 추가 또는 드래그 앤 드롭 이벤트 핸들링 필요
- 또는 `react-markdown-editor-lite`의 이미지 업로드 플러그인 활용 검토

### 3. 자기소개 관리 방식

**옵션:**
1. Portfolio 테이블에 컬럼 추가
2. 별도 ProfileIntroduction 테이블 생성

**선택:** 별도 테이블 생성
- **이유:** 책임 분리, 버전 관리 가능성, 확장성 (다국어 지원 시 유리)

### 5. Article-Project 관계

**설계:** Article → Project (단방향 참조)
- Article은 Project를 참조할 수 있음 (Optional)
- Project는 Article을 직접 참조하지 않음 (조회 시 JOIN으로 해결)
- Article 삭제 시 Project 영향 없음 (ON DELETE SET NULL)

**프로젝트 발전 과정 연결 전략:**
- **목적**: 프로젝트 상세 페이지에서 비즈니스적 내용만 다루고, 기술적 내용은 기술 아티클로 분리
- **구현 방식**: `projectId` + `category='development-timeline'` 조합 사용
  - 별도 엔티티 불필요 (기존 구조 활용)
  - 프로젝트 상세 페이지에서 `GET /api/articles?projectId={id}&category=development-timeline` 조회
  - `sortOrder` 또는 `publishedAt` 기준으로 시간순 정렬하여 "프로젝트 발전 과정" 섹션에 표시
- **장점**:
  - 단순함: 추가 테이블 불필요
  - 유연함: category로 의미 구분 가능
  - 확장성: 필요 시 다른 category로 확장 가능

### 6. 조회수 추적

**구현 방안:**
- **DB 필드**: `articles.view_count` INTEGER (기본값: 0)
- **증가 시점**: 아티클 상세 조회 시 (`GET /api/articles/:businessId`)
- **증가 위치**: Application Layer의 `GetArticleService.getById()` 메서드에서 조회 후 자동 증가
  - Public API에서만 증가 (Admin API에서는 증가하지 않음)
  - 트랜잭션 내에서 조회와 증가를 함께 처리하여 일관성 보장
- **증가 방식**: 
  - 옵션 1: 매 조회마다 증가 (단순 카운터) - **초기 구현**
  - 옵션 2: 세션 기반 중복 방지 (같은 세션에서 1회만 카운트) - 향후 개선
  - 옵션 3: 사용자 기반 중복 방지 (같은 사용자가 1회만 카운트) - 로그인 필요
- **초기 구현**: 옵션 1 (단순 카운터)
  - 장점: 구현 단순, 성능 우수
  - 단점: 중복 조회 카운트 가능
- **향후 개선**: 세션 기반 또는 사용자 기반 중복 방지 추가 가능

**조회수 활용:**
- 아티클 상세 페이지에 조회수 표시
- 인기 아티클 조회 API (`GET /api/articles/popular`)
- Admin에서 조회수 통계 확인
- 목록에서 조회수 기준 정렬 가능

### 7. 메인페이지 노출 전략

**추천 아티클 (`is_featured`):**
- **목적**: 메인페이지에 노출할 추천 아티클 선정
- **구현**: `is_featured` boolean 필드 사용
- **조회**: `GET /api/articles/featured` (메인페이지 전용 API)
- **표시**: 메인페이지 "추천 아티클" 섹션에 카드 형태로 표시

**시리즈 그룹 (`series_id`):**
- **목적**: 관련 아티클들을 시리즈로 묶어 메인페이지에 노출
- **구현**: `series_id` + `series_order` 조합 사용
  - 같은 `series_id`를 가진 아티클들이 하나의 시리즈
  - `series_order`로 시리즈 내 순서 관리
  - `series_id`가 NULL이면 독립 아티클
- **조회**: `GET /api/articles/series/:seriesId` (시리즈별 조회)
- **표시**: 메인페이지 "시리즈" 섹션에 시리즈 그룹으로 표시
  - 시리즈 제목 (첫 번째 아티클 제목 또는 별도 관리)
  - 시리즈 내 아티클 목록 (순서대로)
- **장점**:
  - 단순함: 별도 테이블 불필요
  - 유연함: 시리즈 ID만으로 그룹화 가능
  - 확장성: 필요 시 시리즈 메타데이터 테이블 추가 가능

---

## Implementation Plan

### Phase 0: Admin 공통 프레임 정비 (genpresso-admin 패턴 도입)

> **참고**: genpresso-admin-frontend의 검증된 패턴을 도입하여 Admin 개발 생산성과 유지보수성을 극대화합니다.

#### 0.1 Antd 통합 및 테마 설정
- [ ] Antd 설치 확인 (`package.json`에 `antd: ^5.21.0` 이미 설치됨)
- [ ] `admin/shared/theme/antdTheme.ts` 생성
  - 디자인시스템 CSS 변수(`--color-*`)를 Antd 테마 토큰에 매핑
  - 색상, 간격, 폰트 등 공통 스타일 통일
- [ ] `admin/app/AdminApp.tsx`에 Antd `ConfigProvider` 적용
  - `<ConfigProvider theme={adminTheme}>` 래핑
  - Admin 전체에 일관된 테마 적용

**테마 구조 예시:**
```typescript
// admin/shared/theme/antdTheme.ts
import { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: 'var(--color-primary)',      // 디자인시스템 변수 참조
    colorSuccess: 'var(--color-success)',
    colorWarning: 'var(--color-warning)',
    colorError: 'var(--color-error)',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Button: { controlHeight: 36 },
    Table: { headerBg: 'var(--color-surface-secondary)' },
  },
};
```

#### 0.2 Admin API 클라이언트 통합
- [ ] `admin/api/adminApiClient.ts` 생성
  - 세션 쿠키 기반 (`credentials: 'include'`)
  - 공통 에러 파싱 및 로깅
  - 응답 인터셉터 (에러 토스트, Antd `message` 활용)
  - 요청 인터셉터 (공통 헤더, 로깅)
- [ ] 기존 도메인별 개별 `fetch` 호출을 `adminApiClient`로 통합
  - `entities/*/api/*.ts` 파일에서 `adminApiClient` 사용
  - 중복 코드 제거, 에러 처리 일관성 확보

**클라이언트 구조 예시:**
```typescript
// admin/api/adminApiClient.ts
class AdminApiClient {
  private baseURL = '/api/admin';

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseError(response);
      this.showErrorToast(error);
      throw error;
    }
    return response.json();
  }

  // post, put, delete 메서드...
}

export const adminApiClient = new AdminApiClient();
```

#### 0.3 React Query 안정 옵션 표준화
- [ ] `admin/hooks/useAdminQuery.ts` 유틸 생성
  - React Query 공통 옵션 래퍼
  - `placeholderData: keepPreviousData` 기본 적용 (refetch 중 이전 데이터 유지)
  - 공통 에러 핸들링
  - staleTime, gcTime 등 기본값 설정
- [ ] 기존 `useQuery` 호출을 `useAdminQuery`로 통일

**훅 구조 예시:**
```typescript
// admin/hooks/useAdminQuery.ts
export function useAdminQuery<TData>(options: UseQueryOptions<TData>) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData, // 리페치 중 깜빡임 방지
    staleTime: 5 * 60 * 1000,          // 5분
    gcTime: 10 * 60 * 1000,            // 10분
    retry: 1,
  });
}
```

#### 0.4 테이블 표준 패턴 확립
- [ ] `admin/shared/ui/TableTemplate/` 컴포넌트 생성
  - Antd `Table` 래핑
  - 검색/필터/페이징/정렬 통합 UI
  - 서버 사이드 페이징/정렬 지원 (DataTables 계약)
  - 클라이언트 사이드 정렬 옵션 (작은 데이터셋)
  - 통계 헤더 (전체 개수, 검색 결과 개수)
  - 내보내기 버튼 (선택적)
- [ ] `admin/hooks/useTablePage.ts` 훅 생성
  - DataTable params 관리 (`draw`, `start`, `length`, `search[value]`, `order[]` 등)
  - `useTableWithFilters` 로직 통합
  - pagination/search/filter/sort 상태 통합 관리
  - React Query 연동
- [ ] `admin/types/dataTable.types.ts` 타입 정의
  - `DataTableParams`, `DataTableResponse` 인터페이스
  - 서버/클라이언트 계약 명시

**사용 예시:**
```typescript
// admin/pages/ArticleManagement.tsx
const { tableProps, filterState } = useTablePage({
  initialParams: {
    draw: 1,
    start: 0,
    length: 20,
    'search[value]': '',
  },
  config: {
    searchConfig: { placeholder: '제목, 내용 검색', fields: ['title', 'content'] },
    filters: [
      { key: 'category', label: '카테고리', options: [...] },
      { key: 'status', label: '상태', options: [...] },
    ],
    sortableColumnIndexMap: { publishedAt: 0, createdAt: 1 },
    defaultSort: { column: 0, dir: 'desc' },
    defaultPageSize: 20,
  },
  useQuery: useAdminArticlesQuery,
  errorMessage: '게시글 목록을 불러오는데 실패했습니다.',
});

return (
  <TableTemplate
    {...tableProps}
    columns={ARTICLE_CONFIG.columns}
    rowKey="id"
    onRowClick={handleEdit}
  />
);
```

#### 0.5 공통 UI 컴포넌트 라이브러리 (Antd 기반)
- [ ] `admin/shared/ui/SearchFilter/` - 검색/필터 UI (Antd Input + Select + Button)
- [ ] `admin/shared/ui/StatsCards/` - 통계 카드 (Antd Card + Statistic)
- [ ] `admin/shared/ui/FormModal/` - CRUD 모달 (Antd Modal + Form)
- [ ] `admin/shared/ui/TablePaginationHeader/` - 테이블 헤더 (페이지 크기 선택, 통계, 내보내기)
- [ ] `admin/shared/ui/ConfirmModal/` - 확인 모달 (삭제 등)

**공유 컴포넌트 설계 원칙:**
- Antd 컴포넌트를 프로젝트 요구사항에 맞게 래핑
- props는 필요한 것만 노출 (복잡도 ↓)
- 재사용성과 확장성 고려
- TypeScript 타입으로 사용법 명확히

---

### Phase 0.5: Featured Project 노출 순서 조정 (선택적)

> **참고**: 이 Phase는 선택적입니다. 메인페이지 Featured Project 순서 조정이 필요하지 않다면 생략 가능합니다.

#### 0.5.1 Backend
- [ ] DB 마이그레이션 (`projects` 테이블에 `featured_sort_order` 필드 추가)
- [ ] `Project` 도메인 모델에 `featuredSortOrder` 필드 추가
- [ ] `GET /api/projects/featured` API 구현 (featured_sort_order 기준 정렬)
- [ ] Admin API에 Featured Project 순서 업데이트 엔드포인트 추가 (선택적)

#### 0.5.2 Admin UI
- [ ] 기존 프로젝트 관리 페이지에 Featured 설정 추가
  - [ ] `is_featured` Switch 추가
  - [ ] `featured_sort_order` 입력 필드 추가
  - [ ] Featured Project 목록에서 순서 조정 UI (드래그 앤 드롭 또는 숫자 입력)
- [ ] **라우팅**: `/admin/projects` (기존 페이지 활용)

#### 0.5.3 Frontend UI
- [ ] 메인페이지 Featured Project 섹션에 순서대로 표시 확인

---

### Phase 1: 자기소개 Markdown 관리

#### 1.1 Backend
- [ ] DB 마이그레이션 (ProfileIntroduction 테이블)
- [ ] Domain Layer 작성
- [ ] Application Layer 작성
- [ ] Infrastructure Layer 작성
- [ ] API 테스트

#### 1.2 Admin UI
- [ ] Entities Layer 작성 (`frontend/src/admin/entities/profile-introduction/`)
- [ ] Features Layer 작성 (`frontend/src/admin/features/profile-introduction-management/`)
  - [ ] `admin/shared/ui/markdown/MarkdownEditor.tsx` 재사용
- [ ] Pages Layer 작성 (`frontend/src/admin/pages/ProfileIntroductionManagement.tsx`)
- [ ] API 연동 및 테스트

#### 1.3 Frontend UI
- [ ] Entities Layer 작성 (`frontend/src/main/entities/profile-introduction/`)
- [ ] IntroductionSection 컴포넌트 수정 (`frontend/src/main/pages/ProfilePage/components/IntroductionSection.tsx`)
- [ ] API 연동 (마크다운 콘텐츠 조회)
- [ ] 마크다운 렌더링 적용 (`react-markdown` + `remark-gfm`)
- [ ] 디자인 시스템 컴포넌트 활용

---

### Phase 2: 기술 아티클 시스템

#### 2.1 Backend
- [ ] DB 마이그레이션 (Article, ArticleTechStack 테이블)
- [ ] Domain Layer 작성
- [ ] Application Layer 작성
- [ ] Infrastructure Layer 작성
- [ ] API 테스트

#### 2.2 Admin UI
- [ ] Shared 컴포넌트 확인 (재사용)
  - [ ] `admin/shared/ui/markdown/MarkdownEditor.tsx` 재사용
  - [ ] `admin/shared/ui/Table.tsx`, `Modal.tsx`, `StatsCards.tsx`, `SearchFilter.tsx` 등 재사용
- [ ] **이미지 업로드 기능 통합**
  - [ ] `adminUploadApi`에 `'article'` 타입 추가
  - [ ] `MarkdownEditor` 컴포넌트에 이미지 업로드 기능 추가
    - 드래그 앤 드롭 또는 이미지 선택 버튼
    - 업로드 후 마크다운에 자동 삽입
  - [ ] `MarkdownEditorWithImage` 래퍼 컴포넌트 생성 (선택적)
- [ ] Entities Layer 작성 (`frontend/src/admin/entities/article/`)
- [ ] Features Layer 작성 (`frontend/src/admin/features/article-management/`)
- [ ] Pages Layer 작성 (`frontend/src/admin/pages/ArticleManagement.tsx`)
- [ ] API 연동 및 테스트

#### 2.3 Frontend UI
- [ ] Entities Layer 작성 (`frontend/src/main/entities/article/`)
- [ ] Features Layer 작성 (`frontend/src/main/features/article-view/`)
- [ ] ArticlesPage 작성 (목록) (`frontend/src/main/pages/ArticlesPage/`)
- [ ] ArticleDetailPage 작성 (상세) (`frontend/src/main/pages/ArticlesPage/`)
- [ ] 라우팅 추가 (`frontend/src/main/app/MainApp.tsx` 또는 라우팅 설정 파일)
- [ ] **프로젝트 상세 페이지에 "프로젝트 발전 과정" 섹션 추가**
  - [ ] `GET /api/projects/:id/articles?category=development-timeline` API 연동
  - [ ] 시간순 정렬된 아티클 목록 표시
  - [ ] 아티클 카드 컴포넌트 (제목, 요약, 발행일)
  - [ ] 아티클 상세 페이지로 이동 링크
  - [ ] 섹션 제목: "프로젝트 발전 과정" 또는 "기술 문서"
- [ ] **메인페이지 노출 기능 구현**
  - [ ] 추천 아티클 섹션 (`GET /api/articles/featured`)
    - [ ] 추천 아티클 카드 컴포넌트
    - [ ] 메인페이지 "추천 아티클" 섹션에 표시
  - [ ] 시리즈 아티클 섹션 (`GET /api/articles/series/:seriesId`)
    - [ ] 시리즈 그룹 컴포넌트
    - [ ] 시리즈 내 아티클 목록 표시
    - [ ] 메인페이지 "시리즈" 섹션에 표시
- [ ] 디자인 시스템 컴포넌트 활용

#### 2.4 시리즈 메타데이터 관리 (선택적, Phase 2.5)

> **참고**: 이 Phase는 선택적입니다. 시리즈의 메타데이터(제목, 설명, 썸네일)를 별도로 관리할 필요가 없다면 생략 가능합니다. 초기에는 Article 생성 시 자동으로 `article_series` 레코드가 생성되는 것으로 충분합니다.

- [ ] `ArticleSeriesManagement.tsx` 페이지 생성
- [ ] 시리즈 목록 조회/수정/삭제 기능
- [ ] 시리즈 썸네일 업로드 기능
- [ ] 시리즈 설명 편집 기능
- [ ] **라우팅**: `/admin/article-series`

---

## API Specification

### 1. Profile Introduction API

#### Admin API (CUD)
```
POST   /api/admin/profile-introduction  (최초 생성 또는 덮어쓰기)
PUT    /api/admin/profile-introduction  (수정)
```

**Request Body:**
```json
{
  "content": "# 안녕하세요\n\nAI와 함께 성장하는 개발자입니다..."
}
```

**Response:**
```json
{
  "id": "intro-001",
  "content": "# 안녕하세요\n\n...",
  "version": 1,
  "createdAt": "2025-01-09T10:00:00",
  "updatedAt": "2025-01-09T10:00:00"
}
```

#### Public API (R)
```
GET    /api/profile-introduction
```

**Response:**
```json
{
  "content": "# 안녕하세요\n\n...",
  "updatedAt": "2025-01-09T10:00:00"
}
```

---

### 2. Article API

#### Admin API (CRUD)
```
GET    /api/admin/articles                    (목록 조회)
GET    /api/admin/articles/:businessId       (상세 조회, businessId 사용)
POST   /api/admin/articles                    (생성)
PUT    /api/admin/articles/:businessId        (수정, businessId 사용)
DELETE /api/admin/articles/:businessId        (삭제, businessId 사용)
PATCH  /api/admin/articles/sort-order         (정렬 순서 변경)

GET    /api/admin/article-series         (시리즈 목록 조회)
GET    /api/admin/article-series/:seriesId  (시리즈 상세 조회)
POST   /api/admin/article-series         (시리즈 생성)
PUT    /api/admin/article-series/:seriesId  (시리즈 수정)
DELETE /api/admin/article-series/:seriesId  (시리즈 삭제)
```

**Query Parameters (목록 조회):**
```
?category={category}
&status={status}
&projectId={projectId}
&tag={tag}
&limit={limit}         // 권장 기본값: 20, 최대: 100
&offset={offset}       // 또는 page/size로 대체 가능 (팀 표준으로 1개만 채택)
&sortBy={sortBy}       // 예: publishedAt, sortOrder, createdAt
&sortOrder={asc|desc}
```

**Request Body (생성/수정):**
```json
{
  "title": "React Query로 서버 상태 관리하기",
  "summary": "React Query를 사용한 효율적인 서버 상태 관리 방법을 소개합니다.",
  "content": "# React Query로 서버 상태 관리하기\n\n![React Query 로고](https://example.com/react-query-logo.png)\n\nReact Query는 서버 상태 관리를 위한 강력한 라이브러리입니다...",
  "projectId": "proj-001",  // Optional, 프로젝트 businessId (API에서 노출)
  "category": "tutorial",
  "tags": ["react", "react-query", "state-management"],
  "techStackNames": ["React", "React Query", "TypeScript"],
  "status": "published",
  "publishedAt": "2025-01-09T10:00:00",
  "isFeatured": true,  // Optional, 추천 아티클 여부 (메인페이지 노출)
  "seriesId": "article-series-001",  // Optional, 시리즈 그룹 ID (형식: 'article-series-n')
  "seriesOrder": 1  // Optional, 시리즈 내 순서 (seriesId가 있을 때만 사용)
}
```

**참고:**
- `content` 필드에 마크다운 형식으로 작성
- 이미지는 마크다운 문법으로 포함: `![alt text](image-url)`
- 이미지 URL은 업로드 API를 통해 먼저 업로드한 후 사용

**Response (상세 조회):**
```json
{
  "businessId": "article-001",  // 외부 식별자 (API에서 사용)
  "title": "React Query로 서버 상태 관리하기",
  "summary": "React Query를 사용한...",
  "content": "# React Query로 서버 상태 관리하기\n\n![이미지 설명](https://example.com/image.png)\n\n...",
  "projectId": "proj-001",  // Optional, 프로젝트 businessId (API에서 노출) (내부적으로만 사용)
  "project": {  // 상세 조회 시 JOIN하여 포함 (선택적)
    "businessId": "proj-001",  // 프로젝트 외부 식별자 (API에서 사용)
    "title": "AI Portfolio"
  },
  "category": "tutorial",
  "tags": ["react", "react-query", "state-management"],
  "techStackMetadata": [
    {
      "name": "React",
      "displayName": "React",
      "category": "Frontend"
    }
  ],
  "status": "published",
  "publishedAt": "2025-01-09T10:00:00",
  "sortOrder": 1,
  "viewCount": 1234,  // 조회수
  "createdAt": "2025-01-09T10:00:00",
  "updatedAt": "2025-01-09T10:00:00"
}
```

**Response (목록 조회):**
```json
{
  "data": [
    {
      "businessId": "article-001",  // 외부 식별자 (API에서 사용)
      "title": "React Query로 서버 상태 관리하기",
      "summary": "React Query를 사용한...",
      "projectId": "proj-001",  // Optional, 프로젝트 businessId (API에서 노출)
      "category": "tutorial",
      "tags": ["react", "react-query"],
      "status": "published",
      "publishedAt": "2025-01-09T10:00:00",
      "sortOrder": 1,
      "isFeatured": false,
      "seriesId": null,
      "seriesOrder": null
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

**참고:**
- **도메인 모델**: `projectId` (PK, Long)로 참조 관계만 유지
- **DTO/Response**: 
  - 백엔드 내부에서는 PK(`project_id`) 사용
  - API 응답으로 변환 시 프로젝트의 `businessId`를 조회하여 `projectId` 필드로 노출
  - 목록 조회: `projectId` (프로젝트 businessId)만 포함 (성능 최적화, 프로젝트 상세 페이지 연결용)
  - 상세 조회: `project` 객체 포함 (편의성)
- **이미지**: 마크다운 콘텐츠 내에 이미지 URL 포함 (`![alt](url)` 형식)
- **API 식별자**: 모든 API 엔드포인트와 응답에서 `businessId` 사용 (내부 PK는 노출하지 않음)
  - 아티클의 `businessId`: API 엔드포인트와 응답에 사용
  - 프로젝트의 `businessId`: API 응답의 `projectId` 필드로 노출 (프로젝트 상세 페이지 연결용)

#### Public API (R)
```
GET    /api/articles                          (목록 조회, 발행된 것만)
GET    /api/articles/:businessId               (상세 조회, businessId 사용)
GET    /api/articles/statistics               (통계 조회)
GET    /api/projects/:businessId/articles     (프로젝트 연관 게시글, 프로젝트 businessId 사용)
```

**Query Parameters (목록 조회):**
```
?category={category}
&projectId={projectId}
&tag={tag}
&limit={limit}
&offset={offset}
```

**프로젝트 연관 게시글 조회 (`GET /api/projects/:id/articles`):**
- **목적**: 프로젝트 상세 페이지에서 "프로젝트 발전 과정" 섹션에 표시할 아티클 조회
- **Query Parameters:**
  ```
  ?category=development-timeline  // 프로젝트 발전 과정 아티클만 조회 (권장)
  &sortBy=publishedAt            // 또는 sortOrder
  &sortOrder=asc                  // 시간순 정렬 (오래된 것부터)
  &limit={limit}                  // 기본값: 20
  &offset={offset}                // 페이징
  ```
- **사용 예시:**
  ```
  GET /api/projects/proj-001/articles?category=development-timeline&sortBy=publishedAt&sortOrder=asc
  (프로젝트 businessId 사용)
  ```
- **Response**: Article 목록 조회와 동일한 형식
- **전략**: 프로젝트 상세 페이지는 비즈니스적 내용 중심, 기술적 내용은 아티클로 연결

**Response (목록 조회):**
```json
{
  "data": [
    {
      "businessId": "article-001",  // 외부 식별자 (API에서 사용)
      "title": "React Query로 서버 상태 관리하기",
      "summary": "React Query를 사용한 효율적인 서버 상태 관리 방법을 소개합니다.",
      "projectId": "proj-001",  // Optional, 프로젝트 businessId (API에서 노출, 프로젝트 상세 페이지 연결용)
      "category": "tutorial",
      "tags": ["react", "react-query", "state-management"],
      "techStackMetadata": [
        {
          "name": "React",
          "displayName": "React",
          "category": "Frontend"
        }
      ],
      "publishedAt": "2025-01-09T10:00:00"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

**Response (상세 조회):**
```json
{
  "businessId": "article-001",  // 외부 식별자 (API에서 사용)
  "title": "React Query로 서버 상태 관리하기",
  "summary": "React Query를 사용한 효율적인 서버 상태 관리 방법을 소개합니다.",
  "content": "# React Query로 서버 상태 관리하기\n\n![이미지 설명](https://example.com/image.png)\n\n...",
  "projectId": "proj-001",  // Optional, 프로젝트 businessId (API에서 노출) (내부적으로만 사용)
  "project": {  // 상세 조회 시 JOIN하여 포함 (선택적)
    "businessId": "proj-001",  // 프로젝트 외부 식별자 (API에서 사용)
    "title": "AI Portfolio"
  },
  "category": "tutorial",
  "tags": ["react", "react-query", "state-management"],
  "techStackMetadata": [
    {
      "name": "React",
      "displayName": "React",
      "category": "Frontend"
    }
  ],
  "publishedAt": "2025-01-09T10:00:00",
  "viewCount": 1234,  // 조회수
  "createdAt": "2025-01-09T10:00:00",
  "updatedAt": "2025-01-09T10:00:00"
}
```

**추천 아티클 조회 (`GET /api/articles/featured`):**
- **목적**: 메인페이지에 노출할 추천 아티클 조회
- **Query Parameters:**
  ```
  ?limit={limit}  // 기본값: 6, 최대: 20
  ```
- **Response:**
```json
{
  "data": [
    {
      "businessId": "article-001",  // 외부 식별자 (API에서 사용)
      "title": "React Query로 서버 상태 관리하기",
      "summary": "React Query를 사용한...",
      "category": "tutorial",
      "tags": ["react", "react-query"],
      "publishedAt": "2025-01-09T10:00:00",
      "viewCount": 1234,
      "isFeatured": true
    }
  ],
  "total": 6
}
```

**시리즈 아티클 조회 (`GET /api/articles/series/:seriesId`):**
- **목적**: 메인페이지에 노출할 시리즈 아티클 조회
- **Response:**
```json
{
  "seriesId": "react-series-001",
  "title": "React 완전 정복",  // article_series.title
  "description": "React를 처음부터 마스터까지",  // article_series.description (선택적)
  "thumbnailUrl": "https://example.com/react-series-thumb.png",  // article_series.thumbnail_url (선택적)
  "articles": [
    {
      "businessId": "article-001",  // 외부 식별자 (API에서 사용)
      "title": "React 기초",
      "summary": "React의 기본 개념을...",
      "seriesOrder": 1,
      "publishedAt": "2025-01-09T10:00:00"
    },
    {
      "businessId": "article-002",  // 외부 식별자 (API에서 사용)
      "title": "React Hooks 심화",
      "summary": "React Hooks의 고급...",
      "seriesOrder": 2,
      "publishedAt": "2025-01-10T10:00:00"
    }
  ]
}
```

**통계 조회 (`GET /api/articles/statistics`):**
- **목적**: 아티클 통계 정보 조회 (카테고리별, 프로젝트별, 시리즈별)
- **Response:**
```json
{
  "categories": {
    "tutorial": 10,
    "troubleshooting": 5,
    "architecture": 3,
    "insight": 8,
    "development-timeline": 4
  },
  "projects": [
    {
      "projectId": "proj-001",
      "projectBusinessId": "proj-001",
      "projectTitle": "AI Portfolio",
      "count": 5
    }
  ],
  "series": [
    {
      "seriesId": "article-series-001",
      "seriesTitle": "React 완전 정복",
      "count": 3
    }
  ]
}
```

**참고:**
- Public API는 `status='published'`인 게시글만 반환
- 목록 조회: `projectId`만 포함 (성능 최적화)
- 상세 조회: `project` 객체 포함 가능 (편의성)
- 이미지: 마크다운 콘텐츠 내에 이미지 URL 포함 (`![alt](url)` 형식)
- 추천 아티클: `is_featured=true` AND `status='published'` 조건
- 시리즈: `series_id IS NOT NULL` AND `status='published'` 조건, `series_order`로 정렬
- 통계: 발행된 아티클(`status='published'`)만 집계

---

## Definition of Done (DoD)

### Phase 0.5: Featured Project 노출 순서 조정 (선택적)
- [ ] `projects` 테이블에 `is_featured`, `featured_sort_order` 필드 추가 완료
- [ ] Admin에서 Featured Project 지정 및 순서 조정 가능
- [ ] 메인페이지 Featured Project 섹션에 순서대로 표시
- [ ] `GET /api/projects/featured` API 정상 작동

### Phase 0: Admin 공통 프레임 정비
- [ ] Admin API 호출이 공통 클라이언트로 통합됨 (도메인별 fetch 중복 제거)
- [ ] Admin Query가 리페치 중에도 UX가 안정적임 (이전 데이터 유지/깜빡임 최소화)
- [ ] 모든 Admin CRUD에 재사용 가능한 테이블 프레임 구축 완료 (서버 페이징/정렬/필터 계약 확정)

### Phase 1: 자기소개 Markdown 관리
- [ ] ProfileIntroduction 테이블 생성 및 마이그레이션 완료
- [ ] Backend API 구현 및 테스트 완료
- [ ] Admin 페이지에서 마크다운 편집 가능 (`frontend/src/admin/pages/ProfileIntroductionManagement.tsx`)
- [ ] `admin/shared/ui/markdown/MarkdownEditor.tsx` 재사용 확인
- [ ] Profile 페이지에서 마크다운 렌더링 표시 (`frontend/src/main/pages/ProfilePage/components/IntroductionSection.tsx`)
- [ ] 기존 하드코딩된 자기소개 제거
- [ ] 디자인 시스템 컴포넌트 활용
- [ ] 다크모드에서도 올바르게 표시 (`@media (prefers-color-scheme: dark)`)

### Phase 2: 기술 아티클 시스템
- [ ] Article, ArticleTechStack, ArticleSeries 테이블 생성 및 마이그레이션 완료
- [ ] Backend CRUD API 구현 및 테스트 완료
  - [ ] Article API
  - [ ] ArticleSeries API (시리즈 메타데이터 관리, Article 생성 시 자동 생성)
  - [ ] 조회수 추적 기능 (Application Layer의 GetArticleService.getById()에서 자동 증가)
  - [ ] 발행일 자동 설정 (status를 'published'로 변경 시 publishedAt이 NULL이면 현재 시각으로 자동 설정)
- [ ] **이미지 업로드 기능 구현**
  - [ ] `adminUploadApi`에 `'article'` 타입 추가
  - [ ] 마크다운 에디터에 이미지 업로드 통합 (드래그 앤 드롭 또는 버튼)
  - [ ] 업로드된 이미지 URL 자동 삽입 기능
  - [ ] 이미지 업로드 중 로딩 상태 표시
- [ ] **게시글 삭제 시 이미지 정리 정책 확정** (옵션 2: 수동 정리, 초기 구현)
- [ ] Admin 페이지에서 게시글 생성/수정/삭제 가능 (`frontend/src/admin/pages/ArticleManagement.tsx`)
- [ ] `admin/shared/ui/` 컴포넌트 재사용 확인 (Table, Modal, StatsCards, SearchFilter, MarkdownEditor)
- [ ] Admin 페이지에서 프로젝트 연계 설정 가능
- [ ] Admin에서 초안 상태 게시글 미리보기 기능 (Admin 전용)
- [ ] Frontend 게시글 목록 페이지 표시 (`frontend/src/main/pages/ArticlesPage/ArticlesPage.tsx`)
- [ ] Frontend 게시글 상세 페이지 표시 (`frontend/src/main/pages/ArticlesPage/ArticleDetailPage.tsx`)
  - [ ] 마크다운 내 이미지 정상 렌더링 확인
- [ ] **프로젝트 상세 페이지에 "프로젝트 발전 과정" 섹션 구현**
  - [ ] `category='development-timeline'` 아티클 조회 API 연동
  - [ ] 시간순 정렬된 아티클 목록 표시
  - [ ] 아티클 카드 UI (제목, 요약, 발행일)
  - [ ] 아티클 상세 페이지로 이동 기능
- [ ] 마크다운 렌더링이 디자인 시스템 가이드에 맞게 표시
- [ ] 디자인 시스템 컴포넌트 활용 (`@/design-system`)
- [ ] 다크모드 지원 (`@media (prefers-color-scheme: dark)`)
- [ ] 모바일 반응형 지원

### Phase 2.5: 시리즈 메타데이터 관리 페이지 (선택적)
- [ ] `ArticleSeriesManagement.tsx` 페이지 구현
- [ ] 시리즈 목록 조회/수정/삭제 기능
- [ ] 시리즈 썸네일 업로드 기능
- [ ] 시리즈 설명 편집 기능
- [ ] **라우팅**: `/admin/article-series`
- [ ] 시리즈 삭제 시 연관 Article들의 `series_id` NULL 처리 확인

---

## 의사결정이 필요한 사항 및 추천

다음 사항들은 개발 전에 의사결정이 필요합니다. 각 항목에 대한 추천 사항을 제시합니다.

### 1. Article Series 메타데이터 테이블 활용 전략

**의사결정 필요:**
- `article_series` 테이블을 언제, 어떻게 활용할지 결정 필요
- 초기 구현에서 시리즈 메타데이터 관리 페이지가 필요한지 결정

**추천:**
- **초기 구현 (Phase 2)**: 시리즈 생성 시 `article_series` 레코드 자동 생성
  - Article 생성/수정 시 `seriesId` 입력 시 Backend에서 자동으로 `article_series` 레코드 생성
  - 시리즈 제목은 첫 번째 Article의 제목 또는 Article 생성 폼에서 별도 입력
  - 장점: 구현 단순, 빠른 개발 가능
  - 단점: 시리즈 메타데이터(썸네일, 설명) 관리 불가
- **향후 개선 (Phase 2.5, 선택적)**: 별도 시리즈 관리 페이지 추가
  - 시리즈 썸네일, 설명 등 상세 정보 관리 필요 시 추가
  - 초기에는 생략 가능, 필요성 확인 후 추가

**결정 권장:**
- ✅ **초기에는 Phase 2만 구현** (자동 생성 방식)
- ⏸️ **Phase 2.5는 필요성 확인 후 추가** (시리즈 썸네일/설명 관리 필요 시)

### 2. 조회수 증가 구현 위치

**의사결정 필요:**
- 조회수 증가를 어느 레이어에서 처리할지 결정

**추천:**
- ✅ **Application Layer의 `GetArticleService.getById()` 메서드에서 처리**
  - Public API에서만 증가 (Admin API에서는 증가하지 않음)
  - 트랜잭션 내에서 조회와 증가를 함께 처리하여 일관성 보장
  - 장점: 비즈니스 로직이 명확, 테스트 용이

**결정 권장:**
- ✅ **Application Layer에서 처리** (이미 PRD에 반영됨)

### 3. 발행일(published_at) 자동 설정

**의사결정 필요:**
- `status`를 'published'로 변경 시 `publishedAt`을 자동 설정할지, 수동 입력할지 결정

**추천:**
- ✅ **자동 설정 (Backend에서 처리)**
  - `status`를 'published'로 변경 시 `publishedAt`이 NULL이면 현재 시각으로 자동 설정
  - Admin에서 수동으로 발행일을 지정하고 싶은 경우에만 수동 입력 허용
  - 장점: 사용자 편의성 향상, 실수 방지

**결정 권장:**
- ✅ **자동 설정 방식 채택** (이미 PRD에 반영됨)

### 4. 초안(draft) 상태 게시글 미리보기

**의사결정 필요:**
- Admin에서 초안 상태 게시글을 Public API 없이 미리보기할 수 있는 기능이 필요한지 결정

**추천:**
- ✅ **Admin 전용 미리보기 기능 제공**
  - Admin 페이지에서 초안 게시글도 미리보기 가능
  - Public API는 `status='published'`인 게시글만 반환
  - Admin API에 초안 조회 엔드포인트 추가: `GET /api/admin/articles/:businessId?includeDraft=true`
  - 장점: 작성 중인 게시글 확인 용이, 사용자 경험 향상

**결정 권장:**
- ✅ **Admin 전용 미리보기 기능 제공** (이미 PRD에 반영됨)

### 5. 이미지 삭제 정책

**의사결정 필요:**
- 게시글 삭제 시 마크다운 내 이미지를 자동으로 삭제할지, 수동 정리할지 결정

**추천:**
- ✅ **초기 구현: 옵션 2 (수동 정리)**
  - 게시글 삭제 시 이미지는 유지
  - 주기적으로 미사용 이미지 정리 작업 (별도 스케줄러 또는 수동)
  - 장점: 구현 단순, 빠른 개발 가능
  - 단점: 스토리지 낭비 가능성
- ⏸️ **향후 개선: 옵션 1 (자동 정리)**
  - 게시글 삭제 시 마크다운 내 이미지 URL 추출 후 자동 삭제
  - 필요성 확인 후 추가

**결정 권장:**
- ✅ **초기에는 옵션 2 (수동 정리)** (이미 PRD에 반영됨)
- ⏸️ **향후 필요 시 옵션 1로 개선**

### 6. Article Series 삭제 정책

**의사결정 필요:**
- `article_series` 삭제 시 해당 `series_id`를 가진 Article들의 처리 방법 결정

**추천:**
- ✅ **Application Layer에서 처리**
  - `ArticleSeriesService.delete()` 메서드에서:
    1. 해당 `series_id`를 가진 모든 Article들의 `series_id`를 NULL로 설정
    2. `series_order`도 NULL로 설정
    3. `article_series` 레코드 삭제
  - Foreign Key 제약조건 대신 Application Layer에서 명시적 처리
  - 장점: 데이터 일관성 보장, 명확한 비즈니스 로직

**결정 권장:**
- ✅ **Application Layer에서 처리** (이미 PRD에 반영됨)

### 7. Featured Project 순서 조정 Phase 위치

**의사결정 필요:**
- Phase 0.5를 언제 구현할지 결정 (선택적 Phase)

**추천:**
- ✅ **Phase 0.5는 선택적으로 구현**
  - 메인페이지 Featured Project 순서 조정이 필요하지 않다면 생략 가능
  - 필요 시 Phase 0 이후, Phase 1 이전에 구현
  - 또는 Phase 1, 2 완료 후 추가 가능

**결정 권장:**
- ✅ **필요성 확인 후 결정** (이미 PRD에 "선택적"으로 명시됨)

---

## Non-Goals (비범위)

- 마크다운 에디터 직접 구현 (라이브러리 사용)
- 댓글 기능
- 좋아요 기능
- SEO 메타 태그 (현 단계에서는 제외, 향후 추가 가능)
- RSS 피드
- 검색 기능 (향후 추가 가능)
- 다국어 지원 (향후 추가 가능)

---

## Risks & Mitigation

### Risk 1: 마크다운 렌더링 XSS 취약점
- **완화 방안(현재 정책):** `react-markdown` 기본 동작(HTML escape) 유지 + 필요 시 `rehype-sanitize`로 방어 강화
  - 상세 정책은 [0.3 Markdown 렌더링 정책](#03-markdown-렌더링-정책-보안) 참조
- **향후 HTML 필요 시:** `rehype-raw` 도입은 **화이트리스트 sanitize 전제**로만 허용

### Risk 2: 마크다운 에디터 성능 (대용량 콘텐츠)
- **완화 방안:** 콘텐츠 길이 제한 (예: 50,000자), 필요 시 lazy loading 적용

### Risk 3: 기존 Portfolio 도메인과의 의존성 복잡도
- **완화 방안:** Article 도메인을 독립적으로 설계, Project 참조는 Optional로 유지

---

## Future Enhancements

1. **검색 기능** - 제목, 본문, 태그 검색
2. **관련 게시글 추천** - 기술 스택 기반 추천
3. **조회수 중복 방지** - 세션/사용자 기반 중복 조회 방지
4. **SEO 최적화** - 메타 태그, Open Graph, JSON-LD
5. **RSS 피드** - 구독 기능
6. **다국어 지원** - 한국어/영어 게시글
7. **버전 관리** - 게시글 수정 이력 추적
8. **시리즈 기능** - 연속된 게시글 그룹화

---

## 변경 이력

### v1.6 (2025-01-XX) - Article 통계 및 UI 개선
- 추가: ArticleStatistics 도메인 모델 및 통계 조회 기능
  - Backend: `GetArticleStatisticsService`, `ArticleStatistics` 모델 추가
  - 카테고리별, 프로젝트별, 시리즈별 통계 제공
  - Public API: `GET /api/articles/statistics` 엔드포인트 추가
- 추가: FeaturedArticleCard 컴포넌트 (`@/design-system/components/Card/FeaturedArticleCard`)
  - 추천 아티클 표시용 간소화 카드 컴포넌트
  - 카테고리 배지, 시리즈 배지, 추천 배지 표시
- 추가: FeaturedArticleCarousel 컴포넌트
  - 추천 아티클 가로 스크롤 캐러셀 UI
  - ArticleListPage에 통합
- 개선: ArticleListPage UI/UX 개선
  - 필터/검색 기능 개선
  - 통계 정보 표시
  - FeaturedArticleCarousel 통합
- 개선: ArticleTable 컴포넌트
  - 테이블 레이아웃 및 스타일 개선
  - 반응형 디자인 개선
- 개선: ArticleControlPanel 및 ArticleFilterBar
  - 필터 UI 개선
  - 통계 정보 표시 기능 추가
- 개선: Frontend Article API
  - `articleApi.getStatistics()` 메서드 추가
  - `useArticleStatisticsQuery` 훅 추가
- 개선: Admin API 클라이언트 리팩토링
  - 코드 중복 제거 및 구조 개선

### v1.5 (2025-01-XX) - Phase 2.5 진행 중
- 추가: [시리즈 메타데이터 관리](#시리즈-메타데이터-테이블-활용) - Backend 시리즈 생성/검색 API 구현
- 추가: `articles` 테이블에 `featured_sort_order` 필드 추가 (V005 마이그레이션)
- 추가: `article_series` 테이블 생성 및 시리즈 도메인 모델 구현
- 추가: Backend `ManageArticleSeriesService` - 시리즈 생성 기능
- 추가: Backend `ArticleSeriesSearchService` - 시리즈 검색 기능
- 추가: Admin API 시리즈 검색/생성 엔드포인트 (`GET /api/admin/articles/series/search`, `POST /api/admin/articles/series`)
- 추가: Frontend `adminArticleApi.searchSeries()`, `adminArticleApi.createSeries()` 메서드
- 추가: Frontend `SeriesSearchSelect` 컴포넌트 (시리즈 검색/생성 UI)
- 업데이트: [Article API Specification](#2-article-api) - 시리즈 관련 API 엔드포인트 추가
- 진행 중: 별도 시리즈 관리 페이지(`ArticleSeriesManagement.tsx`) 구현

### v1.0 (2025-01-09) - 초기 버전
- 문서 최초 작성
- Phase 0, 1, 2 설계 포함

---

**작성일**: 2025-01-09
**작성자**: AI Agent (Claude)
**버전**: 1.6
