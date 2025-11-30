package com.aiportfolio.backend.infrastructure.external.aws;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AWS 설정
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cloud.aws")
public class AwsConfig {
    private String accessKey;
    private String secretKey;
    private String region = "us-east-1"; // Cost Explorer는 us-east-1 사용
}

