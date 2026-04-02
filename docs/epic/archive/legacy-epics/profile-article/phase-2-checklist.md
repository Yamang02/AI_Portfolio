# Phase 2: 기술 아티클 시스템 체크리스트

> **Phase 목표**: 프로젝트와 연계 가능한 기술 아티클 게시판을 추가하여 개발 인사이트 공유 및 프로젝트 컨텍스트 제공

**시작일**: 2026-01-10
**완료 예정일**: TBD
**실제 완료일**: TBD

**전제 조건**:
- [ ] Phase 1 완료 (자기소개 Markdown 관리)
- [ ] `MarkdownEditor`, `MarkdownRenderer` 컴포넌트 존재 확인
- [ ] Admin 공통 프레임 (Phase 0) 완료

---

## 1. Backend 구현

### 1.1 DB 마이그레이션

#### 1.1.1 마이그레이션 파일 생성
- [ ] `backend/src/main/resources/db/migration/` 디렉토리 확인
- [ ] `V005__create_articles_tables.sql` 파일 생성

#### 1.1.2 Articles 테이블 스키마
- [ ] `articles` 테이블 생성
  - [ ] `id BIGSERIAL PRIMARY KEY`
  - [ ] `business_id VARCHAR(20) UNIQUE NOT NULL`
  - [ ] `title VARCHAR(255) NOT NULL`
  - [ ] `summary TEXT`
  - [ ] `content TEXT NOT NULL`
  - [ ] `project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL`
  - [ ] `category VARCHAR(50)`
  - [ ] `tags TEXT[]`
  - [ ] `status VARCHAR(50) DEFAULT 'published'`
  - [ ] `published_at TIMESTAMP`
  - [ ] `sort_order INTEGER DEFAULT 0`
  - [ ] `view_count INTEGER DEFAULT 0`
  - [ ] `is_featured BOOLEAN DEFAULT FALSE`
  - [ ] `series_id VARCHAR(50)`
  - [ ] `series_order INTEGER`
  - [ ] `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - [ ] `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

