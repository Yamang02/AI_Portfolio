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

### 0. 공통 전제 / 제약 (Admin 개선 방향)

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
-- portfolio 테이블에 컬럼 추가 (또는 별도 테이블 생성)
ALTER TABLE portfolio ADD COLUMN introduction_content TEXT;
```

**또는 별도 테이블 생성 (추천)**
```sql
CREATE TABLE IF NOT EXISTS profile_introduction (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,  -- Markdown 형식
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**설계 선택 기준:**
- Portfolio 테이블에 추가: 간단하지만, Portfolio 도메인에 혼재
- 별도 테이블: 명확한 책임 분리, 버전 관리 가능 (추천)

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
admin/entities/profile-introduction/
  ├── model/profileIntroduction.types.ts
  ├── api/adminProfileIntroductionApi.ts
  └── api/useAdminProfileIntroductionQuery.ts
```

**Features Layer:**
```
admin/features/profile-introduction-management/
  ├── hooks/useMarkdownEditor.ts
  └── ui/ProfileIntroductionEditor.tsx
```

**Pages Layer:**
```
admin/pages/ProfileIntroductionManagement.tsx
```

**기능:**
- 현재 자기소개 조회
- 마크다운 에디터로 편집 (react-markdown-editor-lite 또는 @uiw/react-md-editor 활용)
- 미리보기 기능
- 저장 (Update만 지원, 단일 레코드)

#### 1.4 Frontend 표시 UI

**위치:** `frontend/src/pages/ProfilePage/components/IntroductionSection.tsx`

**변경사항:**
- API에서 마크다운 콘텐츠 조회
- `react-markdown` 라이브러리로 렌더링
- 기존 하드코딩 제거

---

### 2. 기술 아티클 시스템

#### 2.1 DB 스키마

```sql
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,  -- 요약 (목록에서 표시)
    content TEXT NOT NULL,  -- Markdown 형식 본문

    -- 프로젝트 연계 (Optional)
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,

    -- 분류
    category VARCHAR(50),  -- 'tutorial', 'troubleshooting', 'architecture', 'insight' 등
    tags TEXT[],  -- 태그 배열

    -- 메타데이터
    status VARCHAR(50) DEFAULT 'published',  -- 'draft', 'published', 'archived'
    published_at TIMESTAMP,
    reading_time_minutes INTEGER,  -- 예상 읽기 시간
    sort_order INTEGER DEFAULT 0,

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

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_business_id ON articles(business_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON articles(sort_order);

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON article_tech_stack(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON article_tech_stack(tech_name);
```

**주요 필드 설명:**
- `project_id`: NULL 허용 (프로젝트 연관 없는 독립 게시글 가능)
- `category`: 게시글 유형 분류
- `tags`: 키워드 태그 (검색 및 필터링)
- `status`: 초안/발행/보관 상태 관리
- `reading_time_minutes`: 사용자 경험 개선 (읽기 시간 표시)

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
      └── ArticleDomainService.java  (비즈니스 로직, 예: readingTime 계산)
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
  │   └── AdminArticleController.java
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
    private String id;
    private String title;
    private String summary;
    private String content;  // Markdown

    // 프로젝트 연계 (Optional)
    private String projectId;
    private Project project;  // JOIN 시 포함

    // 분류
    private String category;
    private List<String> tags;

    // 기술 스택
    private List<TechStackMetadata> techStackMetadata;

    // 메타데이터
    private String status;
    private LocalDateTime publishedAt;
    private Integer readingTimeMinutes;
    private Integer sortOrder;

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

#### 2.3 Admin UI (Feature-Sliced Design)

**Entities Layer:**
```
admin/entities/article/
  ├── model/
  │   └── article.types.ts
  ├── api/
  │   ├── adminArticleApi.ts
  │   └── useAdminArticleQuery.ts
  └── index.ts
```

**Features Layer:**
```
admin/features/article-management/
  ├── hooks/
  │   ├── useArticleFilter.ts  (카테고리, 태그, 프로젝트 필터링)
  │   ├── useArticleStats.ts  (통계 - 총 개수, 카테고리별 개수 등)
  │   └── useArticleForm.ts  (생성/수정 폼 로직)
  ├── ui/
  │   ├── ArticleTableColumns.tsx
  │   ├── ArticleFormModal.tsx  (마크다운 에디터 포함)
  │   └── ArticlePreview.tsx
  └── index.ts
```

**Pages Layer:**
```
admin/pages/ArticleManagement.tsx
```

**기능:**
- 게시글 목록 (필터링: 카테고리, 태그, 프로젝트, 상태)
- 게시글 생성/수정 (마크다운 에디터, 프로젝트 선택, 기술 스택 다중 선택)
- 게시글 삭제
- 상태 변경 (초안 ↔ 발행 ↔ 보관)
- 미리보기
- 정렬 순서 관리

**UI 컴포넌트:**
- Shared 컴포넌트 재사용 (Table, Modal, StatsCards, SearchFilter)
- 마크다운 에디터: `@uiw/react-md-editor` 또는 `react-markdown-editor-lite` 사용
- 마크다운 렌더러: `react-markdown` 사용

#### 2.4 Frontend 표시 UI

**새 페이지 추가:**
```
frontend/src/pages/ArticlesPage/
  ├── ArticlesPage.tsx  (게시글 목록)
  ├── ArticleDetailPage.tsx  (게시글 상세)
  └── components/
      ├── ArticleCard.tsx
      ├── ArticleList.tsx
      └── ArticleContent.tsx  (마크다운 렌더링)
```

**Entities Layer:**
```
frontend/src/entities/article/
  ├── model/article.types.ts
  ├── api/articleApi.ts
  └── api/useArticleQuery.ts
```

**Features Layer:**
```
frontend/src/features/article-view/
  ├── hooks/useArticleFilter.ts
  └── ui/ArticleCard.tsx
```

**라우팅 추가:**
```tsx
// App.tsx
<Route path="/articles" element={<ArticlesPage />} />
<Route path="/articles/:id" element={<ArticleDetailPage />} />
```

**주요 기능:**
- 게시글 목록 (필터링: 카테고리, 태그, 프로젝트)
- 게시글 상세 (마크다운 렌더링, 관련 프로젝트 링크, 기술 스택 표시)
- 프로젝트 상세 페이지에 연관 게시글 섹션 추가

---

## Technical Decisions

### 1. 마크다운 에디터 선택

**옵션:**
1. `@uiw/react-md-editor` - 가벼움, 미리보기 기본 제공
2. `react-markdown-editor-lite` - 기능 풍부, 플러그인 지원
3. `react-simplemde-editor` - SimpleMDE 기반, 안정적

**선택:** `@uiw/react-md-editor` (가벼움 + 미리보기 + 다크모드 지원)

**재사용 방침(AI_PortFolio Admin):**
- 신규 구현 대신 **기존 Admin 구현을 공통 컴포넌트로 재사용**
  - 예: `frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx` (공통)
  - 기존 프로젝트 README 편집: `frontend/src/admin/features/project-management/ui/ProjectMarkdownEditor.tsx` → 공통 컴포넌트 사용

### 2. 마크다운 렌더링

**선택:** `react-markdown` + `remark-gfm` (GitHub Flavored Markdown 지원)

### 3. 자기소개 관리 방식

**옵션:**
1. Portfolio 테이블에 컬럼 추가
2. 별도 ProfileIntroduction 테이블 생성

**선택:** 별도 테이블 생성
- **이유:** 책임 분리, 버전 관리 가능성, 확장성 (다국어 지원 시 유리)

### 4. Article-Project 관계

**설계:** Article → Project (단방향 참조)
- Article은 Project를 참조할 수 있음 (Optional)
- Project는 Article을 직접 참조하지 않음 (조회 시 JOIN으로 해결)
- Article 삭제 시 Project 영향 없음 (ON DELETE SET NULL)

---

## Implementation Plan

### Phase 0: Admin 공통 프레임 정비 (genpresso-admin 패턴 참고)

#### 0.1 Frontend Admin (AI_PortFolio)
- [ ] Admin API 호출을 **공통 클라이언트로 통합** (중복 fetch 제거, 공통 에러 파싱/로깅)
- [ ] React Query **안정 옵션 유틸** 도입 (`placeholderData`로 리페치 중 이전 데이터 유지)
- [ ] 목록/테이블 페이지 표준 패턴 확정
  - 권장: Article 목록을 고려하여 **서버 페이징/정렬/필터** 표준화 (genpresso의 `useTablePage` 스타일)
- [ ] Admin 에러 표준(토스트/폼 에러) 적용 기준 정리

---

### Phase 1: 자기소개 Markdown 관리

#### 1.1 Backend
- [ ] DB 마이그레이션 (ProfileIntroduction 테이블)
- [ ] Domain Layer 작성
- [ ] Application Layer 작성
- [ ] Infrastructure Layer 작성
- [ ] API 테스트

#### 1.2 Admin UI
- [ ] Entities Layer 작성
- [ ] Features Layer 작성 (마크다운 에디터)
- [ ] Pages Layer 작성
- [ ] API 연동 및 테스트

#### 1.3 Frontend UI
- [ ] IntroductionSection 컴포넌트 수정
- [ ] API 연동 (마크다운 콘텐츠 조회)
- [ ] 마크다운 렌더링 적용

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
- [ ] Entities Layer 작성
- [ ] Features Layer 작성
- [ ] Pages Layer 작성
- [ ] API 연동 및 테스트

#### 2.3 Frontend UI
- [ ] ArticlesPage 작성 (목록)
- [ ] ArticleDetailPage 작성 (상세)
- [ ] Entities/Features Layer 작성
- [ ] 라우팅 추가
- [ ] 프로젝트 상세 페이지에 연관 게시글 섹션 추가

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
GET    /api/admin/articles               (목록 조회)
GET    /api/admin/articles/:id           (상세 조회)
POST   /api/admin/articles               (생성)
PUT    /api/admin/articles/:id           (수정)
DELETE /api/admin/articles/:id           (삭제)
PATCH  /api/admin/articles/sort-order    (정렬 순서 변경)
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
  "content": "# React Query로 서버 상태 관리하기\n\n...",
  "projectId": "proj-001",  // Optional
  "category": "tutorial",
  "tags": ["react", "react-query", "state-management"],
  "techStackNames": ["React", "React Query", "TypeScript"],
  "status": "published",
  "publishedAt": "2025-01-09T10:00:00",
  "readingTimeMinutes": 5
}
```

**Response:**
```json
{
  "id": "article-001",
  "title": "React Query로 서버 상태 관리하기",
  "summary": "React Query를 사용한...",
  "content": "# React Query로 서버 상태 관리하기\n\n...",
  "project": {
    "id": "proj-001",
    "title": "AI Portfolio"
  },
  "category": "tutorial",
  "tags": ["react", "react-query", "state-management"],
  "techStackMetadata": [
    {
      "name": "React",
      "displayName": "React",
      "category": "Frontend",
      "iconUrl": "..."
    }
  ],
  "status": "published",
  "publishedAt": "2025-01-09T10:00:00",
  "readingTimeMinutes": 5,
  "sortOrder": 1,
  "createdAt": "2025-01-09T10:00:00",
  "updatedAt": "2025-01-09T10:00:00"
}
```

#### Public API (R)
```
GET    /api/articles                     (목록 조회, 발행된 것만)
GET    /api/articles/:id                 (상세 조회, 발행된 것만)
GET    /api/projects/:id/articles        (프로젝트 연관 게시글)
```

**Query Parameters:**
```
?category={category}
&projectId={projectId}
&tag={tag}
&limit={limit}
&offset={offset}
```

---

## Definition of Done (DoD)

### Phase 0: Admin 공통 프레임 정비
- [ ] Admin API 호출이 공통 클라이언트로 통합됨 (도메인별 fetch 중복 제거)
- [ ] Admin Query가 리페치 중에도 UX가 안정적임 (이전 데이터 유지/깜빡임 최소화)
- [ ] Article 목록 구현에 필요한 서버 페이징/정렬/필터 계약이 확정됨

### Phase 1: 자기소개 Markdown 관리
- [ ] ProfileIntroduction 테이블 생성 및 마이그레이션 완료
- [ ] Backend API 구현 및 테스트 완료
- [ ] Admin 페이지에서 마크다운 편집 가능
- [ ] Profile 페이지에서 마크다운 렌더링 표시
- [ ] 기존 하드코딩된 자기소개 제거
- [ ] 다크모드에서도 올바르게 표시

### Phase 2: 기술 아티클 시스템
- [ ] Article, ArticleTechStack 테이블 생성 및 마이그레이션 완료
- [ ] Backend CRUD API 구현 및 테스트 완료
- [ ] Admin 페이지에서 게시글 생성/수정/삭제 가능
- [ ] Admin 페이지에서 프로젝트 연계 설정 가능
- [ ] Frontend 게시글 목록 페이지 표시
- [ ] Frontend 게시글 상세 페이지 표시
- [ ] 프로젝트 상세 페이지에 연관 게시글 표시
- [ ] 마크다운 렌더링이 스타일 가이드에 맞게 표시
- [ ] 다크모드 지원
- [ ] 모바일 반응형 지원

---

## Non-Goals (비범위)

- 마크다운 에디터 직접 구현 (라이브러리 사용)
- 댓글 기능
- 좋아요 기능
- 조회수 추적
- SEO 메타 태그 (현 단계에서는 제외, 향후 추가 가능)
- RSS 피드
- 검색 기능 (향후 추가 가능)
- 다국어 지원 (향후 추가 가능)

---

## Risks & Mitigation

### Risk 1: 마크다운 렌더링 XSS 취약점
- **완화 방안(현재 정책):** `react-markdown` 기본 동작(HTML escape) 유지 + 필요 시 `rehype-sanitize`로 방어 강화
- **향후 HTML 필요 시:** `rehype-raw` 도입은 **화이트리스트 sanitize 전제**로만 허용

### Risk 2: 마크다운 에디터 성능 (대용량 콘텐츠)
- **완화 방안:** 콘텐츠 길이 제한 (예: 50,000자), 필요 시 lazy loading 적용

### Risk 3: 기존 Portfolio 도메인과의 의존성 복잡도
- **완화 방안:** Article 도메인을 독립적으로 설계, Project 참조는 Optional로 유지

---

## Future Enhancements

1. **검색 기능** - 제목, 본문, 태그 검색
2. **관련 게시글 추천** - 기술 스택 기반 추천
3. **조회수 트래킹** - 게시글 인기도 측정
4. **SEO 최적화** - 메타 태그, Open Graph, JSON-LD
5. **RSS 피드** - 구독 기능
6. **다국어 지원** - 한국어/영어 게시글
7. **버전 관리** - 게시글 수정 이력 추적
8. **시리즈 기능** - 연속된 게시글 그룹화

---

**작성일**: 2025-01-09
**작성자**: AI Agent (Claude)
**버전**: 1.0
