# Cloud Usage Monitoring - 기능 명세서

## 📋 개요

Admin 대시보드에 AWS와 GCP의 클라우드 사용량 및 비용 정보를 실시간으로 표시하는 기능

### 목표
- AWS Cost Explorer API와 GCP BigQuery를 통해 클라우드 비용 데이터 수집
- 관리자 대시보드에서 통합 비용 현황 조회
- 비용 추이 시각화 및 서비스별 분석 제공

### 범위
- **In Scope**:
  - 현재 월 비용 조회
  - 지난 30일 비용 추이
  - AWS/GCP 별도 및 통합 뷰
  - 서비스별 비용 분석 (Top 5)
  - 캐싱을 통한 API 호출 최적화
- **Out of Scope**:
  - 비용 예측 (Forecasting)
  - 비용 알림/예산 설정
  - 리소스별 상세 분석

---

## 🏗️ 아키텍처 설계

### 백엔드 아키텍처 (Hexagonal Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Web Adapter                                                 │
│  └─ CloudUsageController.java                               │
│     - GET /api/admin/cloud-usage/current                     │
│     - GET /api/admin/cloud-usage/trend?days={days}           │
│     - GET /api/admin/cloud-usage/breakdown                   │
│                                                              │
│  External API Adapters                                       │
│  ├─ AwsCostExplorerAdapter.java                             │
│  │  └─ implements CloudUsagePort                            │
│  └─ GcpBillingAdapter.java                                  │
│     └─ implements CloudUsagePort                            │
│                                                              │
│  Cache Adapter                                               │
│  └─ RedisCloudUsageCacheAdapter.java                        │
│     └─ implements CloudUsageCachePort                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  └─ GetCloudUsageService.java                               │
│     - implements GetCloudUsageUseCase                        │
│     - 캐시 확인 → 없으면 외부 API 호출 → 캐시 저장             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Models                                                      │
│  ├─ CloudUsage.java                                         │
│  │  - provider: CloudProvider (AWS, GCP)                    │
│  │  - totalCost: BigDecimal                                 │
│  │  - currency: String                                      │
│  │  - period: Period                                        │
│  │  - services: List<ServiceCost>                           │
│  ├─ ServiceCost.java                                        │
│  │  - serviceName: String                                   │
│  │  - cost: BigDecimal                                      │
│  └─ UsageTrend.java                                         │
│     - date: LocalDate                                       │
│     - cost: BigDecimal                                      │
│                                                              │
│  Ports (Interfaces)                                          │
│  ├─ in/GetCloudUsageUseCase.java                            │
│  │  - getCurrentMonthUsage(): ConsolidatedUsage             │
│  │  - getUsageTrend(days): List<UsageTrend>                 │
│  │  - getServiceBreakdown(): ServiceBreakdown               │
│  └─ out/CloudUsagePort.java                                 │
│     - fetchUsage(startDate, endDate): CloudUsage            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 백엔드 상세 구현

### 1. Domain Layer

#### 1.1 도메인 모델

```java
// domain/monitoring/model/CloudUsage.java
package com.aiportfolio.backend.domain.monitoring.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CloudUsage {
    private CloudProvider provider;
    private BigDecimal totalCost;
    private String currency;
    private Period period;
    private List<ServiceCost> services;
    private LocalDate lastUpdated;

    // 비즈니스 메서드
    public BigDecimal getTotalCostInUSD() {
        // 환율 변환 로직 (필요시)
        return totalCost;
    }

    public List<ServiceCost> getTopServices(int limit) {
        return services.stream()
            .sorted((a, b) -> b.getCost().compareTo(a.getCost()))
            .limit(limit)
            .toList();
    }
}

// domain/monitoring/model/CloudProvider.java
public enum CloudProvider {
    AWS("Amazon Web Services"),
    GCP("Google Cloud Platform");

    private final String displayName;

    CloudProvider(String displayName) {
        this.displayName = displayName;
    }
}

// domain/monitoring/model/ServiceCost.java
public class ServiceCost {
    private String serviceName;
    private BigDecimal cost;
    private String unit; // "USD", "hours", etc.

    // getters, constructors
}

// domain/monitoring/model/Period.java
public class Period {
    private LocalDate startDate;
    private LocalDate endDate;

    public static Period currentMonth() {
        LocalDate now = LocalDate.now();
        return new Period(
            now.withDayOfMonth(1),
            now.withDayOfMonth(now.lengthOfMonth())
        );
    }

    public static Period lastNDays(int days) {
        LocalDate now = LocalDate.now();
        return new Period(now.minusDays(days), now);
    }
}

// domain/monitoring/model/ConsolidatedUsage.java
public class ConsolidatedUsage {
    private CloudUsage awsUsage;
    private CloudUsage gcpUsage;
    private BigDecimal totalCost;

    public static ConsolidatedUsage of(CloudUsage aws, CloudUsage gcp) {
        BigDecimal total = aws.getTotalCost().add(gcp.getTotalCost());
        return new ConsolidatedUsage(aws, gcp, total);
    }
}
```

