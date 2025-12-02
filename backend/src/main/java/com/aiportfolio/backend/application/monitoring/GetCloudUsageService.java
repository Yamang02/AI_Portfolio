package com.aiportfolio.backend.application.monitoring;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsageCachePort;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;

/**
 * 클라우드 사용량 조회 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCloudUsageService implements GetCloudUsageUseCase {

    private static final long CACHE_TTL_SECONDS = 21600; // 6시간

    private final List<CloudUsagePort> usagePorts;
    private final CloudUsageCachePort cachePort;

    /**
     * 포트들을 프로바이더별로 매핑
     */
    private Map<CloudProvider, CloudUsagePort> getPortMap() {
        return usagePorts.stream()
            .collect(Collectors.toMap(
                CloudUsagePort::getProvider,
                port -> port
            ));
    }

    // ==================== AWS ====================

    @Override
    public CloudUsage getAwsCurrentMonthUsage() {
        Period period = Period.lastNDays(180); // 지난 6개월 조회 (약 180일)
        return getUsageWithCache(CloudProvider.AWS, period.getStartDate(), period.getEndDate());
    }

    @Override
    public List<UsageTrend> getAwsUsageTrend(int days) {
        return getUsageTrend(CloudProvider.AWS, days);
    }

    @Override
    public List<UsageTrend> getAwsUsageTrend30Days(String granularity) {
        return getUsageTrend30Days(CloudProvider.AWS, granularity);
    }

    @Override
    public List<UsageTrend> getAwsUsageTrend6Months() {
        return getUsageTrend6Months(CloudProvider.AWS);
    }

    @Override
    public List<ServiceCost> getAwsTopServices(int limit) {
        return getTopServices(CloudProvider.AWS, limit);
    }

    // ==================== GCP ====================

    @Override
    public CloudUsage getGcpCurrentMonthUsage() {
        Period period = Period.lastNDays(30); // 최근 30일 조회
        return getUsageWithCache(CloudProvider.GCP, period.getStartDate(), period.getEndDate());
    }

    @Override
    public List<UsageTrend> getGcpUsageTrend(int days) {
        return getUsageTrend(CloudProvider.GCP, days);
    }

    @Override
    public List<UsageTrend> getGcpUsageTrend30Days(String granularity) {
        return getUsageTrend30Days(CloudProvider.GCP, granularity);
    }

    @Override
    public List<UsageTrend> getGcpUsageTrend6Months() {
        return getUsageTrend6Months(CloudProvider.GCP);
    }

    @Override
    public List<ServiceCost> getGcpTopServices(int limit) {
        return getTopServices(CloudProvider.GCP, limit);
    }

    // ==================== Consolidated ====================

    @Override
    public ConsolidatedUsage getCurrentMonthUsage() {
        CloudUsage awsUsage = getAwsCurrentMonthUsage();
        CloudUsage gcpUsage = getGcpCurrentMonthUsage();
        return ConsolidatedUsage.of(awsUsage, gcpUsage);
    }

    @Override
    public List<UsageTrend> getUsageTrend(int days) {
        List<UsageTrend> awsTrends = getAwsUsageTrend(days);
        List<UsageTrend> gcpTrends = getGcpUsageTrend(days);
        return mergeProviderTrends(awsTrends, gcpTrends);
    }

    @Override
    public ServiceBreakdown getServiceBreakdown() {
        List<ServiceCost> awsTop5 = getAwsTopServices(5);
        List<ServiceCost> gcpTop5 = getGcpTopServices(5);

        return ServiceBreakdown.builder()
            .awsTop5(awsTop5)
            .gcpTop5(gcpTop5)
            .build();
    }

    // ==================== Private Methods ====================

    /**
     * Provider별 사용량 추이 조회 (공통 메서드)
     */
    private List<UsageTrend> getUsageTrend(CloudProvider provider, int days) {
        Period period = Period.lastNDays(days);

        // Redis에서 날짜별 히스토리 조회
        List<CloudUsage> dailyUsages = cachePort.getDailyUsageRange(
            provider, period.getStartDate(), period.getEndDate());

        // 일별 데이터가 있으면 사용, 없으면 기간 합계 사용
        if (!dailyUsages.isEmpty()) {
            return convertDailyUsagesToTrends(dailyUsages, provider);
        } else {
            CloudUsage usage = getUsageWithCache(provider, period.getStartDate(), period.getEndDate());
            return convertToTrends(usage, period, provider);
        }
    }

    /**
     * Provider별 30일 사용량 추이 조회 (공통 메서드)
     */
    private List<UsageTrend> getUsageTrend30Days(CloudProvider provider, String granularity) {
        Period period = Period.lastNDays(30);
        
        // Redis에서 일별 데이터 조회
        List<CloudUsage> dailyUsages = cachePort.getDailyUsageRange(
            provider, period.getStartDate(), period.getEndDate());
        
        if ("monthly".equals(granularity)) {
            // 일별 데이터를 월별로 집계
            return aggregateDailyToMonthly(dailyUsages, provider);
        } else {
            // 일별 데이터 그대로 사용
            return convertDailyUsagesToTrends(dailyUsages, provider);
        }
    }

    /**
     * Provider별 6개월 사용량 추이 조회 (공통 메서드)
     */
    private List<UsageTrend> getUsageTrend6Months(CloudProvider provider) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(6).withDayOfMonth(1);
        
        // 일별 데이터 조회
        List<CloudUsage> dailyUsages = cachePort.getDailyUsageRange(
            provider, startDate, endDate);
        
        // 월별로 집계
        return aggregateDailyToMonthly(dailyUsages, provider);
    }

    /**
     * Provider별 Top 서비스 조회 (공통 메서드)
     */
    private List<ServiceCost> getTopServices(CloudProvider provider, int limit) {
        CloudUsage usage = provider == CloudProvider.AWS 
            ? getAwsCurrentMonthUsage() 
            : getGcpCurrentMonthUsage();
        return usage.getServices() != null ? usage.getTopServices(limit) : Collections.emptyList();
    }

    /**
     * 캐시를 확인하고 없으면 외부 API 호출 후 캐시 저장
     */
    private CloudUsage getUsageWithCache(
            CloudProvider provider,
            LocalDate start,
            LocalDate end) {

        String cacheKey = generateCacheKey(provider, start, end);

        // 캐시 확인
        if (cachePort.exists(cacheKey)) {
            CloudUsage cached = cachePort.getUsage(cacheKey);
            if (cached != null) {
                log.debug("Cache hit for cloud usage: {}", cacheKey);
                return cached;
            }
        }

        // 외부 API 호출
        CloudUsagePort port = getPortMap().get(provider);
        if (port == null) {
            log.warn("No port found for provider: {}", provider);
            return CloudUsage.empty(provider, new Period(start, end));
        }

        CloudUsage usage = port.fetchUsage(start, end);

        // 기간별 캐시 저장 (6시간 TTL)
        cachePort.saveUsage(cacheKey, usage, CACHE_TTL_SECONDS);

        // 날짜별 히스토리 저장 (90일 TTL) - DB 스키마 변경 없이 임시 저장
        // 오늘 날짜의 데이터만 저장 (매일 API 호출 시 자동으로 히스토리 쌓임)
        LocalDate today = LocalDate.now();
        if (end.equals(today) || end.isAfter(today.minusDays(1))) {
            cachePort.saveDailyUsage(provider, today, usage);
            log.debug("Saved daily usage history: provider={}, date={}", provider, today);
        }

        return usage;
    }

    /**
     * 캐시 키 생성
     */
    private String generateCacheKey(
            CloudProvider provider,
            LocalDate start,
            LocalDate end) {
        return String.format("cloud_usage:%s:%s:%s",
            provider.name(), start, end);
    }

    /**
     * CloudUsage를 UsageTrend 리스트로 변환 (기간 합계)
     * 히스토리 데이터가 없을 때 사용
     */
    private List<UsageTrend> convertToTrends(
            CloudUsage usage,
            Period period,
            CloudProvider provider) {

        BigDecimal totalCost = usage.getTotalCost() != null ? usage.getTotalCost() : BigDecimal.ZERO;
        BigDecimal awsCost = provider == CloudProvider.AWS ? totalCost : BigDecimal.ZERO;
        BigDecimal gcpCost = provider == CloudProvider.GCP ? totalCost : BigDecimal.ZERO;

        UsageTrend trend = UsageTrend.builder()
            .date(period.getEndDate())
            .cost(totalCost)
            .awsCost(awsCost)
            .gcpCost(gcpCost)
            .build();

        return Collections.singletonList(trend);
    }

    /**
     * 일별 CloudUsage 리스트를 UsageTrend 리스트로 변환
     * Redis에 저장된 날짜별 히스토리 데이터를 일별 추이로 변환
     */
    private List<UsageTrend> convertDailyUsagesToTrends(
            List<CloudUsage> dailyUsages,
            CloudProvider provider) {

        return dailyUsages.stream()
            .map(usage -> {
                BigDecimal totalCost = usage.getTotalCost() != null ? usage.getTotalCost() : BigDecimal.ZERO;
                BigDecimal awsCost = provider == CloudProvider.AWS ? totalCost : BigDecimal.ZERO;
                BigDecimal gcpCost = provider == CloudProvider.GCP ? totalCost : BigDecimal.ZERO;

                // CloudUsage의 period에서 날짜 추출 (또는 lastUpdated 사용)
                LocalDate date = usage.getLastUpdated() != null
                    ? usage.getLastUpdated()
                    : (usage.getPeriod() != null ? usage.getPeriod().getEndDate() : LocalDate.now());

                return UsageTrend.builder()
                    .date(date)
                    .cost(totalCost)
                    .awsCost(awsCost)
                    .gcpCost(gcpCost)
                    .build();
            })
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())) // 날짜순 정렬
            .collect(Collectors.toList());
    }

    /**
     * AWS와 GCP의 일별 추이를 날짜별로 합산
     */
    private List<UsageTrend> mergeProviderTrends(
            List<UsageTrend> awsTrends,
            List<UsageTrend> gcpTrends) {

        // 날짜별로 그룹화하여 합산
        Map<LocalDate, UsageTrend> mergedMap = new HashMap<>();

        // AWS 추이 추가
        for (UsageTrend trend : awsTrends) {
            mergedMap.put(trend.getDate(), UsageTrend.builder()
                .date(trend.getDate())
                .cost(trend.getAwsCost())
                .awsCost(trend.getAwsCost())
                .gcpCost(BigDecimal.ZERO)
                .build());
        }

        // GCP 추이 합산
        for (UsageTrend trend : gcpTrends) {
            UsageTrend existing = mergedMap.get(trend.getDate());
            if (existing != null) {
                // 같은 날짜가 있으면 합산
                mergedMap.put(trend.getDate(), UsageTrend.builder()
                    .date(trend.getDate())
                    .cost(existing.getAwsCost().add(trend.getGcpCost()))
                    .awsCost(existing.getAwsCost())
                    .gcpCost(trend.getGcpCost())
                    .build());
            } else {
                // 없으면 새로 추가
                mergedMap.put(trend.getDate(), UsageTrend.builder()
                    .date(trend.getDate())
                    .cost(trend.getGcpCost())
                    .awsCost(BigDecimal.ZERO)
                    .gcpCost(trend.getGcpCost())
                    .build());
            }
        }

        // 날짜순 정렬하여 반환
        return mergedMap.values().stream()
            .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
            .collect(Collectors.toList());
    }

    /**
     * 일별 데이터를 월별로 집계
     */
    private List<UsageTrend> aggregateDailyToMonthly(List<CloudUsage> dailyUsages, CloudProvider provider) {
        // 월별로 그룹화
        Map<String, List<CloudUsage>> monthlyMap = new HashMap<>();
        
        for (CloudUsage daily : dailyUsages) {
            LocalDate date = daily.getLastUpdated() != null 
                ? daily.getLastUpdated() 
                : (daily.getPeriod() != null ? daily.getPeriod().getStartDate() : LocalDate.now());
            
            String monthKey = String.format("%d-%02d", date.getYear(), date.getMonthValue());
            monthlyMap.computeIfAbsent(monthKey, k -> new ArrayList<>()).add(daily);
        }
        
        // 월별로 집계
        List<UsageTrend> monthlyTrends = new ArrayList<>();
        for (Map.Entry<String, List<CloudUsage>> entry : monthlyMap.entrySet()) {
            BigDecimal totalCost = BigDecimal.ZERO;
            String currency = null;
            Map<String, BigDecimal> serviceCosts = new HashMap<>();
            
            for (CloudUsage daily : entry.getValue()) {
                if (daily.getTotalCost() != null) {
                    totalCost = totalCost.add(daily.getTotalCost());
                }
                if (currency == null && daily.getCurrency() != null) {
                    currency = daily.getCurrency();
                }
                if (daily.getServices() != null) {
                    for (ServiceCost service : daily.getServices()) {
                        serviceCosts.merge(
                            service.getServiceName(),
                            service.getCost(),
                            BigDecimal::add
                        );
                    }
                }
            }
            
            // 월의 첫날을 날짜로 사용
            String[] parts = entry.getKey().split("-");
            LocalDate monthDate = LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), 1);
            
            BigDecimal awsCost = provider == CloudProvider.AWS ? totalCost : BigDecimal.ZERO;
            BigDecimal gcpCost = provider == CloudProvider.GCP ? totalCost : BigDecimal.ZERO;
            
            monthlyTrends.add(UsageTrend.builder()
                .date(monthDate)
                .cost(totalCost)
                .awsCost(awsCost)
                .gcpCost(gcpCost)
                .build());
        }
        
        return monthlyTrends.stream()
            .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
            .collect(Collectors.toList());
    }

    @Override
    public List<UsageTrend> getCustomUsageTrend(CloudProvider provider, LocalDate startDate, LocalDate endDate, String granularity) {
        // 기간 검증
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
        }
        
        // 최대 1년까지만 조회 가능
        if (startDate.isBefore(endDate.minusYears(1))) {
            throw new IllegalArgumentException("조회 기간은 최대 1년까지 가능합니다.");
        }

        // Redis에서 일별 데이터 조회
        List<CloudUsage> dailyUsages = cachePort.getDailyUsageRange(provider, startDate, endDate);

        if ("monthly".equals(granularity)) {
            // 월별로 집계
            return aggregateDailyToMonthly(dailyUsages, provider);
        } else {
            // 일별 데이터 그대로 사용
            return convertDailyUsagesToTrends(dailyUsages, provider);
        }
    }
}

