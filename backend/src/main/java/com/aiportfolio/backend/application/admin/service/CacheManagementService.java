package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageCacheUseCase;
import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 캐시 관리 서비스
 * ManageCacheUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheManagementService implements ManageCacheUseCase {
    
    private final CacheManagementPort cacheManagementPort;
    
    @Override
    public void flushAllCache() {
        log.info("Starting cache flush operation");
        
        try {
            cacheManagementPort.flushAll();
            log.info("Cache flush completed successfully");
            
        } catch (Exception e) {
            log.error("Error during cache flush", e);
            throw new RuntimeException("캐시 초기화 중 오류가 발생했습니다", e);
        }
    }
    
    @Override
    public Map<String, Object> getCacheStats() {
        log.info("Retrieving cache statistics");
        
        try {
            Map<String, Object> stats = cacheManagementPort.getStatistics();
            log.info("Cache stats retrieved successfully");
            return stats;
            
        } catch (Exception e) {
            log.error("Error retrieving cache stats", e);
            throw new RuntimeException("캐시 통계 조회 중 오류가 발생했습니다", e);
        }
    }
    
    @Override
    public void evictCacheByPattern(String pattern) {
        log.info("Evicting cache by pattern: {}", pattern);
        
        try {
            cacheManagementPort.evictByPattern(pattern);
            log.info("Cache evicted by pattern successfully: {}", pattern);
            
        } catch (Exception e) {
            log.error("Error during cache eviction by pattern: {}", pattern, e);
            throw new RuntimeException("패턴별 캐시 삭제 중 오류가 발생했습니다", e);
        }
    }
}