#### 1.1.3 ArticleTechStack 테이블 스키마
- [ ] `article_tech_stack` 테이블 생성
  - [ ] `id BIGSERIAL PRIMARY KEY`
  - [ ] `article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE`
  - [ ] `tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE`
  - [ ] `is_primary BOOLEAN DEFAULT FALSE`
  - [ ] `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - [ ] `UNIQUE(article_id, tech_name)` 제약조건

#### 1.1.4 ArticleSeries 테이블 스키마
- [ ] `article_series` 테이블 생성
  - [ ] `id BIGSERIAL PRIMARY KEY`
  - [ ] `series_id VARCHAR(50) UNIQUE NOT NULL`
  - [ ] `title VARCHAR(255) NOT NULL`
  - [ ] `description TEXT`
  - [ ] `thumbnail_url VARCHAR(500)`
  - [ ] `sort_order INTEGER DEFAULT 0`
  - [ ] `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - [ ] `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

#### 1.1.5 인덱스 생성
- [ ] Articles 테이블 인덱스
  - [ ] `idx_articles_business_id`
  - [ ] `idx_articles_project_id`
  - [ ] `idx_articles_category`
  - [ ] `idx_articles_status`
  - [ ] `idx_articles_published_at`
  - [ ] `idx_articles_sort_order`
  - [ ] `idx_articles_is_featured` (WHERE is_featured = TRUE)
  - [ ] `idx_articles_series_id` (WHERE series_id IS NOT NULL)
  - [ ] `idx_articles_view_count` (WHERE status = 'published')
- [ ] ArticleTechStack 테이블 인덱스
  - [ ] `idx_article_tech_stack_article_id`
  - [ ] `idx_article_tech_stack_tech_name`
- [ ] ArticleSeries 테이블 인덱스
  - [ ] `idx_article_series_series_id`
  - [ ] `idx_article_series_sort_order`

#### 1.1.6 트리거 생성
- [ ] `update_articles_updated_at()` 함수 생성
- [ ] `articles_updated_at` 트리거 생성 (BEFORE UPDATE)
- [ ] `update_article_series_updated_at()` 함수 생성
- [ ] `article_series_updated_at` 트리거 생성 (BEFORE UPDATE)
- [ ] `set_article_published_at()` 함수 생성 (status='published' 시 자동 설정)
- [ ] `articles_set_published_at` 트리거 생성 (BEFORE INSERT OR UPDATE)

#### 1.1.7 마이그레이션 실행
- [ ] 애플리케이션 실행하여 마이그레이션 자동 적용
- [ ] DB 클라이언트로 테이블 생성 확인
- [ ] 인덱스 생성 확인
- [ ] 트리거 생성 확인

---

### 1.2 Domain Layer

#### 1.2.1 Article (Domain Model)
- [ ] `backend/src/main/java/com/aiportfolio/backend/domain/article/model/` 디렉토리 확인
- [ ] `Article.java` 파일 생성
- [ ] 필드 정의
  - [ ] `Long id`
  - [ ] `String businessId`
  - [ ] `String title`
  - [ ] `String summary`
  - [ ] `String content`
  - [ ] `Long projectId`
  - [ ] `String category`
  - [ ] `List<String> tags`
  - [ ] `List<ArticleTechStack> techStack`
  - [ ] `String status`
  - [ ] `LocalDateTime publishedAt`
  - [ ] `Integer sortOrder`
  - [ ] `Integer viewCount`
  - [ ] `Boolean isFeatured`
  - [ ] `String seriesId`
  - [ ] `Integer seriesOrder`
  - [ ] `LocalDateTime createdAt`
  - [ ] `LocalDateTime updatedAt`
- [ ] `@Builder`, `@Getter` 어노테이션 추가
- [ ] 비즈니스 로직 메서드 구현
  - [ ] `isPublished()`
  - [ ] `hasProject()`
  - [ ] `isInSeries()`
  - [ ] `incrementViewCount()`
  - [ ] `validate()`

#### 1.2.2 ArticleTechStack (Domain Model)
- [ ] `ArticleTechStack.java` 파일 생성
- [ ] 필드 정의
  - [ ] `Long id`
  - [ ] `Long articleId`
  - [ ] `String techName`
  - [ ] `Boolean isPrimary`
  - [ ] `LocalDateTime createdAt`
- [ ] `@Builder`, `@Getter` 어노테이션 추가

#### 1.2.3 ArticleSeries (Domain Model)
- [ ] `ArticleSeries.java` 파일 생성
- [ ] 필드 정의
  - [ ] `Long id`
  - [ ] `String seriesId`
  - [ ] `String title`
  - [ ] `String description`
  - [ ] `String thumbnailUrl`
  - [ ] `Integer sortOrder`
  - [ ] `LocalDateTime createdAt`
  - [ ] `LocalDateTime updatedAt`
- [ ] `@Builder`, `@Getter` 어노테이션 추가
- [ ] `validate()` 메서드 구현

#### 1.2.4 ManageArticleUseCase (Input Port)
- [ ] `backend/src/main/java/com/aiportfolio/backend/domain/article/port/in/` 디렉토리 확인
- [ ] `ManageArticleUseCase.java` 인터페이스 생성
- [ ] 메서드 정의
  - [ ] `Article create(CreateArticleCommand command)`
  - [ ] `Article update(UpdateArticleCommand command)`
  - [ ] `void delete(Long id)`
- [ ] `CreateArticleCommand` record 정의
  - [ ] 필드: title, summary, content, projectId, category, tags, techStack, status, isFeatured, seriesId, seriesOrder
  - [ ] Compact constructor에서 유효성 검증
- [ ] `UpdateArticleCommand` record 정의
  - [ ] 필드: id, title, summary, content, projectId, category, tags, techStack, status, isFeatured, seriesId, seriesOrder
  - [ ] Compact constructor에서 유효성 검증

#### 1.2.5 GetArticleUseCase (Input Port)
- [ ] `GetArticleUseCase.java` 인터페이스 생성
- [ ] 메서드 정의
  - [ ] `Optional<Article> findById(Long id)`
  - [ ] `Optional<Article> findByBusinessId(String businessId)`
  - [ ] `Page<Article> findAll(Pageable pageable)`
  - [ ] `Page<Article> findByFilter(ArticleFilter filter, Pageable pageable)`
  - [ ] `void incrementViewCount(Long id)`
- [ ] `ArticleFilter` record 정의
  - [ ] 필드: status, category, projectId, seriesId, isFeatured, searchKeyword

#### 1.2.6 ArticleRepositoryPort (Output Port)
- [ ] `backend/src/main/java/com/aiportfolio/backend/domain/article/port/out/` 디렉토리 확인
- [ ] `ArticleRepositoryPort.java` 인터페이스 생성
- [ ] 메서드 정의
  - [ ] `Article save(Article article)`
  - [ ] `void delete(Long id)`
  - [ ] `Optional<Article> findById(Long id)`
  - [ ] `Optional<Article> findByBusinessId(String businessId)`
  - [ ] `Page<Article> findAll(Pageable pageable)`
  - [ ] `Page<Article> findByFilter(ArticleFilter filter, Pageable pageable)`
  - [ ] `void incrementViewCount(Long id)`
  - [ ] `String generateNextBusinessId()`

#### 1.2.7 ManageArticleSeriesUseCase (Input Port, 선택적)
- [ ] `ManageArticleSeriesUseCase.java` 인터페이스 생성 (Phase 2.5에서 사용)
- [ ] 메서드 정의
  - [ ] `ArticleSeries create(CreateArticleSeriesCommand command)`
  - [ ] `ArticleSeries update(UpdateArticleSeriesCommand command)`
  - [ ] `void delete(Long id)`

#### 1.2.8 GetArticleSeriesUseCase (Input Port, 선택적)
- [ ] `GetArticleSeriesUseCase.java` 인터페이스 생성 (Phase 2.5에서 사용)
- [ ] 메서드 정의
  - [ ] `Optional<ArticleSeries> findById(Long id)`
  - [ ] `Optional<ArticleSeries> findBySeriesId(String seriesId)`
  - [ ] `List<ArticleSeries> findAll()`

---

### 1.3 Application Layer

#### 1.3.1 ManageArticleService
- [ ] `backend/src/main/java/com/aiportfolio/backend/application/article/` 디렉토리 확인
- [ ] `ManageArticleService.java` 클래스 생성
- [ ] `@Service`, `@RequiredArgsConstructor`, `@Transactional` 어노테이션 추가
- [ ] `ManageArticleUseCase` 인터페이스 구현
- [ ] `ArticleRepositoryPort` 의존성 주입
- [ ] `create()` 메서드 구현
  - [ ] 비즈니스 ID 생성 (`generateNextBusinessId()`)
  - [ ] 기술 스택 변환 (techStack List -> ArticleTechStack)
  - [ ] Article 도메인 모델 생성
  - [ ] 유효성 검증 (`validate()`)
  - [ ] 저장 (`save()`)
- [ ] `update()` 메서드 구현
  - [ ] 기존 Article 조회
  - [ ] 기술 스택 변환
  - [ ] Article 업데이트
  - [ ] 유효성 검증
  - [ ] 저장
- [ ] `delete()` 메서드 구현

#### 1.3.2 GetArticleService
- [ ] `GetArticleService.java` 클래스 생성
- [ ] `@Service`, `@RequiredArgsConstructor`, `@Transactional(readOnly = true)` 어노테이션 추가
- [ ] `GetArticleUseCase` 인터페이스 구현
- [ ] `ArticleRepositoryPort` 의존성 주입
- [ ] `findById()` 메서드 구현
- [ ] `findByBusinessId()` 메서드 구현
- [ ] `findAll()` 메서드 구현
- [ ] `findByFilter()` 메서드 구현
- [ ] `incrementViewCount()` 메서드 구현 (`@Transactional` 추가)

---

### 1.4 Infrastructure Layer - Persistence

#### 1.4.1 ArticleJpaEntity
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/entity/` 디렉토리 확인
- [ ] `ArticleJpaEntity.java` 클래스 생성
- [ ] `@Entity`, `@Table(name = "articles")` 어노테이션 추가
- [ ] `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` 어노테이션 추가
- [ ] 필드 정의
  - [ ] `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id`
  - [ ] `@Column(name = "business_id", unique = true, nullable = false, length = 20) String businessId`
  - [ ] `@Column(nullable = false) String title`
  - [ ] `@Column(columnDefinition = "TEXT") String summary`
  - [ ] `@Column(nullable = false, columnDefinition = "TEXT") String content`
  - [ ] `@Column(name = "project_id") Long projectId`
  - [ ] `@Column(length = 50) String category`
  - [ ] `@Column(columnDefinition = "TEXT[]") String[] tags`
  - [ ] `@Column(length = 50) String status`
  - [ ] `@Column(name = "published_at") LocalDateTime publishedAt`
  - [ ] `@Column(name = "sort_order") Integer sortOrder`
  - [ ] `@Column(name = "view_count") Integer viewCount`
  - [ ] `@Column(name = "is_featured") Boolean isFeatured`
  - [ ] `@Column(name = "series_id", length = 50) String seriesId`
  - [ ] `@Column(name = "series_order") Integer seriesOrder`
  - [ ] `@CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) LocalDateTime createdAt`
  - [ ] `@UpdateTimestamp @Column(name = "updated_at", nullable = false) LocalDateTime updatedAt`
