# 식별자 사용 가이드 (PK vs businessId)

프로젝트는 **내부 식별자(PK)**와 **외부 식별자(businessId)**를 분리하여 사용합니다.

## 📊 식별자 구분

### PK (Primary Key)
- **타입**: `BIGSERIAL` (데이터베이스), `Long` (Java)
- **용도**: 데이터베이스 내부 식별자
- **사용 범위**: 
  - 데이터베이스 내부에서만 사용
  - Foreign Key 참조
  - 내부 조회 및 조인
  - 트랜잭션 관리
- **노출**: 외부에 노출하지 않음

### businessId
- **타입**: `VARCHAR(20)` (데이터베이스), `String` (Java/TypeScript)
- **용도**: 외부 식별자
- **사용 범위**:
  - API 엔드포인트 경로
  - API 요청/응답 DTO
  - URL, 라우팅
  - 에러 메시지
- **생성**: Backend에서 자동 생성 (규칙: `{domain}-{number}`, 예: `article-001`, `proj-001`)
- **제약**: UNIQUE 제약조건으로 중복 방지

---

## 🎯 프론트엔드 가이드

### ✅ DO

#### API 엔드포인트
```typescript
// ✅ 올바른 사용
GET /api/articles/article-001
GET /api/projects/proj-001
PUT /api/admin/articles/article-001
```

#### API 응답 처리
```typescript
// ✅ 올바른 사용
interface Article {
  businessId: string;  // businessId만 사용
  title: string;
  projectId?: string;  // 프로젝트의 businessId (프로젝트 상세 페이지 연결용)
  // id 필드는 없음 (내부 PK는 노출되지 않음)
}

// API 호출 예시
const article = await fetch('/api/articles/article-001');
const { businessId, projectId } = await article.json();

// 프로젝트 상세 페이지로 이동
if (projectId) {
  navigate(`/projects/${projectId}`);
}
```

#### React Query 사용
```typescript
// ✅ 올바른 사용
const { data } = useQuery({
  queryKey: ['article', 'article-001'],  // businessId 사용
  queryFn: () => fetchArticle('article-001')
});
```

#### 라우팅
```typescript
// ✅ 올바른 사용
<Route path="/articles/:businessId" element={<ArticleDetailPage />} />
<Route path="/projects/:businessId" element={<ProjectDetailPage />} />

// 컴포넌트에서 사용
const { businessId } = useParams<{ businessId: string }>();
```

#### 상태 관리
```typescript
// ✅ 올바른 사용
const [selectedArticleId, setSelectedArticleId] = useState<string>('article-001');
```

### ❌ DON'T

#### 내부 PK 사용 금지
```typescript
// ❌ 잘못된 사용
const articleId = 1;  // PK 사용 금지
fetch(`/api/articles/${articleId}`);
```

#### API 응답의 `id` 필드 사용 금지
```typescript
// ❌ 잘못된 사용
const { id } = article;  // id 필드는 API 응답에 없음
```

#### PK와 businessId 혼용 금지
```typescript
// ❌ 잘못된 사용
const articleId = article.id || article.businessId;  // 혼용 금지
```

### 📝 주요 원칙

1. **모든 API 통신에서 `businessId`만 사용**
2. **내부 PK는 백엔드에서만 사용되며 프론트엔드에 노출되지 않음**
3. **프로젝트 참조 시에도 프로젝트의 `businessId` 사용**
4. **라우팅, 쿼리 키, 상태 관리 모두 `businessId` 기반**

### 🔍 예시: 아티클 상세 페이지

```typescript
// ArticleDetailPage.tsx
const ArticleDetailPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  
  const { data: article } = useQuery({
    queryKey: ['article', businessId],
    queryFn: () => fetchArticle(businessId)  // businessId 사용
  });

  if (!article) return <Loading />;

  return (
    <div>
      <h1>{article.title}</h1>
      {article.projectId && (
        <Link to={`/projects/${article.projectId}`}>
          관련 프로젝트 보기
        </Link>
      )}
    </div>
  );
};
```

---

## 🎯 백엔드 가이드

### 1. 도메인 모델 (Domain Layer)

```java
// ✅ 올바른 사용
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private Long id;              // PK (내부 식별자)
    private String businessId;    // 외부 식별자
    private Long projectId;       // 프로젝트 PK 참조 (내부적으로만 사용)
    private String title;
    // ...
}
```

