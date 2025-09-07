# 헥사고날 아키텍처 레이어 간 데이터 전송 형태

## 개요

헥사고날 아키텍처(Hexagonal Architecture)에서 각 레이어 간 데이터 전송은 명확한 규칙과 형태를 가져야 합니다. 이 문서는 각 레이어에서 다른 레이어로 데이터를 전송할 때 사용되는 이상적이고 보편적인 형태를 정의합니다.

## 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Web Adapter    │  │  Database       │  │   External  │ │
│  │   (Gradio UI)    │  │  Adapter        │  │   API       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Use Cases     │  │   Services      │  │   DTOs      │ │
│  │                 │  │   (Application) │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Entities      │  │   Value Objects │  │   Services  │ │
│  │                 │  │                 │  │  (Domain)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 실제 디렉토리 구조

```
demo/
├── infrastructure/           # Infrastructure Layer
│   ├── inbound/             # 인바운드 어댑터
│   │   ├── ui/
│   │   │   └── gradio/      # Gradio UI 어댑터
│   │   └── usecase_factory.py
│   └── outbound/            # 아웃바운드 어댑터
│       ├── repositories/    # 데이터 저장소 어댑터
│       ├── embedding/       # 임베딩 모델 어댑터
│       └── llm/            # LLM 어댑터
├── application/             # Application Layer
│   ├── usecases/           # 유스케이스들
│   └── common/             # 공통 유틸리티
├── domain/                  # Domain Layer
│   ├── entities/           # 도메인 엔티티
│   ├── services/           # 도메인 서비스
│   └── ports/              # 포트 인터페이스
└── config/                  # 설정 파일들
```

## 데이터 전송 형태 정의

### 1. Domain Layer → Application Layer

**원칙**: 도메인 객체는 그대로 전달하거나, 필요한 경우에만 간단한 변환

#### ✅ 올바른 형태
```python
# 도메인 서비스에서 UseCase로
def get_document(self, document_id: str) -> Document:
    """도메인 객체를 그대로 반환"""
    return self.repository.find_by_id(document_id)

# UseCase에서 도메인 서비스 호출
def execute(self, document_id: str) -> Dict[str, Any]:
    document = self.document_service.get_document(document_id)
    return document.to_dict()  # 필요시에만 변환
```

#### ❌ 잘못된 형태
```python
# 도메인 레이어에서 API 응답 형식 반환
def get_document(self, document_id: str) -> Dict[str, Any]:
    document = self.repository.find_by_id(document_id)
    return ResponseFormatter.success(data=document.to_dict())
```

### 2. Application Layer → Infrastructure Layer

**원칙**: UseCase는 순수한 데이터 구조만 반환, API 응답 형식은 Adapter에서 처리

#### ✅ 올바른 형태
```python
# UseCase에서 순수 데이터 반환
def execute(self, document_id: str) -> Dict[str, Any]:
    document = self.document_service.get_document(document_id)
    return {
        "content": document.content,
        "title": document.title,
        "source": document.source,
        "document_id": document.document_id
    }

# Adapter에서 API 응답 형식으로 변환
def handle_get_document_content(self, document_id: str) -> str:
    result = self.usecase.execute(document_id)
    return self._format_response(result)
```

#### ❌ 잘못된 형태
```python
# UseCase에서 API 응답 형식 반환
def execute(self, document_id: str) -> Dict[str, Any]:
    document = self.document_service.get_document(document_id)
    return ResponseFormatter.success(
        data={"content": document.content},
        message="문서 조회 성공"
    )
```

### 3. Infrastructure Layer → Application Layer

**원칙**: 외부 시스템의 데이터를 도메인 객체나 표준화된 형태로 변환

#### ✅ 올바른 형태
```python
# 외부 API 응답을 도메인 객체로 변환
def fetch_external_document(self, url: str) -> Document:
    response = requests.get(url)
    data = response.json()
    
    return Document(
        content=data["content"],
        source=data["source"],
        title=data["title"]
    )

# 데이터베이스 결과를 도메인 객체로 변환
def find_by_id(self, document_id: str) -> Optional[Document]:
    row = self.db.query("SELECT * FROM documents WHERE id = ?", document_id)
    if row:
        return Document.from_dict(row)
    return None
```

