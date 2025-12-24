package com.aiportfolio.backend.domain.portfolio.port.in;

/**
 * 프로젝트 캐시 관리 Use Case
 * Primary Port (인바운드 포트)
 */
public interface ManageProjectCacheUseCase {
    
    /**
     * 프로젝트 캐시만 무효화
     */
    void refreshProjectsCache();
    
    /**
     * 모든 포트폴리오 캐시 무효화
     */
    void refreshCache();
    
    /**
     * 캐시 상태를 확인합니다 (Redis TTL 기반)
     */
    boolean isCacheValid();
}