# P01: ObjectMapper 중앙화 및 직렬화 설정 통합

## 목표

`RedisConfig`와 `CacheConfig`가 각각 독립적으로 생성하던 `GenericJackson2JsonRedisSerializer` 인스턴스를
하나의 `@Bean ObjectMapper`를 공유하도록 변경하여 직렬화 설정 불일치를 근본 제거한다.

## 문제 상세

### 현재 구조
```
RedisConfig.java
  └─ new GenericJackson2JsonRedisSerializer()
       └─ .configure(om -> { JavaTimeModule, ... })  ← 내부 ObjectMapper A

CacheConfig.java
  └─ new GenericJackson2JsonRedisSerializer()
       └─ .configure(om -> { JavaTimeModule, ... })  ← 내부 ObjectMapper B (다른 인스턴스)
```

두 `configure()` 람다가 동일해 보여도 인스턴스가 다르므로, 향후 한 쪽만 수정되면 즉시 직렬화 불일치 발생.
`GenericJackson2JsonRedisSerializer(ObjectMapper)` 생성자를 사용하면 외부에서 주입한 ObjectMapper를 그대로 사용하므로 공유 가능하다.

### `configure()` vs 생성자 주입 차이
- `configure(om -> ...)`: 내부적으로 이미 defaultTyping이 설정된 ObjectMapper를 람다로 수정 — DefaultTyping 설정을 덮어쓸 위험 없음
- `new GenericJackson2JsonRedisSerializer(objectMapper)`: 외부 ObjectMapper를 그대로 사용 — **activateDefaultTyping을 직접 설정해야 함**

따라서 생성자 주입 방식을 선택할 경우 ObjectMapper 빈에 `activateDefaultTyping(PROPERTY)` 적용이 필수다.

## 구현 상세

### 1. Redis 전용 ObjectMapper 빈 추출

**새 파일 생성:**  
`backend/src/main/java/com/aiportfolio/backend/infrastructure/config/RedisObjectMapperConfig.java`

```java
@Configuration
public class RedisObjectMapperConfig {

    @Bean("redisObjectMapper")
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setDateFormat(new SimpleDateFormat("yyyy-MM"));
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // GenericJackson2JsonRedisSerializer가 내부적으로 적용하는 것과 동일한 타입 설정
        mapper.activateDefaultTyping(
            mapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }
}
```

**주의:** `@Primary` 지정 금지 — Spring MVC의 기본 ObjectMapper와 분리 유지.

### 2. RedisConfig 수정

**변경 파일:** `infrastructure/config/RedisConfig.java`

```java
// Before
GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();
serializer.configure(om -> { ... });

// After
@Autowired @Qualifier("redisObjectMapper")
private ObjectMapper redisObjectMapper;

GenericJackson2JsonRedisSerializer serializer =
    new GenericJackson2JsonRedisSerializer(redisObjectMapper);
```

### 3. CacheConfig 수정

**변경 파일:** `infrastructure/config/CacheConfig.java`

```java
// redisCacheManager 메서드 파라미터에 ObjectMapper 추가
@Bean
@Primary
public CacheManager redisCacheManager(
    RedisConnectionFactory connectionFactory,
    @Qualifier("redisObjectMapper") ObjectMapper redisObjectMapper
) {
    GenericJackson2JsonRedisSerializer serializer =
        new GenericJackson2JsonRedisSerializer(redisObjectMapper);
    // 나머지 동일
}
```

### 4. CacheConfig 주석 제거

현재 "WRAPPER_ARRAY vs PROPERTY 충돌" 주석은 `configure()` 람다 방식의 주의사항이었으므로,
생성자 주입으로 교체 후 해당 주석 삭제.

## 완료 기준 (체크리스트)

- [x] `RedisObjectMapperConfig.java` 생성, `@Bean("redisObjectMapper")` 정의
- [x] `RedisConfig`: `configure()` 람다 제거, `@Qualifier("redisObjectMapper")` 주입으로 교체
- [x] `CacheConfig`: `configure()` 람다 제거, 메서드 파라미터로 `redisObjectMapper` 주입
- [x] `CacheConfig`의 WRAPPER_ARRAY/PROPERTY 관련 주석 제거
- [x] Docker `backend` 컨테이너에서 `mvn compile`·`mvn test` 성공 (AGENTS.md)
- [x] Redis/캐시 직렬화 회귀 방지: `RedisSerializationConfigIntegrationTest` (`redisObjectMapper` 빈, `RedisTemplate`·`CacheManager` 라운드트립)
- [ ] 로컬 실행 후 `/api/portfolio` 호출 → Redis에 캐시 저장 확인 (Admin 캐시 키 조회)
- [ ] 캐시 저장 후 재조회 시 역직렬화 오류 없음 확인
- [ ] P02 착수 전 Redis 전체 플러시 (`POST /api/admin/cache/flush`) 실행 권고
