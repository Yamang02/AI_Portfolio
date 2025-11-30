package com.aiportfolio.backend.infrastructure.web.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 단일 클라우드 사용량 지표를 나타냅니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudUsageMetric {
    private String name;
    private Double value;
    private String unit;
    private String description;
}


