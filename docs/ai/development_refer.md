# AI Portfolio - 개발 참고 가이드

> **목적**: AI Agent가 개발 시 참고할 핵심 원칙, 패턴, 의사결정 맥락을 정리한 문서입니다.
> 
> **업데이트 규칙**: conversation_log에 새로운 개발 내용 추가 시, 이 문서에 반영할 핵심 정보가 있는지 검토 필요
> 
> **마지막 업데이트**: 2025-08-14 - 헥사고날 아키텍처 완성 및 Application Layer 도메인별 분리

## 📋 AI Agent 행동강령

### 🔍 conversation_log 업데이트 시 필수 검토사항
AI Agent는 conversation_log에 새로운 대화 내용을 추가할 때마다 다음을 반드시 확인해야 합니다:

#### ✅ development_refer.md 업데이트 대상 식별
다음 유형의 내용이 포함된 경우 이 문서에 추가 검토:

1. **🏗️ 아키텍처 결정**
   - 새로운 아키텍처 패턴 도입
   - 기존 구조 변경 및 그 이유
   - 설계 원칙 변경

2. **📋 개발 패턴 확립**
   - 새로운 코딩 패턴 도입
   - API 설계 규칙 변경
   - 타입 정의 방식 개선

3. **🤖 AI 관련 인사이트**
   - 프롬프트 엔지니어링 개선사항
   - RAG/벡터DB 도입 관련 결정
   - AI 모델 연동 방식 변경

4. **⚠️ 중요한 문제 해결**
   - 반복될 수 있는 함정과 해결책
   - 성능/보안 이슈 해결 방법
   - 배포/운영 관련 교훈

5. **🔧 도구 및 라이브러리 결정**
   - 새로운 라이브러리 도입 이유
   - 기존 도구 교체 및 마이그레이션
   - 빌드/배포 도구 변경

#### 📝 업데이트 프로세스
```
1. conversation_log 업데이트 완료 후
2. 위 5개 카테고리에 해당하는 내용 식별
3. development_refer.md의 해당 섹션에 핵심 정보 추가
4. 기존 내용과 중복되거나 outdated된 정보 정리
5. "마지막 업데이트" 날짜 갱신
```

---

## 🏗️ 아키텍처 원칙

### Frontend: FSD (Feature-Sliced Design)
**도입 이유**: 
- 복잡해지는 프론트엔드 구조의 체계적 관리
- 컴포넌트 간 의존성 명확화
- 확장성과 유지보수성 향상

**구조 원칙**:
```
src/
├── app/          # 애플리케이션 레이어 - 전역 설정, Provider
├── entities/     # 엔티티 레이어 - 비즈니스 도메인 모델  
├── features/     # 기능 레이어 - 독립적 기능 단위
└── shared/       # 공유 레이어 - 공통 유틸리티
```

**핵심 규칙**:
- 상위 레이어가 하위 레이어만 의존 (단방향 의존성)
- entities에서 모든 비즈니스 타입 통합 관리
- 각 레이어의 단일 책임 원칙 준수

### Backend: 헥사고날 아키텍처 (완료)
**현재 상태**: 헥사고날 아키텍처 (포트 & 어댑터) + 도메인별 Application Layer 분리 ✅
**이전 상태**: 레이어드 아키텍처

**전환 이유**:
- 벡터DB/RAG 도입 시 외부 의존성 추상화 필요
- 다양한 AI 서비스 (Gemini, OpenAI 등) 유연한 교체
- 비즈니스 로직과 인프라 계층 분리
- 테스트 용이성 및 확장성 확보

**완료된 단계**:
1. ✅ Repository 패턴 도입 - ProjectRepository 포트 및 JsonProjectRepository 어댑터
2. ✅ 도메인 서비스 분리 - ChatService, LLMPort, PromptPort, QuestionAnalysisPort
3. ✅ 포트/어댑터 구조 적용 - GeminiLLMAdapter, JsonPromptAdapter, RuleBasedQuestionAnalysisAdapter
4. ✅ DDD 원칙 적용 - 도메인 모델 리팩토링 및 PostgreSQL 마이그레이션 준비
5. ✅ 도메인 모델과 인프라스트럭처 레이어 명확한 분리
6. ✅ **도메인 격리 및 Application Layer 분리** - Portfolio ↔ Chatbot 도메인 완전 분리

