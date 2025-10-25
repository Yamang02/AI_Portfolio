package com.aiportfolio.backend.domain.admin.port.in;

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
}
