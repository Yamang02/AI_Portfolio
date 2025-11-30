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
    private String billingDataset;
    private String billingTable;
    private String credentialsPath; // 서비스 계정 JSON 키 파일 경로
}

