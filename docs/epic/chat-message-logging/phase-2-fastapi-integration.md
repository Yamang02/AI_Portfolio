# Phase 2: FastAPI 연동

**상태**: 대기 (Phase 1 완료 후 시작)
**우선순위**: Medium
**담당**: 백엔드 + FastAPI

---

## 목표

FastAPI(에이전트+보안 서버)와 백엔드를 연동하여 LLM 응답의 usage 메타데이터를 수집한다.
- FastAPI 응답 스펙 확정
- 백엔드에서 model_runs 테이블에 저장
- Trace ID 전파

---

## 전제 조건

- [x] Phase 1 완료 (스키마, 저장 API, 쿠키)
- [ ] FastAPI 서버 기본 구조 구축 완료
- [ ] Cloudflare Tunnel 설정 완료 (백엔드 ↔ FastAPI)

---

## 아키텍처 흐름

```
[백엔드] --POST /chat--> [FastAPI] --API--> [Ollama LLM]
                              │
                              ▼
                    응답: text + usage metadata
                              │
                              ▼
[백엔드] <-- response + provider, model, tokens, latency 등
    │
    ▼
messages + model_runs 저장
```

---

## 산출물

- [ ] FastAPI 응답 스펙 문서
- [ ] 백엔드 FastAPI 클라이언트
- [ ] model_runs 저장 로직
- [ ] Trace ID 헤더 전파

---

## 상세 태스크

### 1. FastAPI 응답 스펙 (확정)

#### 1.1 요청 (백엔드 → FastAPI)

```
POST /api/chat
Headers:
  X-Trace-Id: <trace-id>
  Content-Type: application/json

Body:
{
    "messages": [
        {"role": "user", "content": "안녕하세요"}
    ],
    "conversation_id": "uuid",  // optional
    "max_tokens": 1000,         // optional
    "temperature": 0.7          // optional
}
```

#### 1.2 응답 (FastAPI → 백엔드)

```json
{
    "response": "안녕하세요! 무엇을 도와드릴까요?",
    "usage": {
        "provider": "ollama",
        "model_name": "llama3:8b",
        "prompt_tokens": 15,
        "completion_tokens": 12,
        "total_tokens": 27,
        "latency_ms": 1234,
        "eval_duration_ns": 987654321
    },
    "error": null
}
```

#### 1.3 에러 응답

```json
{
    "response": null,
    "usage": {
        "provider": "ollama",
        "model_name": "llama3:8b",
        "prompt_tokens": 15,
        "completion_tokens": 0,
        "total_tokens": 15,
        "latency_ms": 500
    },
    "error": "Model timeout: exceeded 30s"
}
```

---

### 2. FastAPI 구현 (Python)

#### 2.1 응답 DTO

```python
from pydantic import BaseModel
from typing import Optional

class UsageInfo(BaseModel):
    provider: str = "ollama"
    model_name: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    eval_duration_ns: Optional[int] = None

class ChatResponse(BaseModel):
    response: Optional[str] = None
    usage: UsageInfo
    error: Optional[str] = None
```

#### 2.2 Ollama 호출 및 응답 가공

```python
import time
import httpx
from fastapi import FastAPI, Header

app = FastAPI()

@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    x_trace_id: str = Header(None)
):
    start_time = time.time()

    try:
        # Ollama API 호출
        ollama_response = await call_ollama(request.messages)

        latency_ms = int((time.time() - start_time) * 1000)

        return ChatResponse(
            response=ollama_response["message"]["content"],
            usage=UsageInfo(
                provider="ollama",
                model_name=ollama_response.get("model", "llama3:8b"),
                prompt_tokens=ollama_response.get("prompt_eval_count"),
                completion_tokens=ollama_response.get("eval_count"),
                total_tokens=(
                    (ollama_response.get("prompt_eval_count") or 0) +
                    (ollama_response.get("eval_count") or 0)
                ),
                latency_ms=latency_ms,
                eval_duration_ns=ollama_response.get("eval_duration")
            ),
            error=None
        )
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        return ChatResponse(
            response=None,
            usage=UsageInfo(
                provider="ollama",
                model_name="llama3:8b",
                latency_ms=latency_ms
            ),
            error=str(e)
        )
```

---

### 3. 백엔드 FastAPI 클라이언트 (Java)

#### 3.1 응답 DTO

```java
public record FastApiChatResponse(
    String response,
    UsageInfo usage,
    String error
) {}

public record UsageInfo(
    String provider,
    String modelName,
    Integer promptTokens,
    Integer completionTokens,
    Integer totalTokens,
    Integer latencyMs,
    Long evalDurationNs
) {}
```

