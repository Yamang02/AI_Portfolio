package com.aiportfolio.backend.domain.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 통합 클라우드 사용량 (AWS + GCP)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsolidatedUsage {
    private CloudUsage awsUsage;
    private CloudUsage gcpUsage;
    private BigDecimal totalCost;

    /**
     * AWS와 GCP 사용량을 통합하여 생성
     */
    public static ConsolidatedUsage of(CloudUsage aws, CloudUsage gcp) {
        BigDecimal awsCost = aws != null && aws.getTotalCost() != null 
            ? aws.getTotalCost() : BigDecimal.ZERO;
        BigDecimal gcpCost = gcp != null && gcp.getTotalCost() != null 
            ? gcp.getTotalCost() : BigDecimal.ZERO;
        BigDecimal total = awsCost.add(gcpCost);

        return ConsolidatedUsage.builder()
            .awsUsage(aws != null ? aws : CloudUsage.empty(CloudProvider.AWS, Period.currentMonth()))
            .gcpUsage(gcp != null ? gcp : CloudUsage.empty(CloudProvider.GCP, Period.currentMonth()))
            .totalCost(total)
            .build();
    }
}