**현재 아키텍처 구조**:
```
domain/
├── portfolio/               # Portfolio 도메인
│   ├── model/              # 도메인 엔티티 (Project, Experience, Education, Certification)
│   ├── port/
│   │   ├── in/            # Primary Ports (GetProjectsUseCase, GetAllDataUseCase)
│   │   └── out/           # Secondary Ports (ProjectRepositoryPort)
└── chatbot/               # Chatbot 도메인
    ├── model/             # 채팅 관련 모델 (ChatRequest, ChatResponse, enums)
    └── port/
        ├── in/            # Primary Ports (ChatUseCase)
        └── out/           # Secondary Ports (AIServicePort, ContextBuilderPort, LLMPort)

application/
├── portfolio/             # Portfolio 도메인 Application Layer
│   ├── PortfolioApplicationService.java
│   ├── ProjectApplicationService.java  
│   └── GitHubIntegrationService.java
├── chatbot/              # Chatbot 도메인 Application Layer
│   ├── ChatApplicationService.java
│   ├── service/
│   │   ├── ContextBuilderService.java    # 도메인 격리 핵심 서비스
│   │   ├── ai/ (AIService, PromptService)
│   │   └── analysis/ (QuestionAnalysisService)
│   └── validation/ (InputValidationService, SpamProtectionService)
└── common/               # 공통 유틸리티
    └── PromptConverter.java

infrastructure/           # 기술 구현 (어댑터)
├── persistence/         # 데이터 저장소 어댑터
│   └── postgres/entity/ # PostgreSQL 엔티티
├── external/           # 외부 API 어댑터 (Gemini, GitHub)
└── web/               # 웹 어댑터
    └── dto/           # API 입출력 객체
```

**🔥 도메인 격리 핵심 원칙 (2025-08-14 완성)**:
- **도메인 간 직접 의존성 금지**: Chatbot 도메인이 Portfolio 도메인 모델을 직접 사용 불가
- **ContextBuilderPort를 통한 격리**: Portfolio 데이터를 문자열 컨텍스트로 변환하여 Chatbot에 전달
- **포트를 통한 느슨한 결합**: 각 도메인이 포트 인터페이스를 통해서만 상호작용
- **Application Layer 도메인별 분리**: 각 도메인의 Application 서비스들을 별도 패키지로 구성

**데이터 흐름**:
```
Portfolio 도메인: Infrastructure (Web) → Application → Domain → Infrastructure (DB/GitHub)
Chatbot 도메인:   Infrastructure (Web) → Application → ContextBuilderPort → Portfolio 도메인
                                                   → AIServicePort → Gemini API
```

**새로운 아키텍처 원칙**:
- **도메인 모델 순수성**: 프레임워크나 외부 의존성 없이 순수한 비즈니스 로직만 포함
- **도메인 격리**: 도메인 간 직접 결합 제거, 포트를 통한 추상화된 상호작용
- **단일 책임 원칙**: 각 Application 서비스가 명확한 책임 영역 보유
- **의존성 역전**: 모든 의존성이 Domain → Application → Infrastructure 방향 준수
- **이중 ID 체계**: `dbId` (Long, DB 내부용) + `businessId` (String, 비즈니스용)
- **프론트엔드 호환성**: 기존 API 응답 구조 유지로 프론트엔드 변경 불필요

## 📋 개발 패턴 & 규칙

### 🆕 **도메인 격리 설계 원칙** (2025-08-14 추가)
**목적**: 도메인 간 강결합을 방지하고 각 도메인의 독립성을 보장

**핵심 패턴**:
1. **ContextBuilderPort 패턴**: 도메인 간 데이터 교환을 문자열 컨텍스트로 추상화
   ```java
   // ❌ 직접 의존: ChatService → ProjectRepositoryPort
   // ✅ 포트를 통한 격리: ChatService → ContextBuilderPort → ContextBuilderService
   ```

2. **도메인별 Application 패키지 분리**:
   ```
   application/
   ├── portfolio/     # Portfolio 도메인 전용 Application 서비스
   ├── chatbot/       # Chatbot 도메인 전용 Application 서비스  
   └── common/        # 도메인 무관한 공통 유틸리티
   ```

