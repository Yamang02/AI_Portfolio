package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.ServiceBreakdown;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 서비스별 비용 분석 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBreakdownDto {
    private List<ServiceCostDto> awsTop5;
    private List<ServiceCostDto> gcpTop5;

    public static ServiceBreakdownDto from(ServiceBreakdown breakdown) {
        return ServiceBreakdownDto.builder()
            .awsTop5(breakdown.getAwsTop5() != null
                ? breakdown.getAwsTop5().stream()
                    .map(ServiceCostDto::from)
                    .collect(Collectors.toList())
                : Collections.emptyList())
            .gcpTop5(breakdown.getGcpTop5() != null
                ? breakdown.getGcpTop5().stream()
                    .map(ServiceCostDto::from)
                    .collect(Collectors.toList())
                : Collections.emptyList())
            .build();
    }
}










