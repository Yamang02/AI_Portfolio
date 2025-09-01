# 표준 헥사고널 아키텍처 (포트와 어댑터 패턴) 표준 가이드

## 🎯 **헥사고널 아키텍처 핵심 원칙**

### **1. 의존성 방향**
```
외부 시스템 → 어댑터 → 포트 → 애플리케이션 → 포트 → 어댑터 → 외부 시스템
```

### **2. 핵심 계층 구조**
```
┌─────────────────────────────────────────────────────────────┐
│                    외부 시스템 (External Systems)            │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    어댑터 (Adapters)                        │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │  Primary/       │              │  Secondary/     │      │
│  │  Driving        │              │  Driven          │      │
│  │  Adapters       │              │  Adapters       │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    포트 (Ports)                            │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │  Inbound Ports  │              │  Outbound Ports │      │
│  │  (입력 포트)     │              │  (출력 포트)     │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                애플리케이션 (Application)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              도메인 로직 (Domain Logic)             │    │
│  │              유스케이스 (Use Cases)                 │    │
│  │              서비스 (Services)                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 **표준 디렉토리 구조**

### **1. 전체 프로젝트 구조**
```
src/
├── core/                           # 핵심 도메인 (의존성 없음)
│   ├── domain/                     # 도메인 모델
│   │   ├── entities/               # 도메인 엔티티
│   │   ├── value_objects/          # 값 객체
│   │   └── services/               # 도메인 서비스
│   └── ports/                      # 포트 인터페이스
│       ├── inbound/                # 입력 포트 (Primary/Driving)
│       └── outbound/               # 출력 포트 (Secondary/Driven)
├── application/                    # 애플리케이션 서비스
│   ├── services/                   # 애플리케이션 서비스
│   ├── use_cases/                  # 유스케이스
│   ├── dto/                        # 데이터 전송 객체
│   └── commands/                   # 명령 객체
└── adapters/                       # 어댑터 (인프라)
    ├── inbound/                    # 입력 어댑터 (Primary/Driving)
    │   ├── web/                    # 웹 어댑터 (REST API, GraphQL 등)
    │   ├── cli/                    # CLI 어댑터
    │   └── messaging/              # 메시징 어댑터
    └── outbound/                   # 출력 어댑터 (Secondary/Driven)
        ├── databases/              # 데이터베이스 어댑터
        ├── external_apis/          # 외부 API 어댑터
        ├── file_systems/           # 파일 시스템 어댑터
        └── messaging/              # 메시징 어댑터
```

### **2. Core Layer (핵심 도메인)**
```
core/
├── domain/                         # 도메인 모델
│   ├── entities/                   # 도메인 엔티티
│   │   ├── user.py
│   │   ├── document.py
│   │   └── conversation.py
│   ├── value_objects/              # 값 객체
│   │   ├── email.py
│   │   ├── document_id.py
│   │   └── conversation_id.py
│   └── services/                   # 도메인 서비스
│       └── document_service.py
└── ports/                          # 포트 인터페이스
    ├── inbound/                    # 입력 포트 (Primary/Driving)
    │   ├── __init__.py
    │   ├── user_management_port.py
    │   ├── document_management_port.py
    │   └── conversation_port.py
    └── outbound/                   # 출력 포트 (Secondary/Driven)
        ├── __init__.py
        ├── user_repository_port.py
        ├── document_repository_port.py
        ├── llm_service_port.py
        └── vector_store_port.py
```

### **3. Application Layer (애플리케이션 서비스)**
```
application/
├── services/                       # 애플리케이션 서비스
│   ├── user_service.py            # UserManagementPort 구현
│   ├── document_service.py        # DocumentManagementPort 구현
│   └── conversation_service.py    # ConversationPort 구현
├── use_cases/                      # 유스케이스
│   ├── create_user_use_case.py
│   ├── add_document_use_case.py
│   └── chat_use_case.py
├── dto/                           # 데이터 전송 객체
│   ├── user_dto.py
│   ├── document_dto.py
│   └── conversation_dto.py
└── commands/                      # 명령 객체
    ├── create_user_command.py
    ├── add_document_command.py
    └── send_message_command.py
