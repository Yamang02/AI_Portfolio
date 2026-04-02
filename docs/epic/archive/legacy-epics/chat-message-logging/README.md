# 에픽: 채팅 메시지 로그 수집 및 저장

**작성일**: 2026-03-03
**상태**: 기획
**우선순위**: Medium
**예상 기간**: 1–2주 (자체 구현)
**결정**: 자체 저장 확정. LLM은 **로컬 LLM** (Ollama, 현재 모델: `llama3:8b`).  
**진행 전략**: 백엔드(스키마·저장·API)를 먼저 준비한 뒤, FastAPI 에이전트/보안 서버 연동 시 응답 스펙만 맞추면 됨.

---

## 개요

AI/채팅 기능에서 발생하는 대화를 로그로 수집·저장하여 분석, 품질 개선, 사용량 추적에 활용합니다.

**사이트 특성**: 별도 User(회원) 계정 없음. 본인 정보를 올리는 **개인 포트폴리오 사이트**이므로, 방문자 구분·추적은 **세션 값**과 **User-Agent**로 수행.

---

## 아키텍처 (연동 구조)

- **프론트(AWS) – 백엔드(GCP) 분리**. 백엔드와 LLM 사이에는 **FastAPI**가 에이전트·보안 레이어로 동작하며, **백엔드 ↔ FastAPI** 구간은 **Cloudflare Tunnel**로 서버 간 통신만 함.

```
[브라우저] → [프론트 AWS] → [백엔드 GCP] --(Cloudflare Tunnel, 서버 간)--> [FastAPI (에이전트+보안)] → [LLM Ollama]
                  │                ↑
                  │                └── 쿠키: 브라우저 ↔ 백엔드(GCP) 만. session_id 여기서 발급·수신
                  └── API 호출 시 credentials 포함하면 쿠키 자동 전송
```

- **쿠키 사용 범위**: **브라우저 ↔ 백엔드(GCP)** 만 해당. 백엔드가 `chat_session_id`를 Set-Cookie로 주면, 프론트에서 `credentials: 'include'`(또는 동등 설정)로 호출할 때 브라우저가 자동 전송. **백엔드 ↔ FastAPI**는 서버 간 통신이므로 쿠키 없음.  
  → 프론트/백엔드가 다른 클라우드(AWS/GCP)여도, 쿠키는 “브라우저–백엔드” 관계라서 **쿠키로 session_id 쓰는 건 도전해볼 만함**. 다만 프론트와 백엔드 도메인이 다르면(예: www.xxx.com vs api.xxx.com) CORS `credentials: true` + 쿠키 `SameSite`, `Secure` 설정 필요.
- **백엔드**: 채팅 API 제공, **로그 수집·저장 책임**. DB 스키마·저장 API·보존 정책은 백엔드에서 관리.
- **FastAPI**: 에이전트 로직 + 보안. LLM(Ollama) 직접 호출. 응답에 **텍스트 + usage 메타데이터**를 담아 백엔드가 그대로 표준 스키마에 적재.

**백엔드 먼저 준비**

- 이 에픽에서는 **백엔드에 스키마·저장 로직·(필요 시) 로그 조회 API**를 먼저 갖춤.
- FastAPI 연동은 그다음 단계. 연동 시에는 FastAPI 응답에 usage/metadata 필드만 규격에 맞추면 되고, 백엔드는 이미 같은 스키마로 저장 가능.

---

## 저장할 정보 (모범 사례 · 표준 스키마)

웹 검색 및 LLM 로깅 스펙(liteLLM StandardLoggingPayload, OpenAI Usage 등) 기반 권장 필드. **스키마는 로컬 LLM과 외부 API 연동을 모두 고려해 표준적으로 설계** — 나중에 OpenAI/Anthropic 등 연동 시 동일 테이블에 그대로 적재 가능.

### 1. 대화/세션 수준 (conversation / chat_session)

**추적 방식**: User 계정 없음 → **세션 값(session_id)** + **User-Agent**로 방문자/대화 구분.

**session_id 확보: 쿠키 vs 클라이언트 생성 ID**

