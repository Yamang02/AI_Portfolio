package com.aiportfolio.backend.domain.admin.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
