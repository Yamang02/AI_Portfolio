package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.model.vo.CloudProvider;
import com.aiportfolio.backend.domain.admin.model.vo.CloudUsageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 특정 시점의 클라우드 사용량 스냅샷입니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudUsageSnapshot {

    private CloudProvider provider;
    private CloudUsageStatus status;
    private Instant collectedAt;
    private String region;
    private String message;

    @Builder.Default
    private List<CloudUsageMetric> metrics = Collections.emptyList();

    @Builder.Default
    private Map<String, Object> metadata = Collections.emptyMap();

    public static CloudUsageSnapshot disabled(CloudProvider provider, String message) {
        return CloudUsageSnapshot.builder()
            .provider(provider)
            .status(CloudUsageStatus.DISABLED)
            .message(message)
            .collectedAt(Instant.now())
            .build();
    }

    public static CloudUsageSnapshot unavailable(CloudProvider provider, String message) {
        return CloudUsageSnapshot.builder()
            .provider(provider)
            .status(CloudUsageStatus.UNAVAILABLE)
            .message(message)
            .collectedAt(Instant.now())
            .build();
    }

    public static CloudUsageSnapshot failure(CloudProvider provider, String message) {
        return unavailable(provider, message);
    }

    public void ensureDefaults() {
        if (collectedAt == null) {
            collectedAt = Instant.now();
        }
        if (status == null) {
            status = CloudUsageStatus.UNAVAILABLE;
        }
        if (metrics == null) {
            metrics = Collections.emptyList();
        }
        if (metadata == null) {
            metadata = Collections.emptyMap();
        }
        if (message == null) {
            message = "";
        }
    }

    public CloudUsageSnapshot withDefaults() {
        ensureDefaults();
        return this;
    }

    public boolean isHealthy() {
        return status == CloudUsageStatus.HEALTHY || status == CloudUsageStatus.DEGRADED;
    }

    public boolean hasMetrics() {
        return metrics != null && !metrics.isEmpty();
    }

    public CloudUsageSnapshot addMetadata(Map<String, Object> additional) {
        if (additional == null || additional.isEmpty()) {
            return this;
        }

        if (metadata == null || metadata.isEmpty()) {
            metadata = additional;
            return this;
        }

        metadata = new java.util.HashMap<>(metadata);
        additional.forEach((key, value) -> metadata.put(key, Objects.requireNonNullElse(value, "")));
        return this;
    }
}

