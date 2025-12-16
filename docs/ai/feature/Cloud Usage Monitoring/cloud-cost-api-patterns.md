# 클라우드 비용 API 호출 패턴

## 📋 일반적인 비용 모니터링 API 호출 방식

### 1. 폴링 (Polling) 방식 ⭐ (현재 사용 중)

**특징**:
- 클라이언트가 주기적으로 API를 호출하여 데이터 조회
- 가장 일반적이고 단순한 방식

**장점**:
- 구현이 간단함
- 실시간성 조절 가능 (폴링 주기 조정)
- 서버 부하 예측 가능

**단점**:
- 불필요한 호출 발생 가능
- 데이터 변경이 없어도 호출함

**사용 사례**:
- 대시보드에서 주기적 갱신
- 모니터링 시스템
- **현재 구현**: 프론트엔드에서 6시간마다 자동 갱신

**구현 예시**:
```typescript
// 프론트엔드
useQuery({
  queryKey: ['cloudUsage'],
  queryFn: fetchCloudUsage,
  refetchInterval: 6 * 60 * 60 * 1000, // 6시간마다
});
```

---

### 2. 배치 처리 (Scheduled Jobs) 방식 ⭐⭐

**특징**:
- 백엔드에서 스케줄러로 주기적으로 데이터 수집
- 수집한 데이터를 DB에 저장
- 클라이언트는 DB에서 조회

**장점**:
- 외부 API 호출 최소화
- 빠른 응답 속도 (DB 조회)
- 과거 데이터 히스토리 관리 가능
- 외부 API 장애 시에도 최근 데이터 제공

**단점**:
- DB 스토리지 필요
- 배치 작업 관리 필요
- 실시간성 낮음

**사용 사례**:
- 대규모 시스템
- 히스토리 데이터 분석 필요
- 비용 최적화가 중요한 경우

**구현 예시**:
```java
@Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시
public void collectCloudUsage() {
    // AWS/GCP API 호출
    // DB에 저장
}
```

---

### 3. 웹훅/이벤트 기반 방식

**특징**:
- 클라우드 제공자가 데이터 변경 시 웹훅 호출
- 서버가 이벤트를 받아 처리

**장점**:
- 실시간성 높음
- 불필요한 호출 없음
- 효율적

**단점**:
- 모든 클라우드 제공자가 지원하지 않음
- 웹훅 엔드포인트 관리 필요
- 보안 고려사항 (인증/검증)

**사용 사례**:
- 실시간 알림 필요
- 이벤트 기반 아키텍처

**지원 현황**:
- AWS: EventBridge, SNS
- GCP: Pub/Sub, Cloud Functions 트리거

---

### 4. 하이브리드 방식 ⭐⭐⭐ (권장)

**특징**:
- 배치 처리 + 폴링 조합
- 백엔드에서 배치로 수집 → DB 저장
- 프론트엔드는 DB에서 조회 (폴링)

**장점**:
- 배치의 효율성 + 폴링의 단순성
- 외부 API 호출 최소화
- 빠른 응답 속도
- 히스토리 데이터 관리

**단점**:
- 구현 복잡도 증가
- DB 스키마 설계 필요

**구현 예시**:
```
[배치] 매일 새벽 2시: AWS/GCP API 호출 → DB 저장
[API] GET /api/admin/cloud-usage/aws/current → DB 조회
[프론트] 6시간마다 API 호출 → 빠른 응답
```

---

## 🎯 현재 프로젝트에 적합한 방식

### 현재 구현 (폴링 방식)
- ✅ 간단하고 빠르게 구현 가능
- ✅ 캐싱으로 API 호출 최적화 (6시간 TTL)
- ⚠️ 외부 API 직접 호출 (비용 발생)

### 권장 개선 방향 (하이브리드)

**Phase 1 (현재)**: 폴링 + 캐싱
- 프론트엔드 → 백엔드 API → 외부 API (캐시)
- 빠른 구현, 적은 비용

**Phase 2 (향후)**: 배치 + DB 저장
- 스케줄러 → 외부 API → DB 저장
- 프론트엔드 → 백엔드 API → DB 조회
- 비용 최적화, 히스토리 관리

---

## 📊 비용 비교

| 방식 | API 호출 빈도 | 응답 속도 | 구현 복잡도 | 비용 |
|------|--------------|----------|------------|------|
| 폴링 (현재) | 사용자 접속마다 | 보통 | 낮음 | 중간 |
| 배치 | 하루 1회 | 빠름 | 중간 | 낮음 |
| 웹훅 | 이벤트 발생 시 | 빠름 | 높음 | 낮음 |
| 하이브리드 | 하루 1회 (배치) | 빠름 | 높음 | 낮음 |

---

## 🔧 실제 구현 패턴 예시

### 패턴 1: 폴링 + 캐싱 (현재)
```java
// 백엔드: 캐시 확인 → 없으면 API 호출
CloudUsage usage = cache.get(key);
if (usage == null) {
    usage = awsClient.fetch();
    cache.set(key, usage, 6h);
}
return usage;
```

### 패턴 2: 배치 + DB
```java
// 스케줄러
@Scheduled(cron = "0 0 2 * * ?")
void collectDaily() {
    CloudUsage usage = awsClient.fetch();
    repository.save(usage);
}

// API
@GetMapping("/current")
CloudUsage getCurrent() {
    return repository.findLatest();
}
```

### 패턴 3: 하이브리드
```java
// 배치: 매일 수집
@Scheduled(cron = "0 0 2 * * ?")
void collectDaily() {
    CloudUsage usage = awsClient.fetch();
    repository.save(usage);
    cache.set(usage); // 캐시도 갱신
}

// API: 캐시 우선, 없으면 DB
@GetMapping("/current")
CloudUsage getCurrent() {
    CloudUsage cached = cache.get(key);
    if (cached != null) return cached;
    return repository.findLatest();
}
```

---

## 💡 권장사항

### 현재 단계 (MVP)
- ✅ **폴링 + 캐싱** 유지
- ✅ 6시간 캐싱으로 비용 최적화
- ✅ 간단하고 빠른 구현

### 향후 개선 (프로덕션)
- ⭐ **하이브리드 방식** 도입
- ⭐ 배치 작업으로 매일 수집
- ⭐ DB에 히스토리 저장
- ⭐ 프론트엔드는 DB 조회 (빠른 응답)

---

**참고**: 대부분의 클라우드 비용 모니터링 도구는 **하이브리드 방식**을 사용합니다.
- AWS Cost Explorer: 배치로 데이터 수집
- GCP Billing Export: BigQuery에 자동 저장 (배치)
- Datadog, New Relic: 배치 수집 + 실시간 폴링