#### 1.2 포트 정의

```java
// domain/monitoring/port/in/GetCloudUsageUseCase.java
package com.aiportfolio.backend.domain.monitoring.port.in;

import com.aiportfolio.backend.domain.monitoring.model.*;
import java.util.List;

public interface GetCloudUsageUseCase {
    /**
     * 현재 월의 통합 클라우드 사용량 조회
     */
    ConsolidatedUsage getCurrentMonthUsage();

    /**
     * 지난 N일간의 비용 추이 조회
     */
    List<UsageTrend> getUsageTrend(int days);

    /**
     * 서비스별 비용 분석 (Top 5)
     */
    ServiceBreakdown getServiceBreakdown();
}

// domain/monitoring/port/out/CloudUsagePort.java
package com.aiportfolio.backend.domain.monitoring.port.out;

import com.aiportfolio.backend.domain.monitoring.model.*;
import java.time.LocalDate;

public interface CloudUsagePort {
    /**
     * 특정 기간의 클라우드 사용량 조회
     */
    CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate);

    /**
     * 지원하는 클라우드 제공자
     */
    CloudProvider getProvider();
}

// domain/monitoring/port/out/CloudUsageCachePort.java
public interface CloudUsageCachePort {
    void saveUsage(String key, CloudUsage usage, long ttlSeconds);
    CloudUsage getUsage(String key);
    boolean exists(String key);
}
```

---

### 2. Application Layer

```java
// application/monitoring/GetCloudUsageService.java
package com.aiportfolio.backend.application.monitoring;

import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsageCachePort;
import com.aiportfolio.backend.domain.monitoring.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class GetCloudUsageService implements GetCloudUsageUseCase {

    private static final long CACHE_TTL_SECONDS = 21600; // 6시간

    private final Map<CloudProvider, CloudUsagePort> usagePorts;
    private final CloudUsageCachePort cachePort;

    public GetCloudUsageService(
            List<CloudUsagePort> ports,
            CloudUsageCachePort cachePort) {
        this.usagePorts = ports.stream()
            .collect(Collectors.toMap(
                CloudUsagePort::getProvider,
                port -> port
            ));
        this.cachePort = cachePort;
    }

    @Override
    public ConsolidatedUsage getCurrentMonthUsage() {
        Period period = Period.currentMonth();

        CloudUsage awsUsage = getUsageWithCache(
            CloudProvider.AWS,
            period.getStartDate(),
            period.getEndDate()
        );

        CloudUsage gcpUsage = getUsageWithCache(
            CloudProvider.GCP,
            period.getStartDate(),
            period.getEndDate()
        );

        return ConsolidatedUsage.of(awsUsage, gcpUsage);
    }

    @Override
    public List<UsageTrend> getUsageTrend(int days) {
        Period period = Period.lastNDays(days);

        // AWS와 GCP 데이터를 날짜별로 합산
        CloudUsage awsUsage = getUsageWithCache(
            CloudProvider.AWS,
            period.getStartDate(),
            period.getEndDate()
        );

        CloudUsage gcpUsage = getUsageWithCache(
            CloudProvider.GCP,
            period.getStartDate(),
            period.getEndDate()
        );

        // 날짜별로 합산 로직 (생략)
        return mergeTrends(awsUsage, gcpUsage);
    }

    @Override
    public ServiceBreakdown getServiceBreakdown() {
        ConsolidatedUsage usage = getCurrentMonthUsage();

        List<ServiceCost> awsTop5 = usage.getAwsUsage().getTopServices(5);
        List<ServiceCost> gcpTop5 = usage.getGcpUsage().getTopServices(5);

        return new ServiceBreakdown(awsTop5, gcpTop5);
    }

    private CloudUsage getUsageWithCache(
            CloudProvider provider,
            LocalDate start,
            LocalDate end) {

        String cacheKey = generateCacheKey(provider, start, end);

        // 캐시 확인
        if (cachePort.exists(cacheKey)) {
            return cachePort.getUsage(cacheKey);
        }

        // 외부 API 호출
        CloudUsagePort port = usagePorts.get(provider);
        CloudUsage usage = port.fetchUsage(start, end);

        // 캐시 저장
        cachePort.saveUsage(cacheKey, usage, CACHE_TTL_SECONDS);

        return usage;
    }

    private String generateCacheKey(
            CloudProvider provider,
            LocalDate start,
            LocalDate end) {
        return String.format("cloud_usage:%s:%s:%s",
            provider.name(), start, end);
    }

    private List<UsageTrend> mergeTrends(
            CloudUsage aws,
            CloudUsage gcp) {
        // 날짜별로 AWS + GCP 비용 합산 로직
        // 구현 세부사항 생략
        return List.of();
    }
}
```

