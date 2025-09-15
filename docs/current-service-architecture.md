# 현재 브랜치 서비스 구성도

## 전체 시스템 아키텍처

현재 브랜치에서는 프론트엔드, 백엔드, AI 서비스로 구성된 풀스택 포트폴리오 시스템이 구현되어 있습니다.

```mermaid
graph TB
    %% 사용자 인터페이스
    subgraph UI ["사용자 인터페이스"]
        Frontend[React Frontend<br/>포트폴리오 웹사이트<br/>TypeScript + Vite]
        Chatbot[AI 챗봇 인터페이스<br/>React 컴포넌트]
    end

    %% 백엔드 서비스
    subgraph Backend ["백엔드 서비스"]
        SpringBackend[Spring Boot Backend<br/>Java 17 + Spring Boot 3.2.0<br/>REST API 서버]
        FastAPIService[FastAPI AI Service<br/>Python + 헥사고날 아키텍처<br/>RAG 챗봇 서비스]
    end

    %% 데이터베이스 및 스토리지
    subgraph Storage ["데이터베이스 및 스토리지"]
        PostgreSQL[(PostgreSQL<br/>Railway DB<br/>포트폴리오 데이터)]
        Redis[(Redis<br/>캐시 및 세션)]
        Qdrant[(Qdrant<br/>벡터 데이터베이스<br/>문서 임베딩)]
    end

    %% 외부 서비스
    subgraph External ["외부 서비스"]
        GeminiAPI[Google Gemini API<br/>LLM 서비스<br/>LangChain4j 통합]
        CloudRun[Google Cloud Run<br/>컨테이너 배포]
        GitHub[GitHub<br/>소스 코드 관리]
    end

    %% CI/CD 파이프라인
    subgraph CICD ["CI/CD 파이프라인"]
        GitHubActions[GitHub Actions<br/>자동화 파이프라인]
        Docker[Docker<br/>컨테이너화]
    end

    %% 데이터 흐름
    Frontend --> SpringBackend
    Frontend --> FastAPIService
    Chatbot --> FastAPIService

    SpringBackend --> PostgreSQL
    SpringBackend --> Redis
    FastAPIService --> PostgreSQL
    FastAPIService --> Redis
    FastAPIService --> Qdrant
    FastAPIService --> GeminiAPI

    %% 배포 흐름
    GitHub --> GitHubActions
    GitHubActions --> Docker
    Docker --> CloudRun

    %% 스타일링
    classDef ui fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef storage fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef cicd fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class Frontend,Chatbot ui
    class SpringBackend,FastAPIService backend
    class PostgreSQL,Redis,Qdrant storage
    class GeminiAPI,CloudRun,GitHub external
    class GitHubActions,Docker cicd
```

## 서비스별 상세 구성

### 1. 프론트엔드 (React + TypeScript)

```mermaid
graph TB
    subgraph Frontend ["프론트엔드 아키텍처"]
        subgraph Components ["컴포넌트 구조"]
            App[App.tsx<br/>메인 애플리케이션]
            Header[Header.tsx<br/>네비게이션]
            HeroSection[HeroSection.tsx<br/>메인 섹션]
            Chatbot[Chatbot.tsx<br/>AI 챗봇]
            ProjectCard[ProjectCard.tsx<br/>프로젝트 카드]
            Modal[Modal 컴포넌트<br/>ContactModal, ProjectModal]
        end

        subgraph Features ["기능별 모듈"]
            ChatbotFeature[챗봇 기능<br/>chatbotService.ts]
            ProjectsFeature[프로젝트 기능<br/>PortfolioSection.tsx]
            HistoryPanel[히스토리 패널<br/>ExperienceCard, EducationCard]
        end

        subgraph Entities ["엔티티"]
            Project[Project 타입]
            Experience[Experience 타입]
            Education[Education 타입]
            Certification[Certification 타입]
        end

        subgraph Shared ["공유 모듈"]
            API[apiClient.ts<br/>API 통신]
            Utils[dateUtils.ts<br/>유틸리티]
            Config[app.config.ts<br/>설정]
        end
    end

    App --> Header
    App --> HeroSection
    App --> Chatbot
    App --> ProjectsFeature
    ProjectsFeature --> ProjectCard
    ProjectsFeature --> HistoryPanel
    HistoryPanel --> Experience
    HistoryPanel --> Education
    HistoryPanel --> Certification
    Chatbot --> API
    ProjectsFeature --> API
    API --> Utils
    API --> Config

    classDef component fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef feature fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef entity fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef shared fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class App,Header,HeroSection,Chatbot,ProjectCard,Modal component
    class ChatbotFeature,ProjectsFeature,HistoryPanel feature
    class Project,Experience,Education,Certification entity
    class API,Utils,Config shared
```

