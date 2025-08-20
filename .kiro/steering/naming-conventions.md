---
inclusion: always
---

# 네이밍 컨벤션 가이드라인

## 기존 프로젝트 패턴 분석

### 현재 Java Backend 패턴
- **도메인 모델**: `Project`, `Experience` (단순명사)
- **서비스**: `PortfolioService`, `ChatApplicationService` (Service 접미사)
- **컨트롤러**: `ChatController`, `DataController` (Controller 접미사)
- **Repository**: `PostgresPortfolioRepository` (기술명 + Repository)

### 현재 Frontend 패턴 (FSD 아키텍처)
- **컴포넌트**: PascalCase (`AppProvider`, `Modal`)
- **파일명**: camelCase (`apiClient.ts`, `dateUtils.ts`)
- **디렉토리**: kebab-case는 없고 camelCase 사용

## 수정된 엔티티 네이밍 규칙

### 기존 패턴 유지 + 명확한 구분
```java
// 도메인 모델 (기존 패턴 유지)
public class Project {
    // 순수 비즈니스 로직만
    // JPA 어노테이션 없음
}

// JPA 엔티티 (새로 추가)
@Entity
@Table(name = "projects")
public class ProjectJpaEntity {
    // JPA 어노테이션만 포함
    // 비즈니스 로직 없음
}
```

### 매퍼 네이밍 (기존 패턴 따름)
```java
// 도메인 ↔ JPA 엔티티 변환
public class ProjectMapper {
    public Project toDomain(ProjectJpaEntity jpaEntity) { ... }
    public ProjectJpaEntity toJpaEntity(Project domainEntity) { ... }
}
```

## 패키지 구조 네이밍 (기존 구조 유지)

### 도메인 레이어 (기존 패턴 유지)
```
com.aiportfolio.backend.domain
├── portfolio/
│   ├── model/
│   │   ├── Project.java                # 도메인 모델 (기존)
│   │   ├── Experience.java             # 도메인 모델 (기존)
│   │   └── Education.java              # 도메인 모델 (기존)
│   └── port/
│       ├── in/                         # Primary Port (Use Cases)
│       └── out/                        # Secondary Port (Repository)
└── chatbot/
    ├── model/
    └── port/
```

### 인프라 레이어 (Portfolio 통합 Repository 구조)
```
com.aiportfolio.backend.infrastructure
├── persistence/
│   └── postgres/
│       ├── entity/                     # 새로 추가
│       │   ├── ProjectJpaEntity.java   # JPA 엔티티
│       │   ├── ExperienceJpaEntity.java
│       │   ├── EducationJpaEntity.java
│       │   └── CertificationJpaEntity.java
│       ├── repository/                 # 새로 추가 (각 엔티티별)
│       │   ├── ProjectJpaRepository.java
│       │   ├── ExperienceJpaRepository.java
│       │   ├── EducationJpaRepository.java
│       │   └── CertificationJpaRepository.java
│       ├── mapper/                     # 새로 추가 (각 엔티티별)
│       │   ├── ProjectMapper.java
│       │   ├── ExperienceMapper.java
│       │   ├── EducationMapper.java
│       │   └── CertificationMapper.java
│       └── PostgresPortfolioRepository.java  # 통합 Repository (수정)
├── web/                                # 기존 유지
└── external/                           # 기존 유지
```

## 클래스 네이밍 규칙

### Repository 계층
```java
// 도메인 포트 (인터페이스)
public interface PortfolioRepositoryPort { ... }

// JPA Repository (Spring Data)
public interface ProjectJpaRepository extends JpaRepository<ProjectJpaEntity, String> { ... }

// 어댑터 구현체
@Repository
public class PostgresPortfolioRepository implements PortfolioRepositoryPort { ... }
```

### Service 계층
```java
// 도메인 서비스
public class PortfolioDomainService { ... }

// 애플리케이션 서비스
@Service
public class PortfolioApplicationService { ... }

// Use Case 인터페이스
public interface GetPortfolioUseCase { ... }
```

### Controller 계층
```java
// REST Controller
@RestController
public class PortfolioController { ... }

// DTO 클래스
public class PortfolioResponse { ... }
public class ProjectRequest { ... }
```

## 메서드 네이밍 규칙

### Repository 메서드 (기존 패턴 유지)
```java
// 도메인 포트 (기존 시그니처 유지)
public interface PortfolioRepositoryPort {
    List<Project> findAllProjects();                 # 도메인 모델 반환
    Optional<Project> findProjectById(String id);
}

// JPA Repository (새로 추가)
public interface ProjectJpaRepository {
    List<ProjectJpaEntity> findByType(String type);  # JPA 엔티티 반환
    List<ProjectJpaEntity> findByIsTeam(boolean isTeam);
}
```

