package com.aiportfolio.backend.domain.port.in;

/**
 * 프로젝트 캐시 관리 Use Case
 * Primary Port (인바운드 포트)
 */
public interface ManageProjectCacheUseCase {
    
    /**
     * 프로젝트 데이터 캐시를 무효화합니다
     */
    void refreshCache();
    
    /**
     * 캐시 상태를 확인합니다
     */
    boolean isCacheValid();
}