package com.aiportfolio.backend.infrastructure.external.mock.gcp;

import com.aiportfolio.backend.domain.monitoring.model.*;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsagePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * GCP BigQuery Billing Mock 어댑터 (로컬 개발용)
 * 
 * Best Practice: Mock 구현체는 별도 패키지(mock)에 배치하여 프로덕션 코드와 분리
 * 
 * 활성화 조건:
 * - cloud.gcp.mock.enabled=true
 * - 또는 spring.profiles.active에 'local-mock' 포함
 * 
 * 사용 방법:
 * 1. application-local.yml에 cloud.gcp.mock.enabled=true 설정
 * 2. 또는 환경 변수: GCP_MOCK_ENABLED=true
 * 3. 또는 프로파일: --spring.profiles.active=local-mock
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "cloud.gcp.mock.enabled", havingValue = "true", matchIfMissing = false)
public class MockGcpBillingAdapter implements CloudUsagePort {

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        log.info("Using Mock GCP Billing Adapter (local development)");
        
        // Mock 데이터 생성 (실제 BigQuery 결과와 유사한 구조)
        List<ServiceCost> mockServices = Arrays.asList(
            ServiceCost.builder()
                .serviceName("Cloud Run")
                .cost(new BigDecimal("16491.45"))
                .unit("KRW")
                .build(),
            ServiceCost.builder()
                .serviceName("Cloud Storage")
                .cost(new BigDecimal("221.77"))
                .unit("KRW")
                .build(),
            ServiceCost.builder()
                .serviceName("Artifact Registry")
                .cost(new BigDecimal("198.17"))
                .unit("KRW")
                .build(),
            ServiceCost.builder()
                .serviceName("Vertex AI")
                .cost(new BigDecimal("8.47"))
                .unit("KRW")
                .build(),
            ServiceCost.builder()
                .serviceName("Cloud Logging")
                .cost(new BigDecimal("0.50"))
                .unit("KRW")
                .build()
        );

        BigDecimal totalCost = mockServices.stream()
            .map(ServiceCost::getCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CloudUsage.builder()
            .provider(CloudProvider.GCP)
            .totalCost(totalCost)
            .currency("KRW")
            .period(new Period(startDate, endDate))
            .services(mockServices)
            .lastUpdated(LocalDate.now())
            .build();
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.GCP;
    }
}

