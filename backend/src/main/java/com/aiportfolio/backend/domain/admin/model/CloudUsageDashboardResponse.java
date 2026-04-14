package com.aiportfolio.backend.domain.admin.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

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
