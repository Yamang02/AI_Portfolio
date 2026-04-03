# Epic E03: redis-cache-serialization-refactor

## 목표

Redis Cloud 7.4 환경에서 반복적으로 발생하는 직렬화/역직렬화 오류를 근본적으로 해결하고,
캐시 관련 Spring Boot 코드 전반을 일관된 전략으로 리팩토링한다.

구체적으로:
- ObjectMapper 설정을 단일 빈으로 중앙화하여 설정 불일치 제거
- 어댑터별로 다른 직렬화 방식을 `GenericJackson2JsonRedisSerializer` 기반으로 통일
- `allEntries=true` 전략 제거, 키 단위 세분화된 캐시 무효화 도입
- Redis Cloud 7.4 호환성 검증 및 회귀 방지 테스트 구축

## 배경 / 맥락

### 반복 발생 중인 직렬화 문제의 원인 구조

현재 캐시 시스템은 아래 세 가지 불일치가 겹쳐 직렬화 오류가 반복 발생하고 있다.

**1. ObjectMapper 인스턴스 분산**
- `RedisConfig`와 `CacheConfig`가 각각 `new GenericJackson2JsonRedisSerializer()`를 생성
- 두 직렬화기의 내부 ObjectMapper는 서로 다른 인스턴스 → 설정이 조금이라도 달라지면 저장/읽기 형식 불일치 발생
- 관련 커밋: `5738535 fix(api/cache): use default Redis JSON typing`, `573df97 fix: Education 및 Experience API 직렬화 문제 해결`

**2. 어댑터별 직렬화 전략 혼재**
- `RedisRateLimitStorageAdapter`: `RedisTemplate<String, Object>` 사용, `GenericJackson2JsonRedisSerializer`로 저장하지만 읽기 시 `Map<?, ?>` fallback 처리 — 타입 정보가 있어야 할 자리에 없을 때 발생하는 방어 코드
- `RedisCloudUsageCacheAdapter`: `RedisTemplate<String, String>` + 수동 `objectMapper.writeValueAsString()` 사용 — Spring Boot 기본 ObjectMapper를 주입받아 사용하므로 Redis 전용 직렬화 설정이 적용되지 않음

**3. `@class` 타입 정보의 취약성**
- `GenericJackson2JsonRedisSerializer`는 저장 시 `{"@class":"com.aiportfolio.backend...ClassName", ...}` 형태로 저장
- 클래스 패키지 이동, 이름 변경 시 기존 캐시 데이터 역직렬화 불가
- CacheConfig 주석에도 WRAPPER_ARRAY vs PROPERTY 충돌이 문서화되어 있음

### Redis Cloud 7.4 환경 특이사항

- `KEYS *` 명령어는 Redis Cloud에서 실행 시 서버 부하 이슈로 차단될 수 있음
- `RedisCacheManagementAdapter`의 `SCAN → KEYS fallback` 패턴이 Cloud 환경에서 예상과 다르게 동작할 가능성
- 연결 풀 설정과 timeout이 환경별로 다르게 설정되어 있어 일관성 검토 필요

## 특이점

- 백엔드는 헥사고날 아키텍처를 지향하므로 직렬화 설정은 `infrastructure/config` 레이어에 위치
- 도메인 모델(`CloudUsage`, `SpamSubmissionRecord`)에 직렬화 어노테이션 추가 시 도메인 오염 최소화 주의
- 각 Phase는 단독 배포 가능한 단위로 구성하되, P01 완료 전 P02 착수 불가 (의존 관계 있음)
- P05는 P01~P04 구현 후 **스킬 기반 검토·문서/경미 수정** 전용이며, 기능 추가 범위에 넣지 않는다
- Redis에 저장된 기존 캐시 데이터는 P01/P02 완료 후 플러시 필요 (직렬화 형식 변경으로 인한 깨진 캐시 제거)

## HTTP·Redis ObjectMapper 경계 (E05)

Spring MVC는 `@Primary` `ObjectMapper`로 HTTP 요청·응답 JSON을 바인딩한다. Redis 캐시는 `@Qualifier("redisObjectMapper")`로 주입된 매퍼(`activateDefaultTyping`, WRAPPER_ARRAY)를 `GenericJackson2JsonRedisSerializer`에만 연결한다. 구현 클래스: `RedisObjectMapperConfig`, `CacheConfig`, `RedisConfig`. 경계를 HTTP에 섞이지 않게 고정한 정리는 [E05 P01](../E05.2026-04-03_cache-boundary-and-ui-primitives-refactor/P01.backend-cache-serialization-boundary.md)를 본다.

## 구현 시 준수 원칙 (코드·메서드·주석)

에픽·Phase 문서 구조는 `epic-lifecycle`(DC-05)을 따른다. 아래는 **이 에픽에서 코드 작성 시** 동일하게 적용하는 basis 요약이다. (인프라·설정 코드가 많은 경우 **CC-01**은 순수 로직·계산에 집중해 적용하고, **CC-02**는 Application/Domain 경계가 바뀔 때 위주로 적용한다.)

### CC-05 코드 위생 (주석·미사용 코드)

| ID | 요지 |
|----|------|
| CC-05-01 | 코드만으로 알 수 없는 배경·제약·외부 약속은 **장문 주석이 아니라 문서**(이 에픽·Phase, `docs/` 등)에 두고, 소스에는 **경로·이슈·ADR 식별자** 수준만 참조한다. |
| CC-05-02 | **설명 주석은 파일(모듈) 상단만** — 역할 한 줄, 공식 문서 링크, 반드시 필요한 주의 한 줄. 구현 라인 옆의 why·단계 나열·보일러플레이트 주석은 쓰지 않는다. (스택이 요구하는 공개 API 문서화·TODO는 해당 규칙 예외.) |
| CC-05-03 | dead store, unused private, unused parameter는 제거한다. (프레임워크가 시그니처를 강제하는 파라미터는 예외.) |
| CC-05-04 | **미사용 import 없음.** |

