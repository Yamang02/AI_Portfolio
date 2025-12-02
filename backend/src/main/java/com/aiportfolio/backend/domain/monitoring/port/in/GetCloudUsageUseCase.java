package com.aiportfolio.backend.domain.monitoring.port.in;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;
import com.aiportfolio.backend.domain.monitoring.model.ConsolidatedUsage;
import com.aiportfolio.backend.domain.monitoring.model.ServiceBreakdown;
import com.aiportfolio.backend.domain.monitoring.model.ServiceCost;
import com.aiportfolio.backend.domain.monitoring.model.UsageTrend;

import java.time.LocalDate;
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
     * AWS 지난 30일간 비용 추이 조회 (일별 또는 월별)
     */
    List<UsageTrend> getAwsUsageTrend30Days(String granularity);

    /**
     * AWS 지난 6개월간 비용 추이 조회 (월별)
     */
    List<UsageTrend> getAwsUsageTrend6Months();

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
     * GCP 지난 30일간 비용 추이 조회 (일별 또는 월별)
     */
    List<UsageTrend> getGcpUsageTrend30Days(String granularity);

    /**
     * GCP 지난 6개월간 비용 추이 조회 (월별)
     */
    List<UsageTrend> getGcpUsageTrend6Months();

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

    // ==================== Custom Search ====================

    /**
     * 커스텀 기간 비용 추이 조회
     * @param provider 클라우드 프로바이더 (AWS 또는 GCP)
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @param granularity 세분성 (daily 또는 monthly)
     */
    List<UsageTrend> getCustomUsageTrend(CloudProvider provider, LocalDate startDate, LocalDate endDate, String granularity);
}




