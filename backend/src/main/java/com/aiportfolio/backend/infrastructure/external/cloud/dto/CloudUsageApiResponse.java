package com.aiportfolio.backend.infrastructure.external.cloud.dto;

import com.aiportfolio.backend.domain.admin.model.dto.CloudUsageMetric;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 외부 사용량 API 응답을 매핑하기 위한 DTO 입니다.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CloudUsageApiResponse {

    private String status;

    private String message;

    private String region;

    @JsonProperty("collected_at")
    private Instant collectedAt;

    private List<MetricResponse> metrics = Collections.emptyList();

    private Map<String, Object> metadata = Collections.emptyMap();

    public List<CloudUsageMetric> toMetrics() {
        if (metrics == null) {
            return Collections.emptyList();
        }
        return metrics.stream()
            .map(metric -> CloudUsageMetric.builder()
                .name(metric.getName())
                .unit(metric.getUnit())
                .value(metric.getValue())
                .description(metric.getDescription())
                .build())
            .collect(Collectors.toList());
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MetricResponse {
        private String name;
        private Double value;
        private String unit;
        private String description;
    }
}
