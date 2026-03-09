# Phase 3: 집계 및 보존 정책 (선택)

**상태**: 대기 (Phase 2 완료 후, 필요 시 진행)
**우선순위**: Low
**담당**: 백엔드

---

## 목표

트래픽 증가 및 운영 안정화 후, 로그 데이터의 집계/분석 및 보존/삭제 정책을 구현한다.

> **현재 판단**: 트래픽이 많지 않아 자동화는 보류. 정책만 정해두고 필요 시 수동/배치로 처리.

---

## 전제 조건

- [x] Phase 1 완료
- [x] Phase 2 완료
- [ ] 일정 수준의 로그 데이터 축적 (분석 의미 있을 정도)

---

## 산출물

- [ ] 보존 정책 문서
- [ ] (선택) 집계 테이블/뷰
- [ ] (선택) 삭제/아카이브 배치 스크립트

---

## 상세 태스크

### 1. 보존 정책 정의

#### 1.1 정책 (안)

| 데이터 | 보존 기간 | 처리 방식 |
|--------|-----------|-----------|
| conversations | 1년 | 1년 후 아카이브 또는 삭제 |
| messages | 1년 | conversation과 동일 |
| model_runs | 1년 | conversation과 동일 |

#### 1.2 고려 사항

- **GDPR/개인정보**: 세션 삭제 API로 사용자가 직접 삭제 가능 (Phase 1에서 구현)
- **스토리지 비용**: 현재 규모에서는 무시 가능, 향후 증가 시 아카이브 검토
- **분석 필요성**: 오래된 데이터도 트렌드 분석에 활용할 수 있음

---

### 2. 집계 뷰/테이블 (선택)

트래픽 증가 시 실시간 집계 대신 미리 계산된 집계 테이블 활용.

#### 2.1 일별 사용량 집계

```sql
CREATE TABLE daily_chat_stats (
    date DATE PRIMARY KEY,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_latency_ms DECIMAL(10, 2),
    unique_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 집계 쿼리 (배치로 실행)
INSERT INTO daily_chat_stats (date, total_conversations, total_messages, total_tokens, avg_latency_ms, unique_sessions)
SELECT
    DATE(c.created_at) as date,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(m.id) as total_messages,
    SUM(mr.total_tokens) as total_tokens,
    AVG(mr.latency_ms) as avg_latency_ms,
    COUNT(DISTINCT c.session_id) as unique_sessions
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
LEFT JOIN model_runs mr ON mr.message_id = m.id
WHERE DATE(c.created_at) = CURRENT_DATE - INTERVAL '1 day'
GROUP BY DATE(c.created_at)
ON CONFLICT (date) DO UPDATE SET
    total_conversations = EXCLUDED.total_conversations,
    total_messages = EXCLUDED.total_messages,
    total_tokens = EXCLUDED.total_tokens,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    unique_sessions = EXCLUDED.unique_sessions;
```

#### 2.2 모델별 사용량 집계

```sql
CREATE TABLE model_usage_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 0,
    total_prompt_tokens INTEGER DEFAULT 0,
    total_completion_tokens INTEGER DEFAULT 0,
    avg_latency_ms DECIMAL(10, 2),
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date, provider, model_name)
);
```

---

### 3. 삭제/아카이브 배치 (선택)

#### 3.1 삭제 스크립트

```sql
-- 1년 이상 된 대화 삭제 (CASCADE로 messages, model_runs도 삭제됨)
DELETE FROM conversations
WHERE created_at < NOW() - INTERVAL '1 year';
```

#### 3.2 아카이브 방식 (대안)

데이터를 완전 삭제하지 않고 별도 테이블/스토리지로 이동.

```sql
-- 아카이브 테이블로 이동
INSERT INTO conversations_archive
SELECT * FROM conversations
WHERE created_at < NOW() - INTERVAL '1 year';

-- 원본에서 삭제
DELETE FROM conversations
WHERE created_at < NOW() - INTERVAL '1 year';
```

#### 3.3 Spring 배치 (선택)

```java
@Scheduled(cron = "0 0 3 * * *")  // 매일 새벽 3시
public void archiveOldConversations() {
    int deleted = conversationRepository.deleteOlderThan(
        OffsetDateTime.now().minusYears(1)
    );
    log.info("Archived {} old conversations", deleted);
}
```

---

### 4. 모니터링 쿼리 (참고)

#### 4.1 최근 7일 사용량

```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as conversations,
    COUNT(DISTINCT session_id) as unique_users
FROM conversations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### 4.2 모델별 토큰 사용량

```sql
SELECT
    provider,
    model_name,
    COUNT(*) as requests,
    SUM(total_tokens) as total_tokens,
    AVG(latency_ms) as avg_latency
FROM model_runs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY provider, model_name;
```

#### 4.3 에러율

```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(CASE WHEN error IS NOT NULL THEN 1 END) as errors,
    ROUND(COUNT(CASE WHEN error IS NOT NULL THEN 1 END)::decimal / COUNT(*) * 100, 2) as error_rate
FROM model_runs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 완료 조건

- [ ] 보존 정책 문서화 완료
- [ ] (선택) 집계 테이블 생성 및 배치 스크립트 작성
- [ ] (선택) 삭제/아카이브 배치 구현

---

## 참고

- 에픽 README: [README.md](./README.md)
- Phase 1 (백엔드 스키마): [phase-1-backend-schema-api.md](./phase-1-backend-schema-api.md)
- Phase 2 (FastAPI 연동): [phase-2-fastapi-integration.md](./phase-2-fastapi-integration.md)
