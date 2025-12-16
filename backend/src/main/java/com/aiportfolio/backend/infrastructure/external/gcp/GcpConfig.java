package com.aiportfolio.backend.infrastructure.external.gcp;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * GCP 설정
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cloud.gcp")
public class GcpConfig {
    private String projectId;
    private String billingAccountId; // Billing API 사용 시 필요
    private String billingDataset; // BigQuery 사용 시 필요 (선택적)
    private String billingTable; // BigQuery 사용 시 필요 (선택적)
    private String credentialsPath; // 서비스 계정 JSON 키 파일 경로
    private boolean useBillingApi = true; // Billing API 사용 여부 (기본값: true)
}




