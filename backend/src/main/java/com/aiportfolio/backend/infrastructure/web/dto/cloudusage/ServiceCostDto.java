package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 서비스별 비용 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCostDto {
    private String serviceName;
    private BigDecimal cost;
    private String unit;

    public static ServiceCostDto from(ServiceCost serviceCost) {
        return ServiceCostDto.builder()
            .serviceName(serviceCost.getServiceName())
            .cost(serviceCost.getCost())
            .unit(serviceCost.getUnit())
            .build();
    }
}




