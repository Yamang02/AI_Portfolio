package com.aiportfolio.backend.infrastructure.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis 캐시 서비스
 * 고수준 캐시 작업 제공
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.data.redis.host")
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheManager cacheManager;

    /**
     * 캐시 데이터 저장
     */
    public void put(String key, Object value) {
        put(key, value, Duration.ofHours(1));
    }

    /**
     * TTL을 지정하여 캐시 데이터 저장
     */
    public void put(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
            log.debug("캐시 저장: {} (TTL: {})", key, ttl);
        } catch (Exception e) {
            log.error("캐시 저장 실패 [{}]: {}", key, e.getMessage());
        }
    }

    /**
     * 캐시 데이터 조회
     */
    public <T> T get(String key, Class<T> type) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value != null && type.isInstance(value)) {
                log.debug("캐시 적중: {}", key);
                return type.cast(value);
            }
            log.debug("캐시 미적중: {}", key);
            return null;
        } catch (Exception e) {
            log.error("캐시 조회 실패 [{}]: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 캐시 데이터 존재 여부 확인
     */
    public boolean hasKey(String key) {
        try {
            Boolean exists = redisTemplate.hasKey(key);
            return exists != null && exists;
        } catch (Exception e) {
            log.error("캐시 존재 확인 실패 [{}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 캐시 데이터 삭제
     */
    public boolean delete(String key) {
        try {
            Boolean deleted = redisTemplate.delete(key);
            if (deleted != null && deleted) {
                log.debug("캐시 삭제: {}", key);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("캐시 삭제 실패 [{}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 패턴 매칭 키 일괄 삭제
     */
    public long deleteByPattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                Long deleted = redisTemplate.delete(keys);
                long count = deleted != null ? deleted : 0;
                log.info("패턴 매칭 캐시 삭제: {} ({}개)", pattern, count);
                return count;
            }
            return 0;
        } catch (Exception e) {
            log.error("패턴 매칭 캐시 삭제 실패 [{}]: {}", pattern, e.getMessage());
            return 0;
        }
    }

    /**
     * 캐시 TTL 설정
     */
    public boolean expire(String key, Duration ttl) {
        try {
            Boolean result = redisTemplate.expire(key, ttl);
            return result != null && result;
        } catch (Exception e) {
            log.error("캐시 TTL 설정 실패 [{}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 캐시 TTL 조회
     */
    public long getExpire(String key) {
        try {
            Long expire = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return expire != null ? expire : -1;
        } catch (Exception e) {
            log.error("캐시 TTL 조회 실패 [{}]: {}", key, e.getMessage());
            return -1;
        }
    }

    /**
     * 포트폴리오 관련 캐시 무효화
     */
    public void invalidatePortfolioCache() {
        try {
            // Spring Cache 무효화
            cacheManager.getCacheNames().forEach(cacheName -> {
                if (cacheName.startsWith("portfolio:")) {
                    var cache = cacheManager.getCache(cacheName);
                    if (cache != null) {
                        cache.clear();
                    }
                }
            });

            // 직접 키 패턴 삭제
            deleteByPattern("portfolio:projects:*");
            deleteByPattern("portfolio:experiences:*");
            deleteByPattern("portfolio:educations:*");
            deleteByPattern("portfolio:certifications:*");

            log.info("포트폴리오 캐시 무효화 완료");
        } catch (Exception e) {
            log.error("포트폴리오 캐시 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * AI 응답 캐시 무효화
     */
    public void invalidateAiResponseCache() {
        try {
            var cache = cacheManager.getCache("ai-responses");
            if (cache != null) {
                cache.clear();
            }

            deleteByPattern("portfolio:ai-responses:*");
            log.info("AI 응답 캐시 무효화 완료");
        } catch (Exception e) {
            log.error("AI 응답 캐시 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * 모든 캐시 무효화
     */
    public void invalidateAllCache() {
        try {
            cacheManager.getCacheNames().forEach(cacheName -> {
                var cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.clear();
                }
            });

            deleteByPattern("portfolio:*");
            log.warn("모든 캐시가 무효화되었습니다");
        } catch (Exception e) {
            log.error("전체 캐시 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * Redis 연결 상태 확인
     */
    public boolean isRedisAvailable() {
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            return true;
        } catch (Exception e) {
            log.warn("Redis 연결 불가: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 캐시 통계 조회
     */
    public CacheStats getCacheStats() {
        try {
            // Redis INFO 명령어를 통한 통계 수집
            var connection = redisTemplate.getConnectionFactory().getConnection();
            var info = connection.info();
            
            return CacheStats.builder()
                .available(true)
                .totalKeys(redisTemplate.keys("portfolio:*").size())
                .usedMemory(extractInfoValue(info, "used_memory_human"))
                .connectedClients(extractInfoValue(info, "connected_clients"))
                .hits(extractInfoValue(info, "keyspace_hits"))
                .misses(extractInfoValue(info, "keyspace_misses"))
                .build();
                
        } catch (Exception e) {
            log.error("캐시 통계 조회 실패: {}", e.getMessage());
            return CacheStats.builder()
                .available(false)
                .error(e.getMessage())
                .build();
        }
    }

    private String extractInfoValue(String info, String key) {
        try {
            String searchKey = key + ":";
            int start = info.indexOf(searchKey);
            if (start == -1) return "N/A";
            
            start += searchKey.length();
            int end = info.indexOf("\r\n", start);
            if (end == -1) end = info.length();
            
            return info.substring(start, end);
        } catch (Exception e) {
            return "N/A";
        }
    }

    /**
     * 캐시 통계 정보 클래스
     */
    @lombok.Builder
    @lombok.Data
    public static class CacheStats {
        private boolean available;
        private int totalKeys;
        private String usedMemory;
        private String connectedClients;
        private String hits;
        private String misses;
        private String error;
        
        public double getHitRate() {
            try {
                long hitsLong = Long.parseLong(hits);
                long missesLong = Long.parseLong(misses);
                long total = hitsLong + missesLong;
                
                if (total == 0) return 0.0;
                return (double) hitsLong / total * 100.0;
            } catch (Exception e) {
                return 0.0;
            }
        }
    }
}