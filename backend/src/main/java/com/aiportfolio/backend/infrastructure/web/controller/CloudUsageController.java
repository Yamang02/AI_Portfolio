package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.cloudusage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

/**
 * 클라우드 사용량 API 컨트롤러
 * AWS와 GCP를 별도 엔드포인트로 제공하며, 통합 뷰도 지원
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/cloud-usage")
public class CloudUsageController {

    private final GetCloudUsageUseCase getCloudUsageUseCase;

    // ==================== AWS 엔드포인트 ====================

    /**
     * AWS 현재 월 사용량 조회
     */
    @GetMapping("/aws/current")
    public ResponseEntity<CloudUsageDto> getAwsCurrent() {
        log.debug("Fetching AWS current month usage");
        var usage = getCloudUsageUseCase.getAwsCurrentMonthUsage();
        return ResponseEntity.ok(CloudUsageDto.from(usage));
    }

    /**
     * AWS 비용 추이 조회 (일별)
     */
    @GetMapping("/aws/trend")
    public ResponseEntity<UsageTrendDto> getAwsTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching AWS usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getAwsUsageTrend(days);
        return ResponseEntity.ok(UsageTrendDto.from(trends));
    }

    /**
     * AWS 서비스별 비용 분석 (Top 5)
     */
    @GetMapping("/aws/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getAwsBreakdown() {
        log.debug("Fetching AWS service breakdown");
        var services = getCloudUsageUseCase.getAwsTopServices(5);

        var breakdown = ServiceBreakdownDto.builder()
            .awsTop5(services.stream()
                .map(ServiceCostDto::from)
                .collect(Collectors.toList()))
            .gcpTop5(java.util.Collections.emptyList())
            .build();

        return ResponseEntity.ok(breakdown);
    }

    // ==================== GCP 엔드포인트 ====================

    /**
     * GCP 현재 월 사용량 조회
     */
    @GetMapping("/gcp/current")
    public ResponseEntity<CloudUsageDto> getGcpCurrent() {
        log.debug("Fetching GCP current month usage");
        var usage = getCloudUsageUseCase.getGcpCurrentMonthUsage();
        return ResponseEntity.ok(CloudUsageDto.from(usage));
    }

    /**
     * GCP 비용 추이 조회 (일별)
     */
    @GetMapping("/gcp/trend")
    public ResponseEntity<UsageTrendDto> getGcpTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching GCP usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getGcpUsageTrend(days);
        return ResponseEntity.ok(UsageTrendDto.from(trends));
    }

    /**
     * GCP 서비스별 비용 분석 (Top 5)
     */
    @GetMapping("/gcp/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getGcpBreakdown() {
        log.debug("Fetching GCP service breakdown");
        var services = getCloudUsageUseCase.getGcpTopServices(5);

        var breakdown = ServiceBreakdownDto.builder()
            .awsTop5(java.util.Collections.emptyList())
            .gcpTop5(services.stream()
                .map(ServiceCostDto::from)
                .collect(Collectors.toList()))
            .build();

        return ResponseEntity.ok(breakdown);
    }

    // ==================== Consolidated 엔드포인트 ====================

    /**
     * 현재 월 통합 클라우드 사용량 조회 (AWS + GCP)
     */
    @GetMapping("/consolidated/current")
    public ResponseEntity<ConsolidatedUsageDto> getConsolidatedCurrent() {
        log.debug("Fetching consolidated current month cloud usage");
        var usage = getCloudUsageUseCase.getCurrentMonthUsage();
        return ResponseEntity.ok(ConsolidatedUsageDto.from(usage));
    }

    /**
     * 통합 비용 추이 조회 (AWS + GCP 합산)
     */
    @GetMapping("/consolidated/trend")
    public ResponseEntity<UsageTrendDto> getConsolidatedTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching consolidated usage trend for {} days", days);
        var trend = getCloudUsageUseCase.getUsageTrend(days);
        return ResponseEntity.ok(UsageTrendDto.from(trend));
    }

    /**
     * 통합 서비스별 비용 분석 (AWS Top 5 + GCP Top 5)
     */
    @GetMapping("/consolidated/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getConsolidatedBreakdown() {
        log.debug("Fetching consolidated service breakdown");
        var breakdown = getCloudUsageUseCase.getServiceBreakdown();
        return ResponseEntity.ok(ServiceBreakdownDto.from(breakdown));
    }

    // ==================== 하위 호환성 엔드포인트 ====================

    /**
     * 현재 월 클라우드 사용량 조회 (하위 호환성)
     * @deprecated Use /consolidated/current instead
     */
    @Deprecated
    @GetMapping("/current")
    public ResponseEntity<ConsolidatedUsageDto> getCurrentUsage() {
        return getConsolidatedCurrent();
    }

    /**
     * 비용 추이 조회 (하위 호환성)
     * @deprecated Use /consolidated/trend instead
     */
    @Deprecated
    @GetMapping("/trend")
    public ResponseEntity<UsageTrendDto> getUsageTrend(
            @RequestParam(defaultValue = "30") int days) {
        return getConsolidatedTrend(days);
    }

    /**
     * 서비스별 비용 분석 (하위 호환성)
     * @deprecated Use /consolidated/breakdown instead
     */
    @Deprecated
    @GetMapping("/breakdown")
    public ResponseEntity<ServiceBreakdownDto> getServiceBreakdown() {
        return getConsolidatedBreakdown();
    }
}
