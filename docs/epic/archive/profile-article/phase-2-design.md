# Phase 2: 기술 아티클 시스템 설계 문서

## 개요

**목표**: 프로젝트와 연계 가능한 기술 아티클 게시판을 추가하여 개발 인사이트 공유 및 프로젝트 컨텍스트 제공

**범위**:
- DB 스키마 추가 (Articles, ArticleTechStack, ArticleSeries 테이블)
- Backend API (Hexagonal Architecture)
- Admin UI (CRUD, 마크다운 에디터, Feature-Sliced Design)
- Frontend 표시 UI (목록, 상세, 마크다운 렌더링)

**비범위**:
- 시리즈 관리 전용 페이지 (Phase 2.5로 미룸, Article 생성 시 자동 생성만 지원)
- 이미지 업로드 기능 (외부 이미지 URL만 지원)
- 댓글/좋아요 기능
- 검색/필터링 고도화 (기본 기능만)

**전제 조건**:
- Phase 1 완료 (자기소개 Markdown 관리)
- `MarkdownEditor`, `MarkdownRenderer` 컴포넌트 존재
- Admin 공통 프레임 (Phase 0) 완료

---

## 1. DB 스키마 설계

### 1.1 Articles 테이블

```sql
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,  -- 외부 식별자 (예: "article-001")
    title VARCHAR(255) NOT NULL,
    summary TEXT,  -- 요약 (목록에서 표시)
    content TEXT NOT NULL,  -- Markdown 형식 본문

    -- 프로젝트 연계 (Optional)
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,

    -- 분류
    category VARCHAR(50),  -- 'tutorial', 'troubleshooting', 'architecture', 'insight', 'development-timeline'
    tags TEXT[],  -- 태그 배열

    -- 메타데이터
    status VARCHAR(50) DEFAULT 'published',  -- 'draft', 'published', 'archived'
    published_at TIMESTAMP,  -- 발행일 (status='published' 시 NULL이면 자동 설정)
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,  -- 조회수 (상세 조회 시 증가)

    -- 메인페이지 노출
    is_featured BOOLEAN DEFAULT FALSE,  -- 추천 아티클 (메인페이지 노출)
    series_id VARCHAR(50),  -- 시리즈 그룹 ID (같은 series_id를 가진 아티클들이 하나의 시리즈)
    series_order INTEGER,  -- 시리즈 내 순서 (series_id가 있을 때만 사용)

    -- 타임스탬프
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
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count) WHERE status = 'published';
```

**설계 의도:**
- `business_id`: 외부 식별자로 URL 등에 사용 (PK와 분리하여 유연성 확보)
- `project_id`: NULL 허용하여 독립 아티클 가능
- `category`: 게시글 유형 분류 (enum처럼 사용)
- `tags`: PostgreSQL 배열 타입으로 태그 저장
- `status`: 초안/발행/보관 상태 관리
- `is_featured`: 메인페이지 추천 아티클 노출용
- `series_id`: 시리즈 그룹 ID (같은 ID를 가진 아티클들이 하나의 시리즈)

### 1.2 ArticleTechStack 테이블 (N:N 매핑)

```sql
CREATE TABLE IF NOT EXISTS article_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,  -- 주요 기술 스택 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, tech_name)
);

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON article_tech_stack(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON article_tech_stack(tech_name);
```

**설계 의도:**
- Article과 TechStackMetadata의 N:N 관계 매핑
- `is_primary`: 주요 기술 스택 표시 (UI에서 강조 표시)
- `ON DELETE CASCADE`: Article 삭제 시 자동 삭제

### 1.3 ArticleSeries 테이블 (시리즈 메타데이터)

```sql
CREATE TABLE IF NOT EXISTS article_series (
    id BIGSERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,  -- articles.series_id와 매칭, 형식: 'article-series-001'
    title VARCHAR(255) NOT NULL,  -- 시리즈 대표명
    description TEXT,  -- 시리즈 설명 (선택적)
    thumbnail_url VARCHAR(500),  -- 시리즈 썸네일 (선택적)
    sort_order INTEGER DEFAULT 0,  -- 메인페이지 노출 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_series_series_id ON article_series(series_id);
CREATE INDEX IF NOT EXISTS idx_article_series_sort_order ON article_series(sort_order);
```

**설계 의도:**
- 시리즈의 메타데이터를 별도 테이블로 관리
- **Phase 2**: Article 생성 시 `series_id` 입력 시 자동으로 `article_series` 레코드 생성
  - 시리즈 제목은 첫 번째 Article의 제목 또는 별도 입력 필드 제공
- **Phase 2.5** (선택적): 별도 시리즈 관리 페이지 추가하여 메타데이터 직접 관리

### 1.4 마이그레이션 파일

**파일 위치**: `backend/src/main/resources/db/migration/V005__create_articles_tables.sql`

```sql
-- V005__create_articles_tables.sql

-- Articles 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    category VARCHAR(50),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'published',
    published_at TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    series_id VARCHAR(50),
    series_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ArticleTechStack 테이블 생성
CREATE TABLE IF NOT EXISTS article_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, tech_name)
);

-- ArticleSeries 테이블 생성
CREATE TABLE IF NOT EXISTS article_series (
    id BIGSERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_business_id ON articles(business_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON articles(sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_series_id ON articles(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON article_tech_stack(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON article_tech_stack(tech_name);

CREATE INDEX IF NOT EXISTS idx_article_series_series_id ON article_series(series_id);
CREATE INDEX IF NOT EXISTS idx_article_series_sort_order ON article_series(sort_order);

-- 트리거: updated_at 자동 업데이트 (Articles)
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();

-- 트리거: updated_at 자동 업데이트 (ArticleSeries)
CREATE OR REPLACE FUNCTION update_article_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_series_updated_at
    BEFORE UPDATE ON article_series
    FOR EACH ROW
    EXECUTE FUNCTION update_article_series_updated_at();

-- 트리거: published_at 자동 설정 (status가 'published'로 변경 시 NULL이면 현재 시각으로 설정)
CREATE OR REPLACE FUNCTION set_article_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_set_published_at
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION set_article_published_at();
```

