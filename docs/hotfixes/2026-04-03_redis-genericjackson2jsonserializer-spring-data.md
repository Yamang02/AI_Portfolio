# 핫픽스: Redis 포트폴리오 캐시 직렬화 (루트 객체 + 직렬화기 일관성)

- **일자:** 2026-04-03  
- **영역:** 백엔드 Spring Cache + Redis (`GenericJackson2JsonRedisSerializer`), `PortfolioService` / `PortfolioApplicationService`

## 증상

`/api/data/projects` 등 포트폴리오 목록 조회 시 `SerializationException` / `MismatchedInputException` → HTTP 500. Redis 플러시 후에도 재현.

## 배경 (모범 사례·이슈)

- Spring Data Redis + `GenericJackson2JsonRedisSerializer`로 **캐시 값 루트가 JSON 배열** `[...]` 이 되면, 다형 역직렬화·`Object` 복원이 깨지는 사례가 보고된다 ([Stack Overflow: List mapping on Redis cache load](https://stackoverflow.com/questions/73355304/how-to-solve-list-mapping-exception-on-redis-cache-load-in-spring-boot), [spring-data-redis#2697](https://github.com/spring-projects/spring-data-redis/issues/2697) — `Stream.toList()` 등 구현체 이슈와 유사한 “루트/컬렉션” 주제).
- Redis용 `ObjectMapper`는 **HTTP용과 분리**하고, `RedisCacheConfiguration`에서 값 직렬화기를 명시하는 방식이 일반적이다 ([Medium: Configure Jackson for Spring Boot Redis cache](https://medium.com/@davenkin_93074/configure-jackson-when-using-spring-boot-redis-cache-daf658ea5e74)).

## 원인 (요약)

1. **`@Cacheable`이 `List<도메인>`을 그대로 반환** → 직렬화 시 **JSON 루트가 배열**이 되기 쉽고, `GenericJackson2JsonRedisSerializer`의 다형 처리와 충돌한다.
2. (과거) 커스텀 `ObjectMapper`에 `WRAPPER_ARRAY` 등을 씌우면 Spring이 기대하는 형식과 어긋날 수 있다.
3. **`PortfolioApplicationService`**가 프로젝트만 `PortfolioService`를 거치고, 경험·교육·자격증은 **레포지토리 직접 호출**로 캐시와 분기가 갈렸다.

## 조치 (코드)

1. **직렬화기:** `new GenericJackson2JsonRedisSerializer()` + `configure`로 `JavaTimeModule` 등만 추가 (`RedisObjectMapperConfig`). `CacheConfig` / `RedisConfig`는 동일 빈 공유.
2. **캐시 값 루트 평탄화:** `List<…>` 대신 **단일 JSON 객체**가 루트가 되도록 record 래퍼 사용 — `CachedProjectList`, `CachedExperienceList`, `CachedEducationList`, `CachedCertificationList` (`application.portfolio.cache`). `@Cacheable`은 `load*ForCache()`가 래퍼를 반환하고, 공개 API는 `.items()`로 언랩.
3. **집계 경로 정렬:** `PortfolioApplicationService`가 목록 조회를 전부 **`PortfolioService`**로 위임해 `/api/data/*`와 캐시 키가 일치한다.

회귀: `RedisSerializationTest` (`CachedProjectList` 루트가 `{` 로 시작하는지 포함).

## 운영

- 배포 후 **한 번** Redis 캐시 플러시 권장(이전 루트-배열 바이트 제거).

## 에픽 문서와의 관계

과거 [E03](../epic/archive/E03.2026-04-03_redis-cache-serialization-refactor/) 등과 병행해 볼 때, **캐시 경계 계약**은 본 핫픽스와 현재 코드를 우선한다.