#### 3.2 클라이언트 서비스

```java
@Service
@RequiredArgsConstructor
public class FastApiClient {
    private final WebClient webClient;

    public Mono<FastApiChatResponse> chat(List<ChatMessage> messages, String traceId) {
        return webClient.post()
            .uri("/api/chat")
            .header("X-Trace-Id", traceId)
            .bodyValue(new ChatRequest(messages))
            .retrieve()
            .bodyToMono(FastApiChatResponse.class)
            .timeout(Duration.ofSeconds(30))
            .onErrorReturn(createErrorResponse("FastAPI timeout"));
    }
}
```

---

### 4. model_runs 저장 로직

```java
@Service
@RequiredArgsConstructor
public class ChatService {
    private final FastApiClient fastApiClient;
    private final ChatLogService chatLogService;

    public ChatResponseDto chat(String sessionId, String userMessage, String traceId) {
        // 1. FastAPI 호출
        FastApiChatResponse fastApiResponse = fastApiClient
            .chat(List.of(new ChatMessage("user", userMessage)), traceId)
            .block();

        // 2. 비동기 로깅 (메시지 + model_run)
        chatLogService.logMessageWithUsageAsync(
            sessionId,
            userMessage,
            fastApiResponse.response(),
            fastApiResponse.usage(),
            fastApiResponse.error(),
            traceId
        );

        // 3. 응답 반환
        return new ChatResponseDto(fastApiResponse.response());
    }
}
```

#### 4.1 확장된 로깅 서비스

```java
@Async
public CompletableFuture<Void> logMessageWithUsageAsync(
        String sessionId,
        String userContent,
        String assistantContent,
        UsageInfo usage,
        String error,
        String traceId
) {
    try {
        Conversation conversation = findOrCreateConversation(sessionId, traceId);

        // user 메시지 저장
        saveMessage(conversation, "user", userContent);

        // assistant 메시지 저장
        Message assistantMessage = saveMessage(conversation, "assistant", assistantContent);

        // model_run 저장 (usage 정보)
        if (usage != null) {
            ModelRun modelRun = ModelRun.builder()
                .message(assistantMessage)
                .provider(usage.provider())
                .modelName(usage.modelName())
                .promptTokens(usage.promptTokens())
                .completionTokens(usage.completionTokens())
                .totalTokens(usage.totalTokens())
                .latencyMs(usage.latencyMs())
                .evalDurationNs(usage.evalDurationNs())
                .error(error)
                .build();
            modelRunRepository.save(modelRun);
        }

    } catch (Exception e) {
        log.error("Failed to log chat with usage: {}", e.getMessage(), e);
    }
    return CompletableFuture.completedFuture(null);
}
```

---

### 5. Trace ID 전파

#### 5.1 흐름

```
[브라우저] → [백엔드] → [FastAPI] → [Ollama]
              │           │
              └─ X-Trace-Id 헤더로 전파

로그/DB에 traceId 저장 → 요청 추적 가능
```

#### 5.2 metadata에 저장

```java
private Conversation findOrCreateConversation(String sessionId, String traceId) {
    Conversation conversation = conversationRepository
        .findRecentBySessionId(sessionId, OffsetDateTime.now().minusMinutes(30))
        .orElseGet(() -> {
            Conversation newConv = new Conversation();
            newConv.setSessionId(sessionId);
            newConv.setMetadata(Map.of("traceIds", new ArrayList<>()));
            return conversationRepository.save(newConv);
        });

    // traceId 추가
    List<String> traceIds = (List<String>) conversation.getMetadata()
        .getOrDefault("traceIds", new ArrayList<>());
    traceIds.add(traceId);
    conversation.getMetadata().put("traceIds", traceIds);

    return conversation;
}
```

---

## 완료 조건

- [ ] FastAPI가 Ollama 응답에서 usage 정보를 추출하여 반환
- [ ] 백엔드가 FastAPI 응답을 받아 model_runs에 저장
- [ ] Trace ID가 백엔드 → FastAPI로 전파됨
- [ ] 에러 발생 시에도 model_runs에 error 필드로 기록됨
- [ ] 기존 Phase 1 기능 (세션, 메시지 저장)이 정상 동작

---

## 참고

- 에픽 README: [README.md](./README.md)
- Phase 1 (백엔드 스키마): [phase-1-backend-schema-api.md](./phase-1-backend-schema-api.md)
- Phase 3 (집계/보존): [phase-3-aggregation-retention.md](./phase-3-aggregation-retention.md)