---

## 2. Backend 설계 (Hexagonal Architecture)

### 2.1 아키텍처 개요

```
Domain Layer (순수 비즈니스 로직)
    ├── article/
    │   ├── model/
    │   │   ├── Article.java
    │   │   ├── ArticleTechStack.java
    │   │   └── ArticleSeries.java
    │   ├── port/in/
    │   │   ├── ManageArticleUseCase.java
    │   │   ├── GetArticleUseCase.java
    │   │   ├── ManageArticleSeriesUseCase.java
    │   │   └── GetArticleSeriesUseCase.java
    │   ├── port/out/
    │   │   ├── ArticleRepositoryPort.java
    │   │   └── ArticleSeriesRepositoryPort.java
    │   └── service/
    │       └── ArticleDomainService.java (비즈니스 로직)

Application Layer (유스케이스 구현)
    ├── article/
    │   ├── ManageArticleService.java
    │   ├── GetArticleService.java
    │   ├── ManageArticleSeriesService.java
    │   └── GetArticleSeriesService.java

Infrastructure Layer (어댑터)
    ├── persistence/postgres/
    │   ├── entity/
    │   │   ├── ArticleJpaEntity.java
    │   │   ├── ArticleTechStackJpaEntity.java
    │   │   └── ArticleSeriesJpaEntity.java
    │   ├── repository/
    │   │   ├── ArticleJpaRepository.java
    │   │   ├── ArticleTechStackJpaRepository.java
    │   │   └── ArticleSeriesJpaRepository.java
    │   ├── mapper/
    │   │   ├── ArticleMapper.java
    │   │   └── ArticleSeriesMapper.java
    │   └── adapter/
    │       ├── PostgresArticleRepository.java
    │       └── PostgresArticleSeriesRepository.java
    └── web/
        ├── admin/controller/
        │   ├── AdminArticleController.java
        │   └── AdminArticleSeriesController.java (Phase 2.5, 선택적)
        └── controller/
            └── ArticleController.java
```

### 2.2 Domain Layer

#### 2.2.1 Article (Domain Model)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/model/Article.java`

```java
package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class Article {
    private Long id;  // PK (내부 식별자)
    private String businessId;  // 외부 식별자 (예: "article-001")
    private String title;
    private String summary;
    private String content;  // Markdown

    // 프로젝트 연계 (Optional)
    private Long projectId;  // 프로젝트 PK 참조

    // 분류
    private String category;
    private List<String> tags;

    // 기술 스택 (Join 데이터)
    private List<ArticleTechStack> techStack;

    // 메타데이터
    private String status;  // 'draft', 'published', 'archived'
    private LocalDateTime publishedAt;
    private Integer sortOrder;
    private Integer viewCount;

    // 메인페이지 노출
    private Boolean isFeatured;
    private String seriesId;  // 시리즈 그룹 ID
    private Integer seriesOrder;  // 시리즈 내 순서

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

    public boolean isInSeries() {
        return seriesId != null;
    }

    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0 : this.viewCount) + 1;
    }

    /**
     * 유효성 검증
     */
    public void validate() {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("본문은 필수입니다.");
        }
        if (businessId == null || businessId.isBlank()) {
            throw new IllegalArgumentException("비즈니스 ID는 필수입니다.");
        }
        if (status == null) {
            throw new IllegalArgumentException("상태는 필수입니다.");
        }
    }
}
```

#### 2.2.2 ArticleTechStack (Domain Model)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/model/ArticleTechStack.java`

```java
package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ArticleTechStack {
    private Long id;
    private Long articleId;
    private String techName;  // TechStackMetadata의 name 참조
    private Boolean isPrimary;  // 주요 기술 스택 여부
    private LocalDateTime createdAt;
}
```

#### 2.2.3 ArticleSeries (Domain Model)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/model/ArticleSeries.java`

```java
package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ArticleSeries {
    private Long id;
    private String seriesId;  // 시리즈 ID (예: 'article-series-001')
    private String title;  // 시리즈 대표명
    private String description;  // 시리즈 설명 (Optional)
    private String thumbnailUrl;  // 시리즈 썸네일 (Optional)
    private Integer sortOrder;  // 메인페이지 노출 순서
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 유효성 검증
     */
    public void validate() {
        if (seriesId == null || seriesId.isBlank()) {
            throw new IllegalArgumentException("시리즈 ID는 필수입니다.");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("시리즈 제목은 필수입니다.");
        }
    }
}
```

#### 2.2.4 ManageArticleUseCase (Input Port)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/port/in/ManageArticleUseCase.java`

```java
package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.Article;

import java.util.List;

public interface ManageArticleUseCase {

    Article create(CreateArticleCommand command);
    Article update(UpdateArticleCommand command);
    void delete(Long id);

    // Command 정의
    record CreateArticleCommand(
            String title,
            String summary,
            String content,
            Long projectId,
            String category,
            List<String> tags,
            List<String> techStack,  // tech_name 목록
            String status,
            Boolean isFeatured,
            String seriesId,
            Integer seriesOrder
    ) {
        public CreateArticleCommand {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("제목은 필수입니다.");
            }
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("본문은 필수입니다.");
            }
        }
    }

    record UpdateArticleCommand(
            Long id,
            String title,
            String summary,
            String content,
            Long projectId,
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            String seriesId,
            Integer seriesOrder
    ) {
        public UpdateArticleCommand {
            if (id == null) {
                throw new IllegalArgumentException("ID는 필수입니다.");
            }
        }
    }
}
```

