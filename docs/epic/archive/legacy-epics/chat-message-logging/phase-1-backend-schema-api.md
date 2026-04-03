# Phase 1: 백엔드 스키마 및 저장 API

**상태**: 대기
**우선순위**: High
**담당**: 백엔드

---

## 목표

FastAPI 연동 전, 백엔드에 채팅 로그 저장 인프라를 먼저 구축한다.
- DB 스키마 (conversations, messages, model_runs)
- 저장 API (비동기 로깅)
- session 기준 삭제 API
- 쿠키 기반 세션 관리

---

## 산출물

- [ ] DB 마이그레이션 스크립트
- [ ] Entity/Repository 클래스
- [ ] 저장 서비스 (`@Async` 비동기)
- [ ] REST API 엔드포인트
- [ ] 쿠키 설정 (CORS 포함)
- [ ] 개인정보 안내 모달 (프론트)

---

## 상세 태스크

### 1. DB 스키마 설계 및 마이그레이션

#### 1.1 conversations 테이블

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    title VARCHAR(500),
    source VARCHAR(50) DEFAULT 'web',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_session_created ON conversations(session_id, created_at);
```

#### 1.2 messages 테이블

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at);
```

#### 1.3 model_runs 테이블 (Phase 2 연동 대비)

```sql
CREATE TABLE model_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    response_cost DECIMAL(10, 6),
    latency_ms INTEGER,
    eval_duration_ns BIGINT,
    temperature DECIMAL(3, 2),
    max_tokens INTEGER,
    error TEXT,
    provider_request_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_model_runs_message_id ON model_runs(message_id);
CREATE INDEX idx_model_runs_provider ON model_runs(provider);
CREATE INDEX idx_model_runs_created_at ON model_runs(created_at);
```

---

### 2. Entity 클래스

#### 2.1 Conversation

```java
@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "user_agent")
    private String userAgent;

    private String title;

    @Column(length = 50)
    private String source = "web";

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<Message> messages = new ArrayList<>();
}
```

#### 2.2 Message

```java
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(nullable = false, length = 20)
    private String role;  // user, assistant, system

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "token_count")
    private Integer tokenCount;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @OneToOne(mappedBy = "message", cascade = CascadeType.ALL)
    private ModelRun modelRun;
}
```

#### 2.3 ModelRun

```java
@Entity
@Table(name = "model_runs")
public class ModelRun {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "response_cost", precision = 10, scale = 6)
    private BigDecimal responseCost;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Column(name = "eval_duration_ns")
    private Long evalDurationNs;

    @Column(precision = 3, scale = 2)
    private BigDecimal temperature;

    @Column(name = "max_tokens")
    private Integer maxTokens;

    @Column(columnDefinition = "TEXT")
    private String error;

    @Column(name = "provider_request_id")
    private String providerRequestId;

    @CreationTimestamp
    private OffsetDateTime createdAt;
}
```

---

### 3. 비동기 로깅 서비스

```java
@Service
@RequiredArgsConstructor
public class ChatLogService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    /**
     * 비동기 로깅 - 실패해도 채팅 응답에 영향 없음
     */
    @Async
    public CompletableFuture<Void> logMessageAsync(
            String sessionId,
            String userAgent,
            String userContent,
            String assistantContent,
            Map<String, Object> metadata
    ) {
        try {
            // 1. conversation 조회 또는 생성
            Conversation conversation = findOrCreateConversation(sessionId, userAgent, metadata);

            // 2. user 메시지 저장
            saveMessage(conversation, "user", userContent);

            // 3. assistant 메시지 저장
            saveMessage(conversation, "assistant", assistantContent);

            // 4. conversation updated_at 갱신
            conversation.setUpdatedAt(OffsetDateTime.now());
            conversationRepository.save(conversation);

        } catch (Exception e) {
            // 로깅 실패는 무시 (fire-and-forget)
            log.error("Failed to log chat message: {}", e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }

    private Conversation findOrCreateConversation(String sessionId, String userAgent, Map<String, Object> metadata) {
        // 최근 30분 내 동일 세션의 대화가 있으면 재사용
        return conversationRepository
            .findRecentBySessionId(sessionId, OffsetDateTime.now().minusMinutes(30))
            .orElseGet(() -> createNewConversation(sessionId, userAgent, metadata));
    }
}
```