| 방식 | 장점 | 단점 |
|------|------|------|
| **쿠키** | 백엔드가 한 번 설정하면 브라우저가 매 요청마다 자동 전송. 프론트 코드 거의 불필요. 새로고침·탭 유지 시 같은 대화로 이어짐. | 쿠키 동의 정책이 있으면 “필수” 세션 쿠키로 두면 되는지 정책 확인 필요. |
| **클라이언트 생성 ID** (localStorage/sessionStorage에 UUID 저장 후 헤더·바디로 전송) | 서버가 쿠키를 설정하지 않아도 됨. EU 등에서 쿠키 동의 이슈 회피에 유리. | 프론트에서 ID 생성·저장·요청 시 포함 로직 필요. 저장 삭제 시 새 세션으로 인식됨. |

**권장: 쿠키 우선.** 프론트(AWS)·백엔드(GCP)가 분리돼 있어도 쿠키는 **브라우저 ↔ 백엔드(GCP)** 구간만 쓰이므로(백엔드–FastAPI는 서버 간 통신이라 쿠키 없음) **쿠키로 session_id 도전해볼 만함**. 백엔드에서 `chat_session_id` 쿠키 한 번 발급해 두고, 프론트는 API 호출 시 `credentials: 'include'`만 넣으면 브라우저가 자동 전송. 프론트/백엔드 도메인이 다르면 CORS `credentials: true` + 쿠키 `SameSite`, `Secure` 설정. 쿠키를 쓰기 어렵다면 `X-Session-Id` 헤더로 클라이언트가 UUID를 보내는 방식으로 대체 가능.

| 필드 | 설명 | 비고 |
|------|------|------|
| `id` | 대화(스레드) 식별자 | UUID 권장 |
| `session_id` | 세션 식별자 | 쿠키(`chat_session_id`)로 발급·전송 |
| `user_agent` | 요청 시 User-Agent 헤더 값 | 브라우저/기기 구분, 이상 트래픽·봇 식별에 활용 |
| `title` | 대화 제목(선택) | 첫 메시지 요약 또는 사용자 입력 |
| `created_at`, `updated_at` | 생성/수정 시각 | 타임존 명시 |
| `source` | 유입 경로 | Web, API, Admin 등 |
| `metadata` (JSONB) | 확장 메타데이터 | 요청 IP, 추가 헤더, 태그 등 (User-Agent는 별도 컬럼 권장) |

### 2. 메시지 수준 (messages)

| 필드 | 설명 | 비고 |
|------|------|------|
| `id` | 메시지 식별자 | UUID |
| `conversation_id` | 소속 대화 ID | FK |
| `role` | 발신 주체 | user / assistant / system |
| `content` | 메시지 본문 | 텍스트 또는 구조화(JSON) |
| `token_count` | 토큰 수(선택) | 비용/한도 분석용 |
| `created_at` | 발송 시각 | |

### 3. 모델 실행 수준 (model_runs) — 표준 스키마 (로컬/외부 API 공통)

스키마는 **로컬 LLM(Ollama)과 외부 API(OpenAI, Anthropic 등) 모두** 같은 테이블로 저장할 수 있도록 표준화. 제공처가 없는 필드는 NULL 허용.

| 필드 | 타입 | 설명 | 로컬(Ollama) | 외부 API |
|------|------|------|---------------|----------|
| `message_id` | FK UUID | 연결된 assistant 메시지 ID | ✓ | ✓ |
| `provider` | enum/string | 제공처 구분 | `ollama` | `openai`, `anthropic` 등 |
| `model_name` | string | 사용한 모델 식별자 | `llama3:8b` | `gpt-4o`, `claude-3-5-sonnet` 등 |
| `prompt_tokens` | int nullable | 입력 토큰 수 | Ollama `prompt_eval_count` | API 응답 |
| `completion_tokens` | int nullable | 출력 토큰 수 | Ollama `eval_count` | API 응답 |
| `total_tokens` | int nullable | 합계 (또는 계산값) | prompt+completion | API 응답 |
| `response_cost` | decimal nullable | 예상 비용(USD) | NULL 또는 0 | API 사용량·단가로 계산 |
| `latency_ms` | int nullable | 응답 지연(ms) | Ollama `total_duration` ns→ms | 측정 또는 API |
| `eval_duration_ns` | bigint nullable | 생성 구간만(ns) | Ollama `eval_duration` | NULL 가능 |
| `temperature` | decimal nullable | 호출 시 temperature | 선택 | 선택 |
| `max_tokens` | int nullable | 호출 시 max_tokens | 선택 | 선택 |
| `error` | text nullable | 오류 메시지(실패 시) | ✓ | ✓ |
| `provider_request_id` | string nullable | 벤더 측 요청 ID | NULL | OpenAI `id` 등 |
| `created_at` | timestamp | 기록 시각 | ✓ | ✓ |

