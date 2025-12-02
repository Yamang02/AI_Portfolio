package com.aiportfolio.backend.domain.monitoring.port.out;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;

import java.time.LocalDate;
import java.util.List;

/**
 * 클라우드 사용량 캐시 포트
 */
public interface CloudUsageCachePort {
    /**
     * 사용량 정보를 캐시에 저장 (기간별 캐시)
     */
    void saveUsage(String key, CloudUsage usage, long ttlSeconds);

    /**
     * 캐시에서 사용량 정보 조회
     */
    CloudUsage getUsage(String key);

    /**
     * 캐시 키 존재 여부 확인
     */
    boolean exists(String key);

    /**
     * 날짜별 사용량 정보 저장 (히스토리용, TTL 90일)
     * DB 스키마 변경 없이 Redis에 날짜별 히스토리 저장
     */
    void saveDailyUsage(CloudProvider provider, LocalDate date, CloudUsage usage);

    /**
     * 날짜별 사용량 정보 조회
     */
    CloudUsage getDailyUsage(CloudProvider provider, LocalDate date);

    /**
     * 날짜 범위의 일별 사용량 조회 (히스토리)
     */
    List<CloudUsage> getDailyUsageRange(CloudProvider provider, LocalDate startDate, LocalDate endDate);
}