---

### 4. REST API 엔드포인트

#### 4.1 채팅 API (로깅 포함)

```
POST /api/chat
Request:
{
    "message": "안녕하세요"
}

Response:
{
    "conversationId": "uuid",
    "message": "안녕하세요! 무엇을 도와드릴까요?",
    "messageId": "uuid"
}

Headers:
Set-Cookie: chat_session_id=<uuid>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400
```

#### 4.2 세션 기준 삭제 API (GDPR 대응)

```
DELETE /api/chat/session
Description: 현재 세션의 모든 대화 기록 삭제

Response:
{
    "deleted": true,
    "conversationsDeleted": 3,
    "messagesDeleted": 15
}

Note: session_id는 쿠키에서 자동 추출
```

#### 4.3 대화 내역 조회 (선택)

```
GET /api/chat/history
Description: 현재 세션의 최근 대화 조회

Response:
{
    "conversations": [
        {
            "id": "uuid",
            "title": "첫 번째 대화",
            "createdAt": "2026-03-03T10:00:00Z",
            "messageCount": 5
        }
    ]
}
```

---

### 5. 쿠키 설정

#### 5.1 쿠키 발급 (백엔드)

```java
@Component
public class ChatSessionCookieManager {
    private static final String COOKIE_NAME = "chat_session_id";
    private static final int MAX_AGE = 86400; // 24시간

    public void setSessionCookie(HttpServletResponse response, String sessionId) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, sessionId)
            .httpOnly(true)
            .secure(true)
            .sameSite("None")  // cross-site 요청 허용 (AWS→GCP)
            .path("/")
            .maxAge(MAX_AGE)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public String getOrCreateSessionId(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = extractSessionId(request);
        if (sessionId == null) {
            sessionId = UUID.randomUUID().toString();
            setSessionCookie(response, sessionId);
        }
        return sessionId;
    }
}
```

#### 5.2 CORS 설정

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://your-frontend-domain.com")
            .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)  // 쿠키 전송 허용
            .maxAge(3600);
    }
}
```

---

### 6. Trace ID 전파

```java
@Component
public class TraceIdFilter extends OncePerRequestFilter {
    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null) {
            traceId = UUID.randomUUID().toString();
        }

        MDC.put("traceId", traceId);
        response.setHeader(TRACE_ID_HEADER, traceId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
        }
    }
}
```

---

### 7. 프론트엔드 - 개인정보 안내 모달

#### 7.1 요구사항

- **위치**: 페이지 하단 모달
- **노출 조건**: 첫 메시지 전, localStorage에 확인 플래그 없을 때
- **저장**: `localStorage.setItem('chat_privacy_accepted', 'true')`

#### 7.2 모달 내용 (예시)

```
[개인정보 수집 안내]

채팅 서비스 이용 시 다음 정보가 수집됩니다:
• 대화 내용
• 세션 정보 (쿠키)
• 브라우저/기기 정보

수집된 정보는 서비스 품질 개선에 활용되며,
언제든 [내 데이터 삭제] 버튼으로 삭제할 수 있습니다.

[확인]
```

---

## 완료 조건

- [ ] DB 마이그레이션 성공 (conversations, messages, model_runs)
- [ ] 채팅 API 호출 시 로그가 비동기로 저장됨
- [ ] 쿠키가 정상 발급되고, 재요청 시 동일 세션으로 인식됨
- [ ] 세션 삭제 API로 데이터 삭제 가능
- [ ] 로깅 실패 시에도 채팅 응답은 정상 반환
- [ ] 개인정보 안내 모달이 첫 방문 시 노출됨

---

## 참고

- 에픽 README: [README.md](./README.md)
- Phase 2 (FastAPI 연동): [phase-2-fastapi-integration.md](./phase-2-fastapi-integration.md)
