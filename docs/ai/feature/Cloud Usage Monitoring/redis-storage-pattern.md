# Redis 기반 임시 저장 패턴 (DB 스키마 변경 없이)

## 📋 개요

DB 스키마 변경 없이 Redis를 활용하여 날짜별 비용 히스토리를 저장하는 방법

## 🎯 Redis 저장 패턴

### 패턴 1: 날짜별 키 저장 (가장 간단) ⭐

**키 구조**:
```
cloud_usage:aws:2025-11-30
cloud_usage:aws:2025-11-29
cloud_usage:aws:2025-11-28
...
cloud_usage:gcp:2025-11-30
cloud_usage:gcp:2025-11-29
...
```

**장점**:
- ✅ 구현이 매우 간단
- ✅ 날짜별 조회 용이
- ✅ TTL 설정으로 자동 정리 (90일 후 삭제)
- ✅ 배치 작업 불필요 (API 호출 시 자동 저장)

**단점**:
- ⚠️ 날짜 범위 조회 시 여러 키 조회 필요
- ⚠️ Redis 메모리 사용량 증가 (하지만 TTL로 자동 정리)

**구현**:
```java
// 저장
String key = String.format("cloud_usage:%s:%s", provider, date);
redisTemplate.opsForValue().set(key, json, 90, TimeUnit.DAYS);

// 조회 (날짜 범위)
for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
    String key = String.format("cloud_usage:%s:%s", provider, date);
    CloudUsage usage = getFromRedis(key);
    // 합산
}
```

---

### 패턴 2: Redis Sorted Set 사용 (정렬된 데이터)

**키 구조**:
```
cloud_usage:aws:dates  (Sorted Set)
  - score: 20251130 (날짜를 숫자로)
  - value: JSON 데이터

cloud_usage:gcp:dates
  - score: 20251130
  - value: JSON 데이터
```

**장점**:
- ✅ 날짜 순서로 자동 정렬
- ✅ 범위 조회가 효율적 (ZRANGE)
- ✅ 한 번의 쿼리로 날짜 범위 조회 가능

**단점**:
- ⚠️ 구현이 약간 복잡
- ⚠️ JSON 데이터가 큰 경우 메모리 사용량 증가

**구현**:
```java
// 저장
String key = String.format("cloud_usage:%s:dates", provider);
long score = date.toEpochDay(); // 또는 날짜를 숫자로 변환
redisTemplate.opsForZSet().add(key, json, score);

// 조회 (날짜 범위)
Set<String> data = redisTemplate.opsForZSet()
    .rangeByScore(key, startScore, endScore);
```

---

### 패턴 3: Redis Hash 사용 (월별 그룹화)

**키 구조**:
```
cloud_usage:aws:2025-11  (Hash)
  - field: 30 (일)
  - value: JSON 데이터
  - field: 29
  - value: JSON 데이터
```

**장점**:
- ✅ 월별로 그룹화되어 관리 용이
- ✅ 한 달치 데이터를 한 번에 조회 가능

**단점**:
- ⚠️ 월 경계 처리 필요
- ⚠️ Hash 크기 제한 고려 필요

---

## 💡 권장 방식: 패턴 1 (날짜별 키 저장)

**이유**:
- ✅ 가장 간단하고 직관적
- ✅ TTL로 자동 정리 (90일)
- ✅ 배치 작업 불필요
- ✅ API 호출 시 자동 저장

**동작 방식**:
1. API 호출 시 외부 API에서 데이터 조회
2. 오늘 날짜의 키로 Redis에 저장 (TTL 90일)
3. 조회 시 날짜 범위의 키들을 조회하여 합산
4. 90일 후 자동 삭제 (메모리 관리)

---

## 🔧 구현 예시

### 저장 로직 (기존 캐시 확장)

```java
// 날짜별로 저장
public void saveDailyUsage(CloudProvider provider, LocalDate date, CloudUsage usage) {
    String key = String.format("cloud_usage:%s:%s", provider.name(), date);
    String json = objectMapper.writeValueAsString(usage);
    // 90일 TTL로 저장
    redisTemplate.opsForValue().set(key, json, 90, TimeUnit.DAYS);
}

// 기존 캐시도 유지 (기간별 캐시)
public void saveUsage(String key, CloudUsage usage, long ttlSeconds) {
    // 기존 로직 유지
}
```

### 조회 로직

```java
public List<UsageTrend> getDailyTrend(CloudProvider provider, int days) {
    List<UsageTrend> trends = new ArrayList<>();
    LocalDate endDate = LocalDate.now();
    LocalDate startDate = endDate.minusDays(days);
    
    for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
        String key = String.format("cloud_usage:%s:%s", provider.name(), date);
        CloudUsage usage = getFromRedis(key);
        
        if (usage != null) {
            trends.add(UsageTrend.builder()
                .date(date)
                .cost(usage.getTotalCost())
                .build());
        }
    }
    
    return trends;
}
```

---

## 📊 메모리 사용량 예상

**가정**:
- CloudUsage JSON 크기: ~2KB
- 90일 저장: 90일 × 2KB = 180KB per provider
- AWS + GCP: 360KB

**결론**: 메모리 사용량이 매우 적음 (Redis에 충분히 저장 가능)

---

## ✅ 장점 요약

1. **DB 스키마 변경 불필요**: Redis만 사용
2. **배치 작업 불필요**: API 호출 시 자동 저장
3. **자동 정리**: TTL로 오래된 데이터 자동 삭제
4. **빠른 구현**: 기존 Redis 인프라 활용
5. **향후 마이그레이션 용이**: DB로 이전 시 Redis에서 읽어서 저장

---

## 🚀 향후 개선

DB 스키마 변경 후:
1. Redis에서 데이터 읽기
2. DB에 저장
3. Redis는 캐시로만 사용

**마이그레이션 스크립트 예시**:
```java
// Redis → DB 마이그레이션
for (String key : redisTemplate.keys("cloud_usage:*")) {
    CloudUsage usage = getFromRedis(key);
    repository.save(usage);
}
```