#### 2.2.5 GetArticleUseCase (Input Port)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/port/in/GetArticleUseCase.java`

```java
package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface GetArticleUseCase {

    /**
     * ID로 조회
     */
    Optional<Article> findById(Long id);

    /**
     * BusinessId로 조회
     */
    Optional<Article> findByBusinessId(String businessId);

    /**
     * 전체 목록 조회 (페이징)
     */
    Page<Article> findAll(Pageable pageable);

    /**
     * 필터링 조회 (Admin용)
     */
    Page<Article> findByFilter(ArticleFilter filter, Pageable pageable);

    /**
     * 조회수 증가
     */
    void incrementViewCount(Long id);

    // 필터 정의
    record ArticleFilter(
            String status,
            String category,
            Long projectId,
            String seriesId,
            Boolean isFeatured,
            String searchKeyword  // 제목/내용 검색
    ) {}
}
```

#### 2.2.6 ArticleRepositoryPort (Output Port)

**파일**: `backend/src/main/java/com/aiportfolio/backend/domain/article/port/out/ArticleRepositoryPort.java`

```java
package com.aiportfolio.backend.domain.article.port.out;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ArticleRepositoryPort {

    Article save(Article article);
    void delete(Long id);
    Optional<Article> findById(Long id);
    Optional<Article> findByBusinessId(String businessId);
    Page<Article> findAll(Pageable pageable);
    Page<Article> findByFilter(GetArticleUseCase.ArticleFilter filter, Pageable pageable);
    void incrementViewCount(Long id);

    /**
     * 다음 비즈니스 ID 생성 (예: "article-001", "article-002")
     */
    String generateNextBusinessId();
}
```

### 2.3 Application Layer

#### 2.3.1 ManageArticleService

**파일**: `backend/src/main/java/com/aiportfolio/backend/application/article/ManageArticleService.java`

```java
package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageArticleService implements ManageArticleUseCase {

    private final ArticleRepositoryPort articleRepository;

    @Override
    public Article create(CreateArticleCommand command) {
        // 비즈니스 ID 생성
        String businessId = articleRepository.generateNextBusinessId();

        // 기술 스택 변환
        List<ArticleTechStack> techStack = convertTechStack(null, command.techStack());

        // Article 도메인 모델 생성
        Article article = Article.builder()
                .businessId(businessId)
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(command.projectId())
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status() != null ? command.status() : "draft")
                .isFeatured(command.isFeatured() != null ? command.isFeatured() : false)
                .seriesId(command.seriesId())
                .seriesOrder(command.seriesOrder())
                .sortOrder(0)
                .viewCount(0)
                .build();

        // 유효성 검증
        article.validate();

        // 저장
        return articleRepository.save(article);
    }

    @Override
    public Article update(UpdateArticleCommand command) {
        // 기존 Article 조회
        Article existing = articleRepository.findById(command.id())
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + command.id()));

        // 기술 스택 변환
        List<ArticleTechStack> techStack = convertTechStack(command.id(), command.techStack());

        // Article 업데이트
        Article updated = Article.builder()
                .id(existing.getId())
                .businessId(existing.getBusinessId())
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(command.projectId())
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status())
                .publishedAt(existing.getPublishedAt())
                .isFeatured(command.isFeatured())
                .seriesId(command.seriesId())
                .seriesOrder(command.seriesOrder())
                .sortOrder(existing.getSortOrder())
                .viewCount(existing.getViewCount())
                .createdAt(existing.getCreatedAt())
                .build();

        // 유효성 검증
        updated.validate();

        // 저장
        return articleRepository.save(updated);
    }

    @Override
    public void delete(Long id) {
        articleRepository.delete(id);
    }

    // 기술 스택 변환 헬퍼
    private List<ArticleTechStack> convertTechStack(Long articleId, List<String> techNames) {
        if (techNames == null || techNames.isEmpty()) {
            return List.of();
        }
        return techNames.stream()
                .map(techName -> ArticleTechStack.builder()
                        .articleId(articleId)
                        .techName(techName)
                        .isPrimary(false)
                        .build())
                .collect(Collectors.toList());
    }
}
```

#### 2.3.2 GetArticleService

**파일**: `backend/src/main/java/com/aiportfolio/backend/application/article/GetArticleService.java`

```java
package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetArticleService implements GetArticleUseCase {

    private final ArticleRepositoryPort articleRepository;

    @Override
    public Optional<Article> findById(Long id) {
        return articleRepository.findById(id);
    }

    @Override
    public Optional<Article> findByBusinessId(String businessId) {
        return articleRepository.findByBusinessId(businessId);
    }

    @Override
    public Page<Article> findAll(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }

    @Override
    public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
        return articleRepository.findByFilter(filter, pageable);
    }

    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        articleRepository.incrementViewCount(id);
    }
}
```

### 2.4 Infrastructure Layer - Persistence

