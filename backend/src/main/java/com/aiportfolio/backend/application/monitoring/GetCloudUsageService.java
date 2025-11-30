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

        return mergeTrends(awsUsage, gcpUsage, period);
    }

    @Override
    public ServiceBreakdown getServiceBreakdown() {
        ConsolidatedUsage usage = getCurrentMonthUsage();

        List<ServiceCost> awsTop5 = usage.getAwsUsage() != null && usage.getAwsUsage().getServices() != null
            ? usage.getAwsUsage().getTopServices(5)
            : Collections.emptyList();

        List<ServiceCost> gcpTop5 = usage.getGcpUsage() != null && usage.getGcpUsage().getServices() != null
            ? usage.getGcpUsage().getTopServices(5)
            : Collections.emptyList();

        return ServiceBreakdown.builder()
            .awsTop5(awsTop5)
            .gcpTop5(gcpTop5)
            .build();
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

        // 캐시 저장
        cachePort.saveUsage(cacheKey, usage, CACHE_TTL_SECONDS);

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
     * AWS와 GCP 사용량을 날짜별로 합산하여 추이 데이터 생성
     * TODO: 실제로는 일별 데이터를 조회해야 하지만, 현재는 전체 기간 합계만 반환
     */
    private List<UsageTrend> mergeTrends(
            CloudUsage aws,
            CloudUsage gcp,
            Period period) {
        
        // 간단한 구현: 전체 기간을 하나의 트렌드로 반환
        // 향후 개선: 일별 데이터를 조회하여 날짜별 추이 제공
        BigDecimal awsCost = aws != null && aws.getTotalCost() != null 
            ? aws.getTotalCost() : BigDecimal.ZERO;
        BigDecimal gcpCost = gcp != null && gcp.getTotalCost() != null 
            ? gcp.getTotalCost() : BigDecimal.ZERO;
        BigDecimal totalCost = awsCost.add(gcpCost);

        UsageTrend trend = UsageTrend.builder()
            .date(period.getEndDate())
            .cost(totalCost)
            .awsCost(awsCost)
            .gcpCost(gcpCost)
            .build();

        return Collections.singletonList(trend);
    }
}