3. **포트 인터페이스 설계 규칙**:
   - Primary Port (in): Use Case 인터페이스, 비즈니스 기능 정의
   - Secondary Port (out): 외부 의존성 추상화, 기술적 관심사 분리
   - 도메인 모델 대신 원시 타입이나 DTO 사용으로 격리 보장

4. **서비스 네이밍 규칙**:
   - `*ApplicationService`: 도메인의 메인 Application 서비스 (Use Case 구현)
   - `*IntegrationService`: 외부 시스템 통합 서비스 (GitHubIntegrationService)
   - `*ValidationService`: 검증 관련 서비스

### 🆕 **도메인 모델 설계 원칙** (2025-08-14 추가)
**목적**: 타입 안전성과 비즈니스 로직 집중을 위한 도메인 모델 설계

**핵심 원칙**:
1. **Enum 타입 시스템**: String 대신 의미있는 Enum 사용
   ```java
   // ❌ 기존: String type = "personal"
   // ✅ 신규: ProjectType type = ProjectType.PERSONAL
   ```

2. **날짜 타입 강화**: String → LocalDate로 변경
   ```java
   // ❌ 기존: String startDate = "2025-01-01"
   // ✅ 신규: LocalDate startDate = LocalDate.of(2025, 1, 1)
   ```

3. **Bean Validation**: 데이터 무결성 보장
   ```java
   @NotBlank(message = "프로젝트 제목은 필수입니다")
   @Size(max = 200, message = "프로젝트 제목은 200자를 초과할 수 없습니다")
   private String title;
   ```

4. **비즈니스 메서드**: 도메인 모델에 핵심 로직 집중
   ```java
   public boolean isOngoing() { return endDate == null; }
   public long getDurationInMonths() { /* 기간 계산 로직 */ }
   ```

### 🆕 **ID 체계 설계 원칙** (2025-08-14 추가)
**목적**: 데이터베이스 성능과 비즈니스 요구사항을 모두 만족하는 ID 체계

**이중 ID 체계**:
```java
// 엔티티 레벨
public class ProjectEntity {
    private Long dbId;        // DB 내부 ID (SERIAL, 1, 2, 3...)
    private String businessId; // 비즈니스 ID (PJT001, PJT002...)
}

// 도메인 모델 레벨 (프론트엔드와 통신)
public class Project {
    private String id;        // 비즈니스 ID (PJT001, PJT002...)
}
```

**ID 네이밍 규칙**:
- **PJT**: Project (PJT001, PJT002, ...)
- **EXP**: Experience (EXP001, EXP002, ...)
- **EDU**: Education (EDU001, EDU002, ...)
- **CRT**: Certification (CRT001, CRT002, ...)


### API 설계 패턴
**ApiResponse 표준화**:
```java
// 성공 응답
ApiResponse.success(data)
ApiResponse.success(data, "커스텀 메시지")

// 에러 응답  
ApiResponse.error("에러 메시지")
ApiResponse.error("메시지", "상세 에러")
```

**에러 처리 전략**:
- 비즈니스 로직 오류: HTTP 200 + success: false
- 시스템 오류: HTTP 4xx/5xx
- 프론트엔드에서 success 필드로 분기 처리

### 타입 정의 규칙
**위치 원칙**:
- **entities/**: 비즈니스 도메인 모델 (Project, Experience 등)
- **shared/types.ts**: entities에서 re-export만
- **features/*/types.ts**: 해당 기능 전용 타입만

**재사용 방식**:
```typescript
// entities에서 정의
export interface Project extends BaseItem { ... }

// shared에서 re-export  
export type { Project } from '../entities';

// features에서 import
import type { Project } from '../../entities';
```

## 🤖 AI 관련 핵심 사항

### 프롬프트 엔지니어링 규칙
**시스템 프롬프트 필수 포함사항**:
- 프로젝트 설명 시 개인/팀 구분 명시
- 팀 프로젝트는 개인 기여도 반드시 설명
- 컨텍스트 생성 시 isTeam/myContributions 정보 포함

**컨텍스트 관리**:
- 프로젝트별 맞춤 컨텍스트 생성
- GitHub API와 로컬 데이터 하이브리드 활용
- 매직 스트링 제거 (예: "I_CANNOT_ANSWER" → null 체크)

