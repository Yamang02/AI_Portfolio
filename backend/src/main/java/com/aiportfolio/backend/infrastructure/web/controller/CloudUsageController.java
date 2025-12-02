package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.cloudusage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라우드 사용량 API 컨트롤러
 * AWS와 GCP를 별도 섹션으로 분리하여 관리
 * 
 * Hexagonal Architecture 준수:
 * - Controller는 UseCase만 호출 (Infrastructure → Application)
 * - 비즈니스 로직은 모두 Application Layer에 위치
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
    public ResponseEntity<ApiResponse<CloudUsageDto>> getAwsCurrent() {
        log.debug("Fetching AWS current month usage");
        var usage = getCloudUsageUseCase.getAwsCurrentMonthUsage();
        return ResponseEntity.ok(ApiResponse.success(CloudUsageDto.from(usage), "AWS 현재 월 사용량 조회 성공"));
    }

    /**
     * AWS 비용 추이 조회 (일별)
     */
    @GetMapping("/aws/trend")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getAwsTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching AWS usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getAwsUsageTrend(days);
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "AWS 비용 추이 조회 성공"));
    }

    /**
     * AWS 지난 30일 비용 추이 조회 (일별/월별 토글)
     */
    @GetMapping("/aws/trend/30days")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getAwsTrend30Days(
            @RequestParam(defaultValue = "monthly") String granularity) {
        log.debug("Fetching AWS usage trend for 30 days, granularity={}", granularity);
        var trends = getCloudUsageUseCase.getAwsUsageTrend30Days(granularity);
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "AWS 30일 비용 추이 조회 성공"));
    }

    /**
     * AWS 지난 6개월 비용 추이 조회 (월별)
     */
    @GetMapping("/aws/trend/6months")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getAwsTrend6Months() {
        log.debug("Fetching AWS usage trend for 6 months");
        var trends = getCloudUsageUseCase.getAwsUsageTrend6Months();
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "AWS 6개월 비용 추이 조회 성공"));
    }

    /**
     * AWS 서비스별 비용 분석
     */
    @GetMapping("/aws/breakdown")
    public ResponseEntity<ApiResponse<ServiceBreakdownDto>> getAwsBreakdown() {
        log.debug("Fetching AWS service breakdown");
        List<ServiceCost> top5 = getCloudUsageUseCase.getAwsTopServices(5);
        ServiceBreakdownDto breakdown = ServiceBreakdownDto.builder()
            .awsTop5(top5.stream()
                .map(serviceCost -> ServiceCostDto.builder()
                    .serviceName(serviceCost.getServiceName())
                    .cost(serviceCost.getCost())
                    .unit(serviceCost.getUnit())
                    .build())
                .collect(Collectors.toList()))
            .gcpTop5(Collections.emptyList())
            .build();
        return ResponseEntity.ok(ApiResponse.success(breakdown, "AWS 서비스별 비용 분석 조회 성공"));
    }

    // ==================== GCP 엔드포인트 ====================

    /**
     * GCP 현재 월 사용량 조회
     */
    @GetMapping("/gcp/current")
    public ResponseEntity<ApiResponse<CloudUsageDto>> getGcpCurrent() {
        log.debug("Fetching GCP current month usage");
        var usage = getCloudUsageUseCase.getGcpCurrentMonthUsage();
        return ResponseEntity.ok(ApiResponse.success(CloudUsageDto.from(usage), "GCP 현재 월 사용량 조회 성공"));
    }

    /**
     * GCP 비용 추이 조회 (일별)
     */
    @GetMapping("/gcp/trend")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getGcpTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching GCP usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getGcpUsageTrend(days);
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "GCP 비용 추이 조회 성공"));
    }

    /**
     * GCP 지난 30일 비용 추이 조회 (일별/월별 토글)
     */
    @GetMapping("/gcp/trend/30days")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getGcpTrend30Days(
            @RequestParam(defaultValue = "daily") String granularity) {
        log.debug("Fetching GCP usage trend for 30 days, granularity={}", granularity);
        var trends = getCloudUsageUseCase.getGcpUsageTrend30Days(granularity);
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "GCP 30일 비용 추이 조회 성공"));
    }

    /**
     * GCP 지난 6개월 비용 추이 조회 (월별)
     */
    @GetMapping("/gcp/trend/6months")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getGcpTrend6Months() {
        log.debug("Fetching GCP usage trend for 6 months");
        var trends = getCloudUsageUseCase.getGcpUsageTrend6Months();
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "GCP 6개월 비용 추이 조회 성공"));
    }

    /**
     * GCP 서비스별 비용 분석
     */
    @GetMapping("/gcp/breakdown")
    public ResponseEntity<ApiResponse<ServiceBreakdownDto>> getGcpBreakdown() {
        log.debug("Fetching GCP service breakdown");
        List<ServiceCost> top5 = getCloudUsageUseCase.getGcpTopServices(5);
        ServiceBreakdownDto breakdown = ServiceBreakdownDto.builder()
            .awsTop5(Collections.emptyList())
            .gcpTop5(top5.stream()
                .map(serviceCost -> ServiceCostDto.builder()
                    .serviceName(serviceCost.getServiceName())
                    .cost(serviceCost.getCost())
                    .unit(serviceCost.getUnit())
                    .build())
                .collect(Collectors.toList()))
            .build();
        return ResponseEntity.ok(ApiResponse.success(breakdown, "GCP 서비스별 비용 분석 조회 성공"));
    }

    // ==================== Custom Search ====================

    /**
     * 커스텀 기간 비용 추이 조회
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> searchUsageTrend(
            @RequestParam String provider,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String granularity) {
        log.debug("Searching usage trend: provider={}, startDate={}, endDate={}, granularity={}", 
                provider, startDate, endDate, granularity);
        
        try {
            CloudProvider cloudProvider = CloudProvider.valueOf(provider.toUpperCase());
            var trends = getCloudUsageUseCase.getCustomUsageTrend(cloudProvider, startDate, endDate, granularity);
            List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
                .map(UsageTrendDto.TrendItemDto::from)
                .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(dtos, "비용 검색 성공"));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid search parameters: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("잘못된 검색 조건: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to search usage trend", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("비용 검색 실패: " + e.getMessage()));
        }
    }
}

