package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.infrastructure.web.admin.dto.response.CloudUsageDashboardResponse;
import com.aiportfolio.backend.domain.admin.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 대시보드용 클라우드 사용량 API.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/cloud/usage")
public class AdminCloudUsageController {

    private final GetCloudUsageUseCase getCloudUsageUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<CloudUsageDashboardResponse>> getUsage() {
        log.debug("Fetching real-time cloud usage snapshot for admin dashboard");
        CloudUsageDashboardResponse response = getCloudUsageUseCase.getRealTimeUsage();
        return ResponseEntity.ok(ApiResponse.success(response, "클라우드 사용량 조회 성공"));
    }
}