### GitHub API 연동 교훈
**핵심 패턴**:
- 24시간 캐시 유효기간 설정
- API 실패 시 로컬 데이터 폴백
- 프로젝트 제목-레포지토리명 매핑 시스템

**주요 함정**:
- 프로젝트명과 GitHub 레포명 불일치 문제
- README 파일 404 에러 처리
- API 호출 최적화 (불필요한 중복 호출 방지)

### RAG 도입 준비 현황
**아키텍처 준비 완료**:
- ✅ Repository 패턴으로 벡터DB 추상화 가능
- ✅ 포트-어댑터 패턴으로 다양한 AI 서비스 지원
- ✅ 도메인-인프라 분리로 비즈니스 로직 독립성 확보
- 🔄 문서 처리 파이프라인 (청킹, 임베딩, 검색) 설계 필요

**다음 단계 구현 예정**:
1. VectorRepository 포트 정의
2. ChromaDB/Pinecone 어댑터 구현
3. DocumentProcessingPort 및 어댑터
4. 하이브리드 검색 서비스 (키워드 + 벡터)

**기술 스택 후보**:
- 벡터DB: Pinecone, Weaviate, ChromaDB
- 임베딩: OpenAI, Cohere, HuggingFace
- 검색 최적화: 하이브리드 검색 (키워드 + 벡터)

## 🚀 배포 & 운영

### Docker 멀티스테이지 패턴
**통합 배포 구조**:
```dockerfile
# 프론트엔드 빌드 → 백엔드에 정적 파일 서빙
# 단일 컨테이너로 CORS 문제 해결
# 포트 8080 통합 사용
```

**핵심 이점**:
- 단일 서비스 관리로 비용 효율성
- CORS 문제 자연 해결
- 배포 복잡성 감소

### 환경 변수 관리
**보안 원칙**:
- API 키는 GitHub Secrets 사용
- Secret Manager 의존성 제거로 배포 단순화
- 프론트엔드 번들에 API 키 노출 금지

**설정 패턴**:
- 개발: 프론트(5173) + 백엔드(8080) 분리
- 프로덕션: 백엔드(8080) 단일 포트
- 상대 경로 API 호출로 환경 무관 동작

### CI/CD 파이프라인
**GitHub Actions 구조**:
- Eclipse Temurin 이미지 사용
- npm workspaces 제거로 빌드 안정성 확보
- 단계별 작업 디렉토리 명시

## ⚠️ 주요 함정과 해결책

### 도메인 간 결합 방지
**문제**: Application Service가 다른 도메인의 Repository나 Model을 직접 의존
**해결**: 
- ContextBuilderPort와 같은 추상화 포트 생성
- 도메인 모델 대신 문자열이나 원시 타입으로 데이터 교환
- 각 도메인의 Application 서비스를 별도 패키지로 분리

**실제 사례**:
```java
// ❌ 문제: ChatApplicationService가 Portfolio 도메인에 직접 의존
class ChatApplicationService {
    private final ProjectRepositoryPort projectRepositoryPort; // 직접 의존
    private final List<Project> projects = projectRepositoryPort.findAll(); // 도메인 모델 직접 사용
}

// ✅ 해결: 포트를 통한 격리
class ChatApplicationService {
    private final ContextBuilderPort contextBuilderPort; // 추상화된 포트
    private final String context = contextBuilderPort.buildFullPortfolioContext(); // 문자열로 격리
}
```

### 순환 참조 방지
**문제**: FSD 구조에서 레이어 간 순환 참조
**해결**: 
- entities → shared → features 단방향 의존성 엄수
- barrel exports로 깔끔한 import 구조
- appConfig 직접 참조 제거

### CORS 문제 해결
**개발 환경**: 프록시 설정 또는 CORS 헤더 설정
**프로덕션**: 동일 오리진 서빙으로 근본 해결

### 캐싱 전략
**API 응답 캐싱**: 
- GitHub API: 24시간 TTL
- 프로젝트 데이터: 메모리 캐싱
- 빌드 결과물: CDN 캐싱 활용

### 성능 최적화
**핵심 원칙**:
- 불필요한 리렌더링 방지 (React.memo, useMemo)
- API 호출 최적화 (중복 호출 방지)
- 번들 크기 최적화 (Tree shaking, Code splitting)

