package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.cloudusage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 클라우드 사용량 API 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/cloud-usage")
public class CloudUsageController {

    private final GetCloudUsageUseCase getCloudUsageUseCase;

    /**
     * 현재 월 클라우드 사용량 조회
     */
    @GetMapping("/current")
    public ResponseEntity<ConsolidatedUsageDto> getCurrentUsage() {
        log.debug("Fetching current month cloud usage");
        var usage = getCloudUsageUseCase.getCurrentMonthUsage();
        return ResponseEntity.ok(ConsolidatedUsageDto.from(usage));
    }

    /**
     * 비용 추이 조회
     */
    @GetMapping("/trend")
    public ResponseEntity<UsageTrendDto> getUsageTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching cloud usage trend for {} days", days);
        var trend = getCloudUsageUseCase.getUsageTrend(days);
        return ResponseEntity.ok(UsageTrendDto.from(trend));
    }

    /**
     * 서비스별 비용 분석
     */
    @GetMapping("/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getServiceBreakdown() {
        log.debug("Fetching service breakdown");
        var breakdown = getCloudUsageUseCase.getServiceBreakdown();
        return ResponseEntity.ok(ServiceBreakdownDto.from(breakdown));
    }
}