- [ ] `techStack` OneToMany 관계 설정
  - [ ] `@OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)`
  - [ ] `List<ArticleTechStackJpaEntity> techStack`

#### 1.4.2 ArticleTechStackJpaEntity
- [ ] `ArticleTechStackJpaEntity.java` 클래스 생성
- [ ] `@Entity`, `@Table(name = "article_tech_stack")` 어노테이션 추가
- [ ] `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` 어노테이션 추가
- [ ] 필드 정의
  - [ ] `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id`
  - [ ] `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "article_id", nullable = false) ArticleJpaEntity article`
  - [ ] `@Column(name = "tech_name", nullable = false, length = 100) String techName`
  - [ ] `@Column(name = "is_primary") Boolean isPrimary`
  - [ ] `@CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) LocalDateTime createdAt`

#### 1.4.3 ArticleSeriesJpaEntity (선택적)
- [ ] `ArticleSeriesJpaEntity.java` 클래스 생성 (Phase 2.5에서 사용)
- [ ] `@Entity`, `@Table(name = "article_series")` 어노테이션 추가
- [ ] 필드 정의

#### 1.4.4 ArticleJpaRepository
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/` 디렉토리 확인
- [ ] `ArticleJpaRepository.java` 인터페이스 생성
- [ ] `JpaRepository<ArticleJpaEntity, Long>` 상속
- [ ] `findByBusinessId(String businessId)` 메서드 정의
- [ ] `incrementViewCount(@Param("id") Long id)` 메서드 정의
  - [ ] `@Modifying`, `@Query` 어노테이션 사용
  - [ ] UPDATE 쿼리로 view_count 증가
- [ ] `findMaxBusinessIdNumber()` 메서드 정의
  - [ ] `@Query` 어노테이션으로 MAX 쿼리 작성

#### 1.4.5 ArticleTechStackJpaRepository
- [ ] `ArticleTechStackJpaRepository.java` 인터페이스 생성
- [ ] `JpaRepository<ArticleTechStackJpaEntity, Long>` 상속

#### 1.4.6 ArticleMapper
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/mapper/` 디렉토리 확인
- [ ] `ArticleMapper.java` 클래스 생성
- [ ] `@Component` 어노테이션 추가
- [ ] `toDomain(ArticleJpaEntity entity)` 메서드 구현
  - [ ] JPA 엔티티 -> 도메인 모델 변환
  - [ ] tags 배열 -> List 변환
  - [ ] techStack OneToMany -> List<ArticleTechStack> 변환
- [ ] `toEntity(Article domain)` 메서드 구현
  - [ ] 도메인 모델 -> JPA 엔티티 변환
  - [ ] tags List -> 배열 변환
- [ ] `techStackToDomain(ArticleTechStackJpaEntity entity)` 메서드 구현

