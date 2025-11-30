package com.aiportfolio.backend.domain.monitoring.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라우드 사용량 도메인 모델
 */
@Data
@Builder
public class CloudUsage {
    private CloudProvider provider;
    private BigDecimal totalCost;
    private String currency;
    private Period period;
    private List<ServiceCost> services;
    private LocalDate lastUpdated;

    /**
     * USD로 변환된 총 비용 반환 (현재는 단순 반환, 향후 환율 변환 로직 추가 가능)
     */
    public BigDecimal getTotalCostInUSD() {
        // TODO: 환율 변환 로직 필요시 추가
        return totalCost != null ? totalCost : BigDecimal.ZERO;
    }

    /**
     * 상위 N개 서비스 반환
     */
    public List<ServiceCost> getTopServices(int limit) {
        if (services == null || services.isEmpty()) {
            return Collections.emptyList();
        }
        return services.stream()
            .sorted((a, b) -> b.getCost().compareTo(a.getCost()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * 빈 CloudUsage 생성
     */
    public static CloudUsage empty(CloudProvider provider, Period period) {
        return CloudUsage.builder()
            .provider(provider)
            .totalCost(BigDecimal.ZERO)
            .currency("USD")
            .period(period)
            .services(Collections.emptyList())
            .lastUpdated(LocalDate.now())
            .build();
    }
}

