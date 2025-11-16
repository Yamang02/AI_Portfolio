package com.aiportfolio.backend.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * 클라우드 사용량 조회에 필요한 외부 API 구성 정보를 보관합니다.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cloud.usage")
public class CloudUsageProperties {

    /**
     * 외부 API 요청 타임아웃 기본값.
     */
    private Duration timeout = Duration.ofSeconds(10);

    /**
     * 공급자별 설정 값.
     */
    private Map<String, ProviderProperties> providers = new HashMap<>();

    public ProviderProperties getAws() {
        return providers.computeIfAbsent("aws", key -> new ProviderProperties());
    }

    public ProviderProperties getGcp() {
        return providers.computeIfAbsent("gcp", key -> new ProviderProperties());
    }

    @Data
    public static class ProviderProperties {
        private boolean enabled = false;
        private String endpoint;
        private String apiKey;
        private String region;
        private String projectId;
        private Map<String, String> headers = new HashMap<>();
        private Map<String, String> query = new HashMap<>();
    }
}
