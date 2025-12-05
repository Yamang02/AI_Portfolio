package com.aiportfolio.backend.domain.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 날짜별 비용 추이 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageTrend {
    private LocalDate date;
    private BigDecimal cost;
    private BigDecimal awsCost;
    private BigDecimal gcpCost;
}







