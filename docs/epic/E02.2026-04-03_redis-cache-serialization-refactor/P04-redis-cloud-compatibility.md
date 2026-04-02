# P04: Redis Cloud 7.4 호환성 검증 및 회귀 방지

## 목표

Redis Cloud 7.4 환경에서의 연결 설정을 검토하고,
P01~P03에서 수정한 직렬화/캐시 전략이 실제 Redis 서버에서 정상 작동함을 검증한다.
이후 동일 문제가 재발하지 않도록 회귀 방지 테스트를 구축한다.

## 문제 상세

### Redis Cloud 7.4 환경 특이사항

**KEYS 명령어 이슈:**
`RedisCacheManagementAdapter`에 `SCAN → KEYS fallback`이 존재한다.
Redis Cloud에서는 `KEYS *`가 성능 보호 정책으로 차단될 수 있으며,
이 경우 `getStatistics()`, `getKeysByPattern()` 메서드가 빈 결과를 반환하거나 예외를 발생시킨다.

**연결 풀 및 timeout 불일치:**
| 환경 | timeout | max-active | SSL |
|---|---|---|---|
| local | 2000ms | 8 | false |
| staging | 10000ms | (기본값) | 미확인 |
| production | 2000ms | (기본값) | 미확인 |

Redis Cloud는 TLS/SSL을 요구하는 경우가 있으며, staging timeout이 유독 길게 설정되어 있는 이유 확인 필요.

### 현재 회귀 방지 수단 없음

직렬화 문제가 발생해도 캐시는 조용히 실패(silent failure)하므로
배포 후 한참 지나서야 문제를 인지하게 되는 구조.

## 구현 상세

### 1. RedisCacheManagementAdapter KEYS fallback 제거

**변경 파일:** `infrastructure/persistence/redis/adapter/RedisCacheManagementAdapter.java`

Redis Cloud 7.4는 SCAN을 완전 지원한다. KEYS fallback을 제거하고 SCAN만 사용:

```java
// Before
try {
    // SCAN 방식
    cursor = redisTemplate.scan(ScanOptions.scanOptions().match(pattern).count(100).build());
    ...
} catch (Exception e) {
    // KEYS fallback
    Set<String> keys = redisTemplate.keys(pattern);  // ← 제거 대상
    ...
}

// After — SCAN만 사용, KEYS fallback 없음
// SCAN 실패 시 빈 Set 반환 또는 로그만 기록
```

### 2. application-staging.yml SSL 설정 확인 및 통일

**변경 파일:** `application-staging.yml`, `application-production.yml`

Redis Cloud 7.4 연결 시 SSL 필수 여부 확인:
```yaml
spring:
  data:
    redis:
      ssl:
        enabled: true  # Redis Cloud 요구 사항이면 staging/production 모두 활성화
      timeout: 3000ms  # staging의 10000ms → 실제 필요치 기반으로 조정
```

staging timeout 10000ms 설정 이유 확인 후 불필요하다면 production과 동일하게 조정.

### 3. 직렬화 단위 테스트 추가

**새 파일:**  
`backend/src/test/java/com/aiportfolio/backend/infrastructure/config/RedisSerializationTest.java`

```java
@SpringBootTest
@ActiveProfiles("local")
class RedisSerializationTest {

    @Autowired
    @Qualifier("redisObjectMapper")
    private ObjectMapper redisObjectMapper;

    @Test
    void redisObjectMapper_should_serialize_and_deserialize_CloudUsage_with_LocalDate() {
        CloudUsage usage = new CloudUsage(...);
        String json = redisObjectMapper.writeValueAsString(usage);
        CloudUsage restored = redisObjectMapper.readValue(json, CloudUsage.class);
        assertThat(restored.getDate()).isEqualTo(usage.getDate());
    }

    @Test
    void redisObjectMapper_should_serialize_SpamSubmissionRecord() { ... }

    @Test
    void genericJackson2JsonSerializer_should_include_class_property() {
        // @class 필드가 포함된 JSON 생성 확인
    }
}
```

**목적:** P01에서 통합한 ObjectMapper 설정이 요구 사항을 충족하는지 빠르게 검증.
Redis 서버 연결 없이 직렬화 로직만 단독 테스트 가능.

### 4. Admin 캐시 헬스체크 엔드포인트 문서화

기존 `GET /api/admin/cache/stats` 응답에 직렬화 버전 또는 설정 식별자를 추가하면
배포 후 직렬화 설정이 올바르게 적용됐는지 확인하는 데 활용 가능.
(선택 구현 — 우선순위 낮음)

## 완료 기준 (체크리스트)

- [x] `RedisCacheManagementAdapter`: `KEYS` fallback 제거, SCAN 실패 시 빈 `Set` 반환 및 로그
- [x] `application-staging.yml`: Redis `timeout` 10000ms → **3000ms** (SCAN 전용·로컬/프덕과 정렬), SSL은 기존 `${REDIS_SSL}` 유지
- [x] SSL: staging/production 모두 `spring.data.redis.ssl.enabled: ${REDIS_SSL}` — Redis Cloud는 배포 환경에서 `REDIS_SSL` 설정으로 반영
- [x] `RedisSerializationTest.java`: CloudUsage+LocalDate, SpamSubmissionRecord, `@class` 포함 JSON (3케이스)
- [x] Docker `backend`에서 `mvn test`·`-Dtest=RedisSerializationTest` 통과
- [ ] staging 배포 후 `GET /api/admin/cache/stats` (수동)
- [ ] staging 배포 후 포트폴리오 API 캐시 동작 (수동)