#### 1.4.7 PostgresArticleRepository (Adapter)
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/` 디렉토리 확인
- [ ] `PostgresArticleRepository.java` 클래스 생성
- [ ] `@Repository`, `@RequiredArgsConstructor` 어노테이션 추가
- [ ] `ArticleRepositoryPort` 인터페이스 구현
- [ ] 의존성 주입
  - [ ] `ArticleJpaRepository jpaRepository`
  - [ ] `ArticleTechStackJpaRepository techStackRepository`
  - [ ] `ArticleMapper mapper`
- [ ] `save()` 메서드 구현
  - [ ] 업데이트 시: 기존 엔티티 조회하여 필드 직접 수정 (영속성 컨텍스트 활용)
  - [ ] 생성 시: 새 엔티티 생성
  - [ ] 기술 스택 업데이트: 기존 삭제 후 재추가 (`clear()` + `addAll()`)
- [ ] `delete()` 메서드 구현
- [ ] `findById()` 메서드 구현
- [ ] `findByBusinessId()` 메서드 구현
- [ ] `findAll()` 메서드 구현
- [ ] `findByFilter()` 메서드 구현 (초기: 간단한 필터링만, 향후 QueryDSL 적용)
- [ ] `incrementViewCount()` 메서드 구현
- [ ] `generateNextBusinessId()` 메서드 구현
  - [ ] `findMaxBusinessIdNumber()` 호출
  - [ ] 다음 번호 계산
  - [ ] `String.format("article-%03d", nextNumber)` 형식으로 반환

---

### 1.5 Infrastructure Layer - Web (Controllers)

#### 1.5.1 AdminArticleController
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/` 디렉토리 확인
- [ ] `AdminArticleController.java` 클래스 생성
- [ ] `@RestController`, `@RequestMapping("/api/admin/articles")`, `@RequiredArgsConstructor` 어노테이션 추가
- [ ] 유스케이스 의존성 주입
  - [ ] `ManageArticleUseCase manageUseCase`
  - [ ] `GetArticleUseCase getUseCase`
- [ ] `getAll(Pageable pageable)` 메서드 구현
  - [ ] `@GetMapping` 어노테이션
  - [ ] 전체 목록 조회 (페이징)
  - [ ] `Page<ArticleResponse>` 반환
- [ ] `getById(@PathVariable Long id)` 메서드 구현
  - [ ] `@GetMapping("/{id}")` 어노테이션
  - [ ] ID로 조회
  - [ ] 404 처리
- [ ] `create(@RequestBody CreateArticleRequest request)` 메서드 구현
  - [ ] `@PostMapping` 어노테이션
  - [ ] Command 생성 및 유스케이스 호출
  - [ ] DTO 변환 및 반환
- [ ] `update(@PathVariable Long id, @RequestBody UpdateArticleRequest request)` 메서드 구현
  - [ ] `@PutMapping("/{id}")` 어노테이션
  - [ ] Command 생성 및 유스케이스 호출
  - [ ] DTO 변환 및 반환
- [ ] `delete(@PathVariable Long id)` 메서드 구현
  - [ ] `@DeleteMapping("/{id}")` 어노테이션
  - [ ] 204 No Content 반환
- [ ] Request DTOs 정의
  - [ ] `CreateArticleRequest` record
  - [ ] `UpdateArticleRequest` record
- [ ] Response DTO 정의
  - [ ] `ArticleResponse` record
  - [ ] `from(Article domain)` 정적 팩토리 메서드

#### 1.5.2 ArticleController (Public API)
- [ ] `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/controller/` 디렉토리 확인
- [ ] `ArticleController.java` 클래스 생성
- [ ] `@RestController`, `@RequestMapping("/api/articles")`, `@RequiredArgsConstructor` 어노테이션 추가
- [ ] `GetArticleUseCase` 의존성 주입
- [ ] `getAll(Pageable pageable)` 메서드 구현
  - [ ] `@GetMapping` 어노테이션
  - [ ] 필터: status='published'만
  - [ ] `Page<ArticleListResponse>` 반환
- [ ] `getByBusinessId(@PathVariable String businessId)` 메서드 구현
  - [ ] `@GetMapping("/{businessId}")` 어노테이션
  - [ ] BusinessId로 조회
  - [ ] `isPublished()` 체크
  - [ ] 조회수 증가 (`incrementViewCount()`)
  - [ ] `ArticleDetailResponse` 반환
  - [ ] 404 처리
- [ ] Response DTOs 정의 (Public용 - 필요한 정보만 노출)
  - [ ] `ArticleListResponse` record
  - [ ] `ArticleDetailResponse` record
  - [ ] `from()` 정적 팩토리 메서드

---

### 1.6 Backend 테스트

#### 1.6.1 API 테스트 (Postman/curl)
- [ ] `GET /api/admin/articles` 테스트 (페이징)
- [ ] `GET /api/admin/articles/{id}` 테스트
- [ ] `POST /api/admin/articles` 테스트 (생성)
  - [ ] Request Body 예시 준비
  - [ ] 201 Created 응답 확인
  - [ ] business_id 자동 생성 확인
- [ ] `PUT /api/admin/articles/{id}` 테스트 (업데이트)
- [ ] `DELETE /api/admin/articles/{id}` 테스트 (삭제)
- [ ] `GET /api/articles` 테스트 (Public, 발행된 것만)
- [ ] `GET /api/articles/{businessId}` 테스트 (Public, 상세)
  - [ ] 조회수 증가 확인

