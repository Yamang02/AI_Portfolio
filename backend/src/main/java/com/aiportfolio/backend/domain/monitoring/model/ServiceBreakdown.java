package com.aiportfolio.backend.domain.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * 서비스별 비용 분석 결과
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBreakdown {
    @Builder.Default
    private List<ServiceCost> awsTop5 = Collections.emptyList();
    
    @Builder.Default
    private List<ServiceCost> gcpTop5 = Collections.emptyList();
}




