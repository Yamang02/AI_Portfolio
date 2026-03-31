package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
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
        log.info("API Request: GET /api/admin/cloud-usage/aws/current");
        var usage = getCloudUsageUseCase.getAwsCurrentMonthUsage();
        log.info("API Response: AWS current usage - totalCost={}, currency={}, services={}", 
                usage.getTotalCost(), usage.getCurrency(), 
                usage.getServices() != null ? usage.getServices().size() : 0);
        return ResponseEntity.ok(ApiResponse.success(CloudUsageDto.from(usage), WebApiResponseMessages.AWS_CURRENT_MONTH_SUCCESS));
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
            .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.AWS_USAGE_TREND_SUCCESS));
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
            .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.AWS_USAGE_TREND_30_SUCCESS));
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
            .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.AWS_USAGE_TREND_6M_SUCCESS));
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
                .toList())
            .gcpTop5(Collections.emptyList())
            .build();
        return ResponseEntity.ok(ApiResponse.success(breakdown, WebApiResponseMessages.AWS_SERVICE_BREAKDOWN_SUCCESS));
    }

    // ==================== GCP 엔드포인트 ====================

    /**
     * GCP 현재 월 사용량 조회
     */
    @GetMapping("/gcp/current")
    public ResponseEntity<ApiResponse<CloudUsageDto>> getGcpCurrent() {
        log.info("API Request: GET /api/admin/cloud-usage/gcp/current");
        var usage = getCloudUsageUseCase.getGcpCurrentMonthUsage();
        log.info("API Response: GCP current usage - totalCost={}, currency={}, services={}", 
                usage.getTotalCost(), usage.getCurrency(), 
                usage.getServices() != null ? usage.getServices().size() : 0);
        return ResponseEntity.ok(ApiResponse.success(CloudUsageDto.from(usage), WebApiResponseMessages.GCP_CURRENT_MONTH_SUCCESS));
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
            .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.GCP_USAGE_TREND_SUCCESS));
    }

    /**
     * GCP 지난 30일 비용 추이 조회 (일별/월별 토글)
     */
    @GetMapping("/gcp/trend/30days")
    public ResponseEntity<ApiResponse<List<UsageTrendDto.TrendItemDto>>> getGcpTrend30Days(
            @RequestParam(defaultValue = "daily") String granularity) {
        log.info("API Request: GET /api/admin/cloud-usage/gcp/trend/30days?granularity={}", granularity);
        var trends = getCloudUsageUseCase.getGcpUsageTrend30Days(granularity);
        List<UsageTrendDto.TrendItemDto> dtos = trends.stream()
            .map(UsageTrendDto.TrendItemDto::from)
            .toList();
        log.info("API Response: GCP 30days trend - granularity={}, dataPoints={}", granularity, dtos.size());
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.GCP_USAGE_TREND_30_SUCCESS));
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
            .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.GCP_USAGE_TREND_6M_SUCCESS));
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
                .toList())
            .build();
        return ResponseEntity.ok(ApiResponse.success(breakdown, WebApiResponseMessages.GCP_SERVICE_BREAKDOWN_SUCCESS));
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
                .toList();
            return ResponseEntity.ok(ApiResponse.success(dtos, WebApiResponseMessages.COST_SEARCH_SUCCESS));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid search parameters: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(WebApiResponseMessages.cloudInvalidSearchCondition(e)));
        } catch (Exception e) {
            log.error("Failed to search usage trend", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(WebApiResponseMessages.cloudCostSearchFailed(e)));
        }
    }
}