---

### 3. Infrastructure Layer

#### 3.1 AWS Cost Explorer Adapter

```java
// infrastructure/external/aws/AwsCostExplorerClient.java
package com.aiportfolio.backend.infrastructure.external.aws;

import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.costexplorer.CostExplorerClient;
import software.amazon.awssdk.services.costexplorer.model.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class AwsCostExplorerClient {

    private final CostExplorerClient client;
    private static final DateTimeFormatter DATE_FORMAT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public AwsCostExplorerClient(AwsConfig config) {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            config.getAccessKey(),
            config.getSecretKey()
        );

        this.client = CostExplorerClient.builder()
            .region(Region.US_EAST_1) // Cost Explorer는 us-east-1 사용
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }

    public GetCostAndUsageResponse getCostAndUsage(
            LocalDate startDate,
            LocalDate endDate) {

        GetCostAndUsageRequest request = GetCostAndUsageRequest.builder()
            .timePeriod(DateInterval.builder()
                .start(startDate.format(DATE_FORMAT))
                .end(endDate.format(DATE_FORMAT))
                .build())
            .granularity(Granularity.DAILY)
            .metrics("BlendedCost")
            .groupBy(
                GroupDefinition.builder()
                    .type(GroupDefinitionType.DIMENSION)
                    .key("SERVICE")
                    .build()
            )
            .build();

        return client.getCostAndUsage(request);
    }
}

// infrastructure/external/aws/AwsCostExplorerAdapter.java
package com.aiportfolio.backend.infrastructure.external.aws.adapter;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import com.aiportfolio.backend.infrastructure.external.aws.AwsCostExplorerClient;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.costexplorer.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AwsCostExplorerAdapter implements CloudUsagePort {

    private final AwsCostExplorerClient client;

    public AwsCostExplorerAdapter(AwsCostExplorerClient client) {
        this.client = client;
    }

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        GetCostAndUsageResponse response = client.getCostAndUsage(
            startDate,
            endDate
        );

        return mapToCloudUsage(response, startDate, endDate);
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.AWS;
    }

    private CloudUsage mapToCloudUsage(
            GetCostAndUsageResponse response,
            LocalDate startDate,
            LocalDate endDate) {

        BigDecimal totalCost = BigDecimal.ZERO;
        List<ServiceCost> services = List.of();

        // ResultByTime에서 서비스별 비용 추출
        for (ResultByTime result : response.resultsByTime()) {
            for (Group group : result.groups()) {
                String serviceName = group.keys().get(0);
                BigDecimal cost = new BigDecimal(
                    group.metrics().get("BlendedCost").amount()
                );

                services.add(new ServiceCost(serviceName, cost, "USD"));
                totalCost = totalCost.add(cost);
            }
        }

        return CloudUsage.builder()
            .provider(CloudProvider.AWS)
            .totalCost(totalCost)
            .currency("USD")
            .period(new Period(startDate, endDate))
            .services(services)
            .lastUpdated(LocalDate.now())
            .build();
    }
}
```

#### 3.2 GCP BigQuery Adapter