#### 1.6.2 유효성 검증 테스트
- [ ] 빈 title 전송 시 400 에러 확인
- [ ] 빈 content 전송 시 400 에러 확인
- [ ] 잘못된 business_id 조회 시 404 에러 확인

#### 1.6.3 DB 확인
- [ ] DB에 데이터가 정상 저장되었는지 확인
- [ ] business_id가 자동 생성되는지 확인 (예: "article-001")
- [ ] published_at이 자동 설정되는지 확인 (status='published' 시)
- [ ] updated_at이 자동 업데이트되는지 확인
- [ ] 조회수가 증가하는지 확인
- [ ] 기술 스택 매핑이 정상 작동하는지 확인

---

## 2. Admin UI 구현

### 2.1 사전 확인
- [ ] Phase 0, Phase 1 완료 확인
  - [ ] `adminApiClient` 존재 확인
  - [ ] `useAdminQuery`, `useAdminMutation` 훅 존재 확인
  - [ ] Antd 테마 설정 확인
- [ ] MarkdownEditor 컴포넌트 존재 확인
  - [ ] `frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx` 파일 확인
- [ ] MarkdownRenderer 컴포넌트 존재 확인
  - [ ] `frontend/src/shared/ui/markdown/MarkdownRenderer.tsx` 파일 확인

---

### 2.2 Entities Layer

#### 2.2.1 타입 정의
- [ ] `frontend/src/admin/entities/article/` 디렉토리 생성
- [ ] `model/` 디렉토리 생성
- [ ] `model/article.types.ts` 파일 생성
- [ ] `Article` 인터페이스 정의
  - [ ] 필드: id, businessId, title, summary, content, projectId, category, tags, techStack, status, publishedAt, sortOrder, viewCount, isFeatured, seriesId, seriesOrder, createdAt, updatedAt
- [ ] `CreateArticleRequest` 인터페이스 정의
- [ ] `UpdateArticleRequest` 인터페이스 정의
- [ ] `ARTICLE_CATEGORIES` 상수 정의
  - [ ] tutorial: '튜토리얼'
  - [ ] troubleshooting: '트러블슈팅'
  - [ ] architecture: '아키텍처'
  - [ ] insight: '인사이트'
  - [ ] development-timeline: '개발 과정'
- [ ] `ArticleCategory` 타입 정의

#### 2.2.2 API 클라이언트
- [ ] `api/` 디렉토리 생성
- [ ] `api/adminArticleApi.ts` 파일 생성
- [ ] `adminApiClient` import
- [ ] `adminArticleApi` 객체 export
- [ ] `getAll(params)` 메서드 구현 (GET, 페이징)
- [ ] `getById(id)` 메서드 구현 (GET)
- [ ] `create(data)` 메서드 구현 (POST)
- [ ] `update(id, data)` 메서드 구현 (PUT)
- [ ] `delete(id)` 메서드 구현 (DELETE)

#### 2.2.3 React Query 훅
- [ ] `api/useAdminArticleQuery.ts` 파일 생성
- [ ] `useAdminQuery`, `useAdminMutation` import
- [ ] `useAdminArticleListQuery(params)` 훅 구현
  - [ ] queryKey: `['admin', 'articles', params]`
  - [ ] queryFn: `getAll(params)`
- [ ] `useAdminArticleQuery(id)` 훅 구현
  - [ ] queryKey: `['admin', 'articles', id]`
  - [ ] queryFn: `getById(id)`
  - [ ] enabled: `!!id`
- [ ] `useCreateArticleMutation()` 훅 구현
  - [ ] mutationFn: `create(data)`
  - [ ] onSuccess: 성공 메시지, 캐시 무효화
- [ ] `useUpdateArticleMutation()` 훅 구현
  - [ ] mutationFn: `update({ id, data })`
  - [ ] onSuccess: 성공 메시지, 캐시 무효화
- [ ] `useDeleteArticleMutation()` 훅 구현
  - [ ] mutationFn: `delete(id)`
  - [ ] onSuccess: 성공 메시지, 캐시 무효화

#### 2.2.4 Index (배럴 파일)
- [ ] `index.ts` 파일 생성
- [ ] 타입, API, 훅 모두 export

---

### 2.3 Features Layer

#### 2.3.1 useArticleForm 훅
- [ ] `frontend/src/admin/features/article-management/` 디렉토리 생성
- [ ] `hooks/` 디렉토리 생성
- [ ] `hooks/useArticleForm.ts` 파일 생성
- [ ] `ArticleFormData` 인터페이스 정의
- [ ] `useForm()` 훅 사용 (Antd Form)
- [ ] 초기 데이터 로드 (useEffect)
  - [ ] article 데이터가 있으면 form.setFieldsValue() 호출
- [ ] `{ form }` 반환

#### 2.3.2 ArticleFormModal 컴포넌트
- [ ] `ui/` 디렉토리 생성
- [ ] `ui/ArticleFormModal.tsx` 파일 생성
- [ ] Props 정의: `open`, `onClose`, `article` (수정 시)
- [ ] `useArticleForm` 훅 사용
- [ ] `content` 상태 관리 (useState)
- [ ] `useCreateArticleMutation`, `useUpdateArticleMutation` 훅 사용
- [ ] `handleSubmit` 핸들러 구현
  - [ ] form.validateFields() 호출
  - [ ] article 있으면 update, 없으면 create
  - [ ] onSuccess: 모달 닫기, 폼 리셋
- [ ] Modal 컴포넌트 구현
  - [ ] title: "아티클 생성" 또는 "아티클 수정"
  - [ ] width: 1200
  - [ ] confirmLoading 처리
