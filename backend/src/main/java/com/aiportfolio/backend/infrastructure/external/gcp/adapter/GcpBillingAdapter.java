package com.aiportfolio.backend.infrastructure.external.gcp.adapter;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import com.aiportfolio.backend.infrastructure.external.gcp.GcpBillingClient;
import com.google.cloud.bigquery.FieldValueList;
import com.google.cloud.bigquery.TableResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * GCP BigQuery Billing 어댑터
 * 
 * 로컬 개발 환경에서 실제 GCP 연결 없이 테스트하려면:
 * - application-local.yml에서 cloud.gcp.mock.enabled=true 설정
 * - 또는 환경 변수 GCP_MOCK_ENABLED=true 설정
 */
@Slf4j
@Component
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "cloud.gcp.mock.enabled", 
    havingValue = "false", 
    matchIfMissing = true
)
public class GcpBillingAdapter implements CloudUsagePort {

    private final GcpBillingClient client;

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        try {
            TableResult result = client.queryBillingData(startDate, endDate);
            return mapToCloudUsage(result, startDate, endDate);
        } catch (Exception e) {
            log.error("Failed to fetch GCP usage", e);
            return CloudUsage.empty(CloudProvider.GCP, new Period(startDate, endDate));
        }
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.GCP;
    }

    /**
     * BigQuery 결과를 CloudUsage 도메인 모델로 변환
     */
    private CloudUsage mapToCloudUsage(
            TableResult result,
            LocalDate startDate,
            LocalDate endDate) {

        BigDecimal totalCost = BigDecimal.ZERO;
        List<ServiceCost> services = new ArrayList<>();
        String currency = "USD";

        for (FieldValueList row : result.iterateAll()) {
            try {
                String serviceName = row.get("service_name").getStringValue();
                Double costValue = row.get("total_cost").getDoubleValue();
                String rowCurrency = row.get("currency").getStringValue();
                
                if (currency == null || currency.equals("USD")) {
                    currency = rowCurrency != null ? rowCurrency : "USD";
                }

                BigDecimal cost = BigDecimal.valueOf(costValue != null ? costValue : 0.0);

                services.add(ServiceCost.builder()
                    .serviceName(serviceName != null ? serviceName : "Unknown")
                    .cost(cost)
                    .unit(currency)
                    .build());

                totalCost = totalCost.add(cost);
            } catch (Exception e) {
                log.warn("Failed to parse row in BigQuery result", e);
            }
        }

        return CloudUsage.builder()
            .provider(CloudProvider.GCP)
            .totalCost(totalCost)
            .currency(currency)
            .period(new Period(startDate, endDate))
            .services(services)
            .lastUpdated(LocalDate.now())
            .build();
    }
}

