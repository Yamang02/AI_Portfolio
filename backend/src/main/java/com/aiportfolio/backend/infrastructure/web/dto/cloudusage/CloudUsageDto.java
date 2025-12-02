package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라우드 사용량 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudUsageDto {
    private CloudProvider provider;
    private BigDecimal totalCost;
    private String currency;
    private PeriodDto period;
    private List<ServiceCostDto> services;
    private LocalDate lastUpdated;

    public static CloudUsageDto from(CloudUsage usage) {
        return CloudUsageDto.builder()
            .provider(usage.getProvider())
            .totalCost(usage.getTotalCost())
            .currency(usage.getCurrency())
            .period(usage.getPeriod() != null ? PeriodDto.from(usage.getPeriod()) : null)
            .services(usage.getServices() != null 
                ? usage.getServices().stream()
                    .map(ServiceCostDto::from)
                    .collect(Collectors.toList())
                : Collections.emptyList())
            .lastUpdated(usage.getLastUpdated())
            .build();
    }
}