**원칙:**
- 도메인 모델에는 PK(`id`)와 `businessId` 모두 포함
- 외부 참조는 PK로 저장 (`projectId: Long`)
- `businessId`는 자동 생성 (생성 규칙: `article-001`, `article-002` 등)

### 2. 데이터베이스 스키마

```sql
-- ✅ 올바른 설계
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,                    -- PK (내부 식별자)
    business_id VARCHAR(20) UNIQUE NOT NULL,     -- 외부 식별자
    project_id BIGINT REFERENCES projects(id),  -- 프로젝트 PK 참조
    title VARCHAR(255) NOT NULL,
    -- ...
);

CREATE INDEX idx_articles_business_id ON articles(business_id);
CREATE INDEX idx_articles_project_id ON articles(project_id);
```

**원칙:**
- PK는 `id` (BIGSERIAL)
- 외부 식별자는 `business_id` (VARCHAR, UNIQUE)
- Foreign Key는 PK 참조 (`project_id` → `projects.id`)

### 3. Repository (Infrastructure Layer)

```java
// ✅ 올바른 사용
public interface ArticleRepositoryPort {
    Optional<Article> findById(Long id);                    // PK로 조회 (내부 사용)
    Optional<Article> findByBusinessId(String businessId); // businessId로 조회 (API용)
    List<Article> findByProjectId(Long projectId);        // 프로젝트 PK로 조회 (내부 사용)
    Article save(Article article);
}
```

**원칙:**
- PK 조회 메서드: 내부 로직에서 사용
- businessId 조회 메서드: API 컨트롤러에서 사용
- Foreign Key 조회: PK 기반으로 조회

### 4. Application Service

```java
// ✅ 올바른 사용
@Service
@RequiredArgsConstructor
public class GetArticleService {
    private final ArticleRepositoryPort articleRepository;
    private final ProjectRepositoryPort projectRepository;
    
    public ArticleResponse getByBusinessId(String businessId) {
        // businessId로 조회
        Article article = articleRepository.findByBusinessId(businessId)
            .orElseThrow(() -> new ArticleNotFoundException(businessId));
        
        // 프로젝트 정보 조회 (PK 사용)
        Project project = null;
        if (article.getProjectId() != null) {
            project = projectRepository.findById(article.getProjectId())
                .orElse(null);
        }
        
        // DTO 변환 시 businessId로 변환
        return ArticleResponse.builder()
            .businessId(article.getBusinessId())
            .projectId(project != null ? project.getBusinessId() : null)  // 프로젝트 businessId로 변환
            .title(article.getTitle())
            .build();
    }
}
```

**원칙:**
- API 요청은 `businessId`로 받음
- 내부 조회는 PK 사용
- API 응답으로 변환 시 `businessId`로 변환
- 프로젝트 참조 시 프로젝트의 `businessId`를 조회하여 노출

### 5. Controller (Infrastructure Layer)

```java
// ✅ 올바른 사용
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final GetArticleService getArticleService;
    private final ManageArticleService manageArticleService;
    
    @GetMapping("/{businessId}")
    public ResponseEntity<ArticleResponse> getArticle(
        @PathVariable String businessId  // businessId 사용
    ) {
        ArticleResponse response = getArticleService.getByBusinessId(businessId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<ArticleResponse> createArticle(
        @RequestBody CreateArticleRequest request
    ) {
        ArticleResponse response = manageArticleService.create(request);
        return ResponseEntity.ok(response);
    }
}
```

**원칙:**
- API 엔드포인트는 `businessId` 사용 (`/{businessId}`)
- PK는 절대 API 경로에 사용하지 않음
- 요청/응답 DTO는 `businessId` 사용

### 6. DTO 변환

```java
// ✅ 올바른 사용
@Data
@Builder
public class ArticleResponse {
    private String businessId;     // 외부 식별자 노출
    private String projectId;      // 프로젝트 businessId (프로젝트 상세 페이지 연결용)
    private String title;
    // id 필드는 없음 (내부 PK는 노출하지 않음)
    
    public static ArticleResponse from(Article article, Project project) {
        return ArticleResponse.builder()
            .businessId(article.getBusinessId())
            .projectId(project != null ? project.getBusinessId() : null)  // 프로젝트 businessId로 변환
            .title(article.getTitle())
            .build();
    }
}
```

