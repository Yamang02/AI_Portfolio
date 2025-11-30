package com.aiportfolio.backend.domain.monitoring.port.in;

import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;
import com.aiportfolio.backend.domain.monitoring.model.ConsolidatedUsage;
import com.aiportfolio.backend.domain.monitoring.model.ServiceBreakdown;
import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import com.aiportfolio.backend.domain.monitoring.model.UsageTrend;

import java.util.List;

/**
 * 클라우드 사용량 조회 유스케이스
 */
public interface GetCloudUsageUseCase {
    // ==================== AWS ====================

    /**
     * AWS 현재 월 사용량 조회
     */
    CloudUsage getAwsCurrentMonthUsage();

    /**
     * AWS 지난 N일간의 비용 추이 조회 (일별)
     */
    List<UsageTrend> getAwsUsageTrend(int days);

    /**
     * AWS 서비스별 비용 Top N 조회
     */
    List<ServiceCost> getAwsTopServices(int limit);

    // ==================== GCP ====================

    /**
     * GCP 현재 월 사용량 조회
     */
    CloudUsage getGcpCurrentMonthUsage();

    /**
     * GCP 지난 N일간의 비용 추이 조회 (일별)
     */
    List<UsageTrend> getGcpUsageTrend(int days);

    /**
     * GCP 서비스별 비용 Top N 조회
     */
    List<ServiceCost> getGcpTopServices(int limit);

    // ==================== Consolidated ====================

    /**
     * 현재 월의 통합 클라우드 사용량 조회 (AWS + GCP)
     */
    ConsolidatedUsage getCurrentMonthUsage();

    /**
     * 지난 N일간의 통합 비용 추이 조회 (AWS + GCP)
     */
    List<UsageTrend> getUsageTrend(int days);

    /**
     * 서비스별 비용 분석 (Top 5) - AWS와 GCP 각각
     */
    ServiceBreakdown getServiceBreakdown();
}

