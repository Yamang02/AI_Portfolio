package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.UsageTrend;
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
 * 비용 추이 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageTrendDto {
    private List<TrendItemDto> trends;

    public static UsageTrendDto from(List<UsageTrend> trends) {
        return UsageTrendDto.builder()
            .trends(trends != null 
                ? trends.stream()
                    .map(TrendItemDto::from)
                    .collect(Collectors.toList())
                : Collections.emptyList())
            .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendItemDto {
        private LocalDate date;
        private BigDecimal cost;
        private BigDecimal awsCost;
        private BigDecimal gcpCost;

        public static TrendItemDto from(UsageTrend trend) {
            return TrendItemDto.builder()
                .date(trend.getDate())
                .cost(trend.getCost())
                .awsCost(trend.getAwsCost())
                .gcpCost(trend.getGcpCost())
                .build();
        }
    }
}








