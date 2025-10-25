package com.aiportfolio.backend.infrastructure.persistence.redis.adapter;

import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Redis 캐시 관리 어댑터
 * CacheManagementPort 인터페이스의 Redis 구현체
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCacheManagementAdapter implements CacheManagementPort {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public void flushAll() {
        log.info("Starting cache flush operation");
        
        try {
            Set<String> keys = redisTemplate.keys("*");
            
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cache flush completed. Deleted {} keys", keys.size());
            } else {
                log.info("No cache keys found to flush");
            }
            
        } catch (Exception e) {
            log.error("Error during cache flush", e);
            throw new RuntimeException("캐시 초기화 중 오류가 발생했습니다", e);
        }
    }
    
    @Override
    public void evictByPattern(String pattern) {
        log.info("Evicting cache by pattern: {}", pattern);
        
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cache evicted by pattern. Deleted {} keys", keys.size());
            } else {
                log.info("No cache keys found for pattern: {}", pattern);
            }
            
        } catch (Exception e) {
            log.error("Error during cache eviction by pattern: {}", pattern, e);
            throw new RuntimeException("패턴별 캐시 삭제 중 오류가 발생했습니다", e);
        }
    }
    
    @Override
    public void evict(String cacheName, String key) {
        log.debug("Evicting cache: {} - {}", cacheName, key);
        
        try {
            String fullKey = cacheName + "::" + key;
            redisTemplate.delete(fullKey);
            log.debug("Cache evicted successfully: {}", fullKey);
            
        } catch (Exception e) {
            log.error("Error during cache eviction: {} - {}", cacheName, key, e);
            throw new RuntimeException("캐시 삭제 중 오류가 발생했습니다", e);
        }
    }
    
    @Override
    public Map<String, Object> getStatistics() {
        log.info("Retrieving cache statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 전체 키 개수
            Set<String> allKeys = redisTemplate.keys("*");
            int totalKeys = allKeys != null ? allKeys.size() : 0;
            
            // 패턴별 키 개수 (null-safe)
            Set<String> sessionKeysSet = redisTemplate.keys("spring:session:*");
            int sessionKeys = sessionKeysSet != null ? sessionKeysSet.size() : 0;
            
            Set<String> portfolioCacheSet = redisTemplate.keys("portfolio::*");
            int portfolioCacheKeys = portfolioCacheSet != null ? portfolioCacheSet.size() : 0;
            
            Set<String> githubCacheSet = redisTemplate.keys("github::*");
            int githubCacheKeys = githubCacheSet != null ? githubCacheSet.size() : 0;
            
            Set<String> aiServiceCacheSet = redisTemplate.keys("ai-service::*");
            int aiServiceCacheKeys = aiServiceCacheSet != null ? aiServiceCacheSet.size() : 0;
            
            // 메모리 사용량 정보
            Map<String, Object> memoryInfo = getMemoryInfo();
            
            stats.put("totalKeys", totalKeys);
            stats.put("sessionKeys", sessionKeys);
            stats.put("portfolioCacheKeys", portfolioCacheKeys);
            stats.put("githubCacheKeys", githubCacheKeys);
            stats.put("aiServiceCacheKeys", aiServiceCacheKeys);
            stats.put("memoryInfo", memoryInfo);
            
            log.info("Cache stats retrieved successfully: {} total keys (sessions: {}, portfolio: {}, github: {}, ai-service: {})",
                totalKeys, sessionKeys, portfolioCacheKeys, githubCacheKeys, aiServiceCacheKeys);
            
        } catch (Exception e) {
            log.error("Error retrieving cache stats", e);
            throw new RuntimeException("캐시 통계 조회 중 오류가 발생했습니다", e);
        }
        
        return stats;
    }
    
    @Override
    public long getKeyCount(String pattern) {
        log.debug("Getting key count for pattern: {}", pattern);
        
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            return keys != null ? keys.size() : 0;
            
        } catch (Exception e) {
            log.error("Error getting key count for pattern: {}", pattern, e);
            return 0;
        }
    }
    
    @Override
    public Map<String, Object> getCacheStatus() {
        log.debug("Getting cache status");
        
        Map<String, Object> status = new HashMap<>();
        
        try {
            // Redis 연결 상태 확인
            var connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory != null) {
                String pingResult = connectionFactory
                    .getConnection()
                    .ping();
                
                status.put("status", "connected");
                status.put("ping", pingResult);
            } else {
                status.put("status", "no_connection_factory");
            }
            status.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            log.error("Error getting cache status", e);
            status.put("status", "error");
            status.put("error", e.getMessage());
            status.put("timestamp", System.currentTimeMillis());
        }
        
        return status;
    }
    
    /**
     * Redis 메모리 정보 조회
     */
    @SuppressWarnings("deprecation")
    private Map<String, Object> getMemoryInfo() {
        Map<String, Object> memoryInfo = new HashMap<>();
        
        try {
            // Redis 데이터베이스 크기 조회
            Long dbSize = redisTemplate.execute((RedisCallback<Long>) connection -> connection.dbSize());
            
            if (dbSize != null) {
                memoryInfo.put("dbSize", dbSize);
                memoryInfo.put("status", "available");
            } else {
                memoryInfo.put("status", "unavailable");
            }
            
            // 메모리 상세 정보는 Redis CLI 또는 모니터링 도구 사용 권장
            memoryInfo.put("note", "상세 메모리 정보는 Redis CLI의 INFO 명령어를 사용하세요");
            
        } catch (Exception e) {
            log.warn("Could not retrieve Redis info", e);
            memoryInfo.put("error", "Redis 정보 조회 중 오류 발생: " + e.getMessage());
            memoryInfo.put("status", "error");
        }
        
        return memoryInfo;
    }
}
