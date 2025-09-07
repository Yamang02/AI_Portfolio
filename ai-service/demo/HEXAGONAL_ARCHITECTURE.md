# 헥사고널 아키텍처에 맞는 올바른 구조

## 🏗️ 헥사고널 아키텍처의 요청/응답 객체 관리

### **표준적인 데이터 흐름:**
```
UI → Inbound Adapter → Application Service → Domain Service → Outbound Adapter → External System
```

### **각 레이어별 역할:**

#### **1. Application Layer (DTOs)**
- **요청 DTOs**: `CreateDocumentRequest`, `GetDocumentRequest`, `GetDocumentsRequest`
- **응답 DTOs**: `CreateDocumentResponse`, `GetDocumentResponse`, `GetDocumentsResponse`
- **에러 DTOs**: `ErrorResponse`, `ValidationErrorResponse`
- **특징**: UI나 외부 시스템에 의존하지 않는 순수한 데이터 전송 객체

#### **2. Application Service**
- **역할**: 비즈니스 로직 처리 및 Domain Entity와의 변환
- **입력**: Application DTOs
- **출력**: Application DTOs
- **특징**: Domain Entity를 사용하지만 외부 의존성은 없음

#### **3. Infrastructure Layer (Adapters)**
- **Inbound Adapter**: UI 입력을 Application DTO로 변환, Application Service 호출, 결과를 UI 형식으로 변환
- **Outbound Adapter**: Domain Entity를 외부 시스템 형식으로 변환
- **특징**: UI 특화 변환만 담당

### **올바른 구조 예시:**

```python
# Application Layer - DTOs
@dataclass
class CreateDocumentRequest:
    content: str
    source: str

@dataclass
class CreateDocumentResponse:
    success: bool
    document_id: Optional[str] = None
    message: str = ""
    error: Optional[str] = None

# Application Service
class DocumentApplicationService:
    def create_document(self, request: CreateDocumentRequest) -> CreateDocumentResponse:
        # 1. Domain Entity 생성
        document = Document(request.content, request.source)
        
        # 2. Domain Service 호출
        self.document_service.create_document(document)
        
        # 3. 응답 DTO 생성
        return CreateDocumentResponse(
            success=True,
            document_id=document.id,
            message="문서 생성 완료"
        )

# Infrastructure Layer - UI Adapter
class DocumentAdapter:
    def handle_add_document(self, content: str, source: str) -> Tuple[str, str, Any]:
        # 1. UI 입력을 Application DTO로 변환
        request = CreateDocumentRequest(content=content, source=source)
        
        # 2. Application Service 호출
        response = self.document_service.create_document(request)
        
        # 3. Application DTO를 UI 형식으로 변환
        return self._format_for_gradio(response)
```

### **핵심 원칙:**

1. **Domain은 외부 의존성 없음**: 순수한 비즈니스 로직만
2. **Application은 DTO 사용**: 레이어 간 데이터 전송
3. **Infrastructure는 변환 담당**: 외부 형식 ↔ 내부 형식 변환
4. **UI 특화 객체는 UI 레이어에서만 사용**: GradioResponse 같은 객체는 제거

### **수정된 구조의 장점:**

- ✅ **헥사고널 아키텍처 준수**: 각 레이어의 책임이 명확히 분리
- ✅ **테스트 용이성**: 각 레이어를 독립적으로 테스트 가능
- ✅ **유지보수성**: 비즈니스 로직과 UI 로직이 분리
- ✅ **확장성**: 새로운 UI나 외부 시스템 추가 시 기존 로직 영향 없음
- ✅ **타입 안전성**: 명확한 DTO 계약으로 타입 안전성 보장

### **제거된 것들:**

- ❌ `GradioResponse`: UI 특화 객체를 모든 곳에서 사용하지 않음
- ❌ `ResponseType` ENUM: UI 특화 타입을 Application Layer에서 사용하지 않음
- ❌ 범용 래퍼 시스템: 헥사고널 아키텍처에서는 불필요한 복잡성
- ❌ UseCase 패턴: Application Service 패턴으로 단순화

이제 **진정한 헥사고널 아키텍처**에 맞는 구조가 되었습니다!