**원칙:**
- 응답 DTO에는 `businessId`만 포함
- 내부 PK(`id`)는 응답에 포함하지 않음
- 프로젝트 참조 시 프로젝트의 `businessId`를 조회하여 노출

### ❌ DON'T

#### API 엔드포인트에 PK 사용 금지
```java
// ❌ 잘못된 사용
@GetMapping("/{id}")
public ArticleResponse getArticle(@PathVariable Long id) {
    // PK를 API 경로에 사용하면 안 됨
}
```

#### API 응답에 PK 노출 금지
```java
// ❌ 잘못된 사용
public class ArticleResponse {
    private Long id;  // PK 노출 금지
}
```

#### 프로젝트 참조를 businessId로 저장 금지
```java
// ❌ 잘못된 사용
public class Article {
    private String projectId;  // businessId로 저장하면 안 됨
}
```

#### DTO에 PK 포함 금지
```java
// ❌ 잘못된 사용
public class ArticleRequest {
    private Long id;  // PK는 요청에 포함하지 않음
}
```

### 📝 주요 원칙 요약

1. **데이터베이스 내부**: PK(`id`) 사용
   - Foreign Key 참조
   - 내부 조회 및 조인
   - 트랜잭션 관리

2. **API 통신**: `businessId` 사용
   - 엔드포인트 경로
   - 요청/응답 DTO
   - 에러 메시지

3. **변환 시점**: Application Service에서 변환
   - API 요청: `businessId` → PK로 변환하여 조회
   - API 응답: PK → `businessId`로 변환하여 노출
   - 프로젝트 참조: 프로젝트 PK → 프로젝트 `businessId`로 변환

4. **자동 생성**: `businessId`는 Backend에서 자동 생성
   - 생성 규칙: `{domain}-{number}` (예: `article-001`, `proj-001`)
   - UNIQUE 제약조건으로 중복 방지

### 🔍 예시: 아티클 생성 및 조회 플로우

```java
// 1. API 요청 (businessId 사용)
POST /api/admin/articles
{
  "title": "React Query 가이드",
  "projectId": "proj-001"  // 프로젝트 businessId
}

// 2. Controller에서 businessId로 프로젝트 조회
@PostMapping
public ArticleResponse createArticle(@RequestBody CreateArticleRequest request) {
    // 프로젝트 businessId → PK 변환
    Project project = projectRepository.findByBusinessId(request.getProjectId())
        .orElseThrow(() -> new ProjectNotFoundException(request.getProjectId()));
    
    // Article 생성 (PK 사용)
    Article article = Article.builder()
        .businessId(generateBusinessId())  // 자동 생성: "article-001"
        .projectId(project.getId())         // PK 참조: 1L
        .title(request.getTitle())
        .build();
    
    article = articleRepository.save(article);
    
    // 응답 변환 (businessId로 변환)
    return ArticleResponse.builder()
        .businessId(article.getBusinessId())  // "article-001"
        .projectId(project.getBusinessId())   // "proj-001"
        .title(article.getTitle())
        .build();
}

// 3. API 응답 (businessId만 노출)
{
  "businessId": "article-001",
  "projectId": "proj-001",
  "title": "React Query 가이드"
}
```

---

## 🔄 변환 플로우

### API 요청 → 내부 처리

```
1. 프론트엔드: GET /api/articles/article-001
2. Controller: @PathVariable String businessId = "article-001"
3. Service: articleRepository.findByBusinessId("article-001")
4. Repository: SELECT * FROM articles WHERE business_id = 'article-001'
5. Domain: Article 객체 반환 (id: 1L, businessId: "article-001")
```

### 내부 처리 → API 응답

```
1. Domain: Article(id: 1L, businessId: "article-001", projectId: 2L)
2. Service: projectRepository.findById(2L) → Project(id: 2L, businessId: "proj-001")
3. DTO 변환: ArticleResponse(businessId: "article-001", projectId: "proj-001")
4. Controller: ResponseEntity.ok(articleResponse)
5. 프론트엔드: { businessId: "article-001", projectId: "proj-001" }
```

---

## 📚 관련 문서

- 프론트엔드 개발 가이드: `frontend/developmentGuide.md`
- 백엔드 개발 가이드: `backend/developmentGuide.md`
- PRD 문서: `docs/epic/profile-article/PRD.md`