### CC-01 로직 레벨 (순수 로직·계산·변환)

**우선순위:** 가독성 → 예측 가능성(동일 패턴 반복) → 단순성.

| 티어 | ID | 요지 |
|------|-----|------|
| Core | CC-01-01 | 로직은 **위→아래 한 방향** 선형 흐름. |
| Core | CC-01-02 | **Early return** — 예외 조건은 상단에서 처리 후 본문은 정상 흐름만. (조건 하나·본문 1~2줄이면 단순 if-else 허용.) |
| Core | CC-01-03 | 조건문 **중첩 최대 1단계**. 더 필요하면 조건 분리·함수 추출. |
| Core | CC-01-04 | 같은 의미가 단계적으로 정제될 때만 **동일 변수 재할당**; 이름이 더는 맞지 않으면 별도 변수(CC-01-06). |
| Guide | CC-01-05 | 변수명은 **그 시점 상태**를 반영; `data`, `tmp`, `result2` 등 금지 이름 피함. |
| Guide | CC-01-06 | **한 변수에 서로 다른 의미** 재할당 금지. |
| Guide | CC-01-07 | 컬렉션 순회는 **명령형 루프 기본**; 단계마다 단일 연산·부수효과 없는 **순수 체이닝**은 허용. 중간이 안 보이면 명령형으로. |
| Core | CC-01-08 | 순수 로직은 **외부 의존을 인자로**; 동일 입력→동일 결과. |
| Guide | CC-01-09 | 함수 복잡도: **책임 1**, **상태 변화(선언·재할당) 5회 이내**, **분기 3개 이내**, **한 조건식의 AND/OR 2개 이내**. 초과 시 분리. |
| Guide | CC-01-10 | **final** 우선(CC-01-04 단계적 변환·루프 카운터 등 예외). |

### CC-02 메서드·레이어 (호출 구조)

**우선순위:** 레이어 경계 유지 → 가독성 → 단순성.

| 티어 | ID | 요지 |
|------|-----|------|
| Core | CC-02-01 | **Application**은 흐름만; **계산은 Domain**으로 위임. |
| Core | CC-02-02 | **비즈니스 계산**은 Application에 직접 쓰지 않는다. (DTO 변환·null 체크 등 **데이터 정리**만 Application에서 허용.) |
| Core | CC-02-03 | 호출은 **Application → Domain**, **Application → Infrastructure** 방향만. Domain이 인프라를 부르지 않는다; 필요한 값은 Application이 조회해 인자로 넘긴다. |
| Core | CC-02-04 | **Application 메서드 하나 = 유스케이스 하나.** |
| Core | CC-02-05 | **부수효과(DB·API·메시지 등)** 는 **Application에서만** 발생. |
| Guide | CC-02-06 | Domain 호출은 **의미 단위**로 묶는다 — 잘게 쪼개 조합만 Application에 남기지 않는다. |

### 스택·검증 (프로젝트 스킬)

- **Spring·레이어:** Redis/캐시 `@Configuration`·어댑터는 `infrastructure`·`config`; 비즈니스 규칙은 도메인·애플리케이션. (`spring-boot-stack`)
- **Java:** 네이밍, record/stream/예외, 불변성 (`java-stack`).
- **도메인·애플리케이션 변경:** `layered-tdd-workflow`(TC-01) 범위면 해당 레이어 테스트·커밋 순서.
- **완료 주장 전:** `evidence-before-completion`; Maven은 `AGENTS.md`대로 Docker `backend` 컨테이너에서 실행.

## Phase 목록

- [P01: ObjectMapper 중앙화 및 직렬화 설정 통합](./P01-objectmapper-centralization.md)
- [P02: 어댑터 직렬화 일관성 확보](./P02-adapter-serialization-consistency.md)
- [P03: 캐시 무효화 전략 세분화](./P03-cache-eviction-refinement.md)
- [P04: Redis Cloud 호환성 검증 및 회귀 방지](./P04-redis-cloud-compatibility.md)
- [P05: 스킬 기반 검토 및 반영](./P05-skill-review-and-remediation.md)

## 상태

- [x] P01 완료 — `redisObjectMapper` 중앙화, 통합 테스트 (`RedisSerializationConfigIntegrationTest` 등)
- [x] P02 완료 — 어댑터 직렬화 통일, `RedisAdapterSerializationIntegrationTest`
- [x] P03 완료 — `CacheKeys`, 키 단위 `@CacheEvict`
- [x] P04 완료 — `RedisCacheManagementAdapter` KEYS 폴백 제거, `RedisSerializationTest`, staging `timeout` 정리
- [ ] P05 완료 — `epic-architecture-review`·`pt-01`·`pt-02`·`cc-02`·`cc-05`·`file-basis-review` 적용 및 [P05 문서](./P05-skill-review-and-remediation.md) 기록

**남은 운영·수동 항목 (에픽 외부/배포 후):** Redis 플러시(직렬화 형식 변경 시), staging에서 `GET /api/admin/cache/stats`·포트폴리오 API 스모크 — [P04 체크리스트](./P04-redis-cloud-compatibility.md) 참고.

## 완료

아카이브일: 2026-04-03

에픽 문서는 `docs/epic/archive/`로 이동했으며, P05 문서·체크리스트는 저장소 기준으로 별도 확인한다.