```

### **4. Adapters Layer (어댑터)**
```
adapters/
├── inbound/                       # 입력 어댑터 (Primary/Driving)
│   ├── web/                       # 웹 어댑터
│   │   ├── __init__.py
│   │   ├── fastapi_router.py      # FastAPI 라우터
│   │   ├── controllers/           # 컨트롤러
│   │   │   ├── user_controller.py
│   │   │   ├── document_controller.py
│   │   │   └── conversation_controller.py
│   │   └── dependencies.py        # 의존성 주입
│   ├── cli/                       # CLI 어댑터
│   │   └── cli_commands.py
│   └── messaging/                 # 메시징 어댑터
│       └── kafka_consumer.py
└── outbound/                      # 출력 어댑터 (Secondary/Driven)
    ├── databases/                 # 데이터베이스 어댑터
    │   ├── __init__.py
    │   ├── postgresql/            # PostgreSQL 어댑터
    │   │   ├── user_repository.py
    │   │   ├── document_repository.py
    │   │   └── conversation_repository.py
    │   ├── mongodb/               # MongoDB 어댑터
    │   └── redis/                 # Redis 어댑터
    ├── external_apis/             # 외부 API 어댑터
    │   ├── openai_adapter.py      # OpenAI API 어댑터
    │   ├── anthropic_adapter.py   # Anthropic API 어댑터
    │   └── huggingface_adapter.py # HuggingFace API 어댑터
    ├── file_systems/              # 파일 시스템 어댑터
    │   ├── local_file_system.py
    │   ├── s3_adapter.py
    │   └── google_drive_adapter.py
    └── messaging/                 # 메시징 어댑터
        └── kafka_producer.py
```

## 🔄 **표준 통신 흐름**

### **1. 사용자 생성 흐름**
```
HTTP POST /users → Web Controller → UserManagementPort → UserService → UserRepositoryPort → PostgreSQLAdapter
```

### **2. 문서 추가 흐름**
```
HTTP POST /documents → Web Controller → DocumentManagementPort → DocumentService → DocumentRepositoryPort → PostgreSQLAdapter
                                                                                ↓
                                                                        VectorStorePort → PineconeAdapter
```

### **3. 채팅 흐름**
```
HTTP POST /chat → Web Controller → ConversationPort → ConversationService → LLMServicePort → OpenAIAdapter
                                                                        ↓
                                                                DocumentRepositoryPort → PostgreSQLAdapter
```

## 📋 **표준 네이밍 컨벤션**

### **1. 포트 인터페이스**
- **Inbound Ports**: `{Domain}ManagementPort`, `{Domain}ServicePort`
- **Outbound Ports**: `{Domain}RepositoryPort`, `{Domain}ServicePort`

### **2. 어댑터**
- **Inbound Adapters**: `{Technology}{Type}Adapter` (예: `FastAPIWebAdapter`)
- **Outbound Adapters**: `{Technology}{Type}Adapter` (예: `PostgreSQLRepositoryAdapter`)

### **3. 서비스**
- **Application Services**: `{Domain}Service`
- **Domain Services**: `{Domain}Service`

## ✅ **표준 원칙**

### **1. 의존성 규칙**
- Core → Application → Adapters (단방향 의존성)
- 외부 의존성은 Adapters에만 존재
- Core는 어떤 외부 의존성도 가질 수 없음

### **2. 인터페이스 분리 원칙**
- 각 포트는 단일 책임을 가짐
- 큰 인터페이스를 작은 인터페이스로 분리

### **3. 의존성 역전 원칙**
- 고수준 모듈이 저수준 모듈에 의존하지 않음
- 둘 다 추상화에 의존

### **4. 단일 책임 원칙**
- 각 클래스는 하나의 변경 이유만 가짐
- 각 계층은 명확한 책임을 가짐

## 🚫 **금지사항**

### **1. Core Layer에서 금지**
- 외부 라이브러리 import
- 데이터베이스 접근
- HTTP 요청
- 파일 시스템 접근

### **2. Application Layer에서 금지**
- 직접적인 외부 시스템 접근
- 프레임워크 특화 코드

### **3. Adapters Layer에서 금지**
- 도메인 로직 포함
- 비즈니스 규칙 포함

이 표준을 기반으로 실제 구조를 평가하고 개선할 수 있습니다.
