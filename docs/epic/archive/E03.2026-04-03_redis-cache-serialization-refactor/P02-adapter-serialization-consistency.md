# P02: 어댑터 직렬화 일관성 확보

## 전제 조건

**P01 완료 후 착수.** P01에서 확립한 `redisObjectMapper` 빈을 이 Phase에서도 활용한다.

## 목표

`RedisCloudUsageCacheAdapter`와 `RedisRateLimitStorageAdapter`의 직렬화 방식을
P01에서 통일한 `GenericJackson2JsonRedisSerializer` 전략과 일치시킨다.

## 문제 상세

### RedisCloudUsageCacheAdapter — 수동 직렬화 불일치

```java
// 현재: Spring Boot 기본 ObjectMapper 주입 (Redis 설정 없음)
private final RedisTemplate<String, String> redisTemplate;
private final ObjectMapper objectMapper;  // ← Spring MVC의 기본 ObjectMapper

// 저장 시 수동 직렬화
String json = objectMapper.writeValueAsString(usage);
redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);

// 읽기 시 수동 역직렬화
String json = redisTemplate.opsForValue().get(key);
CloudUsage usage = objectMapper.readValue(json, CloudUsage.class);
```

**문제점:**
- `RedisTemplate<String, String>`은 값을 plain String으로 저장 → `@class` 타입 정보 없음
- 주입되는 `ObjectMapper`가 Redis용 설정(`JavaTimeModule` + `activateDefaultTyping`)을 갖고 있지 않으면 `LocalDate` 직렬화 오류 발생
- `CloudUsage`가 패키지 이동되어도 타입 정보가 없으므로 `readValue(json, CloudUsage.class)` 방식은 타입 명시로 안전하지만, 다른 어댑터와 전략이 달라 혼란 야기

### RedisRateLimitStorageAdapter — Map fallback 패턴

```java
// 현재: GenericJackson2JsonRedisSerializer가 저장 시 @class 포함 JSON 생성
redisTemplate.opsForValue().set(KEY_PREFIX + clientId, submissionState, RECORD_TTL);

// 읽기 시 타입 정보가 있으면 SpamSubmissionRecord로 역직렬화 되어야 하지만
// Redis 저장값이 LinkedHashMap으로 역직렬화되는 경우를 방어하는 코드
private SpamSubmissionRecord fromRedisValue(Object raw) {
    if (raw instanceof SpamSubmissionRecord r) { return r; }
    if (raw instanceof Map<?, ?> map) { ... }  // ← 이 경로가 실행된다는 것 자체가 문제
}
```

**문제점:**
- `GenericJackson2JsonRedisSerializer`가 제대로 작동하면 `raw instanceof SpamSubmissionRecord`가 항상 참이어야 함
- `Map<?, ?>` fallback이 실행된다는 것은 역직렬화 과정에서 타입 정보가 무시되고 있다는 신호
- P01 완료 후에도 이 문제가 지속된다면 `SpamSubmissionRecord` 클래스 자체의 직렬화 설정 이슈

## 구현 상세

### 1. RedisCloudUsageCacheAdapter 리팩토링

**변경 파일:** `infrastructure/cache/RedisCloudUsageCacheAdapter.java`

```java
// Before
private final RedisTemplate<String, String> redisTemplate;
private final ObjectMapper objectMapper;

// After
private final RedisTemplate<String, Object> redisTemplate;  // String → Object 타입 변경
// ObjectMapper 필드 제거 (RedisTemplate의 serializer가 처리)
```

수동 직렬화/역직렬화 코드 제거:
```java
// Before
String json = objectMapper.writeValueAsString(usage);
redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);

// After
redisTemplate.opsForValue().set(key, usage, ttlSeconds, TimeUnit.SECONDS);
```

역직렬화:
```java
// Before
String json = redisTemplate.opsForValue().get(key);
CloudUsage usage = objectMapper.readValue(json, CloudUsage.class);

// After
Object raw = redisTemplate.opsForValue().get(key);
if (raw instanceof CloudUsage usage) {
    return usage;
}
// GenericJackson2JsonRedisSerializer는 @class 기반으로 CloudUsage를 복원하므로
// Map fallback 없이 타입 캐스팅만으로 충분
log.warn("Unexpected type for cloud usage cache: key={}, type={}", key,
    raw != null ? raw.getClass().getName() : "null");
return null;
```

**주의:** `RedisTemplate<String, Object>` 빈은 `RedisConfig`에서 이미 `GenericJackson2JsonRedisSerializer`로 설정되어 있으므로 추가 설정 불필요.

### 2. RedisRateLimitStorageAdapter Map fallback 제거

**변경 파일:** `infrastructure/persistence/redis/adapter/RedisRateLimitStorageAdapter.java`

P01 완료 후 Redis 플러시 → 재저장된 데이터는 모두 `@class` 포함 형식으로 저장됨.
`Map<?, ?>` fallback이 더 이상 필요 없어지므로 제거.

```java
// After
private SpamSubmissionRecord fromRedisValue(Object raw) {
    if (raw == null) return null;
    if (raw instanceof SpamSubmissionRecord r) return r;
    // Map fallback 제거
    log.warn("Unexpected Redis value type for spam record: {}", raw.getClass().getName());
    return null;
}
```

**만약 P01 완료 후에도 Map fallback이 실행된다면:**  
`SpamSubmissionRecord` 클래스에 문제가 있는 것이므로 아래를 확인:
- Lombok `@Data` 또는 `@Getter/@Setter` 적용 여부 (역직렬화 시 기본 생성자 필요)
- `@JsonCreator` 또는 기본 생성자 존재 여부

### 3. 기존 캐시 데이터 마이그레이션

P02 완료 후 Redis 플러시 실행:
```
POST /api/admin/cache/flush
```
`cloud_usage:daily:*` 키 패턴 데이터도 포함 (90일 TTL이므로 자동 만료 대기 불가).

## 완료 기준 (체크리스트)

- [x] `RedisCloudUsageCacheAdapter`: `RedisTemplate<String, String>` → `RedisTemplate<String, Object>` 교체
- [x] `RedisCloudUsageCacheAdapter`: `objectMapper` 필드 제거, 수동 직렬화/역직렬화 코드 제거
- [x] `RedisCloudUsageCacheAdapter`: `getDailyUsage` 등 `objectMapper.readValue()` 호출 제거
- [x] `RedisRateLimitStorageAdapter`: `Map<?, ?>` fallback 코드 제거
- [x] `CloudUsage`: Jackson/Redis 역직렬화용 `@NoArgsConstructor` / `@AllArgsConstructor` 추가 (기존 `@Builder` 유지)
- [x] `SpamSubmissionRecord`: 기본 생성자 (`@NoArgsConstructor`) 기존 유지 확인
- [x] Docker `backend`에서 `mvn test` 성공; `RedisAdapterSerializationIntegrationTest`로 어댑터 라운드트립 검증
- [ ] 로컬에서 스팸·CloudUsage 수동 스모크 (선택)
- [ ] P02 반영 후 Redis 전체 플러시 (`POST /api/admin/cache/flush`) 권고
