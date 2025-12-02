package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import com.aiportfolio.backend.domain.monitoring.port.in.GetCloudUsageUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.cloudusage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<UsageTrendDto>> getAwsTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching AWS usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getAwsUsageTrend(days);
        return ResponseEntity.ok(ApiResponse.success(UsageTrendDto.from(trends), "AWS 비용 추이 조회 성공"));
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
    public ResponseEntity<ApiResponse<UsageTrendDto>> getGcpTrend(
            @RequestParam(defaultValue = "30") int days) {
        log.debug("Fetching GCP usage trend for {} days", days);
        var trends = getCloudUsageUseCase.getGcpUsageTrend(days);
        return ResponseEntity.ok(ApiResponse.success(UsageTrendDto.from(trends), "GCP 비용 추이 조회 성공"));
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
}