### 매퍼 메서드
```java
public class ProjectMapper {
    // 도메인 → JPA
    public ProjectJpaEntity toJpaEntity(Project domainModel) { ... }
    
    // JPA → 도메인
    public Project toDomain(ProjectJpaEntity jpaEntity) { ... }
    
    // 리스트 변환
    public List<Project> toDomainList(List<ProjectJpaEntity> jpaEntities) { ... }
    public List<ProjectJpaEntity> toJpaEntityList(List<Project> domainModels) { ... }
}
```

## 테이블 및 컬럼 네이밍

### 테이블 네이밍 (snake_case)
```sql
-- 메인 테이블
CREATE TABLE projects (...);
CREATE TABLE experiences (...);
CREATE TABLE educations (...);
CREATE TABLE certifications (...);

-- 연관 테이블
CREATE TABLE project_technologies (...);
CREATE TABLE project_contributions (...);
```

### 컬럼 네이밍 (snake_case)
```sql
CREATE TABLE projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    github_url VARCHAR(500),        -- URL 필드
    live_url VARCHAR(500),
    start_date DATE NOT NULL,       -- 날짜 필드
    end_date DATE,
    is_team BOOLEAN DEFAULT FALSE,  -- boolean 필드는 is_ 접두사
    created_at TIMESTAMP,           -- 시간 필드는 _at 접미사
    updated_at TIMESTAMP
);
```

## 변수 네이밍 규칙

### Java 변수 (camelCase)
```java
// 도메인 엔티티
private String projectId;
private String githubUrl;
private LocalDate startDate;
private boolean isTeam;

// 컬렉션
private List<String> technologies;
private List<ProjectEntity> projects;

// 매퍼 변수
ProjectJpaEntity jpaEntity;
ProjectEntity domainEntity;
List<ProjectEntity> domainEntities;
```

## 상수 네이밍 규칙

### 상수 클래스
```java
public final class PortfolioConstants {
    // 테이블명
    public static final String TABLE_PROJECTS = "projects";
    public static final String TABLE_EXPERIENCES = "experiences";
    
    // 컬럼명
    public static final String COLUMN_PROJECT_ID = "project_id";
    public static final String COLUMN_GITHUB_URL = "github_url";
    
    // 캐시 키
    public static final String CACHE_PROJECTS = "portfolio:projects";
    public static final String CACHE_EXPERIENCES = "portfolio:experiences";
}
```

## 예외 클래스 네이밍

### 도메인 예외
```java
// 도메인 예외
public class ProjectNotFoundException extends DomainException { ... }
public class InvalidProjectDataException extends DomainException { ... }

// 인프라 예외
public class DatabaseConnectionException extends InfrastructureException { ... }
public class DataMigrationException extends InfrastructureException { ... }
```

## 테스트 클래스 네이밍

### 테스트 네이밍 규칙
```java
// 단위 테스트
public class ProjectMapperTest { ... }
public class ProjectJpaRepositoryTest { ... }

// 통합 테스트
public class PostgresPortfolioRepositoryIntegrationTest { ... }
public class PortfolioControllerIntegrationTest { ... }

// 테스트 메서드
@Test
void shouldReturnProjectEntity_whenValidJpaEntityProvided() { ... }

@Test
void shouldThrowException_whenProjectIdNotFound() { ... }
```

## 파일 및 디렉토리 네이밍

### 설정 파일
```
application.yml                    # 메인 설정
application-dev.yml               # 개발 환경
application-prod.yml              # 프로덕션 환경
docker-compose.yml                # Docker 설정
```

### 마이그레이션 파일
```
V1__Create_projects_table.sql
V2__Create_experiences_table.sql
V3__Add_project_technologies_table.sql
```

이 네이밍 컨벤션을 따르면 코드의 가독성과 유지보수성이 크게 향상됩니다!## Pyth
on AI Service 네이밍 규칙 (Python 생태계 표준)

### 파일 및 모듈 네이밍
```python
# 파일명: snake_case (Python 표준)
chat_service.py
vector_search.py
embedding_service.py
rag_pipeline.py

# 디렉토리: snake_case
ai_service/
├── src/
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── vector_search.py
│   │   └── embedding_service.py
│   ├── models/
│   │   ├── chat_models.py
│   │   └── vector_models.py
│   └── utils/
└── tests/
```

### 클래스 네이밍 (PascalCase)
```python
# 서비스 클래스
class ChatService:
    pass

class VectorSearchService:
    pass

class EmbeddingService:
    pass

# 모델 클래스 (Pydantic)
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    confidence_score: float
```

### 함수 및 변수 네이밍 (snake_case)
```python
# 함수명
async def process_chat_message(request: ChatRequest) -> ChatResponse:
    pass

async def search_similar_vectors(query_vector: List[float]) -> List[SearchResult]:
    pass

def generate_embeddings(text: str) -> List[float]:
    pass

# 변수명
user_message = request.message
query_vector = embedding_service.generate(user_message)
search_results = await vector_db.search(query_vector)
```

