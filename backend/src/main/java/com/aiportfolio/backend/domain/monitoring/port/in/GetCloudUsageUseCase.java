package com.aiportfolio.backend.domain.monitoring.port.in;

import com.aiportfolio.backend.domain.monitoring.model.ConsolidatedUsage;
import com.aiportfolio.backend.domain.monitoring.model.ServiceBreakdown;
import com.aiportfolio.backend.domain.monitoring.model.UsageTrend;

import java.util.List;

/**
 * 클라우드 사용량 조회 유스케이스
 */
public interface GetCloudUsageUseCase {
    /**
     * 현재 월의 통합 클라우드 사용량 조회
     */
    ConsolidatedUsage getCurrentMonthUsage();

    /**
     * 지난 N일간의 비용 추이 조회
     */
    List<UsageTrend> getUsageTrend(int days);

    /**
     * 서비스별 비용 분석 (Top 5)
     */
    ServiceBreakdown getServiceBreakdown();
}

