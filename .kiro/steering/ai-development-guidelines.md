---
inclusion: always
---

# AI 개발 협업 가이드라인

## 코드 작성 원칙

### Python AI 서비스
```python
# 항상 타입 힌트 사용
from typing import List, Dict, Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict] = None

# 비동기 함수 우선 사용
async def process_chat(request: ChatRequest) -> ChatResponse:
    pass

# 에러 처리 필수
try:
    result = await ai_service.process(data)
except AIServiceException as e:
    logger.error(f"AI 서비스 오류: {e}")
    return fallback_response(data)
```

### Spring Boot 확장
```java
// 기존 패턴 유지
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        // 기존 API 시그니처 유지
    }
}

// 새로운 서비스는 포트 패턴 사용
public interface AIServicePort {
    ChatResponse processChat(ChatRequest request);
    boolean isAvailable();
}
```

## 테스트 작성 규칙

### 필수 테스트 케이스
1. **정상 케이스**: 기본 기능 동작 확인
2. **AI 서비스 장애**: 대체 응답 확인
3. **캐시 동작**: 히트/미스 시나리오
4. **데이터 동기화**: PostgreSQL ↔ 벡터 DB

### 테스트 네이밍
```python
# Python
def test_should_return_cached_response_when_cache_hit():
    pass

def test_should_fallback_to_postgres_when_ai_service_unavailable():
    pass
```

```java
// Java
@Test
void shouldReturnAIResponseWhenServiceAvailable() {}

@Test 
void shouldReturnFallbackResponseWhenAIServiceDown() {}
```

## 환경 설정 관리

### 환경변수 네이밍
```bash
# AI 서비스
QDRANT_API_KEY=your_qdrant_key
QDRANT_URL=https://your-cluster.qdrant.tech
LANGSMITH_API_KEY=your_langsmith_key
GEMINI_API_KEY=your_gemini_key

# Spring Boot
SPRING_AI_SERVICE_URL=http://localhost:8001
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
```

### Docker Compose 서비스명
```yaml
services:
  postgres:        # 기존 유지
  frontend:        # 기존 유지  
  backend:         # 기존 유지
  ai-service:      # 새로 추가
  redis:           # 새로 추가
  qdrant:          # 로컬 개발용 (선택)
```

## 로깅 및 모니터링

### 로그 레벨 및 형식
```python
# Python - 구조화된 로깅
import structlog

logger = structlog.get_logger()

logger.info(
    "AI 응답 생성 완료",
    conversation_id=conv_id,
    response_time_ms=elapsed_time,
    token_count=tokens_used,
    cache_hit=False
)
```

```java
// Java - 기존 패턴 유지
@Slf4j
public class ChatService {
    
    public ChatResponse processChat(ChatRequest request) {
        log.info("채팅 요청 처리 시작 - 사용자: {}", request.getUserId());
        
        try {
            // 처리 로직
            log.info("AI 서비스 응답 수신 - 응답시간: {}ms", responseTime);
        } catch (Exception e) {
            log.error("채팅 처리 중 오류 발생", e);
        }
    }
}
```

### LangSmith 메타데이터
```python
# 항상 포함할 메타데이터
metadata = {
    "conversation_id": conversation_id,
    "user_type": "portfolio_visitor",
    "query_type": classify_query(user_query),
    "context_source": "vector_db" or "postgres_fallback",
    "response_quality": calculate_quality_score(response)
}
```

## Git 커밋 및 브랜치

### 커밋 메시지 형식
```bash
feat(ai-service): Qdrant 벡터 검색 구현

- 코사인 유사도 기반 검색 로직 추가
- 메타데이터 필터링 지원
- 검색 결과 랭킹 알고리즘 구현

Closes #123
```

### 브랜치 네이밍
```bash
feature/task-{번호}-{간단한-설명}
feature/task-1-1-python-project-setup
feature/task-4-2-rag-context-generation

bugfix/ai-service-timeout-issue
hotfix/production-cache-error
```

## 성능 및 비용 최적화

### 응답 시간 목표
- 캐시 히트: < 100ms
- 벡터 검색: < 500ms  
- AI 생성: < 3000ms
- 대체 응답: < 200ms

### 비용 모니터링
```python
# 토큰 사용량 추적
def track_token_usage(prompt_tokens: int, completion_tokens: int):
    total_cost = calculate_cost(prompt_tokens, completion_tokens)
    logger.info(
        "토큰 사용량",
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        estimated_cost_usd=total_cost
    )
```

## 에러 처리 패턴

### 계층별 에러 처리
1. **AI 서비스**: LangSmith 자동 로깅 + 대체 로직
2. **Spring Boot**: 글로벌 예외 핸들러 + 사용자 친화적 메시지
3. **프론트엔드**: 기존 에러 처리 유지

### 사용자 메시지
```python
ERROR_MESSAGES = {
    "ai_service_down": "잠시 후 다시 시도해주세요. 기본 정보는 계속 제공됩니다.",
    "vector_search_failed": "검색 중 문제가 발생했습니다. 기본 답변을 제공합니다.",
    "rate_limit": "요청이 많아 잠시 대기가 필요합니다."
}
```