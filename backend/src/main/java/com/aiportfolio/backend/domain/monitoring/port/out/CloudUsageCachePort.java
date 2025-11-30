package com.aiportfolio.backend.domain.monitoring.port.out;

import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;

/**
 * 클라우드 사용량 캐시 포트
 */
public interface CloudUsageCachePort {
    /**
     * 사용량 정보를 캐시에 저장
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
}