- [ ] Tabs 컴포넌트 구현
  - [ ] Tab 1: "기본 정보"
    - [ ] Form 필드: title, summary, category, tags, techStack, status, isFeatured, projectId, seriesId, seriesOrder
  - [ ] Tab 2: "본문"
    - [ ] MarkdownEditor 컴포넌트 사용 (preview="live")

#### 2.3.3 Article Table Columns
- [ ] `config/` 디렉토리 생성
- [ ] `config/articleColumns.tsx` 파일 생성
- [ ] `getArticleColumns(onEdit, onDelete)` 함수 구현
- [ ] Antd Table columns 정의
  - [ ] businessId (ID)
  - [ ] title (제목)
  - [ ] category (카테고리)
  - [ ] status (상태, Tag 컴포넌트 사용)
  - [ ] viewCount (조회수)
  - [ ] createdAt (생성일)
  - [ ] actions (작업: 수정/삭제 버튼)

---

### 2.4 Pages Layer

#### 2.4.1 ArticleManagement 페이지
- [ ] `frontend/src/admin/pages/` 디렉토리 확인
- [ ] `ArticleManagement.tsx` 파일 생성
- [ ] 상태 관리
  - [ ] `isModalOpen` (모달 열림 여부)
  - [ ] `editingArticle` (수정 중인 아티클)
  - [ ] `page` (현재 페이지)
- [ ] 훅 호출
  - [ ] `useAdminArticleListQuery({ page, size })`
  - [ ] `useDeleteArticleMutation()`
- [ ] 핸들러 구현
  - [ ] `handleCreate()` - 생성 모달 열기
  - [ ] `handleEdit(article)` - 수정 모달 열기
  - [ ] `handleDelete(id)` - 삭제
  - [ ] `handleModalClose()` - 모달 닫기
- [ ] 헤더 구현
  - [ ] 제목: "아티클 관리"
  - [ ] 생성 버튼 (PlusOutlined 아이콘)
- [ ] Table 컴포넌트 구현
  - [ ] dataSource: data?.content
  - [ ] columns: getArticleColumns()
  - [ ] loading 처리
  - [ ] pagination 설정 (current, pageSize, total, onChange)
- [ ] ArticleFormModal 컴포넌트 렌더링

---

### 2.5 라우팅 추가

#### 2.5.1 Admin 라우팅 설정
- [ ] `frontend/src/admin/app/AdminApp.tsx` 파일 열기
- [ ] `ArticleManagement` import
- [ ] 라우트 추가
  - [ ] `path="/articles"`
  - [ ] `element={<ArticleManagement />}`

#### 2.5.2 Admin 네비게이션 메뉴 추가 (선택적)
- [ ] Admin 사이드바/헤더 메뉴에 "아티클 관리" 링크 추가

---

### 2.6 Admin UI 테스트

#### 2.6.1 기능 테스트
- [ ] Admin 페이지에서 `/admin/articles` 접속
- [ ] 아티클 목록이 표시되는가?
- [ ] "아티클 생성" 버튼 클릭 시 모달이 열리는가?
- [ ] 폼에 데이터 입력 후 저장
  - [ ] 기본 정보 탭: 제목, 요약, 카테고리, 태그 등
  - [ ] 본문 탭: 마크다운 에디터로 내용 작성
- [ ] 성공 토스트 메시지 확인
- [ ] 목록에 새 아티클이 추가되었는가?
- [ ] "수정" 버튼 클릭 시 모달이 열리고 기존 데이터가 로드되는가?
- [ ] 수정 후 저장 시 변경사항이 반영되는가?
- [ ] "삭제" 버튼 클릭 시 삭제 확인 모달이 표시되는가?
- [ ] 삭제 후 목록에서 제거되는가?
- [ ] 페이징이 정상 작동하는가?

#### 2.6.2 UI/UX 테스트
- [ ] 로딩 상태가 적절히 표시되는가?
- [ ] 에러 발생 시 적절한 메시지가 표시되는가?
- [ ] 폼 유효성 검증이 작동하는가? (필수 필드)
- [ ] 마크다운 에디터 내장 미리보기가 올바르게 렌더링되는가?
- [ ] 모달이 닫힐 때 폼이 리셋되는가?

#### 2.6.3 반응형 테스트
- [ ] 모바일 화면에서 정상 작동하는가?
- [ ] 태블릿 화면에서 정상 작동하는가?
- [ ] 데스크탑 화면에서 정상 작동하는가?

---

## 3. Frontend 표시 UI 구현

### 3.1 패키지 확인
- [ ] 마크다운 패키지 이미 설치됨 확인
  - [ ] `react-markdown: ^10.1.0`
  - [ ] `remark-gfm: ^4.0.1`
  - [ ] `rehype-sanitize: ^6.0.0`
  - [ ] `rehype-highlight: ^7.0.2`
  - [ ] `highlight.js: ^11.11.1`

---

### 3.2 Entities Layer

#### 3.2.1 타입 정의 (Public)
- [ ] `frontend/src/main/entities/article/` 디렉토리 생성
- [ ] `model/` 디렉토리 생성
- [ ] `model/article.types.ts` 파일 생성
- [ ] `ArticleListItem` 인터페이스 정의
  - [ ] 필드: businessId, title, summary, category, tags, publishedAt, viewCount
- [ ] `ArticleDetail` 인터페이스 정의
  - [ ] 필드: businessId, title, content, category, tags, techStack, publishedAt, viewCount

