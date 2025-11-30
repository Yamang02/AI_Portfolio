# BigQuery Billing Export 쿼리 트러블슈팅

## 🔍 문제: 쿼리 결과가 비어있음

### 상황
- 테이블에 50행이 존재함
- 하지만 WHERE 조건이 있는 쿼리는 결과가 비어있음

---

## 💡 원인 분석

### 1. `_PARTITIONDATE` 필터 문제 (가장 가능성 높음)

BigQuery Billing Export 테이블은 `_PARTITIONDATE` 컬럼으로 파티션되어 있지만, **실제 데이터의 날짜와 파티션 날짜가 다를 수 있습니다**.

#### 진단 쿼리

```sql
-- 1. 파티션 날짜 확인
SELECT DISTINCT _PARTITIONDATE
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
ORDER BY _PARTITIONDATE DESC
LIMIT 10;
```

**예상 결과**:
- 최근 30일 이내가 아닌 날짜가 나올 수 있음
- 예: 2025-01-01, 2024-12-31 등

---

### 2. 실제 데이터 날짜 확인

```sql
-- 2. usage_start_time 확인 (실제 사용 날짜)
SELECT
  MIN(usage_start_time) as earliest_usage,
  MAX(usage_start_time) as latest_usage,
  MIN(_PARTITIONDATE) as earliest_partition,
  MAX(_PARTITIONDATE) as latest_partition,
  COUNT(*) as total_rows
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`;
```

이 쿼리로 다음을 확인할 수 있습니다:
- 실제 데이터의 사용 기간
- 파티션 날짜 범위
- 전체 행 수

---

### 3. 전체 데이터 조회 (WHERE 없이)

```sql
-- 3. WHERE 조건 없이 전체 데이터 확인
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency,
  COUNT(*) as record_count
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

**이 쿼리가 결과를 반환한다면**: `_PARTITIONDATE` 필터가 문제

---

## ✅ 해결 방법

### 방법 1: `_PARTITIONDATE` 대신 `usage_start_time` 사용 (권장)

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
WHERE DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

**장점**:
- 실제 사용 날짜 기준으로 필터링
- 더 정확한 결과

**단점**:
- 파티션 프루닝이 안 될 수 있어 쿼리 비용이 약간 증가할 수 있음

---

### 방법 2: 파티션 날짜 범위를 넓게 설정

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)  -- 90일로 확장
  AND DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)  -- 실제 필터
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

**장점**:
- 파티션 프루닝 최적화
- 정확한 날짜 필터링

---

### 방법 3: WHERE 조건 없이 전체 조회 (테스트용)

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency,
  MIN(DATE(usage_start_time)) as earliest_date,
  MAX(DATE(usage_start_time)) as latest_date
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

---

## 🔧 백엔드 코드 수정

위 분석 결과를 바탕으로 백엔드 쿼리를 수정해야 합니다.

### 기존 쿼리 (문제가 있을 수 있음)

```java
String query = String.format("""
    SELECT
      service.description as service_name,
      SUM(cost) as total_cost,
      currency
    FROM `%s.%s.%s`
    WHERE _PARTITIONDATE BETWEEN '%s' AND '%s'
    GROUP BY service_name, currency
    ORDER BY total_cost DESC
    """,
    projectId,
    datasetId,
    tableId,
    startDate.format(DATE_FORMAT),
    endDate.format(DATE_FORMAT)
);
```

### 수정된 쿼리 (권장)

```java
String query = String.format("""
    SELECT
      service.description as service_name,
      SUM(cost) as total_cost,
      currency
    FROM `%s.%s.%s`
    WHERE DATE(usage_start_time) BETWEEN '%s' AND '%s'
    GROUP BY service_name, currency
    ORDER BY total_cost DESC
    """,
    projectId,
    datasetId,
    tableId,
    startDate,
    endDate
);
```

### 최적화된 쿼리 (파티션 + 날짜 필터)

```java
String query = String.format("""
    SELECT
      service.description as service_name,
      SUM(cost) as total_cost,
      currency
    FROM `%s.%s.%s`
    WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
      AND DATE(usage_start_time) BETWEEN '%s' AND '%s'
    GROUP BY service_name, currency
    ORDER BY total_cost DESC
    """,
    projectId,
    datasetId,
    tableId,
    startDate,
    endDate
);
```

---

## 📊 추가 확인 사항

### 1. cost 값이 모두 0일 가능성

```sql
-- cost > 0인 레코드만 확인
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency,
  COUNT(*) as record_count
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
WHERE cost > 0
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

### 2. service.description이 NULL일 가능성

```sql
-- service 정보 확인
SELECT
  service.description,
  service.id,
  COUNT(*) as count
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
GROUP BY service.description, service.id
LIMIT 10;
```

### 3. 전체 스키마 확인

```sql
-- 테이블 스키마 확인
SELECT
  column_name,
  data_type
FROM `yamang02-ai-portfolio.billing_export.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'gcp_billing_export_v1_012659_03CA1D_2D9F35'
ORDER BY ordinal_position;
```

