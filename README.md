# AI Portfolio

AI 포트폴리오는 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다.

## 🏗️ 서비스 구조

```mermaid
graph TB
    %% 사용자들
    User1[👤 포트폴리오 사용자]
    User2[👤 AI 데모 사용자]
    
    %% 프론트엔드
    Frontend[🌐 Frontend<br/>React + TypeScript<br/>Vite]
    
    %% 백엔드
    Backend[⚙️ Backend<br/>Spring Boot + Java<br/>REST API]
    
    %% 데이터베이스
    Database[(🗄️ Database<br/>PostgreSQL<br/>Railway)]
    
    %% AI 데모 서비스
    AIDemo[🤖 AI Service Demo<br/>FastAPI + Python<br/>Gradio Interface<br/>RAG Pipeline]
    
    %% 외부 서비스
    GeminiAPI[🔗 Google Gemini API<br/>LLM 서비스]
    
    %% 연결 관계
    User1 --> Frontend
    Frontend --> Backend
    Backend --> Database
    Backend --> GeminiAPI
    
    User2 --> AIDemo
    
    %% 스타일링
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef aidemo fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Frontend frontend
    class Backend backend
    class Database database
    class AIDemo aidemo
    class GeminiAPI external
```

## 🏗️ 인프라 구성

```mermaid
graph TB
    %% 사용자들
    User1[👤 포트폴리오 사용자]
    User2[👤 AI 데모 사용자]
    
    %% AWS 인프라
    subgraph AWS ["☁️ AWS"]
        S3[AWS S3<br/>정적 파일 호스팅<br/>ai-portfolio-fe-production]
        CloudFront[CloudFront CDN<br/>글로벌 배포<br/>E384L5ALEPZ14U]
        Route53[Route53<br/>DNS 관리<br/>yamang02.com]
    end
    
    %% Google Cloud 인프라
    subgraph GCP ["☁️ Google Cloud"]
        CloudRun[Cloud Run<br/>Spring Boot API<br/>asia-northeast3]
        ContainerRegistry[Container Registry<br/>Docker 이미지 저장]
    end
    
    %% Railway 인프라
    subgraph Railway ["🚂 Railway"]
        PostgreSQL[(PostgreSQL<br/>데이터베이스<br/>포트폴리오 데이터)]
    end
    
    %% HuggingFace 인프라
    subgraph HuggingFace ["🤗 HuggingFace"]
        Spaces[HuggingFace Spaces<br/>AI Service Demo<br/>Gradio Interface]
    end
    
    %% 외부 서비스
    subgraph External ["🔗 External Services"]
        GeminiAPI[Google Gemini API<br/>AI 채팅 서비스]
    end
    
    %% CI/CD
    subgraph CICD ["🚀 CI/CD"]
        GitHub[GitHub<br/>소스 코드 관리]
        GitHubActions[GitHub Actions<br/>자동 배포 파이프라인]
    end
    
    %% 연결 관계
    User1 --> Route53
    Route53 --> CloudFront
    CloudFront --> S3
    
    S3 --> CloudRun
    CloudRun --> PostgreSQL
    CloudRun --> GeminiAPI
    
    User2 --> Spaces
    
    GitHub --> GitHubActions
    GitHubActions --> ContainerRegistry
    GitHubActions --> S3
    GitHubActions --> Spaces
    ContainerRegistry --> CloudRun
    
    %% 스타일링
    classDef aws fill:#ff9900,stroke:#ff6600,stroke-width:2px
    classDef gcp fill:#4285f4,stroke:#1a73e8,stroke-width:2px
    classDef railway fill:#0dbd8b,stroke:#00a86b,stroke-width:2px
    classDef huggingface fill:#ff6b6b,stroke:#e55353,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef cicd fill:#6f42c1,stroke:#5a32a3,stroke-width:2px
    
    class S3,CloudFront,Route53 aws
    class CloudRun,ContainerRegistry gcp
    class PostgreSQL railway
    class Spaces huggingface
    class GeminiAPI external
    class GitHub,GitHubActions cicd
```

## 📞 연락처

- **이메일**: ljj0210@gmail.com
- **GitHub**: https://github.com/Yamang02
- **포트폴리오**: https://www.yamang02.com