**표준화 포인트**

- `provider`로 로컬/외부 구분 → 나중에 API 추가해도 마이그레이션 없이 동일 스키마 사용.
- 토큰·비용·지연은 모두 nullable → 제공처가 주는 것만 저장.
- liteLLM StandardLoggingPayload, OpenAI Usage 스키마와 호환되도록 필드명·의미 통일.

**로컬 Ollama + FastAPI 에이전트 구조에서**

- Ollama는 FastAPI 서버가 호출. FastAPI가 Ollama 응답(`prompt_eval_count`, `eval_count`, `total_duration` 등)을 받아, 백엔드가 쓸 **usage 메타데이터**로 가공해 응답에 포함.
- **백엔드**는 FastAPI를 호출하고, 응답 본문(텍스트) + usage 메타데이터를 받아 위 표준 스키마로 저장. 백엔드는 Ollama를 직접 호출하지 않음.
- 연동 시 **FastAPI → 백엔드 응답 스펙**에 다음이 포함되면 됨: `response`(텍스트), `provider`(예: `ollama`), `model_name`, `prompt_tokens`, `completion_tokens`, `latency_ms`, (선택) `eval_duration_ns`, `error`. 백엔드는 이 스펙으로 model_runs까지 한 번에 저장 가능.

### 4. 도구/에이전트 호출 (tool_calls) — 에이전트 사용 시 (Phase 1 제외)

> **Phase 1 제외**: 현재 Ollama llama3:8b는 function calling 미지원. 추후 지원 모델 도입 시 추가.

| 필드 | 설명 | 비고 |
|------|------|------|
| `tool_name` | 호출된 도구/함수명 | |
| `input` (JSONB) | 인자 | |
| `output` (JSONB) | 결과 | 실패 시 스택 등 |
| `latency_ms`, `status` | 소요 시간, 성공/실패 | |
| `step_number` | 대화 내 순서 | |

### 5. 식별·추적 및 컴플라이언스

**현재 사이트**: User 계정 없음 → 개인 식별은 하지 않고, **세션 + User-Agent**만 저장.

| 항목 | 적용 |
|------|------|
| 식별자 | `session_id`(클라이언트/쿠키) + `user_agent`. 동일 방문자·동일 대화 구분용. |
| PII | 메시지 본문에 방문자가 입력한 내용 포함 가능 → 필요 시 태깅·마스킹 정책 적용 |
| 보존 기간 | 정책에 따라 설정(예: 90일, 1년). 오래된 로그 아카이브·삭제 |
| Trace ID | 요청 단위 추적용 ID (디버깅·분석). metadata 또는 별도 필드 |

### 6. 스토리지 전략 (참고)

- **Hot**: 최근 대화 — PostgreSQL/MySQL 등으로 즉시 조회·API 제공
- **Cold**: 오래된 로그 — Parquet/Delta Lake 등으로 아카이브 후 분석·컴플라이언스
- **캐시**: 최근 세션 — Redis 등으로 응답 속도 개선(선택)

---

## 자체 구현 vs 외부 서비스

### 자체 구현 (DB + API)

**장점**
- 데이터 완전 자립, 스키마·보존 기간 자유
- 비용: 인프라만 (DB 스토리지, 백업)
- 포트폴리오 백엔드와 동일 스택(Spring, Postgres)으로 통합 용이

**단점**
- 스키마 설계, 마이그레이션, 보존/삭제 정책 직접 구현
- 대시보드·분석 UI는 별도 구축 필요
- 트래픽 증가 시 스토리지·인덱스 설계 필요

**적합한 경우**: 데이터 주권 중요, 장기적으로 분석·커스텀 요구 많음, 트래픽이 아직 중소 규모

---

### 외부 서비스 (SaaS)

**대표 서비스 예시**
- **GPTboost**: OpenAI API 앱용, 대화 로깅·사용량·감정 분석·PII 보호
- **Inkeep Analytics API**: OpenAI 호환 채팅 로깅, 피드백(좋아요/싫어요), REST API
- **SimplyAnalyze**: 실시간 토픽 분류, 팀 가시성, REST API 연동
- **Chipp**: 채팅 이력·사용량·CSV/Sheets 내보내기
- **PromptLayer, LangSmith** 등: LLM 트레이스·로그·평가에 특화