```java
// infrastructure/external/gcp/GcpBillingClient.java
package com.aiportfolio.backend.infrastructure.external.gcp;

import com.google.cloud.bigquery.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class GcpBillingClient {

    private final BigQuery bigQuery;
    private final String projectId;
    private final String datasetId;
    private final String tableId;

    private static final DateTimeFormatter DATE_FORMAT =
        DateTimeFormatter.ofPattern("yyyyMMdd");

    public GcpBillingClient(GcpConfig config) {
        this.bigQuery = BigQueryOptions.getDefaultInstance().getService();
        this.projectId = config.getProjectId();
        this.datasetId = config.getBillingDataset();
        this.tableId = config.getBillingTable();
    }

    public TableResult queryBillingData(LocalDate startDate, LocalDate endDate) {
        // MVP/개발 단계: WHERE 조건 없이 전체 데이터 조회
        // 이유: BigQuery Billing Export의 _PARTITIONDATE가 불규칙할 수 있음
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

        // 프로덕션 단계: 날짜 필터 추가 (데이터가 정상적으로 쌓이는 것 확인 후)
        // WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        //   AND DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        //   AND cost > 0

        QueryJobConfiguration queryConfig = QueryJobConfiguration
            .newBuilder(query)
            .setUseLegacySql(false)
            .build();

        try {
            return bigQuery.query(queryConfig);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("BigQuery query interrupted", e);
        }
    }
}

// infrastructure/external/gcp/adapter/GcpBillingAdapter.java
package com.aiportfolio.backend.infrastructure.external.gcp.adapter;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import com.aiportfolio.backend.infrastructure.external.gcp.GcpBillingClient;
import com.google.cloud.bigquery.FieldValueList;
import com.google.cloud.bigquery.TableResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class GcpBillingAdapter implements CloudUsagePort {

    private final GcpBillingClient client;

    public GcpBillingAdapter(GcpBillingClient client) {
        this.client = client;
    }

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        TableResult result = client.queryBillingData(startDate, endDate);
        return mapToCloudUsage(result, startDate, endDate);
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.GCP;
    }

    private CloudUsage mapToCloudUsage(
            TableResult result,
            LocalDate startDate,
            LocalDate endDate) {

        BigDecimal totalCost = BigDecimal.ZERO;
        List<ServiceCost> services = new ArrayList<>();
        String currency = "USD";

        for (FieldValueList row : result.iterateAll()) {
            String serviceName = row.get("service_name").getStringValue();
            BigDecimal cost = new BigDecimal(
                row.get("total_cost").getDoubleValue()
            );
            currency = row.get("currency").getStringValue();

            services.add(new ServiceCost(serviceName, cost, currency));
            totalCost = totalCost.add(cost);
        }

        return CloudUsage.builder()
            .provider(CloudProvider.GCP)
            .totalCost(totalCost)
            .currency(currency)
            .period(new Period(startDate, endDate))
            .services(services)
            .lastUpdated(LocalDate.now())
            .build();
    }
}
```

#### 3.3 Redis Cache Adapter

```java
// infrastructure/cache/RedisCloudUsageCacheAdapter.java
package com.aiportfolio.backend.infrastructure.cache;

import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsageCachePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisCloudUsageCacheAdapter implements CloudUsageCachePort {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisCloudUsageCacheAdapter(
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void saveUsage(String key, CloudUsage usage, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(usage);
            redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            // 캐시 실패는 조용히 처리 (fallback to API)
            // 로깅만 수행
        }
    }

    @Override
    public CloudUsage getUsage(String key) {
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) return null;
            return objectMapper.readValue(json, CloudUsage.class);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
```

#### 3.4 Web Controller

```java
// infrastructure/web/controller/CloudUsageController.java
package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.cloudusage.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cloud-usage")
public class CloudUsageController {

    private final GetCloudUsageUseCase getCloudUsageUseCase;

    public CloudUsageController(GetCloudUsageUseCase getCloudUsageUseCase) {
        this.getCloudUsageUseCase = getCloudUsageUseCase;
    }

    /**
     * 현재 월 클라우드 사용량 조회
     */
    @GetMapping("/current")
    public ResponseEntity<ConsolidatedUsageDto> getCurrentUsage() {
        var usage = getCloudUsageUseCase.getCurrentMonthUsage();
        return ResponseEntity.ok(ConsolidatedUsageDto.from(usage));
    }

    /**
     * 비용 추이 조회
     */
    @GetMapping("/trend")
    public ResponseEntity<UsageTrendDto> getUsageTrend(
            @RequestParam(defaultValue = "30") int days) {
        var trend = getCloudUsageUseCase.getUsageTrend(days);
        return ResponseEntity.ok(UsageTrendDto.from(trend));
    }

    /**
     * 서비스별 비용 분석
     */
    @GetMapping("/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getServiceBreakdown() {
        var breakdown = getCloudUsageUseCase.getServiceBreakdown();
        return ResponseEntity.ok(ServiceBreakdownDto.from(breakdown));
    }
}
```

