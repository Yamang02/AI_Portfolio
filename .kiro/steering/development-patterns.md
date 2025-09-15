---
inclusion: always
---

# 개발 패턴 및 모범 사례

## 헥사고날 아키텍처 패턴

### 도메인 격리 원칙
```java
// ❌ 잘못된 예: 도메인 간 직접 의존
class ChatApplicationService {
    private final ProjectRepositoryPort projectRepositoryPort; // 직접 의존
}

// ✅ 올바른 예: 포트를 통한 격리
class ChatApplicationService {
    private final ContextBuilderPort contextBuilderPort; // 추상화된 포트
}
```

### 포트와 어댑터 패턴
```java
// 도메인 포트 (인터페이스)
public interface PortfolioRepositoryPort {
    List<Project> findAllProjects();
}

// 인프라 어댑터 (구현체)
@Repository
public class PostgresPortfolioRepository implements PortfolioRepositoryPort {
    // 실제 PostgreSQL 구현
}
```

### 매퍼 패턴 (도메인 ↔ JPA 엔티티 분리)
```java
@Component
public class ProjectMapper {
    public Project toDomain(ProjectJpaEntity jpaEntity) {
        return Project.builder()
            .id(jpaEntity.getBusinessId())  // business_id → domain.id
            .title(jpaEntity.getTitle())
            .build();
    }
    
    public ProjectJpaEntity toJpaEntity(Project domainModel) {
        ProjectJpaEntity jpaEntity = new ProjectJpaEntity();
        jpaEntity.setBusinessId(domainModel.getId());  // domain.id → business_id
        jpaEntity.setTitle(domainModel.getTitle());
        return jpaEntity;
    }
}
```

## API 설계 패턴

### 표준 응답 형식
```java
// 성공 응답
return ResponseEntity.ok(ApiResponse.success(data, "성공 메시지"));

// 비즈니스 로직 오류 (200 OK + success: false)
return ResponseEntity.ok(ApiResponse.error("비즈니스 오류 메시지"));

// 시스템 오류 (적절한 HTTP 상태 코드)
return ResponseEntity.internalServerError()
    .body(ApiResponse.error("시스템 오류 메시지"));
```

### ResponseType 시스템
```java
public enum ChatResponseType {
    SUCCESS,           // 정상 응답
    RATE_LIMITED,      // 사용량 제한
    CANNOT_ANSWER,     // 답변 불가
    PERSONAL_INFO,     // 개인정보 요청
    INVALID_INPUT,     // 잘못된 입력
    SYSTEM_ERROR,      // 시스템 오류
    SPAM_DETECTED      // 스팸 감지
}
```

## 데이터 모델 패턴

### 이중 ID 체계
```java
// JPA 엔티티 (인프라 레이어)
@Entity
@Table(name = "projects")
public class ProjectJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // DB 내부 ID (자동 증가)
    
    @Column(name = "business_id", unique = true)
    private String businessId;  // 비즈니스 ID (PJT001)
}

// 도메인 모델 (도메인 레이어)
public class Project {
    private String id;  // 비즈니스 ID (PJT001) - 프론트엔드와 통신
}
```

### Bean Validation 패턴
```java
public class Project {
    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 200, message = "프로젝트 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotNull(message = "기술 스택은 필수입니다")
    @Size(min = 1, message = "최소 1개 이상의 기술 스택이 필요합니다")
    private List<String> technologies;
}
```

## 에러 처리 패턴

### 하이브리드 오류 처리
```java
@RestController
public class ChatController {
    
    @PostMapping("/api/chat/message")
    public ResponseEntity<ApiResponse<ChatResponseDto>> sendMessage(@RequestBody ChatRequestDto request) {
        try {
            // 비즈니스 로직 검증
            if (!isValidInput(request)) {
                // 비즈니스 로직 오류: 200 OK + success: false
                return ResponseEntity.ok(ApiResponse.error("잘못된 입력입니다"));
            }
            
            // 정상 처리
            ChatResponse response = chatService.processChat(request);
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            // 시스템 오류: 적절한 HTTP 상태 코드
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("시스템 오류가 발생했습니다"));
        }
    }
}
```

### 계층별 예외 처리
```java
// 도메인 예외
public class ProjectNotFoundException extends DomainException {
    public ProjectNotFoundException(String projectId) {
        super("프로젝트를 찾을 수 없습니다: " + projectId);
    }
}

// 인프라 예외
public class DatabaseConnectionException extends InfrastructureException {
    public DatabaseConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 서비스 레이어 패턴

### Application Service 패턴
```java
@Service
@RequiredArgsConstructor
public class PortfolioApplicationService implements GetProjectsUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public List<Project> getAllProjects() {
        try {
            List<Project> projects = portfolioRepositoryPort.findAllProjects();
            log.info("프로젝트 조회 완료: {} 개", projects.size());
            return projects;
        } catch (Exception e) {
            log.error("프로젝트 조회 중 오류 발생", e);
            throw new ProjectRetrievalException("프로젝트 조회 실패", e);
        }
    }
}
```

### 도메인 서비스 격리 패턴
```java
// ContextBuilderPort를 통한 도메인 격리
@Service
@RequiredArgsConstructor
public class ContextBuilderService implements ContextBuilderPort {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public String buildFullPortfolioContext() {
        List<Project> projects = portfolioRepositoryPort.findAllProjects();
        // 도메인 모델을 문자열 컨텍스트로 변환하여 격리
        return convertToContext(projects);
    }
}
```

## 프론트엔드 패턴 (FSD)

### Feature-Sliced Design 구조
```typescript
// entities: 비즈니스 도메인 모델
export interface Project extends BaseItem {
  title: string;
  description: string;
  technologies: string[];
  type: 'project' | 'experience';
}

