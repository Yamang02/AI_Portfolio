package com.aiportfolio.backend.infrastructure.web.admin.dto.response;

import com.aiportfolio.backend.infrastructure.web.admin.dto.CloudUsageSnapshot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * 관리자 대시보드에서 사용하는 클라우드 사용량 요약 응답입니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudUsageDashboardResponse {

    @Builder.Default
    private Instant generatedAt = Instant.now();

    @Builder.Default
    private List<CloudUsageSnapshot> snapshots = Collections.emptyList();
}

