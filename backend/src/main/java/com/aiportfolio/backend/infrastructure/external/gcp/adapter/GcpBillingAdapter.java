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

        GcpUsageAccumulator acc = new GcpUsageAccumulator();
        for (FieldValueList row : result.iterateAll()) {
            acc.consumeRow(row);
        }

        return CloudUsage.builder()
            .provider(CloudProvider.GCP)
            .totalCost(acc.getTotalCost())
            .currency(acc.resolveCurrency())
            .period(new Period(startDate, endDate))
            .services(acc.getServices())
            .lastUpdated(LocalDate.now())
            .build();
    }

    private final class GcpUsageAccumulator {
        private BigDecimal totalCost = BigDecimal.ZERO;
        private final List<ServiceCost> services = new ArrayList<>();
        private String currency;

        void consumeRow(FieldValueList row) {
            try {
                appendParsedRow(row);
            } catch (Exception e) {
                log.warn("Failed to parse row in BigQuery result", e);
            }
        }

        private void appendParsedRow(FieldValueList row) {
            String serviceName = row.get("service_name").getStringValue();
            Double costValue = row.get("total_cost").getDoubleValue();
            String rowCurrency = row.get("currency").getStringValue();

            if (currency == null && rowCurrency != null) {
                currency = rowCurrency;
                log.info("Using GCP billing currency: {}", currency);
            }
            if (rowCurrency != null && currency != null && !rowCurrency.equals(currency)) {
                log.warn("Mixed currencies detected in GCP billing data: {} and {}. Using first detected: {}",
                        currency, rowCurrency, currency);
            }

            BigDecimal cost = BigDecimal.valueOf(costValue != null ? costValue : 0.0);
            services.add(ServiceCost.builder()
                    .serviceName(serviceName != null ? serviceName : "Unknown")
                    .cost(cost)
                    .unit(currency != null ? currency : "USD")
                    .build());
            totalCost = totalCost.add(cost);
        }

        BigDecimal getTotalCost() {
            return totalCost;
        }

        List<ServiceCost> getServices() {
            return services;
        }

        String resolveCurrency() {
            if (currency == null) {
                log.warn("No billing data found, defaulting to USD");
                return "USD";
            }
            return currency;
        }
    }
}