#### ❌ 잘못된 형태
```python
# 외부 시스템의 원시 데이터를 그대로 전달
def fetch_external_document(self, url: str) -> Dict[str, Any]:
    response = requests.get(url)
    return response.json()  # 외부 시스템 의존성 노출
```

## 구체적인 데이터 형태

### 1. Domain Entities

```python
class Document:
    """도메인 엔티티 - 비즈니스 로직과 상태를 포함"""
    
    def __init__(self, content: str, source: str, document_id: str = None):
        self.document_id = document_id or str(uuid.uuid4())
        self.content = content
        self.source = source
        self.created_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """도메인 객체를 딕셔너리로 변환"""
        return {
            "document_id": self.document_id,
            "content": self.content,
            "source": self.source,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Document':
        """딕셔너리에서 도메인 객체 생성"""
        return cls(
            content=data["content"],
            source=data["source"],
            document_id=data["document_id"]
        )
```

### 2. UseCase 반환 데이터

```python
# 단일 객체 반환
def get_document_content(self, document_id: str) -> Dict[str, Any]:
    document = self.document_service.get_document(document_id)
    return {
        "content": document.content,
        "title": document.title,
        "source": document.source,
        "document_id": document.document_id
    }

# 컬렉션 반환
def get_documents_preview(self) -> Dict[str, Any]:
    documents = self.document_service.list_documents()
    return {
        "documents": [
            {
                "document_id": doc.document_id,
                "title": doc.title,
                "source": doc.source,
                "content_length": len(doc.content)
            }
            for doc in documents
        ],
        "count": len(documents)
    }
```

### 3. Adapter 응답 데이터

```python
# 웹 API 응답
def handle_get_document_content(self, document_id: str) -> Dict[str, Any]:
    try:
        result = self.usecase.execute(document_id)
        return {
            "success": True,
            "data": result,
            "message": "문서 조회 성공",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "문서 조회 실패",
            "timestamp": datetime.now().isoformat()
        }

# UI 컴포넌트 응답
def handle_get_document_content(self, document_id: str) -> str:
    result = self.usecase.execute(document_id)
    return self._format_html_response(result)
```

## 데이터 전송 규칙

### 1. 의존성 방향 규칙

- **Domain Layer**: 다른 레이어에 의존하지 않음
- **Application Layer**: Domain Layer에만 의존
- **Infrastructure Layer**: Application Layer와 Domain Layer에 의존

### 2. 데이터 변환 규칙

- **Domain → Application**: 도메인 객체를 그대로 전달하거나 `to_dict()` 변환
- **Application → Infrastructure**: 순수 데이터 구조만 전달
- **Infrastructure → Application**: 외부 데이터를 도메인 객체로 변환

### 3. 오류 처리 규칙

- **Domain Layer**: 도메인 예외(`ValueError`, `DomainException`) 발생
- **Application Layer**: 도메인 예외를 잡아서 애플리케이션 예외로 변환
- **Infrastructure Layer**: 모든 예외를 잡아서 적절한 응답 형식으로 변환

## 실제 구현 예시

### Document 조회 플로우

```python
# 1. Infrastructure Layer (Gradio Adapter)
def handle_get_document_content(self, document_id: str) -> str:
    try:
        # UseCase 호출
        result = self.usecase.execute(document_id)
        
        # UI 형식으로 변환
        return self._format_html_response(result)
    except Exception as e:
        return self._format_error_html(str(e))

# 2. Application Layer (UseCase)
def execute(self, document_id: str) -> Dict[str, Any]:
    # 도메인 서비스 호출
    document = self.document_service.get_document(document_id)
    
    # 순수 데이터 반환
    return {
        "content": document.content,
        "title": document.title,
        "source": document.source,
        "document_id": document.document_id
    }

# 3. Domain Layer (Service)
def get_document(self, document_id: str) -> Document:
    # 리포지토리 호출
    document = self.repository.find_by_id(document_id)
    
    if not document:
        raise ValueError(f"문서를 찾을 수 없습니다: {document_id}")
    
    # 도메인 객체 반환
    return document

# 4. Infrastructure Layer (Repository)
def find_by_id(self, document_id: str) -> Optional[Document]:
    # 데이터베이스 조회
    row = self.db.query("SELECT * FROM documents WHERE id = ?", document_id)
    
    if row:
        # 도메인 객체로 변환
        return Document.from_dict(row)
    
    return None
```

