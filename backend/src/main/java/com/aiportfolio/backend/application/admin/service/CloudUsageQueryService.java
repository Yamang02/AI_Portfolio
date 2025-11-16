package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.dto.response.CloudUsageDashboardResponse;
import com.aiportfolio.backend.domain.admin.model.dto.CloudUsageSnapshot;
import com.aiportfolio.backend.domain.admin.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.domain.admin.port.out.CloudUsageProviderPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 다수의 클라우드 사용량 제공자를 집계하여 관리자 대시보드 응답을 생성합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudUsageQueryService implements GetCloudUsageUseCase {

    private final List<CloudUsageProviderPort> providerPorts;

    @Override
    public CloudUsageDashboardResponse getRealTimeUsage() {
        List<CloudUsageSnapshot> snapshots = providerPorts.stream()
            .map(port -> {
                try {
                    CloudUsageSnapshot snapshot = port.fetchCurrentUsage();
                    return snapshot == null ? null : snapshot.withDefaults();
                } catch (Exception exception) {
                    log.error("Failed to fetch usage for provider {}", port.getProvider(), exception);
                    return CloudUsageSnapshot.failure(port.getProvider(), exception.getMessage());
                }
            })
            .filter(snapshot -> snapshot != null)
            .collect(Collectors.toList());

        return CloudUsageDashboardResponse.builder()
            .generatedAt(Instant.now())
            .snapshots(snapshots)
            .build();
    }
}