**장점**
- 빠른 도입, 대시보드·분석·알림 제공
- 규정·보존 정책을 서비스에 위임 가능(서비스별 확인 필요)

**단점**
- 비용(월 구독·호출당 과금)
- 데이터가 외부로 나감, 스키마·보존 기간이 서비스 제약에 따름
- 벤더 종속

**적합한 경우**: 빠른 인사이트·대시보드가 우선, 팀 규모 작음, 데이터 외부 저장 수용 가능

---

## 방향 (확정)

**백엔드 먼저**: 백엔드에 스키마·저장 API 구현 (Phase 1). FastAPI 미연동 시에도 메시지·세션만 저장 가능.
- Phase 2: FastAPI 연동 시 응답에 usage 포함 → 백엔드는 동일 스키마로 model_runs 저장.
- Phase 3(선택): 집계·보존 정책.

---

## 다음 단계

- [x] 저장 방식: 자체 저장 확정
- [x] LLM 환경: 로컬 Ollama (llama3:8b) 반영
- [x] 아키텍처: 백엔드 ↔ FastAPI(에이전트+보안) ↔ LLM 반영, 백엔드 먼저 준비
- [ ] **Phase 1**: 백엔드 스키마(마이그레이션) 및 저장 API 설계·구현
- [ ] Phase 2: FastAPI 응답 스펙(usage 포함) 확정 및 연동
- [ ] (선택) Phase 3: 집계·보존 정책

---

## 이 단계에서 함께 고려할 항목

채팅 로그 도입 시 보통 같이 검토하는 항목들. Phase 1과 함께 정할지, Phase 2·3으로 미룰지만 정해 두면 됨.

| 항목 | 설명 | 결정/비고 |
|------|------|------------|
| **세션/IP별 레이트 리밋** | 세션·IP당 요청 제한. | **이미 관련 정책이 코드로 있음.** 기존 정책 활용. |
| **로깅 실패 시 동작** | 로깅 실패해도 채팅은 성공시키기(유저 친화적). **비동기 로깅**: Spring `@Async` + fire-and-forget 방식 사용. | **확정**: `@Async` 방식 |
| **Trace ID / Request ID** | 요청 진입 시 ID 생성 → FastAPI 헤더 전달 → metadata 저장. 디버깅·추적용. | Phase 1에서 필드·전파 규칙 반영 (확정) |
| **보존 기간·TTL** | 90일·1년 등 정책 수립. 삭제/아카이브는 배치·스케줄러로. | **당장 트래픽 많지 않아 자동화는 보류.** 정책만 정해 두고 필요 시 수동·배치로 처리. |
| **쿠키·CORS 체크리스트** | HttpOnly, Secure, SameSite, CORS credentials 등. | **구축 시 직접 처리.** |
| **DB 인덱스** | `conversations(session_id, created_at)`, `messages(conversation_id, created_at)`, `model_runs(...)`. | Phase 1 마이그레이션에 포함 (확정) |
| **개인정보·쿠키 안내** | 채팅 내용·세션 쿠키 저장 안내. **페이지 하단 모달**로 구현. 브라우저 저장 기준 1회 노출 (localStorage에 "안내 확인함" 플래그 저장 → 재방문 시 미노출). 첫 메시지 전 노출. | **확정**: 페이지 하단 모달, 브라우저 저장 1회 |
| **session 기준 삭제 API** | session_id로 조회·삭제. "내 데이터 삭제" 대응 (GDPR 등 고려). | **확정**: Phase 1에 API 포함 |

---

## 참고 자료

- [Unified Chat History and Logging System (Medium)](https://medium.com/@mbonsign/unified-chat-history-and-logging-system-a-comprehensive-approach-to-ai-conversation-management-dc3b5d75499f)
- [liteLLM StandardLoggingPayload](https://docs.litellm.ai/docs/proxy/logging_spec)
- [Schema Design for Agent Memory and LLM History (Medium)](https://medium.com/@pranavprakash4777/schema-design-for-agent-memory-and-llm-history-38f5cbc126fb)
- [AWS IVS Chat Logging](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/chat-logging.html)
- [Inkeep Analytics API](https://docs.inkeep.com/analytics-api/add-analytics-to-any-chat)
