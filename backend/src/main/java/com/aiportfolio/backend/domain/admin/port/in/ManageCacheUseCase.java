package com.aiportfolio.backend.domain.admin.port.in;

import java.util.List;
import java.util.Map;

/**
 * 캐시 관리 Use Case 인터페이스
 * 캐시 관리 기능을 정의합니다.
 */
public interface ManageCacheUseCase {

    /**
     * 모든 캐시를 초기화합니다.
     */
    void flushAllCache();

    /**
     * 캐시 통계를 조회합니다.
     *
     * @return 캐시 통계 정보
     */
    Map<String, Object> getCacheStats();

    /**
     * 특정 패턴의 캐시를 삭제합니다.
     *
     * @param pattern 삭제할 캐시 패턴
     */
    void evictCacheByPattern(String pattern);

    /**
     * 모든 캐시 키 목록을 조회합니다.
     *
     * @return 캐시 키 목록
     */
    List<String> getAllCacheKeys();

    /**
     * 특정 패턴과 일치하는 캐시 키 목록을 조회합니다.
     *
     * @param pattern 조회할 캐시 키 패턴
     * @return 일치하는 캐시 키 목록
     */
    List<String> getCacheKeysByPattern(String pattern);

    /**
     * 프론트엔드 캐시 버전을 조회합니다.
     *
     * @return 현재 캐시 버전
     */
    String getFrontendCacheVersion();

    /**
     * 프론트엔드 캐시 버전을 업데이트합니다.
     * 모든 사용자의 localStorage 캐시가 무효화됩니다.
     *
     * @return 새로운 캐시 버전
     */
    String updateFrontendCacheVersion();
}
