package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.ConsolidatedUsage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 통합 클라우드 사용량 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsolidatedUsageDto {
    private CloudUsageDto awsUsage;
    private CloudUsageDto gcpUsage;
    private BigDecimal totalCost;

    public static ConsolidatedUsageDto from(ConsolidatedUsage usage) {
        return ConsolidatedUsageDto.builder()
            .awsUsage(usage.getAwsUsage() != null ? CloudUsageDto.from(usage.getAwsUsage()) : null)
            .gcpUsage(usage.getGcpUsage() != null ? CloudUsageDto.from(usage.getGcpUsage()) : null)
            .totalCost(usage.getTotalCost())
            .build();
    }
}