### 2. 백엔드 (Spring Boot)

```mermaid
graph TB
    subgraph Backend ["백엔드 아키텍처"]
        subgraph Controllers ["컨트롤러 레이어"]
            ChatController[ChatController<br/>챗봇 API]
            DataController[DataController<br/>데이터 API]
            GitHubController[GitHubController<br/>GitHub 연동]
            ProjectController[ProjectController<br/>프로젝트 API]
            PromptController[PromptController<br/>프롬프트 API]
        end

        subgraph Services ["서비스 레이어"]
            ChatService[ChatService<br/>챗봇 비즈니스 로직]
            ProjectService[ProjectService<br/>프로젝트 관리]
            GitHubService[GitHubService<br/>GitHub 연동]
            PromptService[PromptService<br/>프롬프트 관리]
        end

        subgraph Domain ["도메인 모델"]
            Chat[Chat 도메인]
            Portfolio[Portfolio 도메인]
            Project[Project 모델]
            Experience[Experience 모델]
            Education[Education 모델]
            Certification[Certification 모델]
        end

        subgraph Infrastructure ["인프라 레이어"]
            AIService[AI 서비스<br/>Gemini API 연동]
            Persistence[데이터 영속성<br/>JSON 파일 기반]
        end

        subgraph Config ["설정"]
            AppConfig[AppConfig<br/>애플리케이션 설정]
            WebConfig[WebConfig<br/>웹 설정]
        end
    end

    Controllers --> Services
    Services --> Domain
    Services --> Infrastructure
    Infrastructure --> AIService
    Infrastructure --> Persistence
    Controllers --> Config

    classDef controller fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef service fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef domain fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef infra fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef config fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class ChatController,DataController,GitHubController,ProjectController,PromptController controller
    class ChatService,ProjectService,GitHubService,PromptService service
    class Chat,Portfolio,Project,Experience,Education,Certification domain
    class AIService,Persistence infra
    class AppConfig,WebConfig config
```

### 3. AI 서비스 (FastAPI + 헥사고날 아키텍처)

```mermaid
graph TB
    subgraph AIService ["AI 서비스 아키텍처"]
        subgraph Adapters ["어댑터 레이어"]
            subgraph Primary ["1차 어댑터"]
                WebAdapter[웹 어댑터<br/>FastAPI 엔드포인트]
            end

            subgraph Secondary ["2차 어댑터"]
                LLMAdapter[LLM 어댑터<br/>Gemini API]
                VectorAdapter[벡터 어댑터<br/>Qdrant]
            end
        end

        subgraph Application ["애플리케이션 레이어"]
            ChatbotUseCase[챗봇 유스케이스<br/>RAG 파이프라인]
            DocumentUseCase[문서 처리 유스케이스]
        end

        subgraph Core ["코어 도메인"]
            ChatbotDomain[챗봇 도메인<br/>비즈니스 로직]
            PortfolioDomain[포트폴리오 도메인]
        end

        subgraph Ports ["포트 인터페이스"]
            LLMPort[LLM 포트<br/>AI 서비스 인터페이스]
            VectorPort[벡터 포트<br/>벡터 DB 인터페이스]
        end

        subgraph Services ["서비스 레이어"]
            DocumentService[문서 서비스<br/>로더, 스플리터, 검증기]
        end
    end

    WebAdapter --> Application
    Application --> Core
    Core --> Ports
    Ports --> LLMAdapter
    Ports --> VectorAdapter
    Application --> Services
    Services --> DocumentService

    classDef adapter fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef application fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef core fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef port fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class WebAdapter,LLMAdapter,VectorAdapter adapter
    class ChatbotUseCase,DocumentUseCase application
    class ChatbotDomain,PortfolioDomain core
    class LLMPort,VectorPort port
    class DocumentService service
```