## 네이밍 규칙

### Infrastructure Layer 네이밍

헥사고날 아키텍처에서 Infrastructure Layer의 구성 요소들은 다음과 같이 명명하는 것이 적절합니다:

#### ✅ 권장 네이밍
- **Inbound Adapter**: 외부에서 애플리케이션으로 들어오는 요청을 처리하는 어댑터
- **Outbound Adapter**: 애플리케이션에서 외부 시스템으로 나가는 요청을 처리하는 어댑터
- **UI Adapter**: 사용자 인터페이스를 담당하는 인바운드 어댑터
- **Repository Adapter**: 데이터 저장소와의 인터페이스를 담당하는 아웃바운드 어댑터
- **Primary Inbound Adapter**: 애플리케이션의 주요 진입점이 되는 인바운드 어댑터

#### ❌ 피해야 할 네이밍
- **Main Adapter**: "메인"이라는 용어는 모호하고 비즈니스 의미가 없음
- **Core Adapter**: 도메인 레이어와 혼동될 수 있음
- **Base Adapter**: 추상 클래스와 혼동될 수 있음
- **Primary Adapter**: 방향성이 명확하지 않음 (Inbound/Outbound 구분 없음)

#### 실제 구현 예시
```python
# ✅ 좋은 예시
class GradioAdapter:  # UI Inbound Adapter
    """Gradio UI를 담당하는 인바운드 어댑터"""
    pass

class MemoryDocumentRepositoryAdapter:  # Repository Outbound Adapter
    """메모리 기반 문서 저장소 아웃바운드 어댑터"""
    pass

class InboundAdapterFactory:
    """인바운드 어댑터를 생성하는 팩토리"""
    def create_inbound_adapter(self):
        """애플리케이션의 주요 진입점 인바운드 어댑터 생성"""
        pass
```

### 설정 파일 네이밍

```yaml
# ✅ 좋은 예시
adapter_config:
  inbound_adapters:  # 인바운드 어댑터들
    gradio_adapter:
      module: "infrastructure.inbound.ui.gradio.gradio_adapter"
      class: "GradioAdapter"
    web_adapter:
      module: "infrastructure.inbound.web.web_adapter"
      class: "WebAdapter"
  outbound_adapters:  # 아웃바운드 어댑터들
    database_adapter:
      module: "infrastructure.outbound.database.database_adapter"
      class: "DatabaseAdapter"
    external_api_adapter:
      module: "infrastructure.outbound.api.external_api_adapter"
      class: "ExternalApiAdapter"
```

## 결론

헥사고날 아키텍처에서 각 레이어 간 데이터 전송은 다음과 같은 원칙을 따라야 합니다:

1. **도메인 레이어**: 순수한 도메인 객체와 비즈니스 로직만 포함
2. **애플리케이션 레이어**: 도메인 객체를 순수 데이터로 변환하여 전달
3. **인프라스트럭처 레이어**: 외부 시스템과의 인터페이스 처리 및 응답 형식 변환

### 네이밍의 중요성

적절한 네이밍은 코드의 가독성과 유지보수성을 크게 향상시킵니다:

- **Inbound/Outbound**: 데이터 흐름 방향을 명확히 구분
- **UI Adapter, Repository Adapter**: 구체적인 역할을 명확히 표현
- **Primary Inbound Adapter**: 애플리케이션의 주요 진입점임을 명확히 표현

이러한 구조와 네이밍을 통해 각 레이어의 책임이 명확해지고, 테스트 가능성과 유지보수성이 향상됩니다.