#### 3.2.2 API 클라이언트
- [ ] `api/` 디렉토리 생성
- [ ] `api/articleApi.ts` 파일 생성
- [ ] `articleApi` 객체 export
- [ ] `getAll(params)` 메서드 구현
  - [ ] `fetch('/api/articles?page=...&size=...')` 호출
  - [ ] 에러 처리
  - [ ] JSON 파싱 및 반환
- [ ] `getByBusinessId(businessId)` 메서드 구현
  - [ ] `fetch('/api/articles/{businessId}')` 호출
  - [ ] 에러 처리
  - [ ] JSON 파싱 및 반환

#### 3.2.3 React Query 훅
- [ ] `api/useArticleQuery.ts` 파일 생성
- [ ] `useQuery` import
- [ ] `useArticleListQuery(params)` 훅 구현
  - [ ] queryKey: `['articles', params]`
  - [ ] queryFn: `getAll(params)`
  - [ ] staleTime: 5분
- [ ] `useArticleQuery(businessId)` 훅 구현
  - [ ] queryKey: `['articles', businessId]`
  - [ ] queryFn: `getByBusinessId(businessId)`
  - [ ] staleTime: 10분

#### 3.2.4 Index (배럴 파일)
- [ ] `index.ts` 파일 생성
- [ ] 타입, API, 훅 모두 export

---

### 3.3 ArticleListPage

#### 3.3.1 페이지 생성
- [ ] `frontend/src/main/pages/` 디렉토리 확인
- [ ] `ArticleListPage.tsx` 파일 생성
- [ ] `page` 상태 관리 (useState)
- [ ] `useArticleListQuery({ page, size })` 훅 호출
- [ ] 로딩 상태 처리
  - [ ] `isLoading`이면 "로딩 중..." 표시
- [ ] 에러 상태 처리
  - [ ] `error`이면 에러 메시지 표시
- [ ] 아티클 목록 렌더링
  - [ ] 제목 (Link 컴포넌트 사용)
  - [ ] 요약
  - [ ] 발행일, 조회수, 태그
- [ ] 페이지네이션 구현
  - [ ] "이전" 버튼 (disabled 처리)
  - [ ] 현재 페이지 / 전체 페이지
  - [ ] "다음" 버튼 (disabled 처리)

---

### 3.4 ArticleDetailPage

#### 3.4.1 페이지 생성
- [ ] `ArticleDetailPage.tsx` 파일 생성
- [ ] `useParams()` 훅으로 businessId 추출
- [ ] `useArticleQuery(businessId)` 훅 호출
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 아티클 상세 렌더링
  - [ ] 헤더 (제목, 발행일, 조회수, 태그)
  - [ ] MarkdownRenderer 컴포넌트로 본문 렌더링
  - [ ] 푸터 (기술 스택 표시)

---

### 3.5 Frontend 라우팅 추가

#### 3.5.1 Main 라우팅 설정
- [ ] `frontend/src/main/app/MainApp.tsx` 파일 열기 (또는 라우팅 설정 파일)
- [ ] `ArticleListPage`, `ArticleDetailPage` import
- [ ] 라우트 추가
  - [ ] `path="/articles"` -> `ArticleListPage`
  - [ ] `path="/articles/:businessId"` -> `ArticleDetailPage`

---

### 3.6 Frontend UI 테스트

#### 3.6.1 기능 테스트
- [ ] 메인 페이지에서 `/articles` 접속
- [ ] 아티클 목록이 표시되는가?
- [ ] 페이징이 정상 작동하는가?
- [ ] 아티클 제목 클릭 시 상세 페이지로 이동하는가?
- [ ] 상세 페이지에서 마크다운이 올바르게 렌더링되는가?
- [ ] 조회수가 증가하는가?

#### 3.6.2 마크다운 렌더링 테스트
- [ ] 제목 렌더링 확인 (H1, H2, H3)
- [ ] 강조 렌더링 확인 (굵게, 기울임)
- [ ] 목록 렌더링 확인 (순서, 비순서)
- [ ] 링크 렌더링 확인
- [ ] 코드 블록 렌더링 확인
- [ ] 인용구 렌더링 확인

#### 3.6.3 스타일 테스트
- [ ] 디자인 시스템 색상이 적용되는가?
- [ ] 반응형 스타일이 적용되는가?
- [ ] 여백과 간격이 적절한가?

#### 3.6.4 로딩/에러 테스트
- [ ] 로딩 중 스켈레톤 UI가 표시되는가?
- [ ] 네트워크 에러 시 에러 메시지가 표시되는가?
- [ ] 잘못된 businessId 접근 시 404 처리가 되는가?

---

## 4. 통합 테스트

### 4.1 End-to-End 테스트
- [ ] Admin에서 아티클 작성
  - [ ] 제목, 요약, 본문, 카테고리, 태그, 기술 스택 입력
  - [ ] 상태: 'draft'로 저장
- [ ] Admin에서 아티클 수정
  - [ ] 상태를 'published'로 변경
- [ ] 메인 페이지에서 아티클 목록 확인
  - [ ] 발행된 아티클만 표시되는가?
- [ ] 메인 페이지에서 아티클 상세 확인
  - [ ] 마크다운이 올바르게 렌더링되는가?
  - [ ] 조회수가 증가하는가?
- [ ] 브라우저 새로고침 후에도 변경사항 유지 확인

