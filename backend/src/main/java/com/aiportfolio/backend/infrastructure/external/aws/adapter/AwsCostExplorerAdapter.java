package com.aiportfolio.backend.infrastructure.external.aws.adapter;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import com.aiportfolio.backend.infrastructure.external.aws.AwsCostExplorerClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.costexplorer.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * AWS Cost Explorer 어댑터
 * 
 * 로컬 개발 환경에서 실제 AWS 연결 없이 테스트하려면:
 * - application-local.yml에서 cloud.aws.mock.enabled=true 설정
 * - 또는 환경 변수 AWS_MOCK_ENABLED=true 설정
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "cloud.aws.mock.enabled", havingValue = "false", matchIfMissing = true)
public class AwsCostExplorerAdapter implements CloudUsagePort {

    private final AwsCostExplorerClient client;

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        try {
            GetCostAndUsageResponse response = client.getCostAndUsage(startDate, endDate);
            return mapToCloudUsage(response, startDate, endDate);
        } catch (Exception e) {
            log.error("Failed to fetch AWS usage", e);
            return CloudUsage.empty(CloudProvider.AWS, new Period(startDate, endDate));
        }
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.AWS;
    }

    /**
     * AWS Cost Explorer 응답을 CloudUsage 도메인 모델로 변환
     */
    private CloudUsage mapToCloudUsage(
            GetCostAndUsageResponse response,
            LocalDate startDate,
            LocalDate endDate) {

        BigDecimal totalCost = BigDecimal.ZERO;
        List<ServiceCost> services = new ArrayList<>();
        int processedGroups = 0;

        // ResultByTime에서 서비스별 비용 추출
        for (ResultByTime result : response.resultsByTime()) {
            for (Group group : result.groups()) {
                String serviceName = group.keys().isEmpty() ? "Unknown" : group.keys().get(0);
                MetricValue metricValue = group.metrics().get("BlendedCost");

                if (metricValue != null && metricValue.amount() != null) {
                    BigDecimal cost = new BigDecimal(metricValue.amount());
                    String unit = metricValue.unit() != null ? metricValue.unit() : "USD";

                    // 같은 서비스가 여러 날짜에 있으면 합산
                    ServiceCost existing = services.stream()
                        .filter(s -> s.getServiceName().equals(serviceName))
                        .findFirst()
                        .orElse(null);

                    if (existing != null) {
                        existing.setCost(existing.getCost().add(cost));
                    } else {
                        services.add(ServiceCost.builder()
                            .serviceName(serviceName)
                            .cost(cost)
                            .unit(unit)
                            .build());
                    }

                    totalCost = totalCost.add(cost);
                    processedGroups++;
                }
            }
        }

        log.info("Processed {} AWS service cost groups, total cost: {} USD", processedGroups, totalCost);

        return CloudUsage.builder()
            .provider(CloudProvider.AWS)
            .totalCost(totalCost)
            .currency("USD")
            .period(new Period(startDate, endDate))
            .services(services)
            .lastUpdated(LocalDate.now())
            .build();
    }
}