## 데이터 흐름 시퀀스 다이어그램

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as React Frontend
    participant Backend as Spring Boot Backend
    participant AIService as FastAPI AI Service
    participant DB as PostgreSQL
    participant VectorDB as Qdrant
    participant LLM as Gemini API
    participant Cache as Redis

    %% 포트폴리오 조회 플로우
    User->>Frontend: 포트폴리오 조회
    Frontend->>Backend: GET /api/projects
    Backend->>DB: 프로젝트 데이터 조회
    DB-->>Backend: 프로젝트 정보
    Backend-->>Frontend: JSON 응답
    Frontend-->>User: 포트폴리오 표시

    %% AI 챗봇 질문 플로우
    User->>Frontend: AI 챗봇 질문
    Frontend->>AIService: POST /rag
    AIService->>Cache: 캐시 확인
    alt 캐시 히트
        Cache-->>AIService: 캐시된 답변
    else 캐시 미스
        AIService->>VectorDB: 유사 문서 검색
        VectorDB-->>AIService: 관련 문서들
        AIService->>LLM: 컨텍스트 기반 답변 생성
        LLM-->>AIService: AI 답변
        AIService->>Cache: 답변 캐싱
    end
    AIService-->>Frontend: RAG 답변
    Frontend-->>User: 챗봇 응답 표시

    %% GitHub 프로젝트 연동 플로우
    User->>Frontend: GitHub 프로젝트 요청
    Frontend->>Backend: GET /api/github/projects
    Backend->>GitHub: GitHub API 호출
    GitHub-->>Backend: 프로젝트 정보
    Backend->>DB: 프로젝트 정보 저장
    Backend-->>Frontend: GitHub 프로젝트 목록
    Frontend-->>User: GitHub 프로젝트 표시
```

## 기술 스택 상세

| 구성 요소 | 기술 스택 | 버전 | 주요 특징 |
|-----------|-----------|------|-----------|
| **프론트엔드** | React + TypeScript + Vite | React 19.1.0 | FSD 아키텍처, 반응형 디자인 |
| **백엔드** | Spring Boot + Java | Spring Boot 3.2.0, Java 17 | REST API, JPA, LangChain4j |
| **AI 서비스** | FastAPI + Python | FastAPI | 헥사고날 아키텍처, RAG 파이프라인 |
| **데이터베이스** | PostgreSQL + Redis + Qdrant | - | Railway PostgreSQL, Cloud Run Redis/Qdrant |
| **외부 서비스** | Google Gemini API | - | LLM 서비스, LangChain4j 통합 |
| **배포** | Google Cloud Run + Docker | - | 컨테이너 기반 클라우드 배포 |
| **CI/CD** | GitHub Actions | - | 자동화 파이프라인 |

## 현재 구현 상태

### ✅ 완료된 기능
- 프론트엔드 기본 구조 및 UI (React + TypeScript)
- 백엔드 REST API 서버 (Spring Boot)
- AI 서비스 헥사고날 아키텍처 (FastAPI)
- Docker 컨테이너화
- CI/CD 파이프라인
- Google Cloud Run 배포
- Railway PostgreSQL 데이터베이스 연동
- LangChain4j를 통한 Gemini API 연동

### 🚧 진행 중인 기능
- RAG 파이프라인 최적화
- 벡터 데이터베이스 연동
- 캐시 시스템 구현

### 📋 계획된 기능
- 사용자 인증 시스템
- 실시간 채팅 기능
- 모니터링 및 로깅
- 성능 최적화




