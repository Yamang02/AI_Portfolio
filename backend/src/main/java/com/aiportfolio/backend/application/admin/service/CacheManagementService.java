package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageCacheUseCase;
import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 캐시 관리 서비스
 * ManageCacheUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheManagementService implements ManageCacheUseCase {

    private final CacheManagementPort cacheManagementPort;

    private static final String FRONTEND_CACHE_VERSION_KEY = "frontend:cache:version";
    private static final DateTimeFormatter VERSION_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
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

    @Override
    public List<String> getAllCacheKeys() {
        log.info("Retrieving all cache keys");

        try {
            Set<String> keys = cacheManagementPort.getKeysByPattern("*");
            List<String> sortedKeys = new ArrayList<>(keys);
            Collections.sort(sortedKeys);
            log.info("Retrieved {} cache keys", sortedKeys.size());
            return sortedKeys;

        } catch (Exception e) {
            log.error("Error retrieving cache keys", e);
            throw new RuntimeException("캐시 키 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    @Override
    public List<String> getCacheKeysByPattern(String pattern) {
        log.info("Retrieving cache keys by pattern: {}", pattern);

        try {
            Set<String> keys = cacheManagementPort.getKeysByPattern(pattern);
            List<String> sortedKeys = new ArrayList<>(keys);
            Collections.sort(sortedKeys);
            log.info("Retrieved {} cache keys matching pattern: {}", sortedKeys.size(), pattern);
            return sortedKeys;

        } catch (Exception e) {
            log.error("Error retrieving cache keys by pattern: {}", pattern, e);
            throw new RuntimeException("패턴별 캐시 키 조회 중 오류가 발생했습니다", e);
        }
    }

    @Override
    public String getFrontendCacheVersion() {
        log.info("Retrieving frontend cache version");

        try {
            String version = cacheManagementPort.getValue(FRONTEND_CACHE_VERSION_KEY);
            if (version == null) {
                // 초기 버전 설정
                version = LocalDateTime.now().format(VERSION_FORMATTER);
                cacheManagementPort.setValue(FRONTEND_CACHE_VERSION_KEY, version);
                log.info("Initialized frontend cache version: {}", version);
            }
            return version;

        } catch (Exception e) {
            log.error("Error retrieving frontend cache version", e);
            throw new RuntimeException("프론트엔드 캐시 버전 조회 중 오류가 발생했습니다", e);
        }
    }

    @Override
    public String updateFrontendCacheVersion() {
        log.info("Updating frontend cache version");

        try {
            String newVersion = LocalDateTime.now().format(VERSION_FORMATTER);
            cacheManagementPort.setValue(FRONTEND_CACHE_VERSION_KEY, newVersion);
            log.info("Frontend cache version updated to: {}", newVersion);
            return newVersion;

        } catch (Exception e) {
            log.error("Error updating frontend cache version", e);
            throw new RuntimeException("프론트엔드 캐시 버전 업데이트 중 오류가 발생했습니다", e);
        }
    }
}