---

## 🎨 프론트엔드 아키텍처 (Feature-Sliced Design)

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
├─────────────────────────────────────────────────────────────┤
│  Dashboard.tsx (기존 대시보드 확장)                            │
│  └─ CloudUsageSection 추가                                   │
│     - ConsolidatedUsageCard (from features)                  │
│     - UsageTrendChart (from features)                        │
│     - ServiceBreakdownTable (from features)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Features                               │
├─────────────────────────────────────────────────────────────┤
│  features/cloud-usage-monitoring/                            │
│  ├─ hooks/                                                   │
│  │  ├─ useCloudUsageStats.ts                                │
│  │  └─ useUsageComparison.ts                                │
│  └─ ui/                                                      │
│     ├─ ConsolidatedUsageCard.tsx                            │
│     ├─ UsageTrendChart.tsx                                  │
│     └─ ServiceBreakdownTable.tsx                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Entities                               │
├─────────────────────────────────────────────────────────────┤
│  entities/cloud-usage/                                       │
│  ├─ model/cloudUsage.types.ts                               │
│  │  - CloudUsageData                                        │
│  │  - ConsolidatedUsageData                                 │
│  │  - UsageTrendData                                        │
│  └─ api/                                                     │
│     ├─ cloudUsageApi.ts                                     │
│     └─ useCloudUsageQuery.ts (React Query 설정)             │
│        - refetchInterval: 6시간 (21600000ms)                │
│        - staleTime: 6시간 - 프론트엔드도 6시간 캐싱         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Shared                                │
├─────────────────────────────────────────────────────────────┤
│  shared/ui/                                                  │
│  └─ StatsCards.tsx (기존 재사용)                              │
└─────────────────────────────────────────────────────────────┘
```

### 프론트엔드 자동 갱신 전략

```typescript
// entities/cloud-usage/api/useCloudUsageQuery.ts
export const useCurrentCloudUsage = () => {
  return useQuery({
    queryKey: ['cloudUsage', 'current'],
    queryFn: cloudUsageApi.getCurrentUsage,
    staleTime: 6 * 60 * 60 * 1000,     // 6시간 - 데이터를 신선하게 유지
    refetchInterval: 6 * 60 * 60 * 1000, // 6시간마다 자동 갱신
    refetchOnWindowFocus: false,        // 창 포커스 시 갱신 안함 (불필요한 호출 방지)
  });
};
```

**자동 갱신 설정 이유**:
- ✅ **백엔드 캐싱과 동기화**: 백엔드 6시간 TTL과 일치
- ✅ **불필요한 호출 방지**: 캐시가 유효한 동안은 API 호출 안 함
- ✅ **자동 최신화**: 대시보드를 열어두면 6시간마다 자동으로 최신 데이터 표시
- ✅ **사용자 경험**: 수동 새로고침 불필요

---

## 🔧 설정

### 백엔드 설정

```yaml
# application.yml
cloud:
  aws:
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}
    region: us-east-1
  gcp:
    project-id: ${GCP_PROJECT_ID}
    billing-dataset: ${GCP_BILLING_DATASET:billing_export}
    billing-table: ${GCP_BILLING_TABLE:gcp_billing_export}
    credentials-path: ${GCP_CREDENTIALS_PATH}

spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
```

### 환경 변수

```bash
# AWS
AWS_ACCESS_KEY=AKIAxxxxxxxxxx  # 기존 배포용 IAM에 권한 추가
AWS_SECRET_KEY=xxxxxxxxxx

