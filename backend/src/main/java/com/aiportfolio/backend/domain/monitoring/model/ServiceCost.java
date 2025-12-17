package com.aiportfolio.backend.domain.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 서비스별 비용 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCost {
    private String serviceName;
    private BigDecimal cost;
    private String unit; // "USD", "hours", etc.
}