### 상수 네이밍 (UPPER_SNAKE_CASE)
```python
# 설정 상수
MAX_CONTEXT_LENGTH = 4000
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
QDRANT_COLLECTION_NAME = "portfolio"
CACHE_TTL_SECONDS = 3600

# 환경변수
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
```

### API 엔드포인트 네이밍 (kebab-case)
```python
# FastAPI 라우터
@app.post("/ai/chat")
async def process_chat(request: ChatRequest) -> ChatResponse:
    pass

@app.post("/ai/embeddings/generate")
async def generate_embeddings(request: EmbeddingRequest) -> EmbeddingResponse:
    pass

@app.get("/ai/health-check")
async def health_check() -> HealthResponse:
    pass
```

## Frontend 네이밍 규칙 (기존 FSD 패턴 유지)

### 컴포넌트 네이밍 (PascalCase)
```typescript
// React 컴포넌트
export const ChatInterface: React.FC = () => { ... }
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => { ... }
export const VectorSearchResults: React.FC = () => { ... }
```

### 파일 네이밍 (camelCase - 기존 패턴 유지)
```
src/
├── features/
│   ├── aiChatbot/              # AI 챗봇 기능
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── MessageBubble.tsx
│   │   ├── services/
│   │   │   └── aiChatService.ts
│   │   └── types.ts
│   └── vectorSearch/           # 벡터 검색 기능 (필요시)
└── shared/
    ├── services/
    │   └── aiApiClient.ts      # AI 서비스 API 클라이언트
    └── types/
        └── aiTypes.ts          # AI 관련 타입 정의
```

### TypeScript 타입 네이밍
```typescript
// 인터페이스: PascalCase + Interface 접미사 (선택)
interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isFromAI: boolean;
}

// 타입: PascalCase
type ChatStatus = 'idle' | 'loading' | 'success' | 'error';
type VectorSearchResult = {
  content: string;
  score: number;
  metadata: Record<string, any>;
};

// Enum: PascalCase
enum ChatResponseType {
  SUCCESS = 'success',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited'
}
```

## 데이터베이스 네이밍 (기존 패턴 유지)

### 테이블 네이밍 (snake_case)
```sql
-- 기존 테이블 (유지)
projects
experiences  
educations
certifications

-- 새로운 AI 관련 테이블
chat_conversations
vector_embeddings
ai_service_logs
```

### 컬럼 네이밍 (snake_case)
```sql
-- 기존 패턴 유지
CREATE TABLE projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    github_url VARCHAR(500),
    start_date DATE NOT NULL,
    is_team BOOLEAN DEFAULT FALSE
);

-- AI 관련 새 테이블
CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 환경변수 네이밍 규칙

### Java Backend (기존 패턴 유지)
```bash
# Spring Boot 패턴
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ai_portfolio
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# 앱 설정 (기존 패턴)
GEMINI_API_KEY=your_gemini_key
GITHUB_USERNAME=Yamang02
```

### Python AI Service (Python 표준)
```bash
# Python 서비스용
QDRANT_API_KEY=your_qdrant_key
QDRANT_URL=https://your-cluster.qdrant.tech
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT=ai-portfolio-chatbot

# FastAPI 설정
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
FASTAPI_DEBUG=false
```

### Docker Compose 서비스명 (kebab-case)
```yaml
services:
  postgres:          # 기존 유지
  frontend:          # 기존 유지  
  backend:           # 기존 유지
  ai-service:        # 새로 추가 (kebab-case)
  redis:             # 새로 추가
  vector-db:         # 로컬 개발용 (선택)
```

이렇게 하면 각 언어와 생태계의 표준을 따르면서도 일관성을 유지할 수 있습니다!##
 Import 네이밍 및 정리 규칙

### Import 그룹 순서 (Java)

1. **도메인 레이어**: `com.aiportfolio.backend.domain.*`
2. **인프라 레이어**: `com.aiportfolio.backend.infrastructure.*`  
3. **외부 라이브러리**: `lombok.*`, `org.springframework.*`
4. **Java 표준**: `java.util.*`, `java.time.*`

### 와일드카드 네이밍 규칙

**패키지별 와일드카드 사용:**
```java
// ✅ 권장: 관련 클래스들 그룹화
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;

// ❌ 비권장: 너무 광범위한 와일드카드
import com.aiportfolio.backend.infrastructure.*;
```

### 주석 네이밍 표준

**그룹별 주석 형식:**
```java
// 도메인 모델 imports
// 인프라 레이어 imports
// 외부 라이브러리 imports  
// Java 표준 라이브러리 imports
```

### 특수 케이스 처리

**JPA 관련 imports:**
```java
// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
```

**Lombok imports:**
```java
// 외부 라이브러리 imports
import lombok.*;
```

이 규칙을 따르면 모든 Java 파일에서 일관된 import 구조를 유지할 수 있습니다.