# GCP
GCP_PROJECT_ID=your-project-id
GCP_BILLING_DATASET=billing_export
GCP_BILLING_TABLE=gcp_billing_export_v1_XXXXXX
GCP_CREDENTIALS_PATH=/path/to/service-account-key.json  # 기존 배포용 서비스 계정
```

---

## 📊 데이터 흐름

### 1. 현재 월 사용량 조회 플로우

```
사용자 → Dashboard.tsx
         ↓
    useCloudUsageQuery.getCurrentUsage()
         ↓
    GET /api/admin/cloud-usage/current
         ↓
    GetCloudUsageService.getCurrentMonthUsage()
         ↓
    [캐시 확인] → 있으면 반환
         ↓ (없으면)
    AWS Adapter + GCP Adapter 병렬 호출
         ↓
    외부 API (AWS Cost Explorer + GCP BigQuery)
         ↓
    도메인 모델 변환 → 캐시 저장 → 반환
```

### 2. 캐싱 전략

```
Key: cloud_usage:{provider}:{startDate}:{endDate}
TTL: 21600초 (6시간)

예시:
- cloud_usage:AWS:2025-11-01:2025-11-29
- cloud_usage:GCP:2025-11-01:2025-11-29
```

#### 캐싱 주기별 비용 비교

| 캐싱 주기 | 하루 API 호출 | AWS 월 비용 | 연간 비용 | 비고 |
|----------|--------------|------------|----------|------|
| 캐싱 없음 | ~1000회 | $10.00 | $120.00 | 사용자 접속마다 호출 |
| 1시간 | 24회 | $0.24 | $2.88 | 시간당 1회 갱신 |
| **6시간** | **4회** | **$0.04** | **$0.48** | **권장 (6배 절감)** |
| 12시간 | 2회 | $0.02 | $0.24 | 데이터 신선도 낮음 |
| 24시간 | 1회 | $0.01 | $0.12 | 최대 절감, 하루 1회만 |

**선택 이유**: 6시간 캐싱
- ✅ **비용 효율**: 1시간 대비 83% 절감 ($0.24 → $0.04/일)
- ✅ **데이터 신선도**: 하루 4회 갱신으로 충분한 최신성
- ✅ **AWS 특성 고려**: 비용 데이터는 24시간 지연되므로 6시간마다 갱신이면 충분
- ✅ **GCP 특성 고려**: BigQuery Export는 하루 1회 업데이트

> **💡 참고**:
> - AWS Cost Explorer 데이터는 24시간 지연
> - GCP BigQuery Export는 하루 1회 업데이트
> - 따라서 6시간 캐싱으로도 실질적인 데이터 손실 없음

---

## 🚀 구현 우선순위

### Phase 1: MVP (4-6시간)
1. ✅ Domain Layer (모델, 포트)
2. ✅ AWS Adapter (Cost Explorer)
3. ✅ Application Service (캐싱 제외)
4. ✅ REST API
5. ✅ 프론트엔드 기본 표시 (현재 월 비용만)

### Phase 2: 고도화 (2-3시간)
1. ✅ GCP Adapter (BigQuery)
2. ✅ Redis 캐싱
3. ✅ 비용 추이 차트
4. ✅ 서비스별 분석

### Phase 3: 최적화 (1-2시간)
1. ✅ 에러 핸들링
2. ✅ 로딩 상태 개선
3. ✅ 자동 갱신 (polling)

---

## 📝 TODO

- [ ] GCP Console에서 BigQuery Export 활성화
- [ ] 기존 AWS IAM에 `ce:GetCostAndUsage` 권한 추가
- [ ] 기존 GCP 서비스 계정에 BigQuery 권한 추가
- [ ] 백엔드 구현
  - [ ] Domain Layer
  - [ ] Application Layer
  - [ ] Infrastructure Layer (AWS)
  - [ ] Infrastructure Layer (GCP)
  - [ ] Infrastructure Layer (Cache)
  - [ ] REST API
- [ ] 프론트엔드 구현
  - [ ] Entities Layer
  - [ ] Features Layer
  - [ ] Pages Layer (Dashboard 확장)
- [ ] 테스트
  - [ ] 단위 테스트
  - [ ] 통합 테스트
  - [ ] E2E 테스트

---

## 🎯 성공 지표

- [ ] AWS 비용 데이터를 조회 가능 (24시간 지연)
- [ ] GCP 비용 데이터를 조회 가능 (하루 1회 업데이트)
- [ ] 통합 대시보드에서 한눈에 비용 파악 가능
- [ ] API 호출 비용 최적화 (6시간 캐싱으로 하루 $0.04, 연 $0.48)
- [ ] 응답 속도 1초 이내 (캐시 히트 시)

---

**작성일**: 2025-11-29
**작성자**: AI Agent (Claude)
**버전**: 1.0
