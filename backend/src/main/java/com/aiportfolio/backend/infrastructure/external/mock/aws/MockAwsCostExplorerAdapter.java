package com.aiportfolio.backend.infrastructure.external.mock.aws;

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
 * AWS Cost Explorer Mock 어댑터 (로컬 개발용)
 * 
 * Best Practice: Mock 구현체는 별도 패키지(mock)에 배치하여 프로덕션 코드와 분리
 * 
 * 활성화 조건:
 * - cloud.aws.mock.enabled=true
 * - 또는 spring.profiles.active에 'local-mock' 포함
 * 
 * 사용 방법:
 * 1. application-local.yml에 cloud.aws.mock.enabled=true 설정
 * 2. 또는 환경 변수: AWS_MOCK_ENABLED=true
 * 3. 또는 프로파일: --spring.profiles.active=local-mock
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "cloud.aws.mock.enabled", havingValue = "true", matchIfMissing = false)
public class MockAwsCostExplorerAdapter implements CloudUsagePort {

    @Override
    public CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate) {
        log.info("Using Mock AWS Cost Explorer Adapter (local development)");
        
        // Mock 데이터 생성
        List<ServiceCost> mockServices = Arrays.asList(
            ServiceCost.builder()
                .serviceName("EC2")
                .cost(new BigDecimal("45.67"))
                .unit("USD")
                .build(),
            ServiceCost.builder()
                .serviceName("S3")
                .cost(new BigDecimal("12.34"))
                .unit("USD")
                .build(),
            ServiceCost.builder()
                .serviceName("CloudFront")
                .cost(new BigDecimal("8.90"))
                .unit("USD")
                .build(),
            ServiceCost.builder()
                .serviceName("Lambda")
                .cost(new BigDecimal("3.21"))
                .unit("USD")
                .build(),
            ServiceCost.builder()
                .serviceName("RDS")
                .cost(new BigDecimal("15.43"))
                .unit("USD")
                .build()
        );

        BigDecimal totalCost = mockServices.stream()
            .map(ServiceCost::getCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CloudUsage.builder()
            .provider(CloudProvider.AWS)
            .totalCost(totalCost)
            .currency("USD")
            .period(new Period(startDate, endDate))
            .services(mockServices)
            .lastUpdated(LocalDate.now())
            .build();
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.AWS;
    }
}

