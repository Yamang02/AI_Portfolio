# AI 포트폴리오 시스템 구성도

## 전체 시스템 아키텍처

이 프로젝트는 프론트엔드, 백엔드, AI 서비스로 구성된 풀스택 포트폴리오 시스템입니다. 각 서비스는 Google Cloud Run에 배포되며, 데이터베이스는 Railway에서 관리됩니다.

```mermaid
graph TB
    %% 사용자 인터페이스
    subgraph UI ["사용자 인터페이스"]
        Frontend[React Frontend<br/>포트폴리오 웹사이트]
        GradioDemo[Gradio Demo<br/>AI 서비스 데모]
    end

    %% 백엔드 서비스
    subgraph Backend ["백엔드 서비스"]
        SpringBackend[Spring Boot Backend<br/>REST API 서버]
        FastAPIService[FastAPI AI Service<br/>헥사고날 아키텍처]
    end

    %% 데이터베이스 및 스토리지
    subgraph Storage ["데이터베이스 및 스토리지"]
        PostgreSQL[(PostgreSQL<br/>Railway DB)]
        Redis[(Redis<br/>캐시 및 세션)]
        Qdrant[(Qdrant<br/>벡터 데이터베이스)]
    end

    %% 외부 서비스
    subgraph External ["외부 서비스"]
        GeminiAPI[Google Gemini API<br/>LLM 서비스]
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
    GradioDemo --> FastAPIService

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

    class Frontend,GradioDemo ui
    class SpringBackend,FastAPIService backend
    class PostgreSQL,Redis,Qdrant storage
    class GeminiAPI,CloudRun,GitHub external
    class GitHubActions,Docker cicd
```

## 서비스별 상세 구성

### 1. 프론트엔드 (React)
- **기술 스택**: React, TypeScript, Vite
- **주요 기능**: 포트폴리오 웹사이트, AI 챗봇 인터페이스
- **아키텍처**: Feature-Sliced Design (FSD)
- **배포**: Google Cloud Run

### 2. 백엔드 (Spring Boot)
- **기술 스택**: Java, Spring Boot, JPA
- **주요 기능**: REST API, 사용자 관리, 프로젝트 정보 관리
- **아키텍처**: 레이어드 아키텍처
- **데이터베이스**: Railway PostgreSQL (클라우드)
- **캐시**: Redis
- **배포**: Google Cloud Run

### 3. AI 서비스 (FastAPI)
- **기술 스택**: Python, FastAPI, LangChain
- **주요 기능**: RAG 챗봇, 문서 처리, 벡터 검색
- **아키텍처**: 헥사고날 아키텍처 (Ports & Adapters)
- **벡터 DB**: Qdrant
- **LLM**: Google Gemini API
- **데이터베이스**: Railway PostgreSQL (클라우드)
- **배포**: Google Cloud Run

## 데이터 흐름 다이어그램

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

    User->>Frontend: 포트폴리오 조회
    Frontend->>Backend: GET /api/projects
    Backend->>DB: 프로젝트 데이터 조회
    DB-->>Backend: 프로젝트 정보
    Backend-->>Frontend: JSON 응답
    Frontend-->>User: 포트폴리오 표시

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
```

## 배포 아키텍처

```mermaid
graph LR
    subgraph CI ["CI/CD 파이프라인"]
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        DockerBuild[Docker Build]
        Tests[테스트 실행]
    end

    subgraph Deployment ["배포 환경"]
        CloudRun[Google Cloud Run<br/>컨테이너 서비스]
        RailwayDB[Railway<br/>PostgreSQL DB]
    end

    subgraph Services ["배포된 서비스"]
        FrontendProd[Frontend<br/>Cloud Run]
        BackendProd[Backend<br/>Cloud Run]
        AIServiceProd[AI Service<br/>Cloud Run]
    end

    GitHub --> Actions
    Actions --> DockerBuild
    DockerBuild --> Tests
    Tests --> CloudRun
    CloudRun --> Services
    Services --> RailwayDB

    classDef ci fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef deploy fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class GitHub,Actions,DockerBuild,Tests ci
    class CloudRun,RailwayDB deploy
    class FrontendProd,BackendProd,AIServiceProd service
```

## 기술 스택 요약

| 구성 요소 | 기술 스택 | 주요 특징 |
|-----------|-----------|-----------|
| **프론트엔드** | React + TypeScript + Vite | FSD 아키텍처, 반응형 디자인 |
| **백엔드** | Spring Boot + Java | REST API, JPA, 보안 |
| **AI 서비스** | FastAPI + Python | 헥사고날 아키텍처, RAG 파이프라인 |
| **데이터베이스** | PostgreSQL + Redis + Qdrant | Railway PostgreSQL (클라우드), Cloud Run Redis/Qdrant |
| **외부 서비스** | Google Gemini API | LLM 서비스 |
| **배포** | Google Cloud Run + Docker | 컨테이너 기반 클라우드 배포 |
| **CI/CD** | GitHub Actions | 자동화 파이프라인 |

## 구현 상태

### ✅ 완료된 기능
- 프론트엔드 기본 구조 및 UI
- 백엔드 REST API 서버
- AI 서비스 헥사고날 아키텍처
- Docker 컨테이너화
- CI/CD 파이프라인
- Google Cloud Run 배포
- Railway PostgreSQL 데이터베이스 연동

### 🚧 진행 중인 기능
- RAG 파이프라인 최적화
- 벡터 데이터베이스 연동
- 캐시 시스템 구현

### 📋 계획된 기능
- 사용자 인증 시스템
- 실시간 채팅 기능
- 모니터링 및 로깅
- 성능 최적화
