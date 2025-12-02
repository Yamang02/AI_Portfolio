package com.aiportfolio.backend.domain.monitoring.port.out;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;

import java.time.LocalDate;

/**
 * 외부 클라우드 사용량 데이터를 가져오는 포트
 */
public interface CloudUsagePort {
    /**
     * 특정 기간의 클라우드 사용량 조회
     */
    CloudUsage fetchUsage(LocalDate startDate, LocalDate endDate);

    /**
     * 지원하는 클라우드 제공자
     */
    CloudProvider getProvider();
}





