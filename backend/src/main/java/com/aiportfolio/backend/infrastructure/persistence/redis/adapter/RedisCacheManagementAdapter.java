package com.aiportfolio.backend.infrastructure.persistence.redis.adapter;

import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Component;

import java.util.*;

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
            Set<String> keys = scanKeys("*");
            
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
            Set<String> keys = scanKeys(pattern);
            
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
            // 전체 키 개수 (SCAN 사용)
            Set<String> allKeys = scanKeys("*");
            int totalKeys = allKeys != null ? allKeys.size() : 0;
            
            // 패턴별 키 개수 (null-safe, SCAN 사용)
            Set<String> sessionKeysSet = scanKeys("spring:session:*");
            int sessionKeys = sessionKeysSet != null ? sessionKeysSet.size() : 0;
            
            Set<String> portfolioCacheSet = scanKeys("portfolio::*");
            int portfolioCacheKeys = portfolioCacheSet != null ? portfolioCacheSet.size() : 0;
            
            Set<String> githubCacheSet = scanKeys("github::*");
            int githubCacheKeys = githubCacheSet != null ? githubCacheSet.size() : 0;
            
            Set<String> aiServiceCacheSet = scanKeys("ai-service::*");
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
            Set<String> keys = scanKeys(pattern);
            return keys != null ? keys.size() : 0;
            
        } catch (Exception e) {
            log.error("Error getting key count for pattern: {}", pattern, e);
            return 0;
        }
    }
    
    @Override
    public Map<String, Object> getCacheStatus() {
        log.info("Getting cache status");

        Map<String, Object> status = new HashMap<>();

        try {
            // Redis 연결 상태 확인
            var connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory != null) {
                var connection = connectionFactory.getConnection();
                try {
                    String pingResult = connection.ping();
                    Properties info = connection.info("server");
                    String redisVersion = info.getProperty("redis_version");
                    
                    status.put("status", "connected");
                    status.put("ping", pingResult);
                    status.put("redisVersion", redisVersion != null ? redisVersion : "unknown");
                    
                    log.info("Redis connection status - Connected: true, Ping: {}, Version: {}", pingResult, redisVersion);
                } finally {
                    connection.close();
                }
            } else {
                status.put("status", "no_connection_factory");
                log.warn("Redis connection factory is null");
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

    @Override
    public Set<String> getKeysByPattern(String pattern) {
        log.debug("Getting keys by pattern: {}", pattern);

        try {
            Set<String> keys = scanKeys(pattern);
            log.debug("Found {} keys matching pattern: {}", keys != null ? keys.size() : 0, pattern);
            return keys != null ? keys : Set.of();

        } catch (Exception e) {
            log.error("Error getting keys by pattern: {}", pattern, e);
            return Set.of();
        }
    }

    @Override
    public String getValue(String key) {
        log.debug("Getting value for key: {}", key);

        try {
            Object value = redisTemplate.opsForValue().get(key);
            return value != null ? value.toString() : null;

        } catch (Exception e) {
            log.error("Error getting value for key: {}", key, e);
            return null;
        }
    }

    @Override
    public void setValue(String key, String value) {
        log.debug("Setting value for key: {}", key);

        try {
            redisTemplate.opsForValue().set(key, value);
            log.debug("Value set successfully for key: {}", key);

        } catch (Exception e) {
            log.error("Error setting value for key: {}", key, e);
            throw new RuntimeException("Redis 값 저장 중 오류가 발생했습니다", e);
        }
    }
    
    /**
     * SCAN 명령어를 사용하여 키를 조회합니다.
     * keys(*) 대신 SCAN을 사용하여 논블로킹 방식으로 키를 조회합니다.
     * 
     * @param pattern 조회할 키 패턴
     * @return 일치하는 키 목록
     */
    private Set<String> scanKeys(String pattern) {
        log.info("Scanning keys with pattern: {}", pattern);
        
        // 현재 Redis 연결 정보 로깅 (환경 차이 진단용)
        try {
            var connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory != null) {
                var connection = connectionFactory.getConnection();
                try {
                    // Redis INFO 명령으로 DB 정보 확인
                    Properties info = connection.info("server");
                    String redisVersion = info.getProperty("redis_version");
                    log.info("Redis connection info - Version: {}", redisVersion);
                } catch (Exception infoEx) {
                    log.debug("Could not retrieve Redis INFO", infoEx);
                } finally {
                    connection.close();
                }
            }
        } catch (Exception e) {
            log.warn("Could not retrieve Redis connection info", e);
        }
        
        Set<String> keys = new HashSet<>();
        int scanCount = 100; // 한 번에 스캔할 키 개수
        
        try {
            ScanOptions options = ScanOptions.scanOptions()
                    .match(pattern)
                    .count(scanCount)
                    .build();
            
            log.info("Starting SCAN operation with pattern: {}, count: {}", pattern, scanCount);
            
            try (Cursor<String> cursor = redisTemplate.scan(options)) {
                int scanned = 0;
                while (cursor.hasNext()) {
                    keys.add(cursor.next());
                    scanned++;
                    if (scanned % 100 == 0) {
                        log.debug("Scanned {} keys so far...", scanned);
                    }
                }
                log.info("SCAN completed. Total keys found: {}", keys.size());
            }
            
        } catch (Exception e) {
            log.error("Error scanning keys with pattern: {}. Error: {}", pattern, e.getMessage(), e);
            // SCAN 실패 시 keys() 명령어로 fallback (경고 로그와 함께)
            log.warn("Falling back to keys() command due to SCAN failure. This may cause performance issues.");
            try {
                Set<String> fallbackKeys = redisTemplate.keys(pattern);
                log.info("Fallback keys() command succeeded. Found {} keys", fallbackKeys != null ? fallbackKeys.size() : 0);
                return fallbackKeys != null ? fallbackKeys : Collections.emptySet();
            } catch (Exception fallbackException) {
                log.error("Fallback keys() command also failed. Error: {}", fallbackException.getMessage(), fallbackException);
                throw new RuntimeException("키 조회 중 오류가 발생했습니다", fallbackException);
            }
        }
        
        return keys;
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