// shared: 공통 유틸리티
export const apiClient = {
  async post<T>(url: string, data: any): Promise<T> {
    // 공통 API 클라이언트 로직
  }
};

// features: 독립적 기능 단위
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // 프로젝트 카드 컴포넌트
};
```

### 타입 안전성 패턴
```typescript
// 엄격한 타입 정의
export type ResponseType = 
  | 'SUCCESS'
  | 'RATE_LIMITED'
  | 'CANNOT_ANSWER'
  | 'PERSONAL_INFO'
  | 'INVALID_INPUT'
  | 'SYSTEM_ERROR'
  | 'SPAM_DETECTED';

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
```

## 캐싱 패턴

### Repository 레벨 캐싱
```java
@Repository
public class PostgresPortfolioRepository implements PortfolioRepositoryPort {
    
    private LocalDateTime lastCacheTime;
    private static final long CACHE_DURATION_MINUTES = 60;
    
    @Override
    public List<Project> findAllProjects() {
        if (!isCacheValid()) {
            // 캐시 무효화 시 DB에서 새로 조회
            refreshCache();
        }
        return cachedProjects;
    }
}
```

### GitHub API 캐싱
```typescript
class GitHubService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
  
  async getProjectInfo(repoName: string) {
    const cached = this.cache.get(repoName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    // API 호출 및 캐시 업데이트
    const data = await this.fetchFromGitHub(repoName);
    this.cache.set(repoName, { data, timestamp: Date.now() });
    return data;
  }
}
```

## 테스트 패턴

### 단위 테스트 패턴
```java
@ExtendWith(MockitoExtension.class)
class ProjectMapperTest {
    
    @Test
    void shouldMapJpaEntityToDomain() {
        // Given
        ProjectJpaEntity jpaEntity = createTestJpaEntity();
        
        // When
        Project domain = projectMapper.toDomain(jpaEntity);
        
        // Then
        assertThat(domain.getId()).isEqualTo(jpaEntity.getBusinessId());
        assertThat(domain.getTitle()).isEqualTo(jpaEntity.getTitle());
    }
}
```

### 통합 테스트 패턴
```java
@SpringBootTest
@Testcontainers
class PostgresPortfolioRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("test_db")
            .withUsername("test")
            .withPassword("test");
    
    @Test
    void shouldFindAllProjects() {
        // 실제 PostgreSQL 컨테이너를 사용한 통합 테스트
    }
}
```

## 성능 최적화 패턴

### 지연 로딩 패턴
```typescript
// React.lazy를 통한 코드 스플리팅
const HistoryPanel = React.lazy(() => import('./HistoryPanel'));

// 조건부 렌더링으로 불필요한 컴포넌트 로딩 방지
{isHistoryPanelOpen && (
  <Suspense fallback={<div>Loading...</div>}>
    <HistoryPanel />
  </Suspense>
)}
```

### 메모이제이션 패턴
```typescript
// React.memo로 불필요한 리렌더링 방지
export const ProjectCard = React.memo<ProjectCardProps>(({ project, onMouseEnter, onMouseLeave }) => {
  // 컴포넌트 로직
});

// useMemo로 비싼 계산 캐싱
const sortedProjects = useMemo(() => {
  return projects.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}, [projects]);
```

## 보안 패턴

### 입력 검증 패턴
```java
@Service
public class InputValidationService {
    
    public ValidationResult validateInput(String input) {
        // 길이 검증
        if (input.length() > MAX_LENGTH) {
            return ValidationResult.invalid("입력이 너무 깁니다");
        }
        
        // 스팸 패턴 검증
        if (containsSpamPattern(input)) {
            return ValidationResult.spam("스팸으로 감지되었습니다");
        }
        
        return ValidationResult.valid();
    }
}
```

### API 키 보안 패턴
```yaml
# application.yml
app:
  gemini:
    api-key: ${GEMINI_API_KEY:}  # 환경변수로 관리
  github:
    username: ${GITHUB_USERNAME:Yamang02}
```

이러한 패턴들을 따르면 일관되고 유지보수하기 쉬운 코드를 작성할 수 있습니다.##
 Import 관리 패턴

### Java Import 컨벤션

**표준 그룹 순서:**
```java
// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.*;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.*;

// 외부 라이브러리 imports
import lombok.*;
import org.springframework.stereotype.Component;

// Java 표준 라이브러리 imports
import java.util.*;
import java.time.*;
```

### 와일드카드 사용 기준

**✅ 사용 권장:**
- 같은 패키지에서 3개 이상 import
- 관련 클래스들의 집합 (Entity, Mapper, Repository)

**❌ 사용 금지:**
- 1-2개만 import하는 경우
- 클래스명 충돌 가능성이 있는 경우

### 코드 품질 향상

**주석으로 그룹 구분:**
```java
// 도메인 모델 imports
// 인프라 레이어 imports  
// 외부 라이브러리 imports
// Java 표준 라이브러리 imports
```

**IDE 자동화 활용:**
- IntelliJ: `Ctrl+Alt+O` (import 최적화)
- Eclipse: `Ctrl+Shift+O` (import 정리)

이 패턴을 따르면 코드 리뷰 시 가독성이 크게 향상됩니다.