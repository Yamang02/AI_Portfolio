package com.aiportfolio.backend.application.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Admin Cache Management Service
 * Redis 캐시 관리 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Redis 캐시 전체 flush
     */
    public void flushAllCache() {
        log.info("Starting cache flush operation");
        
        try {
            // 모든 키 조회
            Set<String> keys = redisTemplate.keys("*");
            
            if (keys != null && !keys.isEmpty()) {
                // 모든 키 삭제
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

    /**
     * Redis 캐시 통계 조회
     */
    public Map<String, Object> getCacheStats() {
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

            // 메모리 사용량 (Redis INFO 명령어 결과)
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

    /**
     * Redis 메모리 정보 조회
     * 참고: Redis INFO 명령어는 현재 deprecated API를 사용하지 않고는 호출하기 어렵습니다.
     * 대신 기본적인 통계 정보만 제공합니다.
     */
    @SuppressWarnings("deprecation")
    private Map<String, Object> getMemoryInfo() {
        Map<String, Object> memoryInfo = new HashMap<>();

        try {
            // Redis 데이터베이스 크기 조회
            // dbSize()는 deprecated이지만 대체 API가 없어 사용
            Long dbSize = redisTemplate.execute((RedisCallback<Long>) connection ->
                connection.dbSize());

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