### 4.2 크로스 브라우저 테스트
- [ ] Chrome에서 정상 작동 확인
- [ ] Firefox에서 정상 작동 확인
- [ ] Safari에서 정상 작동 확인 (Mac 있는 경우)
- [ ] Edge에서 정상 작동 확인

### 4.3 성능 테스트
- [ ] 긴 마크다운 콘텐츠 (5,000자 이상) 렌더링 테스트
- [ ] 대량 아티클 목록 (100개 이상) 페이징 테스트
- [ ] 로딩 속도 확인 (Lighthouse)
- [ ] 메모리 누수 확인 (개발자 도구)

---

## 5. 문서화

### 5.1 API 문서
- [ ] Swagger/OpenAPI 스펙 추가 (선택적)
- [ ] API 엔드포인트 문서화
  - [ ] `GET /api/admin/articles`
  - [ ] `GET /api/admin/articles/{id}`
  - [ ] `POST /api/admin/articles`
  - [ ] `PUT /api/admin/articles/{id}`
  - [ ] `DELETE /api/admin/articles/{id}`
  - [ ] `GET /api/articles`
  - [ ] `GET /api/articles/{businessId}`

### 5.2 컴포넌트 문서
- [ ] ArticleFormModal 컴포넌트 사용법 문서 작성
- [ ] ArticleListPage, ArticleDetailPage 사용법 문서 작성

### 5.3 사용자 가이드
- [ ] Admin 사용자를 위한 아티클 작성 가이드
- [ ] 마크다운 문법 가이드 (Admin UI에 포함됨)
- [ ] 카테고리별 작성 가이드

---

## 6. Phase 2 완료 기준

### 6.1 필수 조건
- [ ] DB 마이그레이션 완료 및 테이블 생성 확인
- [ ] Backend API 구현 완료 (Hexagonal Architecture)
  - [ ] Article CRUD
  - [ ] 비즈니스 ID 자동 생성
  - [ ] 조회수 증가
  - [ ] 기술 스택 매핑
- [ ] Admin UI 구현 완료 (Feature-Sliced Design)
  - [ ] 아티클 CRUD
  - [ ] 마크다운 에디터
  - [ ] 필터링/페이징
- [ ] Frontend 표시 UI 구현 완료
  - [ ] 아티클 목록
  - [ ] 아티클 상세
  - [ ] 마크다운 렌더링
- [ ] End-to-End 테스트 통과

### 6.2 선택 조건
- [ ] 단위 테스트 작성 (Backend)
- [ ] 컴포넌트 테스트 작성 (Frontend)
- [ ] API 문서화 완료
- [ ] 사용자 가이드 작성
- [ ] Phase 2.5 (시리즈 관리 전용 페이지) 구현

### 6.3 검증 체크리스트
- [ ] Admin에서 아티클을 작성하고 저장할 수 있는가?
- [ ] Admin에서 아티클을 수정할 수 있는가?
- [ ] Admin에서 아티클을 삭제할 수 있는가?
- [ ] 메인 페이지에서 발행된 아티클 목록을 볼 수 있는가?
- [ ] 메인 페이지에서 아티클 상세를 볼 수 있는가?
- [ ] 마크다운이 올바르게 렌더링되는가?
- [ ] 조회수가 증가하는가?
- [ ] 비즈니스 ID가 자동 생성되는가? (예: "article-001")
- [ ] published_at이 자동 설정되는가? (status='published' 시)
- [ ] 기술 스택 매핑이 정상 작동하는가?
- [ ] 페이징이 정상 작동하는가?

### 6.4 다음 단계
- [ ] Phase 2.5 (시리즈 관리 전용 페이지) 시작 (선택적)
- [ ] Phase 3 (프로젝트와 아티클 연계) 시작
- [ ] 메인 페이지에 Featured Article 섹션 추가

---

## 7. 이슈 및 리스크

### 7.1 발견된 이슈
- 이슈 1:
- 이슈 2:

### 7.2 해결 방안
- 해결 1:
- 해결 2:

### 7.3 기술적 부채
- 부채 1: `findByFilter()` 메서드가 간단한 필터링만 지원 (향후 QueryDSL 적용 필요)
- 부채 2: 시리즈 관리 기능이 제한적 (Phase 2.5에서 개선)

---

## 8. 회고

### 8.1 잘된 점
-

### 8.2 개선할 점
-

### 8.3 배운 점
-

### 8.4 Phase 3에 적용할 사항
-

---

## 9. 참고 자료

### 9.1 Backend
- [Hexagonal Architecture 가이드](../../technical/architecture/backend-architecture-guide.md)
- [CRUD 템플릿 가이드](../../technical/guides/backend/crud-template-guide.md)
- [Phase 1 설계 문서](./phase-1-design.md) (ProfileIntroduction 참고)

### 9.2 Frontend
- [Feature-Sliced Design 가이드](../../technical/architecture/frontend-architecture.md)
- [CRUD 템플릿 가이드](../../technical/guides/frontend/crud-template-guide.md)
- [Phase 1 설계 문서](./phase-1-design.md) (MarkdownEditor/Renderer 참고)

### 9.3 마크다운
- [react-markdown 공식 문서](https://github.com/remarkjs/react-markdown)
- [remark-gfm 공식 문서](https://github.com/remarkjs/remark-gfm)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)

### 9.4 Antd
- [Antd Table 공식 문서](https://ant.design/components/table/)
- [Antd Form 공식 문서](https://ant.design/components/form/)
- [Antd Modal 공식 문서](https://ant.design/components/modal/)

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 체크리스트 생성 완료
