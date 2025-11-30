package com.aiportfolio.backend.infrastructure.external.aws;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.costexplorer.CostExplorerClient;
import software.amazon.awssdk.services.costexplorer.model.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * AWS Cost Explorer API 클라이언트
 * Mock 모드일 때는 비활성화 (cloud.aws.mock.enabled=false일 때만 활성화)
 */
@Slf4j
@Component
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "cloud.aws.mock.enabled", 
    havingValue = "false", 
    matchIfMissing = true
)
public class AwsCostExplorerClient {

    private final AwsConfig config;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private CostExplorerClient client;

    /**
     * Cost Explorer 클라이언트 초기화 (지연 초기화)
     */
    private CostExplorerClient getClient() {
        if (client == null) {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(
                config.getAccessKey(),
                config.getSecretKey()
            );

            this.client = CostExplorerClient.builder()
                .region(Region.US_EAST_1) // Cost Explorer는 us-east-1 사용
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
        }
        return client;
    }

    /**
     * 비용 및 사용량 조회
     */
    public GetCostAndUsageResponse getCostAndUsage(LocalDate startDate, LocalDate endDate) {
        try {
            GetCostAndUsageRequest request = GetCostAndUsageRequest.builder()
                .timePeriod(DateInterval.builder()
                    .start(startDate.format(DATE_FORMAT))
                    .end(endDate.plusDays(1).format(DATE_FORMAT)) // endDate는 exclusive이므로 +1일
                    .build())
                .granularity(Granularity.DAILY)
                .metrics("BlendedCost")
                .groupBy(
                    GroupDefinition.builder()
                        .type(GroupDefinitionType.DIMENSION)
                        .key("SERVICE")
                        .build()
                )
                .build();

            return getClient().getCostAndUsage(request);
        } catch (Exception e) {
            log.error("Failed to fetch AWS cost and usage data", e);
            throw new RuntimeException("Failed to fetch AWS cost data: " + e.getMessage(), e);
        }
    }
}