#### 2.4.1 ArticleJpaEntity

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/entity/ArticleJpaEntity.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ArticleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    private String businessId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "project_id")
    private Long projectId;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(length = 50)
    private String status;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "view_count")
    private Integer viewCount;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "series_id", length = 50)
    private String seriesId;

    @Column(name = "series_order")
    private Integer seriesOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ArticleTechStack 조인
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ArticleTechStackJpaEntity> techStack = new ArrayList<>();
}
```

#### 2.4.2 ArticleTechStackJpaEntity

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/entity/ArticleTechStackJpaEntity.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "article_tech_stack")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ArticleTechStackJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticleJpaEntity article;

    @Column(name = "tech_name", nullable = false, length = 100)
    private String techName;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

#### 2.4.3 ArticleJpaRepository

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/ArticleJpaRepository.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ArticleJpaRepository extends JpaRepository<ArticleJpaEntity, Long> {

    Optional<ArticleJpaEntity> findByBusinessId(String businessId);

    @Modifying
    @Query("UPDATE ArticleJpaEntity a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT MAX(CAST(SUBSTRING(a.businessId, 9) AS integer)) FROM ArticleJpaEntity a WHERE a.businessId LIKE 'article-%'")
    Integer findMaxBusinessIdNumber();
}
```

#### 2.4.4 ArticleMapper

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/mapper/ArticleMapper.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ArticleMapper {

    public Article toDomain(ArticleJpaEntity entity) {
        return Article.builder()
                .id(entity.getId())
                .businessId(entity.getBusinessId())
                .title(entity.getTitle())
                .summary(entity.getSummary())
                .content(entity.getContent())
                .projectId(entity.getProjectId())
                .category(entity.getCategory())
                .tags(entity.getTags() != null ? Arrays.asList(entity.getTags()) : List.of())
                .techStack(entity.getTechStack() != null ?
                        entity.getTechStack().stream()
                                .map(this::techStackToDomain)
                                .collect(Collectors.toList()) : List.of())
                .status(entity.getStatus())
                .publishedAt(entity.getPublishedAt())
                .sortOrder(entity.getSortOrder())
                .viewCount(entity.getViewCount())
                .isFeatured(entity.getIsFeatured())
                .seriesId(entity.getSeriesId())
                .seriesOrder(entity.getSeriesOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ArticleJpaEntity toEntity(Article domain) {
        return ArticleJpaEntity.builder()
                .id(domain.getId())
                .businessId(domain.getBusinessId())
                .title(domain.getTitle())
                .summary(domain.getSummary())
                .content(domain.getContent())
                .projectId(domain.getProjectId())
                .category(domain.getCategory())
                .tags(domain.getTags() != null ? domain.getTags().toArray(new String[0]) : new String[0])
                .status(domain.getStatus())
                .publishedAt(domain.getPublishedAt())
                .sortOrder(domain.getSortOrder())
                .viewCount(domain.getViewCount())
                .isFeatured(domain.getIsFeatured())
                .seriesId(domain.getSeriesId())
                .seriesOrder(domain.getSeriesOrder())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private ArticleTechStack techStackToDomain(ArticleTechStackJpaEntity entity) {
        return ArticleTechStack.builder()
                .id(entity.getId())
                .articleId(entity.getArticle().getId())
                .techName(entity.getTechName())
                .isPrimary(entity.getIsPrimary())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
```

#### 2.4.5 PostgresArticleRepository (Adapter)

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/PostgresArticleRepository.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.ArticleMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleTechStackJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostgresArticleRepository implements ArticleRepositoryPort {

    private final ArticleJpaRepository jpaRepository;
    private final ArticleTechStackJpaRepository techStackRepository;
    private final ArticleMapper mapper;

    @Override
    public Article save(Article article) {
        ArticleJpaEntity entity;

        if (article.getId() != null) {
            // 업데이트: 기존 엔티티 조회
            entity = jpaRepository.findById(article.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Article not found: " + article.getId()));

            // 필드 업데이트
            entity.setTitle(article.getTitle());
            entity.setSummary(article.getSummary());
            entity.setContent(article.getContent());
            entity.setProjectId(article.getProjectId());
            entity.setCategory(article.getCategory());
            entity.setTags(article.getTags() != null ? article.getTags().toArray(new String[0]) : new String[0]);
            entity.setStatus(article.getStatus());
            entity.setIsFeatured(article.getIsFeatured());
            entity.setSeriesId(article.getSeriesId());
            entity.setSeriesOrder(article.getSeriesOrder());

            // 기술 스택 업데이트 (기존 삭제 후 재추가)
            entity.getTechStack().clear();
            if (article.getTechStack() != null) {
                List<ArticleTechStackJpaEntity> newTechStack = article.getTechStack().stream()
                        .map(ts -> ArticleTechStackJpaEntity.builder()
                                .article(entity)
                                .techName(ts.getTechName())
                                .isPrimary(ts.getIsPrimary())
                                .build())
                        .collect(Collectors.toList());
                entity.getTechStack().addAll(newTechStack);
            }
        } else {
            // 생성: 새 엔티티
            entity = mapper.toEntity(article);

            // 기술 스택 설정
            if (article.getTechStack() != null) {
                List<ArticleTechStackJpaEntity> techStackEntities = article.getTechStack().stream()
                        .map(ts -> ArticleTechStackJpaEntity.builder()
                                .article(entity)
                                .techName(ts.getTechName())
                                .isPrimary(ts.getIsPrimary())
                                .build())
                        .collect(Collectors.toList());
                entity.setTechStack(techStackEntities);
            }
        }

        ArticleJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void delete(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public Optional<Article> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Article> findByBusinessId(String businessId) {
        return jpaRepository.findByBusinessId(businessId)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Article> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Article> findByFilter(GetArticleUseCase.ArticleFilter filter, Pageable pageable) {
        // TODO: QueryDSL 또는 Specification으로 동적 쿼리 구현
        // 초기 구현: 간단한 필터링만 지원
        return jpaRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public void incrementViewCount(Long id) {
        jpaRepository.incrementViewCount(id);
    }

    @Override
    public String generateNextBusinessId() {
        Integer maxNumber = jpaRepository.findMaxBusinessIdNumber();
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("article-%03d", nextNumber);
    }
}
```

### 2.5 Infrastructure Layer - Web (Controllers)

#### 2.5.1 AdminArticleController

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminArticleController.java`

```java
package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ManageArticleUseCase manageUseCase;
    private final GetArticleUseCase getUseCase;

    /**
     * 전체 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<ArticleResponse>> getAll(Pageable pageable) {
        Page<Article> articles = getUseCase.findAll(pageable);
        return ResponseEntity.ok(articles.map(ArticleResponse::from));
    }

    /**
     * ID로 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getById(@PathVariable Long id) {
        return getUseCase.findById(id)
                .map(article -> ResponseEntity.ok(ArticleResponse::from(article)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 생성
     */
    @PostMapping
    public ResponseEntity<ArticleResponse> create(@RequestBody CreateArticleRequest request) {
        ManageArticleUseCase.CreateArticleCommand command = new ManageArticleUseCase.CreateArticleCommand(
                request.title(),
                request.summary(),
                request.content(),
                request.projectId(),
                request.category(),
                request.tags(),
                request.techStack(),
                request.status(),
                request.isFeatured(),
                request.seriesId(),
                request.seriesOrder()
        );

        Article created = manageUseCase.create(command);
        return ResponseEntity.ok(ArticleResponse.from(created));
    }

    /**
     * 업데이트
     */
    @PutMapping("/{id}")
    public ResponseEntity<ArticleResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateArticleRequest request) {

        ManageArticleUseCase.UpdateArticleCommand command = new ManageArticleUseCase.UpdateArticleCommand(
                id,
                request.title(),
                request.summary(),
                request.content(),
                request.projectId(),
                request.category(),
                request.tags(),
                request.techStack(),
                request.status(),
                request.isFeatured(),
                request.seriesId(),
                request.seriesOrder()
        );

        Article updated = manageUseCase.update(command);
        return ResponseEntity.ok(ArticleResponse.from(updated));
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        manageUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    // DTOs
    public record CreateArticleRequest(
            String title,
            String summary,
            String content,
            Long projectId,
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            String seriesId,
            Integer seriesOrder
    ) {}

    public record UpdateArticleRequest(
            String title,
            String summary,
            String content,
            Long projectId,
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            String seriesId,
            Integer seriesOrder
    ) {}

    public record ArticleResponse(
            Long id,
            String businessId,
            String title,
            String summary,
            String content,
            Long projectId,
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            String publishedAt,
            Integer sortOrder,
            Integer viewCount,
            Boolean isFeatured,
            String seriesId,
            Integer seriesOrder,
            String createdAt,
            String updatedAt
    ) {
        public static ArticleResponse from(Article domain) {
            return new ArticleResponse(
                    domain.getId(),
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getSummary(),
                    domain.getContent(),
                    domain.getProjectId(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getStatus(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getSortOrder(),
                    domain.getViewCount(),
                    domain.getIsFeatured(),
                    domain.getSeriesId(),
                    domain.getSeriesOrder(),
                    domain.getCreatedAt().toString(),
                    domain.getUpdatedAt().toString()
            );
        }
    }
}
```

#### 2.5.2 ArticleController (Public API)

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/controller/ArticleController.java`

```java
package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final GetArticleUseCase getUseCase;

    /**
     * 전체 목록 조회 (페이징, 발행된 것만)
     */
    @GetMapping
    public ResponseEntity<Page<ArticleListResponse>> getAll(Pageable pageable) {
        GetArticleUseCase.ArticleFilter filter = new GetArticleUseCase.ArticleFilter(
                "published", null, null, null, null, null
        );
        Page<Article> articles = getUseCase.findByFilter(filter, pageable);
        return ResponseEntity.ok(articles.map(ArticleListResponse::from));
    }

    /**
     * BusinessId로 조회 (상세)
     */
    @GetMapping("/{businessId}")
    public ResponseEntity<ArticleDetailResponse> getByBusinessId(@PathVariable String businessId) {
        return getUseCase.findByBusinessId(businessId)
                .filter(Article::isPublished)
                .map(article -> {
                    // 조회수 증가
                    getUseCase.incrementViewCount(article.getId());
                    return ResponseEntity.ok(ArticleDetailResponse.from(article));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTOs (Public용 - 필요한 정보만 노출)
    public record ArticleListResponse(
            String businessId,
            String title,
            String summary,
            String category,
            List<String> tags,
            String publishedAt,
            Integer viewCount
    ) {
        public static ArticleListResponse from(Article domain) {
            return new ArticleListResponse(
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getSummary(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getViewCount()
            );
        }
    }

    public record ArticleDetailResponse(
            String businessId,
            String title,
            String content,
            String category,
            List<String> tags,
            List<String> techStack,
            String publishedAt,
            Integer viewCount
    ) {
        public static ArticleDetailResponse from(Article domain) {
            return new ArticleDetailResponse(
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getContent(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getViewCount()
            );
        }
    }
}
```

---

## 3. Admin UI 설계 (Feature-Sliced Design)

### 3.1 아키텍처 개요

```
frontend/src/admin/
├── entities/article/
│   ├── model/article.types.ts
│   ├── api/adminArticleApi.ts
│   ├── api/useAdminArticleQuery.ts
│   └── index.ts
├── features/article-management/
│   ├── hooks/
│   │   ├── useArticleForm.ts
│   │   ├── useArticleModal.ts
│   │   └── useArticleTable.ts
│   ├── ui/
│   │   ├── ArticleFormModal.tsx  (생성/수정 모달)
│   │   ├── ArticlePreview.tsx    (마크다운 미리보기)
│   │   └── ArticleFilters.tsx    (필터 UI)
│   └── config/
│       ├── articleColumns.tsx    (Antd Table columns)
│       ├── articleFilters.ts     (필터 옵션)
│       └── articleSearchConfig.ts
└── pages/
    └── ArticleManagement.tsx
```

### 3.2 Entities Layer

#### 3.2.1 타입 정의

**파일**: `frontend/src/admin/entities/article/model/article.types.ts`

```typescript
/**
 * 아티클 타입
 */
export interface Article {
  id: number;
  businessId: string;
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags: string[];
  techStack: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  sortOrder: number;
  viewCount: number;
  isFeatured: boolean;
  seriesId?: string;
  seriesOrder?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 아티클 생성 요청
 */
export interface CreateArticleRequest {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 아티클 업데이트 요청
 */
export interface UpdateArticleRequest {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 카테고리 옵션
 */
export const ARTICLE_CATEGORIES = {
  tutorial: '튜토리얼',
  troubleshooting: '트러블슈팅',
  architecture: '아키텍처',
  insight: '인사이트',
  'development-timeline': '개발 과정',
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
```

#### 3.2.2 API 클라이언트

**파일**: `frontend/src/admin/entities/article/api/adminArticleApi.ts`

```typescript
import { adminApiClient } from '@/admin/api/adminApiClient';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '../model/article.types';

/**
 * Admin 아티클 API
 */
export const adminArticleApi = {
  /**
   * 전체 목록 조회 (페이징)
   */
  getAll: (params: { page: number; size: number }) =>
    adminApiClient.get<{ content: Article[]; totalElements: number }>('/articles', { params }),

  /**
   * ID로 조회
   */
  getById: (id: number) =>
    adminApiClient.get<Article>(`/articles/${id}`),

  /**
   * 생성
   */
  create: (data: CreateArticleRequest) =>
    adminApiClient.post<Article>('/articles', data),

  /**
   * 업데이트
   */
  update: (id: number, data: UpdateArticleRequest) =>
    adminApiClient.put<Article>(`/articles/${id}`, data),

  /**
   * 삭제
   */
  delete: (id: number) =>
    adminApiClient.delete(`/articles/${id}`),
};
```

#### 3.2.3 React Query 훅

**파일**: `frontend/src/admin/entities/article/api/useAdminArticleQuery.ts`

```typescript
import { useAdminQuery } from '@/admin/hooks/useAdminQuery';
import { useAdminMutation } from '@/admin/hooks/useAdminMutation';
import { adminArticleApi } from './adminArticleApi';
import { CreateArticleRequest, UpdateArticleRequest } from '../model/article.types';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * 아티클 목록 조회 쿼리
 */
export function useAdminArticleListQuery(params: { page: number; size: number }) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticleApi.getAll(params),
  });
}

/**
 * 아티클 상세 조회 쿼리
 */
export function useAdminArticleQuery(id: number) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', id],
    queryFn: () => adminArticleApi.getById(id),
    enabled: !!id,
  });
}

/**
 * 아티클 생성 뮤테이션
 */
export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (data: CreateArticleRequest) => adminArticleApi.create(data),
    onSuccess: () => {
      message.success('아티클이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}

/**
 * 아티클 업데이트 뮤테이션
 */
export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateArticleRequest }) =>
      adminArticleApi.update(id, data),
    onSuccess: () => {
      message.success('아티클이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}

/**
 * 아티클 삭제 뮤테이션
 */
export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (id: number) => adminArticleApi.delete(id),
    onSuccess: () => {
      message.success('아티클이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}
```

### 3.3 Features Layer

#### 3.3.1 useArticleForm 훅

**파일**: `frontend/src/admin/features/article-management/hooks/useArticleForm.ts`

```typescript
import { useForm } from 'antd/es/form/Form';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '@/admin/entities/article';
import { useEffect } from 'react';

export interface ArticleFormData {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 아티클 폼 훅
 */
export function useArticleForm(article?: Article) {
  const [form] = useForm<ArticleFormData>();

  // 초기 데이터 로드
  useEffect(() => {
    if (article) {
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        content: article.content,
        projectId: article.projectId,
        category: article.category,
        tags: article.tags,
        techStack: article.techStack,
        status: article.status,
        isFeatured: article.isFeatured,
        seriesId: article.seriesId,
        seriesOrder: article.seriesOrder,
      });
    }
  }, [article, form]);

  return { form };
}
```

#### 3.3.2 ArticleFormModal 컴포넌트

**파일**: `frontend/src/admin/features/article-management/ui/ArticleFormModal.tsx`

```typescript
import { Modal, Form, Input, Select, Switch, InputNumber, Button, Tabs } from 'antd';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { Article, ARTICLE_CATEGORIES } from '@/admin/entities/article';
import { useArticleForm } from '../hooks/useArticleForm';
import {
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '@/admin/entities/article/api/useAdminArticleQuery';
import { useState } from 'react';

interface ArticleFormModalProps {
  open: boolean;
  onClose: () => void;
  article?: Article;
}

/**
 * 아티클 폼 모달 (생성/수정)
 */
export function ArticleFormModal({ open, onClose, article }: ArticleFormModalProps) {
  const { form } = useArticleForm(article);
  const [content, setContent] = useState(article?.content || '');

  const createMutation = useCreateArticleMutation();
  const updateMutation = useUpdateArticleMutation();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = { ...values, content };

    if (article) {
      // 업데이트
      updateMutation.mutate({ id: article.id, data }, {
        onSuccess: () => {
          onClose();
          form.resetFields();
          setContent('');
        },
      });
    } else {
      // 생성
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
          form.resetFields();
          setContent('');
        },
      });
    }
  };

  return (
    <Modal
      title={article ? '아티클 수정' : '아티클 생성'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={1200}
      okText="저장"
      cancelText="취소"
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Tabs
        items={[
          {
            key: 'basic',
            label: '기본 정보',
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label="제목"
                  rules={[{ required: true, message: '제목은 필수입니다.' }]}
                >
                  <Input placeholder="아티클 제목" />
                </Form.Item>

                <Form.Item name="summary" label="요약">
                  <Input.TextArea rows={3} placeholder="아티클 요약 (목록에서 표시)" />
                </Form.Item>

                <Form.Item name="category" label="카테고리">
                  <Select placeholder="카테고리 선택" allowClear>
                    {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="tags" label="태그">
                  <Select mode="tags" placeholder="태그 입력" />
                </Form.Item>

                <Form.Item name="techStack" label="기술 스택">
                  <Select mode="tags" placeholder="기술 스택 입력" />
                </Form.Item>

                <Form.Item name="status" label="상태" initialValue="draft">
                  <Select>
                    <Select.Option value="draft">초안</Select.Option>
                    <Select.Option value="published">발행</Select.Option>
                    <Select.Option value="archived">보관</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="isFeatured" label="추천 아티클" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item name="projectId" label="연관 프로젝트 ID">
                  <InputNumber placeholder="프로젝트 ID (선택)" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="seriesId" label="시리즈 ID">
                  <Input placeholder="시리즈 ID (선택)" />
                </Form.Item>

                <Form.Item name="seriesOrder" label="시리즈 순서">
                  <InputNumber placeholder="시리즈 순서 (선택)" style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'content',
            label: '본문',
            children: (
              <div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  height={600}
                  preview="live"
                />
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
```

#### 3.3.3 Article Table Columns

**파일**: `frontend/src/admin/features/article-management/config/articleColumns.tsx`

```typescript
import { ColumnsType } from 'antd/es/table';
import { Article, ARTICLE_CATEGORIES } from '@/admin/entities/article';
import { Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export function getArticleColumns(
  onEdit: (article: Article) => void,
  onDelete: (id: number) => void
): ColumnsType<Article> {
  return [
    {
      title: 'ID',
      dataIndex: 'businessId',
      key: 'businessId',
      width: 120,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => ARTICLE_CATEGORIES[category as keyof typeof ARTICLE_CATEGORIES] || '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === 'published' ? 'green' : status === 'draft' ? 'orange' : 'gray';
        const text = status === 'published' ? '발행' : status === 'draft' ? '초안' : '보관';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'right',
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('ko-KR'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            수정
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];
}
```

### 3.4 Pages Layer

#### 3.4.1 ArticleManagement 페이지

**파일**: `frontend/src/admin/pages/ArticleManagement.tsx`

```typescript
import { useState } from 'react';
import { Button, Table, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ArticleFormModal } from '../features/article-management/ui/ArticleFormModal';
import { Article } from '../entities/article';
import {
  useAdminArticleListQuery,
  useDeleteArticleMutation,
} from '../entities/article/api/useAdminArticleQuery';
import { getArticleColumns } from '../features/article-management/config/articleColumns';

/**
 * 아티클 관리 페이지
 */
export function ArticleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 데이터 조회
  const { data, isLoading } = useAdminArticleListQuery({ page: page - 1, size: pageSize });
  const deleteMutation = useDeleteArticleMutation();

  // 핸들러
  const handleCreate = () => {
    setEditingArticle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingArticle(undefined);
  };

  // 테이블 컬럼
  const columns = getArticleColumns(handleEdit, handleDelete);

  return (
    <div className="article-management-page p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">아티클 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          아티클 생성
        </Button>
      </div>

      <Table
        dataSource={data?.content || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total: data?.totalElements || 0,
          onChange: setPage,
        }}
      />

      <ArticleFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        article={editingArticle}
      />
    </div>
  );
}
```

### 3.5 라우팅 추가

**파일**: `frontend/src/admin/app/AdminApp.tsx`

```typescript
// 라우팅 추가
<Route path="/articles" element={<ArticleManagement />} />
```

---

## 4. Frontend 표시 UI 설계

### 4.1 아키텍처 개요

```
frontend/src/main/
├── entities/article/
│   ├── model/article.types.ts
│   ├── api/articleApi.ts
│   ├── api/useArticleQuery.ts
│   └── index.ts
└── pages/
    ├── ArticleListPage.tsx
    └── ArticleDetailPage.tsx
```

### 4.2 Entities Layer

#### 4.2.1 타입 정의 (Public)

**파일**: `frontend/src/main/entities/article/model/article.types.ts`

```typescript
/**
 * 아티클 (Public)
 */
export interface ArticleListItem {
  businessId: string;
  title: string;
  summary?: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
  viewCount: number;
}

export interface ArticleDetail {
  businessId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  techStack: string[];
  publishedAt?: string;
  viewCount: number;
}
```

#### 4.2.2 API 클라이언트

**파일**: `frontend/src/main/entities/article/api/articleApi.ts`

```typescript
import { ArticleListItem, ArticleDetail } from '../model/article.types';

/**
 * Public 아티클 API
 */
export const articleApi = {
  /**
   * 전체 목록 조회
   */
  getAll: async (params: { page: number; size: number }): Promise<{ content: ArticleListItem[]; totalElements: number }> => {
    const response = await fetch(`/api/articles?page=${params.page}&size=${params.size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  /**
   * BusinessId로 조회
   */
  getByBusinessId: async (businessId: string): Promise<ArticleDetail> => {
    const response = await fetch(`/api/articles/${businessId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return response.json();
  },
};
```

#### 4.2.3 React Query 훅

**파일**: `frontend/src/main/entities/article/api/useArticleQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { articleApi } from './articleApi';

/**
 * 아티클 목록 조회 쿼리
 */
export function useArticleListQuery(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 아티클 상세 조회 쿼리
 */
export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000, // 10분
  });
}
```

### 4.3 ArticleListPage

**파일**: `frontend/src/main/pages/ArticleListPage.tsx`

```typescript
import { useArticleListQuery } from '../entities/article';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * 아티클 목록 페이지
 */
export function ArticleListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useArticleListQuery({ page: page - 1, size: pageSize });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>아티클을 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="article-list-page">
      <h1 className="text-3xl font-bold mb-8">Articles</h1>

      <div className="space-y-6">
        {data?.content.map((article) => (
          <article key={article.businessId} className="border-b pb-6">
            <Link to={`/articles/${article.businessId}`}>
              <h2 className="text-2xl font-semibold hover:text-blue-600">
                {article.title}
              </h2>
            </Link>
            {article.summary && (
              <p className="text-gray-600 mt-2">{article.summary}</p>
            )}
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              <span>{article.publishedAt && new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
              <span>조회 {article.viewCount}</span>
              {article.tags.length > 0 && (
                <div className="flex gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-4 py-2">
          {page} / {Math.ceil((data?.totalElements || 0) / pageSize)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil((data?.totalElements || 0) / pageSize)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
```

### 4.4 ArticleDetailPage

**파일**: `frontend/src/main/pages/ArticleDetailPage.tsx`

```typescript
import { useParams } from 'react-router-dom';
import { useArticleQuery } from '../entities/article';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';

/**
 * 아티클 상세 페이지
 */
export function ArticleDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: article, isLoading, error } = useArticleQuery(businessId!);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error || !article) {
    return <div>아티클을 불러오는데 실패했습니다.</div>;
  }

  return (
    <article className="article-detail-page max-w-4xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{article.publishedAt && new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
          <span>조회 {article.viewCount}</span>
        </div>
        {article.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 px-3 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <MarkdownRenderer content={article.content} />

      {article.techStack.length > 0 && (
        <footer className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
          <div className="flex gap-2 flex-wrap">
            {article.techStack.map((tech) => (
              <span key={tech} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
```

---

## 5. 구현 순서

1. **Backend 구현** (2-3일)
   - DB 마이그레이션
   - Domain Layer (Article, ArticleTechStack, ArticleSeries 모델)
   - Application Layer (ManageArticleService, GetArticleService)
   - Infrastructure Layer (JPA Entity, Repository, Adapter)
   - Controllers (AdminArticleController, ArticleController)
   - API 테스트

2. **Admin UI 구현** (2-3일)
   - Entities Layer (타입, API, React Query 훅)
   - Features Layer (ArticleFormModal, ArticleFilters, Table Columns)
   - Pages Layer (ArticleManagement)
   - 라우팅 추가
   - CRUD 기능 테스트

3. **Frontend 표시 UI 구현** (1-2일)
   - Entities Layer (Public 타입, API, React Query 훅)
   - ArticleListPage (목록)
   - ArticleDetailPage (상세, 마크다운 렌더링)
   - 라우팅 추가
   - UI/UX 테스트

4. **통합 테스트 및 검증** (1일)
   - End-to-End 테스트
   - 성능 테스트
   - 문서화

**총 예상 기간**: 6-9일

---

## 6. 검증 기준

### 6.1 Backend
- [ ] DB 마이그레이션이 정상적으로 실행되는가?
- [ ] API가 정상적으로 동작하는가? (CRUD)
- [ ] 비즈니스 ID가 자동 생성되는가?
- [ ] published_at이 자동 설정되는가?
- [ ] 조회수가 증가하는가?
- [ ] 기술 스택 매핑이 정상 작동하는가?
- [ ] Hexagonal Architecture가 올바르게 구현되었는가?

### 6.2 Admin UI
- [ ] 아티클 목록을 조회할 수 있는가?
- [ ] 아티클을 생성할 수 있는가?
- [ ] 아티클을 수정할 수 있는가?
- [ ] 아티클을 삭제할 수 있는가?
- [ ] 마크다운 에디터가 정상 작동하는가?
- [ ] 필터링/검색이 작동하는가?
- [ ] 페이징이 정상 작동하는가?

### 6.3 Frontend UI
- [ ] 아티클 목록이 올바르게 표시되는가?
- [ ] 아티클 상세가 올바르게 표시되는가?
- [ ] 마크다운이 올바르게 렌더링되는가?
- [ ] 조회수가 증가하는가?
- [ ] 페이징이 정상 작동하는가?

---

## 7. 주의사항

1. **비즈니스 ID 생성**: Backend에서 자동 생성 (중복 방지)
2. **published_at 자동 설정**: DB 트리거로 처리
3. **기술 스택 매핑**: OneToMany/ManyToOne 관계 주의
4. **시리즈 관리**: Phase 2에서는 Article 생성 시 자동 생성만 지원 (Phase 2.5에서 별도 페이지 추가)
5. **마크다운 보안**: HTML 태그는 기본적으로 escape
6. **조회수 증가**: Public API에서 상세 조회 시에만 증가
7. **페이징**: 서버 사이드 페이징 사용 (대규모 데이터 대비)

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 설계 완료
