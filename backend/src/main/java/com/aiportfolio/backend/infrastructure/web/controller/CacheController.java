package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.cache.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 캐시 관리 REST API 컨트롤러
 * Redis 캐시 시스템 관리 엔드포인트 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@ConditionalOnBean(CacheService.class)
public class CacheController {

    private final CacheService cacheService;

    /**
     * 캐시 상태 및 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        try {
            var stats = cacheService.getCacheStats();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "redis_available", stats.isAvailable(),
                "cache_stats", stats
            ));
            
        } catch (Exception e) {
            log.error("캐시 통계 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "redis_available", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 캐시 연결 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getCacheHealth() {
        boolean available = cacheService.isRedisAvailable();
        
        return ResponseEntity.ok(Map.of(
            "redis_available", available,
            "status", available ? "healthy" : "unavailable"
        ));
    }

    /**
     * 포트폴리오 캐시 무효화
     */
    @DeleteMapping("/portfolio")
    public ResponseEntity<Map<String, String>> invalidatePortfolioCache() {
        try {
            cacheService.invalidatePortfolioCache();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "포트폴리오 캐시가 성공적으로 무효화되었습니다"
            ));
            
        } catch (Exception e) {
            log.error("포트폴리오 캐시 무효화 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "캐시 무효화 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * AI 응답 캐시 무효화
     */
    @DeleteMapping("/ai-responses")
    public ResponseEntity<Map<String, String>> invalidateAiResponseCache() {
        try {
            cacheService.invalidateAiResponseCache();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "AI 응답 캐시가 성공적으로 무효화되었습니다"
            ));
            
        } catch (Exception e) {
            log.error("AI 응답 캐시 무효화 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "캐시 무효화 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 키 패턴 캐시 무효화
     */
    @DeleteMapping("/pattern/{pattern}")
    public ResponseEntity<Map<String, Object>> invalidateCacheByPattern(@PathVariable String pattern) {
        try {
            long deletedCount = cacheService.deleteByPattern(pattern);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", String.format("패턴 '%s'에 해당하는 캐시 %d개가 무효화되었습니다", pattern, deletedCount),
                "deleted_count", deletedCount
            ));
            
        } catch (Exception e) {
            log.error("패턴 캐시 무효화 실패 [{}]: {}", pattern, e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "캐시 무효화 중 오류가 발생했습니다: " + e.getMessage(),
                "deleted_count", 0
            ));
        }
    }

    /**
     * 전체 캐시 무효화 (주의: 개발용)
     */
    @DeleteMapping("/all")
    public ResponseEntity<Map<String, String>> invalidateAllCache() {
        try {
            cacheService.invalidateAllCache();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "⚠️ 모든 캐시가 무효화되었습니다"
            ));
            
        } catch (Exception e) {
            log.error("전체 캐시 무효화 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "캐시 무효화 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 키 캐시 조회
     */
    @GetMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> getCacheValue(@PathVariable String key) {
        try {
            boolean exists = cacheService.hasKey(key);
            Object value = null;
            long ttl = -1;
            
            if (exists) {
                value = cacheService.get(key, Object.class);
                ttl = cacheService.getExpire(key);
            }
            
            return ResponseEntity.ok(Map.of(
                "key", key,
                "exists", exists,
                "value", value != null ? value : "null",
                "ttl_seconds", ttl
            ));
            
        } catch (Exception e) {
            log.error("캐시 키 조회 실패 [{}]: {}", key, e.getMessage());
            return ResponseEntity.ok(Map.of(
                "key", key,
                "exists", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 특정 키 캐시 삭제
     */
    @DeleteMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> deleteCacheKey(@PathVariable String key) {
        try {
            boolean deleted = cacheService.delete(key);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "key", key,
                "deleted", deleted,
                "message", deleted ? "캐시 키가 삭제되었습니다" : "삭제할 캐시 키가 없습니다"
            ));
            
        } catch (Exception e) {
            log.error("캐시 키 삭제 실패 [{}]: {}", key, e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "key", key,
                "deleted", false,
                "message", "캐시 키 삭제 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}