---

## 🎯 즉시 실행할 진단 쿼리 (순서대로)

### Step 1: 데이터 존재 확인

```sql
SELECT COUNT(*) as total_rows
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`;
```

### Step 2: 날짜 범위 확인

```sql
SELECT
  MIN(_PARTITIONDATE) as min_partition,
  MAX(_PARTITIONDATE) as max_partition,
  MIN(DATE(usage_start_time)) as min_usage_date,
  MAX(DATE(usage_start_time)) as max_usage_date
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`;
```

### Step 3: 조건 없이 서비스별 비용 확인

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

### Step 4: usage_start_time 기준으로 필터링

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency,
  COUNT(*) as record_count
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
WHERE DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

---

## 💡 예상 결과

### 가능성 1: 파티션 날짜가 오래됨
```
min_partition: 2025-01-01
max_partition: 2025-01-01
min_usage_date: 2025-11-01
max_usage_date: 2025-11-29
```

→ **해결**: `usage_start_time` 사용

### 가능성 2: 데이터가 모두 최근 것이 아님
```
min_usage_date: 2025-10-01
max_usage_date: 2025-10-31
```

→ **해결**: 날짜 범위 조정

### 가능성 3: cost가 모두 0 또는 매우 작음
```
total_cost: 0.0000001
```

→ **해결**: `WHERE cost > 0` 추가

---

## 📝 권장 사항

1. **Step 1-4 쿼리를 순서대로 실행**하여 정확한 원인 파악
2. **`usage_start_time` 기준 필터링**으로 변경
3. **백엔드 코드 수정** 후 재테스트

---

---

## ✅ 실제 문제 해결 사례

### 진단 결과

#### 날짜 범위 확인
```
min_partition: 2025-10-01
max_partition: 2025-10-19
min_usage_date: 2025-09-01
max_usage_date: 2025-10-19
total_rows: 5971
```

**문제 원인**:
- 현재 날짜(2025-11-29)에서 30일 전 = 2025-10-30
- 최대 파티션 날짜 = 2025-10-19
- **10-19 < 10-30** → WHERE 조건에 걸리지 않음!

#### 해결 쿼리 (WHERE 조건 제거)

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10;
```

#### 실제 결과 (정상 조회됨)

| Service | Cost (KRW) |
|---------|-----------|
| Cloud Run | 16,491.45 |
| Cloud Storage | 221.77 |
| Artifact Registry | 198.17 |
| Vertex AI | 8.47 |
| Invoice | 0.000003 |
| Cloud Logging | 0.0 |
| Secret Manager | 0.0 |
| Dataplex | 0.0 |

### 백엔드 구현 권장 사항

#### MVP/개발 단계 (권장)

**WHERE 조건 없이 전체 데이터 조회**

```java
public TableResult queryBillingData(LocalDate startDate, LocalDate endDate) {
    // 개발 단계에서는 WHERE 조건 없이 전체 데이터 조회
    String query = String.format("""
        SELECT
          service.description as service_name,
          SUM(cost) as total_cost,
          currency
        FROM `%s.%s.%s`
        WHERE cost > 0
        GROUP BY service_name, currency
        ORDER BY total_cost DESC
        """,
        projectId,
        datasetId,
        tableId
    );

    // 쿼리 실행...
}
```

**이유**:
- ✅ 데이터가 항상 조회됨 (빈 결과 없음)
- ✅ Billing Export가 불규칙하게 업데이트되는 경우에도 동작
- ✅ 개발/테스트 단계에서 안정적
- ⚠️ 데이터가 많아지면 쿼리 비용 증가 가능

#### 프로덕션 단계 (최적화)

데이터가 정상적으로 쌓이는 것을 확인한 후:

```java
public TableResult queryBillingData(LocalDate startDate, LocalDate endDate) {
    // 파티션 필터 + 실제 날짜 필터 조합
    String query = String.format("""
        SELECT
          service.description as service_name,
          SUM(cost) as total_cost,
          currency
        FROM `%s.%s.%s`
        WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
          AND DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          AND cost > 0
        GROUP BY service_name, currency
        ORDER BY total_cost DESC
        """,
        projectId,
        datasetId,
        tableId
    );

    // 쿼리 실행...
}
```

### 추가 확인 필요

**BigQuery Billing Export가 최근 데이터를 받지 못하는 이유**:
1. 10월 20일 이후 GCP 사용이 없음
2. Billing Export 설정이 비활성화됨
3. Billing Account에 문제가 있음

**확인 방법**:
- GCP Console → Billing → Cost table에서 최근 비용 확인
- Billing → Billing export → Status 확인

---

**작성일**: 2025-11-29
**문제**: _PARTITIONDATE 필터로 결과가 비어있음
**원인**: 파티션 날짜(10-19)가 현재-30일(10-30)보다 이전
**해결**: WHERE 조건 제거 또는 usage_start_time 사용
**실제 결과**: WHERE 조건 제거로 정상 조회 확인 (Cloud Run 16,491원 등)
